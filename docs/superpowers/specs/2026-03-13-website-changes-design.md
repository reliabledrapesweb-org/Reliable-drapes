# Website Changes — Design Spec

**Date:** 2026-03-13
**Status:** Approved

## Overview

A set of UI, content, and admin changes to the Reliable Drapes website covering: header, footer, "The Brand" page, Exhibitions & Moments, Store Locator, Contact Us, Careers, and an admin panel upload bug fix.

Requirements #5 (Instagram link in footer videos) and #15 (Remove B2B in shop header) are deferred.

---

## 1. GeM Logo — Increase Size in Header

**Current state:** The GeM Assessed logo in the header has 4 size tiers controlled via admin settings. The `Image` component uses pixel values for `width`/`height` props and Tailwind classes for `className`. All tiers are too small to be clearly visible.

**Change:** Increase all size tiers. Values below are for the `next/image` `width`/`height` pixel props and the Tailwind `className` height utility:

| Tier | Current (px width / className) | New (px width / className) |
|------|-------------------------------|---------------------------|
| small | width={64}, `h-5 xl:h-6` | width={96}, `h-8 xl:h-9` |
| medium | width={88}, `h-6 xl:h-7` | width={128}, `h-10 xl:h-11` |
| large | width={120}, `h-8 xl:h-9` | width={160}, `h-12 xl:h-14` |
| extra-large | width={152}, `h-10 xl:h-11` | width={192}, `h-14 xl:h-16` |

Note: `h-14` and `h-16` are standard Tailwind utilities. The `width`/`height` pixel props on `next/image` accept arbitrary numbers.

**Files affected:**
- `src/components/layout/Header.tsx` — update size maps for the GeM logo `Image` component

**No DB changes.**

---

## 2. Footer — Editable B2B Tagline + Dual Address Blocks

**Current state:** Footer has a hardcoded tagline ("Reliable Drapes provides B2B furnishing solutions...") and a single address field from `site_settings.company_address`.

**Change:**
- Replace the hardcoded tagline with an admin-editable `company_tagline` field from `site_settings`
- Replace the single address block with two blocks side by side: **Head Office** and **Warehouse**
- Both addresses pulled from new `site_settings` fields
- Footer phone number: `96257 31948` (from existing `site_settings.company_phone`)

**New `site_settings` columns:**
- `company_tagline` (text) — the line near the address (currently says "B2B Furnishing")
- `head_office_address` (text) — full head office address
- `warehouse_address` (text) — full warehouse address

**Updated `getCompanyDetails()` return type:**
```ts
{
  email: string;
  phone: string;           // company_phone (96257 31948)
  address: string;         // legacy, kept for backward compat
  tagline: string;         // company_tagline (B2B line)
  headOfficeAddress: string;
  warehouseAddress: string;
}
```
Fallbacks: `tagline` defaults to existing hardcoded B2B text, addresses default to empty string.

**Files affected:**
- `supabase/migrations/` — single migration adding all new `site_settings` columns (shared with sections 8 and 12)
- `src/lib/actions/site-settings.ts` — expose new fields in `getCompanyDetails()`
- `src/components/layout/Footer.tsx` — render two address blocks + editable tagline
- `src/app/admin/settings/` — add input fields for new settings in the Site tab

---

## 3. The Brand — Leadership Row + Chairman Write-up

**Current state:** The About page has: FounderSection → WhyChooseSection → FeaturesGrid → VisionMissionSection. Only the Founder has a profile and write-up.

**Change:**

### 3a. Leadership Row
New section at the top of the About page showing 3 equal large profile cards in a row:
- **Founder** — photo + name + "Founder" designation
- **Chairman** — photo + name + "Chairman" designation
- **Director** — photo + name + "Director" designation

Each card: large portrait photo (aspect 3:4), name below, designation in purple text. Responsive: 3 cols → 1 col on mobile.

### 3b. Write-ups
Below the leadership row:
1. **Founder write-up** (existing, restructured) — photo left, text right
2. **Chairman write-up** (new) — text left, photo right (mirrors Founder layout)

Director does NOT get a write-up.

### 3c. Vision Text
The VisionMissionSection currently reads "His Vision Behind Reliable Drapes". Remove the "His" prefix so it reads **"Vision Behind Reliable Drapes"**.

