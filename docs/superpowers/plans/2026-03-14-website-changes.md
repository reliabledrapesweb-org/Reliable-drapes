# Website Changes Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 13 website changes (header, footer, brand page, exhibitions, store locator, contact, careers) + fix admin upload bug.

**Architecture:** Existing Next.js 15 + Supabase app. Changes involve: 1 shared DB migration for `site_settings` columns, 1 migration for exhibition tables + data migration, 1 seed for about sections, UI rewrites for 3 major pages, and smaller updates across header/footer/contact/careers.

**Tech Stack:** Next.js 15 (App Router), Supabase (PostgreSQL), Tailwind CSS, React Hook Form, Zod, Zustand, Motion (framer-motion)

**Spec:** `docs/superpowers/specs/2026-03-13-website-changes-design.md`

---

## Chunk 1: Database Migrations + Constants + Bug Fix

### Task 1: Site Settings Migration — New Columns

**Files:**
- Create: `supabase/migrations/20260314000001_add_site_settings_columns.sql`
- Modify: `src/lib/actions/site-settings.ts:11-63` (types)

- [ ] **Step 1: Write the migration SQL**

Create `supabase/migrations/20260314000001_add_site_settings_columns.sql`:

```sql
-- Add new site_settings columns for footer, contact, and business hours
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS company_tagline text,
  ADD COLUMN IF NOT EXISTS head_office_address text,
  ADD COLUMN IF NOT EXISTS warehouse_address text,
  ADD COLUMN IF NOT EXISTS contact_call_phone text DEFAULT '+91 98113 31948',
  ADD COLUMN IF NOT EXISTS business_hours jsonb DEFAULT '[{"day":"Monday - Friday","hours":"9:00 AM - 6:00 PM"},{"day":"Saturday","hours":"10:00 AM - 4:00 PM"},{"day":"Sunday","hours":"Closed"}]'::jsonb;

-- Update company_phone to the correct number
UPDATE site_settings SET company_phone = '+91 96257 31948' WHERE company_phone IS NOT NULL;

-- Enable public read access for the new columns (already covered by existing SELECT policy)
-- No new RLS policies needed since site_settings already has public read + admin write
```

- [ ] **Step 2: Update SiteSettings type**

In `src/lib/actions/site-settings.ts`, add the new fields to the `SiteSettings` type (after line 31):

```ts
company_tagline: string | null;
head_office_address: string | null;
warehouse_address: string | null;
contact_call_phone: string | null;
business_hours: Array<{ day: string; hours: string }> | null;
```

And add them to `SiteSettingsFormData` Pick union (after line 59):

```ts
| "company_tagline"
| "head_office_address"
| "warehouse_address"
| "contact_call_phone"
| "business_hours"
```

- [ ] **Step 3: Add Zod validation for business_hours**

In `src/lib/actions/site-settings.ts`, add near the top imports:

```ts
import { z } from "zod";

const businessHoursSchema = z.array(
  z.object({
    day: z.string().min(1),
    hours: z.string().min(1),
  })
).min(1);
```

Then add a helper to validate business hours before saving:

```ts
function validateBusinessHours(hours: unknown): Array<{ day: string; hours: string }> | null {
  const result = businessHoursSchema.safeParse(hours);
  return result.success ? result.data : null;
}
```

Use this in `updateSiteSettings()` — if `formData.business_hours` is present, validate it before passing to the update query. If invalid, return `{ success: false, error: "Invalid business hours format" }`.

- [ ] **Step 4: Update getCompanyDetails()**

In `src/lib/actions/site-settings.ts`, update `getCompanyDetails()` (lines 333-359) to include the new footer/address fields.

**Note:** `contactCallPhone` and `businessHours` are also fetched here (rather than a separate function) to avoid multiple DB queries. This is a pragmatic deviation from the spec's return type which only listed 6 fields.