**Implementation:**
- Add new `about_sections` rows with `section_key`: `chairman`, `director`
- New component: `LeadershipRow` — renders 3 cards from founder/chairman/director sections
- New component: `ChairmanSection` — mirrors `FounderSection` with flipped layout
- Update `VisionMissionSection` to use "Vision Behind Reliable Drapes"
- All editable through existing `/admin/about-sections`

**About page flow:**
1. LeadershipRow (Founder, Chairman, Director cards)
2. FounderSection (write-up)
3. ChairmanSection (write-up)
4. WhyChooseSection
5. FeaturesGrid
6. VisionMissionSection ("Vision Behind Reliable Drapes")

**Files affected:**
- `src/app/about/page.tsx` — new page structure
- `src/components/features/about/LeadershipRow.tsx` — new component
- `src/components/features/about/ChairmanSection.tsx` — new component
- `src/components/features/about/FounderSection.tsx` — change "His Vision Behind Reliable Drapes" to "Vision Behind Reliable Drapes"
- `src/components/features/about/index.ts` — export new components
- Seed migration for chairman/director `about_sections` rows:
  ```sql
  INSERT INTO about_sections (section_key, title, subtitle, content, display_order, is_active)
  VALUES
    ('chairman', 'Chairman', 'Chairman', 'Chairman write-up to be added.', 2, true),
    ('director', 'Director', 'Director', '', 3, true);
  ```

---

## 4. Admin Editability of Write-ups

**Current state:** About section content is already editable via `/admin/about-sections`.

**Confirmation:** Yes, all write-ups (Founder, Chairman) can be edited from the admin panel. No changes needed beyond what's in section 3.

---

## 5. ~~Instagram Link in Footer Videos~~ — DEFERRED

---

## 6. Exhibitions & Moments — Year-Based Restructure

**Current state:** Flat gallery grid pulling from `exhibitions` table. No year grouping or sub-categorization.

**Change:** Complete restructure to year-based navigation with 3 sub-sections per year.

### Database

**New tables:**

```sql
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
  -- news-specific fields
  source_name text,        -- e.g., "Times of India"
  article_url text,        -- external link
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- updated_at triggers (consistent with existing tables)
CREATE TRIGGER set_exhibition_years_updated_at
  BEFORE UPDATE ON exhibition_years
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_exhibition_items_updated_at
  BEFORE UPDATE ON exhibition_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

RLS policies: public read for active items, admin write access.

### Public Page UI

1. **Year tabs** — horizontal scrollable tabs (2014–present). Active year highlighted in purple. Mobile: dropdown selector.
2. **Sub-section pills** — "Exhibitions" / "Moments" / "In the News" as rounded pill tabs within each year.
3. **Exhibitions & Moments** — photo grid (3 columns) with title overlay on each image.
4. **In the News** — article card layout: thumbnail image + source name + headline + "Read Article →" link.

### Admin Page

Replace existing `/admin/exhibitions` with:
- **Year management** — add/remove years, toggle active
- **Items per year** — select year → type filter (Exhibition/Moment/News) → CRUD items
- **News-specific fields** — source name + article URL inputs shown when type = "news"
- **Display order** — numeric input per item for manual ordering (avoids adding a drag-and-drop library dependency)

### Data Migration

Existing rows in the `exhibitions` table will be migrated into the new tables. The migration SQL will:
1. Extract distinct years from `start_date` and insert into `exhibition_years`.
2. Copy each `exhibitions` row into `exhibition_items` with `type = 'exhibition'`, mapping `year_id` from the extracted year.
3. The old `exhibitions` table will be kept but no longer read by the public page. It can be dropped in a future cleanup migration once the admin confirms all data is intact.

```sql
-- Migrate existing data
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

**Files affected:**
- `supabase/migrations/` — new migration for `exhibition_years`, `exhibition_items`, data migration, triggers, RLS
- `src/lib/actions/exhibitions.ts` — new functions for year-based queries
- `src/app/exhibitions-events/page.tsx` — complete rewrite
- `src/app/admin/exhibitions/page.tsx` — complete rewrite
- `src/components/features/exhibitions/YearTabs.tsx` — year tab navigation
- `src/components/features/exhibitions/SubSectionTabs.tsx` — exhibition/moment/news pill selector
- `src/components/features/exhibitions/NewsArticleCard.tsx` — article card for "In the News"
- `src/components/features/exhibitions/index.ts` — barrel exports

---

## 7. Store Locator — Sarom-Inspired Redesign

**Current state:** Search-based filtering with a store grid and a generic Google Maps iframe.

**Change:** Sarom-inspired layout adapted to Reliable Drapes design aesthetic.

### UI Structure

1. **"Filter by States" button** — purple branded button that opens a modal
2. **State filter modal** — checkbox grid populated dynamically from stores' state values. "All States" option. Apply/Clear buttons.
3. **4-column card grid** — each card has:
   - Purple (#2F2582) header bar with STATE NAME (uppercase)
   - Store name (bold)
   - Full address
   - Responsive: 4 → 2 → 1 columns
4. **"Load More" button** — pagination (8 cards per page)
5. **Map section below** — Google Maps embed with store markers. Implementation: use a dynamically constructed Google Maps Embed API URL with the `&q=lat,lng` parameter for each store. If there are too many stores for a single embed, fall back to a static India map with a "View on Google Maps" link per store card. If a Google Maps JavaScript API key is available, use the JS API for interactive markers instead. Stores missing lat/lng are excluded from the map but still shown in the card grid.

**Pagination constant:** `STORES_PER_PAGE = 8` in `src/lib/constants/app.ts`.

### No DB Changes

The existing `stores` table already has `name`, `address`, `city`, `state`, `latitude`, `longitude`. No schema changes needed.

**Files affected:**
- `src/app/store-locator/page.tsx` — rewrite page layout
- `src/components/features/store-locator/StoreGrid.tsx` — rewrite to card grid with state headers
- New component: `StateFilterModal.tsx`
- Update map section to use marker-based embed

---

## 8. Contact Us — Call Number Change

**Current state:** Contact Us call section shows `COMPANY_PHONE` constant (`+91 85069 31948`).

**Change:**
- Add `contact_call_phone` field to `site_settings` (text)
- Set initial value to `+91 98113 31948`
- Contact Us "Call" section reads from this field
- Admin can change it later via Settings → Site tab

**Files affected:**
- `supabase/migrations/` — add column
- `src/lib/actions/site-settings.ts` — expose field
- `src/app/contact/page.tsx` — read from settings instead of constant
- `src/app/admin/settings/` — add input field

---

## 9. Contact Us — Message Section Number

**Current state:** Message form section shows `COMPANY_PHONE` constant (`+91 85069 31948`).

**Change:** This section needs `96257 31948`. Here is the definitive phone number strategy across the entire app:

### Phone Number Source of Truth

| Location | Number | Source |
|----------|--------|--------|
| Contact Us — Call button | `+91 98113 31948` (temp) | `site_settings.contact_call_phone` (admin-editable) |
| Contact Us — Message form text | `+91 96257 31948` | `site_settings.company_phone` |
| Footer | `+91 96257 31948` | `site_settings.company_phone` |
| Style Expert | `+91 96257 31948` | `WHATSAPP_NUMBER` constant (unchanged) |
| Careers — HR | `+91 85069 31948` | `HR_PHONE` constant (new) |

**Actions:**
1. Update `COMPANY_PHONE` constant to `"+91 96257 31948"` (used as fallback only)
2. Set `site_settings.company_phone` DB value to `+91 96257 31948`
3. Add `HR_PHONE = "+91 85069 31948"` constant for careers
4. Contact Us message form reads from `site_settings.company_phone`
5. Contact Us call button reads from `site_settings.contact_call_phone`

This ensures no page accidentally shows the wrong number. The `COMPANY_PHONE` constant is only a fallback if DB is unreachable.

**Files affected:**
- `src/lib/constants/app.ts` — update `COMPANY_PHONE` to `"+91 96257 31948"`, add `HR_PHONE`
- `src/app/contact/page.tsx` — message section reads from `site_settings.company_phone`, call section from `site_settings.contact_call_phone`

---

## 10. Style Expert — Number

No change needed. Style Expert already uses `96257 31948` via `WHATSAPP_NUMBER` constant.

---

## 11. Footer Addresses

Covered in section 2 above.

---

## 12. Business Hours — Admin-Editable

**Current state:** Hardcoded in `src/app/contact/page.tsx` as an array: Mon-Fri 9-6, Sat 10-4, Sun Closed.

**Change:**
- Add `business_hours` JSONB field to `site_settings`
- Format: `[{ "day": "Monday - Friday", "hours": "9:00 AM - 6:00 PM" }, ...]`
- Default value seeded in migration: `[{"day":"Monday - Friday","hours":"9:00 AM - 6:00 PM"},{"day":"Saturday","hours":"10:00 AM - 4:00 PM"},{"day":"Sunday","hours":"Closed"}]`
- Contact page reads from DB with fallback to hardcoded defaults if field is null/empty
- Admin Settings → Site tab: structured rows editor (add/remove rows, each row has "Day" text input + "Hours" text input). Not free-form JSON.

**Validation (Zod):**
```ts
const businessHoursSchema = z.array(
  z.object({
    day: z.string().min(1),
    hours: z.string().min(1),
  })
).min(1);
```

**Files affected:**
- `supabase/migrations/` — add column (part of the single shared migration)
- `src/lib/actions/site-settings.ts` — expose field with Zod validation
- `src/app/contact/page.tsx` — read from settings
- `src/app/admin/settings/` — add structured business hours editor

---

## 13. Contact Us — Warehouse Address

**Current state:** Shows `"Warehouse - PNP"` from `COMPANY_ADDRESS` constant.

**Change:** Replace with the complete warehouse address from `site_settings.warehouse_address` (same field used in footer, section 2).

**Files affected:**
- `src/app/contact/page.tsx` — read `warehouse_address` from site settings

---

## 14. Careers — HR Contact Number

**Current state:** Careers page currently shows a placeholder Nigerian number (`+234 803 456 7890`).

**Change:** Replace with `+91 85069 31948` using the new `HR_PHONE` constant (defined in section 9's phone number strategy).

**Files affected:**
- `src/app/careers/page.tsx` — replace placeholder with `HR_PHONE` constant
- `src/lib/constants/app.ts` — `HR_PHONE` constant added (see section 9)

---

## 15. ~~Remove B2B in Shop Header~~ — DEFERRED

---

## Bug: Admin Panel Upload Error

**Symptoms:**
- Upload works first time, errors on second attempt
- Admin → Settings → Shop toggle fails
- Instagram/Facebook social links can't be saved

**Investigation plan:**
1. Inspect `src/lib/actions/site-settings.ts` — check upsert logic for `site_settings` table
2. Check Supabase RLS policies on `site_settings` — ensure UPDATE is allowed for admin role
3. Look at the media upload action for stale state or missing error handling
4. Test for race conditions in concurrent settings saves
5. Check if the settings form resets its state properly after a successful save

**Likely root cause:** Either a Supabase RLS policy preventing UPDATE after initial INSERT, or a client-side state issue where the form/upload component doesn't reset properly after the first operation.

**Files to investigate:**
- `src/lib/actions/site-settings.ts`
- `src/lib/actions/media.ts`
- `src/app/admin/settings/` — settings form components
- `supabase/migrations/` — RLS policies on `site_settings`

**Acceptance criteria:**
1. Admin can upload a file, then immediately upload another file without error
2. Admin → Settings → Shop toggle saves successfully and persists on page reload
3. Instagram and Facebook social link URLs can be saved and persist on page reload
4. No console errors during any of the above operations

---

## Summary of Database Changes

### New Tables
| Table | Purpose |
|-------|---------|
| `exhibition_years` | Year entries for exhibitions |
| `exhibition_items` | Items within each year (exhibitions, moments, news) |

### New `site_settings` Columns
| Column | Type | Purpose |
|--------|------|---------|
| `company_tagline` | text | Editable B2B tagline in footer |
| `head_office_address` | text | Head office address for footer/contact |
| `warehouse_address` | text | Warehouse address for footer/contact |
| `contact_call_phone` | text | Admin-editable Contact Us call number |
| `business_hours` | jsonb | Day-by-day business hours |

### New `about_sections` Rows
| Section Key | Purpose |
|-------------|---------|
| `chairman` | Chairman photo + write-up |
| `director` | Director photo (no write-up) |

---

## Summary of New Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `LeadershipRow` | `src/components/features/about/` | 3-card leadership display |
| `ChairmanSection` | `src/components/features/about/` | Chairman write-up (mirrored layout) |
| `StateFilterModal` | `src/components/features/store-locator/` | State checkbox filter |
| `YearTabs` | `src/components/features/exhibitions/` | Year-based horizontal tab navigation |
| `SubSectionTabs` | `src/components/features/exhibitions/` | Exhibition/Moment/News pill selector |
| `NewsArticleCard` | `src/components/features/exhibitions/` | "In the News" article card |