```ts
export async function getCompanyDetails(): Promise<{
  email: string | null;
  phone: string | null;
  address: string | null;
  tagline: string | null;
  headOfficeAddress: string | null;
  warehouseAddress: string | null;
  contactCallPhone: string | null;
  businessHours: Array<{ day: string; hours: string }> | null;
}> {
  try {
    const supabase = getAnonSupabase();

    const { data, error } = await supabase
      .from("site_settings")
      .select("company_email, company_phone, company_address, company_tagline, head_office_address, warehouse_address, contact_call_phone, business_hours")
      .limit(1)
      .single();

    if (error) {
      return { email: null, phone: null, address: null, tagline: null, headOfficeAddress: null, warehouseAddress: null, contactCallPhone: null, businessHours: null };
    }

    return {
      email: data?.company_email ?? null,
      phone: data?.company_phone ?? null,
      address: data?.company_address ?? null,
      tagline: data?.company_tagline ?? null,
      headOfficeAddress: data?.head_office_address ?? null,
      warehouseAddress: data?.warehouse_address ?? null,
      contactCallPhone: data?.contact_call_phone ?? null,
      businessHours: validateBusinessHours(data?.business_hours),
    };
  } catch {
    return { email: null, phone: null, address: null, tagline: null, headOfficeAddress: null, warehouseAddress: null, contactCallPhone: null, businessHours: null };
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260314000001_add_site_settings_columns.sql src/lib/actions/site-settings.ts
git commit -m "feat: add site_settings columns for footer, contact, business hours"
```

---

### Task 2: Exhibition Tables Migration + Data Migration

**Files:**
- Create: `supabase/migrations/20260314000002_exhibition_years_and_items.sql`

- [ ] **Step 1: Write the migration SQL**

Create `supabase/migrations/20260314000002_exhibition_years_and_items.sql`:

```sql
-- New exhibition year-based structure
CREATE TABLE exhibition_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE exhibition_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year_id uuid REFERENCES exhibition_years(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('exhibition', 'moment', 'news')),
  title text NOT NULL,
  description text,
  image_url text,
  source_name text,
  article_url text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- updated_at triggers
CREATE TRIGGER set_exhibition_years_updated_at
  BEFORE UPDATE ON exhibition_years
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_exhibition_items_updated_at
  BEFORE UPDATE ON exhibition_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies
ALTER TABLE exhibition_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_items ENABLE ROW LEVEL SECURITY;

-- Public read for active items
CREATE POLICY "Public can read active exhibition years"
  ON exhibition_years FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can read active exhibition items"
  ON exhibition_items FOR SELECT
  USING (is_active = true);

-- Admin full access (uses the service role key via getAdminSupabase)
-- No admin INSERT/UPDATE/DELETE policies needed since admin uses service role

-- Migrate existing data from exhibitions table
INSERT INTO exhibition_years (year)
SELECT DISTINCT EXTRACT(YEAR FROM start_date)::int
FROM exhibitions
WHERE start_date IS NOT NULL
ON CONFLICT (year) DO NOTHING;

INSERT INTO exhibition_items (year_id, type, title, description, image_url, is_active)
SELECT ey.id, 'exhibition', e.title, e.description, e.image_url, e.is_active
FROM exhibitions e
JOIN exhibition_years ey ON ey.year = EXTRACT(YEAR FROM e.start_date)::int
WHERE e.start_date IS NOT NULL;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260314000002_exhibition_years_and_items.sql
git commit -m "feat: add exhibition_years and exhibition_items tables with data migration"
```

---

### Task 3: About Sections Seed Migration

**Files:**
- Create: `supabase/migrations/20260314000003_seed_chairman_director_sections.sql`

- [ ] **Step 1: Write the seed migration**

Create `supabase/migrations/20260314000003_seed_chairman_director_sections.sql`:

```sql
-- Seed chairman and director about sections
INSERT INTO about_sections (section_key, title, subtitle, content, display_order, is_active)
VALUES
  ('chairman', 'Chairman', 'Chairman', 'Chairman write-up to be added.', 2, true),
  ('director', 'Director', 'Director', '', 3, true)
ON CONFLICT (section_key) DO NOTHING;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260314000003_seed_chairman_director_sections.sql
git commit -m "feat: seed chairman and director about sections"
```

---

### Task 4: Update Constants

**Files:**
- Modify: `src/lib/constants/app.ts`

- [ ] **Step 1: Update constants**

In `src/lib/constants/app.ts`:

1. Change `COMPANY_PHONE` from `"+91 85069 31948"` to `"+91 96257 31948"`
2. Add `HR_PHONE = "+91 85069 31948"` (the old number, now only for careers)
3. Add `STORES_PER_PAGE = 8`

```ts
export const COMPANY_PHONE = "+91 96257 31948";
export const HR_PHONE = "+91 85069 31948";
export const STORES_PER_PAGE = 8;
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/constants/app.ts
git commit -m "feat: update phone constants and add STORES_PER_PAGE"
```

---

### Task 5: Investigate and Fix Admin Upload Bug

**Files to investigate:**
- `src/lib/actions/site-settings.ts:106-160`
- `src/lib/actions/media.ts:156-247`
- `src/app/admin/settings/page.tsx:1263-1278` (handleSave)
- `supabase/migrations/` — RLS policies on `site_settings`

- [ ] **Step 1: Investigate the updateSiteSettings flow**

Read `src/lib/actions/site-settings.ts` lines 106-160. The current flow:
1. Fetches existing settings row by `select("id").limit(1).single()`
2. Updates that row by `.eq("id", existingSettings.id)`

Check if there's a race condition or if the `formData` spread includes fields not in the DB (which would cause Supabase to error on second save).

- [ ] **Step 2: Investigate the media upload flow**

Read `src/lib/actions/media.ts` lines 156-247. Check if:
- The upload creates a record in `media_library` and if a duplicate filename causes conflict
- The Supabase storage upload uses `upsert: true` or if it fails on duplicate

- [ ] **Step 3: Investigate admin settings form state**

Read `src/app/admin/settings/page.tsx`:
- Lines 1172-1218: Check if `formData` state includes extra fields not in `SiteSettingsFormData` type
- Lines 1263-1278: Check if `handleSave` passes the entire `formData` object (including non-DB fields) to `updateSiteSettings`
- Check if `siteSettings` state gets properly refreshed after save (line 1268)

- [ ] **Step 4: Check RLS policies**

Search migrations for `site_settings` RLS policies. Ensure UPDATE is allowed for the service role (admin uses `getAdminSupabase()` which bypasses RLS, so this likely isn't the issue).

- [ ] **Step 5: Apply fix**

Based on investigation, apply the fix. Common patterns:
- If `formData` spread issue: filter to only known DB columns before passing to `updateSiteSettings`
- If storage duplicate: add `upsert: true` to the Supabase storage upload call
- If state issue: ensure `setSiteSettings(result.settings)` properly refreshes form state

- [ ] **Step 6: Verify fix meets acceptance criteria**

Test manually or describe test steps:
1. Upload a file → succeeds
2. Upload another file immediately → succeeds (no error)
3. Toggle Shop on/off → saves and persists on reload
4. Enter Instagram/Facebook URLs → saves and persists on reload

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "fix: resolve admin panel upload and settings save errors"
```

---

## Chunk 2: Header, Footer, Contact, Careers (Simple Changes)

### Task 6: GeM Logo Size Increase

**Files:**
- Modify: `src/components/layout/Header.tsx:306-339`

- [ ] **Step 1: Update the width pixel map**

In `Header.tsx`, find the GeM logo `width` prop (around line 311) and update:

```ts
width={
  (
    {
      small: 96,
      medium: 128,
      large: 160,
      "extra-large": 192,
    } as const
  )[gemAssessedLogo.size]
}
```

- [ ] **Step 2: Update the height pixel map**

Find the `height` prop (around line 320) and update:

```ts
height={
  (
    {
      small: 32,
      medium: 40,
      large: 48,
      "extra-large": 56,
    } as const
  )[gemAssessedLogo.size]
}
```

- [ ] **Step 3: Update the className height map**

Find the `className` prop (around line 330) and update:

```ts
className={
  (
    {
      small: "h-8 w-auto object-contain xl:h-9",
      medium: "h-10 w-auto object-contain xl:h-11",
      large: "h-12 w-auto object-contain xl:h-14",
      "extra-large": "h-14 w-auto object-contain xl:h-16",
    } as const
  )[gemAssessedLogo.size]
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat: increase GeM logo size tiers in header"
```

---

### Task 7: Footer — Dual Address Blocks + Editable Tagline

**Files:**
- Modify: `src/components/layout/Footer.tsx`

- [ ] **Step 1: Read current Footer.tsx**

Read `src/components/layout/Footer.tsx` to understand the current structure, especially lines 40-60 (state + fetch) and lines 120-150 (address rendering).

- [ ] **Step 2: Update the state and fetch to include new fields**

The Footer currently fetches from `getCompanyDetails()` and stores result in state (lines 43-47). Update the state to hold ALL fields (preserving existing `email`, `phone`, `address`):

```ts
const [companyDetails, setCompanyDetails] = useState<{
  email: string | null;
  phone: string | null;
  address: string | null;
  tagline: string | null;
  headOfficeAddress: string | null;
  warehouseAddress: string | null;
}>({
  email: null,
  phone: null,
  address: null,
  tagline: null,
  headOfficeAddress: null,
  warehouseAddress: null,
});
```

Ensure the existing `getCompanyDetails()` fetch (around line 56) still populates `email`, `phone`, `address` in addition to the new fields. The icon imports may need `Building` from `lucide-react` for the head office icon.

- [ ] **Step 3: Update address rendering**

Replace the single address display with two address blocks:

```tsx
{/* Addresses */}
<div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
  {companyDetails.headOfficeAddress && (
    <div className="flex items-start gap-2">
      <Building className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
      <div>
        <p className="text-xs font-semibold text-gray-300">Head Office</p>
        <p className="text-sm text-gray-400">{companyDetails.headOfficeAddress}</p>
      </div>
    </div>
  )}
  {companyDetails.warehouseAddress && (
    <div className="flex items-start gap-2">
      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
      <div>
        <p className="text-xs font-semibold text-gray-300">Warehouse</p>
        <p className="text-sm text-gray-400">{companyDetails.warehouseAddress}</p>
      </div>
    </div>
  )}
</div>
```

- [ ] **Step 4: Replace hardcoded tagline with editable one**

Find the B2B tagline text and replace with:

```tsx
{companyDetails.tagline && (
  <p className="text-sm text-gray-400">{companyDetails.tagline}</p>
)}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "feat: add dual address blocks and editable tagline to footer"
```

---

### Task 8: Contact Us — Phone Numbers + Address + Business Hours

**Files:**
- Modify: `src/app/contact/page.tsx`

- [ ] **Step 1: Read current contact page**

Read `src/app/contact/page.tsx` to understand how phone/address/business hours are currently rendered (lines 239-255 for contact items, lines 619-636 for business hours).

- [ ] **Step 2: Convert to server component or add data fetching**

The contact page is currently a client component. Add a `useEffect` to fetch company details:

```ts
import { getCompanyDetails } from "@/lib/actions/site-settings";

// Inside component:
const [companyInfo, setCompanyInfo] = useState<{
  phone: string | null;
  contactCallPhone: string | null;
  warehouseAddress: string | null;
  businessHours: Array<{ day: string; hours: string }> | null;
}>({ phone: null, contactCallPhone: null, warehouseAddress: null, businessHours: null });

useEffect(() => {
  getCompanyDetails().then((details) => {
    setCompanyInfo({
      phone: details.phone,
      contactCallPhone: details.contactCallPhone,
      warehouseAddress: details.warehouseAddress,
      businessHours: details.businessHours,
    });
  });
}, []);
```

- [ ] **Step 3: Update contactItems to use fetched data**

The `contactItems` array (around line 239) is currently defined at the top of the component body and uses constants. It must be wrapped in `useMemo` so it recomputes when `companyInfo` state updates after fetch:

```ts
const contactItems = useMemo(() => [
  {
    icon: Mail,
    title: "Email",
    lines: [CONTACT_EMAIL],
  },
  {
    icon: Phone,
    title: "Call Us",
    lines: [companyInfo.contactCallPhone || "+91 98113 31948"],
  },
  {
    icon: MapPin,
    title: "Address",
    lines: [companyInfo.warehouseAddress || COMPANY_ADDRESS],
  },
], [companyInfo]);
```

Also update the form section helper text (line 369) to use `companyInfo.phone || COMPANY_PHONE` for the message number.

Add `useMemo` to the React import at the top of the file.

- [ ] **Step 4: Update business hours to read from DB**

Replace the hardcoded business hours array (around line 619) with:

```ts
const businessHours = companyInfo.businessHours || [
  { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
  { day: "Saturday", hours: "10:00 AM - 4:00 PM" },
  { day: "Sunday", hours: "Closed" },
];
```

Then map over `businessHours` in the JSX instead of the hardcoded array.

- [ ] **Step 5: Commit**

```bash
git add src/app/contact/page.tsx
git commit -m "feat: contact page reads phone, address, business hours from site settings"
```

---

### Task 9: Careers — HR Phone Number

**Files:**
- Modify: `src/app/careers/page.tsx:65`

- [ ] **Step 1: Replace placeholder phone number**

In `src/app/careers/page.tsx`, line 65 currently has:
```ts
const hrPhone = "+234 803 456 7890";
```

Replace with:
```ts
import { HR_PHONE } from "@/lib/constants/app";
// ...
const hrPhone = HR_PHONE;
```

Also update the display text at line 160 to use the variable instead of hardcoded.

- [ ] **Step 2: Commit**

```bash
git add src/app/careers/page.tsx
git commit -m "feat: update careers HR phone to correct Indian number"
```

---

### Task 10: Admin Settings — New Fields UI

**Files:**
- Modify: `src/app/admin/settings/page.tsx`

- [ ] **Step 1: Read the Site tab section of admin settings**

Read `src/app/admin/settings/page.tsx` around the "Company Details" section (search for `company_email`, `company_phone`, `company_address` inputs). Understand the form pattern used.

- [ ] **Step 2: Add company tagline input**

After the existing `company_address` input, add a new input for `company_tagline`:

```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
    Company Tagline (Footer)
  </label>
  <input
    type="text"
    value={formData.company_tagline || ""}
    onChange={(e) => handleChange("company_tagline", e.target.value)}
    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
    placeholder="e.g., B2B Furnishing Solutions"
  />
</div>
```

- [ ] **Step 3: Add head office and warehouse address inputs**

```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
    Head Office Address
  </label>
  <textarea
    value={formData.head_office_address || ""}
    onChange={(e) => handleChange("head_office_address", e.target.value)}
    rows={2}
    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
    placeholder="Full head office address"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
    Warehouse Address
  </label>
  <textarea
    value={formData.warehouse_address || ""}
    onChange={(e) => handleChange("warehouse_address", e.target.value)}
    rows={2}
    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
    placeholder="Full warehouse address"
  />
</div>
```

- [ ] **Step 4: Add contact call phone input**

```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
    Contact Us Call Number
  </label>
  <input
    type="text"
    value={formData.contact_call_phone || ""}
    onChange={(e) => handleChange("contact_call_phone", e.target.value)}
    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
    placeholder="+91 XXXXX XXXXX"
  />
  <p className="mt-1 text-xs text-gray-500">This number is shown on the Contact Us page call button</p>
</div>
```

- [ ] **Step 5: Add business hours editor**

Add a structured business hours editor section:

```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    Business Hours
  </label>
  {(formData.business_hours || []).map((entry, index) => (
    <div key={index} className="flex items-center gap-2 mb-2">
      <input
        type="text"
        value={entry.day}
        onChange={(e) => {
          const updated = [...(formData.business_hours || [])];
          updated[index] = { ...updated[index], day: e.target.value };
          setFormData((prev) => ({ ...prev, business_hours: updated }));
        }}
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        placeholder="Day range"
      />
      <input
        type="text"
        value={entry.hours}
        onChange={(e) => {
          const updated = [...(formData.business_hours || [])];
          updated[index] = { ...updated[index], hours: e.target.value };
          setFormData((prev) => ({ ...prev, business_hours: updated }));
        }}
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        placeholder="Hours"
      />
      <button
        type="button"
        onClick={() => {
          const updated = (formData.business_hours || []).filter((_, i) => i !== index);
          setFormData((prev) => ({ ...prev, business_hours: updated }));
        }}
        className="text-red-500 hover:text-red-700 text-sm"
      >
        Remove
      </button>
    </div>
  ))}
  <button
    type="button"
    onClick={() => {
      const updated = [...(formData.business_hours || []), { day: "", hours: "" }];
      setFormData((prev) => ({ ...prev, business_hours: updated }));
    }}
    className="text-sm text-[#2F2582] hover:underline"
  >
    + Add Row
  </button>
</div>
```

- [ ] **Step 6: Update the useEffect that initializes formData from siteSettings**

Around line 1181, ensure the new fields are mapped from `siteSettings`:

```ts
company_tagline: siteSettings.company_tagline || "",
head_office_address: siteSettings.head_office_address || "",
warehouse_address: siteSettings.warehouse_address || "",
contact_call_phone: siteSettings.contact_call_phone || "",
business_hours: siteSettings.business_hours || [
  { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
  { day: "Saturday", hours: "10:00 AM - 4:00 PM" },
  { day: "Sunday", hours: "Closed" },
],
```

- [ ] **Step 7: Commit**

```bash
git add src/app/admin/settings/page.tsx
git commit -m "feat: add admin UI for tagline, addresses, call phone, business hours"
```

---

## Chunk 3: The Brand Page — Leadership Row + Chairman

### Task 11: LeadershipRow Component

**Files:**
- Create: `src/components/features/about/LeadershipRow.tsx`

- [ ] **Step 1: Create the LeadershipRow component**

```tsx
"use client";

import Image from "next/image";
import { User } from "lucide-react";
import { motion } from "motion/react";

type LeadershipMember = {
  name: string;
  designation: string;
  imageUrl: string | null;
};

type LeadershipRowProps = {
  members: LeadershipMember[];
};

export function LeadershipRow({ members }: LeadershipRowProps) {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#2F2582]" />
            <span className="text-xs font-semibold tracking-[0.15em] text-[#2F2582] uppercase">
              Our Leadership
            </span>
            <span className="h-px w-8 bg-[#2F2582]" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
            The People Behind Reliable Drapes
          </h2>
        </motion.div>

        {/* 3 equal cards */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member, index) => (
            <motion.div
              key={member.designation}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-gray-100 to-gray-200">
                {member.imageUrl ? (
                  <Image
                    src={member.imageUrl}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <User className="h-16 w-16 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="p-5 text-center">
                <p className="text-lg font-bold text-gray-900">{member.name}</p>
                <p className="mt-1 text-sm font-semibold tracking-wide text-[#2F2582] uppercase">
                  {member.designation}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/about/LeadershipRow.tsx
git commit -m "feat: add LeadershipRow component for brand page"
```

---

### Task 12: ChairmanSection Component

**Files:**
- Create: `src/components/features/about/ChairmanSection.tsx`

- [ ] **Step 1: Read FounderSection for reference**

Read `src/components/features/about/FounderSection.tsx` to understand the layout pattern. The ChairmanSection mirrors it with flipped layout (text left, photo right).

- [ ] **Step 2: Create ChairmanSection**

Create `src/components/features/about/ChairmanSection.tsx` — same structure as FounderSection but with the image on the right and text on the left. Use the `about_sections` data from section_key `"chairman"`.

The component signature should match FounderSection:
```tsx
type Props = {
  section?: AboutSection;
};

export function ChairmanSection({ section }: Props) {
  // Similar to FounderSection but mirrored:
  // - Text on the LEFT
  // - Image on the RIGHT
  // - Uses section.title, section.content, section.image_url
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/features/about/ChairmanSection.tsx
git commit -m "feat: add ChairmanSection component with mirrored layout"
```

---

### Task 13: Update About Page + Exports + Vision Text

**Files:**
- Modify: `src/components/features/about/index.ts`
- Modify: `src/components/features/about/FounderSection.tsx:92`
- Modify: `src/app/about/page.tsx`

- [ ] **Step 1: Update barrel exports**

In `src/components/features/about/index.ts`, add:
```ts
export { LeadershipRow } from "./LeadershipRow";
export { ChairmanSection } from "./ChairmanSection";
```

- [ ] **Step 2: Verify admin about-sections page supports new section keys**

Read `src/app/admin/about-sections/page.tsx`. Check if it dynamically lists ALL rows from `about_sections` (good) or if it hardcodes a list of known section_keys like `["founder", "why-choose", "features", "vision-mission"]` (bad — would need updating). If hardcoded, add `"chairman"` and `"director"` to the list.

- [ ] **Step 3: Fix vision text in FounderSection**

In `src/components/features/about/FounderSection.tsx`, line 92, change:
```
"His Vision Behind Reliable Drapes"
```
to:
```
"Vision Behind Reliable Drapes"
```

- [ ] **Step 4: Update About page**

Rewrite `src/app/about/page.tsx`:

```tsx
import {
  FounderSection,
  ChairmanSection,
  LeadershipRow,
  WhyChooseSection,
  FeaturesGrid,
  VisionMissionSection,
} from "@/components/features/about";
import { PageHero, Breadcrumb } from "@/components/shared";
import { getAboutSections } from "@/lib/actions/about-sections";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const result = await getAboutSections();
  const sections = result.success ? result.data : [];

  const sectionsMap = new Map(
    sections?.map((section) => [section.section_key, section]),
  );

  const founderSection = sectionsMap.get("founder");
  const chairmanSection = sectionsMap.get("chairman");
  const directorSection = sectionsMap.get("director");

  const leadershipMembers = [
    {
      name: founderSection?.title || "Founder",
      designation: "Founder",
      imageUrl: founderSection?.image_url || null,
    },
    {
      name: chairmanSection?.title || "Chairman",
      designation: "Chairman",
      imageUrl: chairmanSection?.image_url || null,
    },
    {
      name: directorSection?.title || "Director",
      designation: "Director",
      imageUrl: directorSection?.image_url || null,
    },
  ];

  return (
    <main className="mt-14 md:mt-16 lg:mt-[72px]">
      <PageHero heading="About Reliable Drapes" />
      <Breadcrumb />
      <LeadershipRow members={leadershipMembers} />
      <FounderSection section={founderSection} />
      <ChairmanSection section={chairmanSection} />
      <WhyChooseSection section={sectionsMap.get("why-choose")} />
      <FeaturesGrid section={sectionsMap.get("features")} />
      <VisionMissionSection section={sectionsMap.get("vision-mission")} />
    </main>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/features/about/index.ts src/components/features/about/FounderSection.tsx src/app/about/page.tsx
git commit -m "feat: restructure brand page with leadership row and chairman section"
```

---

## Chunk 4: Exhibitions & Moments — Full Rewrite

### Task 14: Exhibition Server Actions

**Files:**
- Modify: `src/lib/actions/exhibitions.ts`

- [ ] **Step 1: Read existing exhibitions.ts**

Read `src/lib/actions/exhibitions.ts` to understand existing action patterns (types, admin check, Supabase queries).

- [ ] **Step 2: Add new types and functions**

Add new types and server actions for the year-based structure. Keep existing functions for backward compat (old admin page still references them during transition). Add:

```ts
// Types
export type ExhibitionYear = {
  id: string;
  year: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ExhibitionItem = {
  id: string;
  year_id: string;
  type: "exhibition" | "moment" | "news";
  title: string;
  description: string | null;
  image_url: string | null;
  source_name: string | null;
  article_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Public: get all active years
export async function getExhibitionYears()

// Public: get items for a year + type
export async function getExhibitionItems(yearId: string, type?: string)

// Admin: CRUD for years
export async function createExhibitionYear(year: number)
export async function updateExhibitionYear(id: string, data: { year?: number; is_active?: boolean })
export async function deleteExhibitionYear(id: string)

// Admin: CRUD for items
export async function createExhibitionItem(data: Omit<ExhibitionItem, "id" | "created_at" | "updated_at">)
export async function updateExhibitionItem(id: string, data: Partial<ExhibitionItem>)
export async function deleteExhibitionItem(id: string)
export async function toggleExhibitionItemStatus(id: string, isActive: boolean)
```

Each follows the existing pattern:
- `getAdminSupabase()` for writes, `getAnonSupabase()` for reads
- Return `{ success, data/error }`
- **All admin write functions MUST call `await verifyAdmin()` before performing any DB operation** (see existing `createExhibition()` for the pattern)
- **Revalidate paths** after writes: `revalidatePath("/exhibitions-events")` and `revalidatePath("/admin/exhibitions")`

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions/exhibitions.ts
git commit -m "feat: add server actions for year-based exhibitions"
```

---

### Task 15: Exhibition UI Components

**Files:**
- Create: `src/components/features/exhibitions/YearTabs.tsx`
- Create: `src/components/features/exhibitions/SubSectionTabs.tsx`
- Create: `src/components/features/exhibitions/NewsArticleCard.tsx`
- Create: `src/components/features/exhibitions/index.ts`

**Note:** The directory `src/components/features/exhibitions/` does not exist yet. Create it before creating files.

**Motion import:** Use `import { motion } from "motion/react"` (the project standard), NOT `"framer-motion"`. Some older pages (like `contact/page.tsx`) use the old import — do not copy that pattern.

- [ ] **Step 1: Create YearTabs component**

Horizontal scrollable year tabs for desktop. Dropdown for mobile. Props: `years: ExhibitionYear[]`, `activeYear: string`, `onYearChange: (yearId: string) => void`.

- [ ] **Step 2: Create SubSectionTabs component**

Rounded pill tabs for "Exhibitions" / "Moments" / "In the News". Props: `activeType: string`, `onTypeChange: (type: string) => void`.

- [ ] **Step 3: Create NewsArticleCard component**

Card with: thumbnail (16:9 aspect), source name label, headline, "Read Article →" link. Props: `item: ExhibitionItem`.

- [ ] **Step 4: Create barrel export**

```ts
export { YearTabs } from "./YearTabs";
export { SubSectionTabs } from "./SubSectionTabs";
export { NewsArticleCard } from "./NewsArticleCard";
```

- [ ] **Step 5: Commit**

```bash
git add src/components/features/exhibitions/
git commit -m "feat: add exhibition UI components (YearTabs, SubSectionTabs, NewsArticleCard)"
```

---

### Task 16: Exhibitions Public Page Rewrite

**Files:**
- Modify: `src/app/exhibitions-events/page.tsx`

- [ ] **Step 1: Rewrite the exhibitions page**

Replace the flat gallery with the year-based structure:

1. Fetch years on mount with `getExhibitionYears()`
2. Default to most recent year
3. Fetch items for selected year + type with `getExhibitionItems(yearId, type)`
4. Render: PageHero → Breadcrumb → YearTabs → SubSectionTabs → content grid
5. For type `"exhibition"` or `"moment"`: photo grid (reuse existing card style)
6. For type `"news"`: `NewsArticleCard` grid

- [ ] **Step 2: Commit**

```bash
git add src/app/exhibitions-events/page.tsx
git commit -m "feat: rewrite exhibitions page with year-based navigation"
```

---

### Task 17: Exhibitions Admin Page Rewrite

**Files:**
- Modify: `src/app/admin/exhibitions/page.tsx`

- [ ] **Step 1: Read existing admin exhibitions page**

Read `src/app/admin/exhibitions/page.tsx` to understand the current CRUD pattern.

- [ ] **Step 2: Rewrite with year management + item management**

The admin page needs:

1. **Year list** — table/grid of years with add/toggle/delete
2. **Year selector** — pick a year to manage items
3. **Type filter** — Exhibition / Moment / News tabs
4. **Items grid** — CRUD for items within selected year + type
5. **Item form** — title, description, image (media picker), display_order. For type "news": also source_name, article_url
6. **Add Year modal** — simple year number input

Follow the existing admin page pattern (Card components, modals, toast notifications).

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/exhibitions/page.tsx
git commit -m "feat: rewrite exhibitions admin with year-based management"
```

---

## Chunk 5: Store Locator Redesign

### Task 18: StateFilterModal Component

**Files:**
- Create: `src/components/features/store-locator/StateFilterModal.tsx`

- [ ] **Step 1: Create the StateFilterModal**

Props: `isOpen: boolean`, `onClose: () => void`, `states: string[]`, `selectedStates: string[]`, `onApply: (states: string[]) => void`.

Features:
- Modal overlay with checkbox grid (3 columns)
- "All States" checkbox that toggles all
- Apply + Clear buttons
- Dynamically populated from stores' state values

- [ ] **Step 2: Commit**

```bash
git add src/components/features/store-locator/StateFilterModal.tsx
git commit -m "feat: add StateFilterModal for store locator"
```

---

### Task 19: Store Locator Page + StoreGrid Rewrite

**Files:**
- Modify: `src/app/store-locator/page.tsx`
- Modify: `src/components/features/store-locator/StoreGrid.tsx`

- [ ] **Step 1: Rewrite StoreGrid**

Replace current grid (`src/components/features/store-locator/StoreGrid.tsx`, currently 63 lines) with Sarom-style 4-column cards. The component receives an array of stores already filtered.

Card structure:
```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {stores.map((store) => (
    <div key={store.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* State header bar */}
      <div className="bg-[#2F2582] px-4 py-2.5 text-center">
        <p className="text-xs font-bold tracking-widest text-white uppercase">
          {store.state || store.city}
        </p>
      </div>
      {/* Store details */}
      <div className="p-4">
        <p className="text-sm font-bold text-gray-900">{store.name}</p>
        <p className="mt-2 text-xs leading-relaxed text-gray-600">{store.address}</p>
      </div>
    </div>
  ))}
</div>
```

- [ ] **Step 2: Rewrite store-locator page**

1. Remove the current `PageHeader` search input and `StoreGridSkeleton` import
2. Keep `PageHero` and `Breadcrumb` at top
3. Add state for: `selectedStates: string[]`, `isFilterOpen: boolean`, `visibleCount: number` (for pagination)
4. Extract unique states: `const uniqueStates = [...new Set(stores.map(s => s.state).filter(Boolean))].sort()`
5. Filter: `const filtered = selectedStates.length === 0 ? stores : stores.filter(s => selectedStates.includes(s.state))`
6. Paginate: `const visible = filtered.slice(0, visibleCount)` with `STORES_PER_PAGE` from constants
7. "Filter by States" button opens `StateFilterModal`
8. "Load More" button increments `visibleCount` by `STORES_PER_PAGE`
9. Map: keep the existing Google Maps iframe embed showing India (updating the `src` to center on India is fine). Below it show store count text.

- [ ] **Step 3: Commit**

```bash
git add src/app/store-locator/page.tsx src/components/features/store-locator/StoreGrid.tsx
git commit -m "feat: redesign store locator with state filter and card grid"
```

---

## Chunk 6: Final Verification

### Task 20: Run Type Check and Lint

- [ ] **Step 1: Run typecheck**

```bash
npx turbo typecheck
```

Expected: No type errors. Fix any that appear.

- [ ] **Step 2: Run lint**

```bash
npx turbo lint
```

Expected: No lint errors. Fix any that appear.

- [ ] **Step 3: Run prettier**

```bash
npx prettier --write "src/**/*.{ts,tsx}" --check
```

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "chore: fix type and lint errors from website changes"
```

---

### Task 21: Final Commit + Summary

- [ ] **Step 1: Verify all changes are committed**

```bash
git status
git log --oneline -15
```

- [ ] **Step 2: Create summary of what was done**

List all commits and verify they map to the spec requirements.
