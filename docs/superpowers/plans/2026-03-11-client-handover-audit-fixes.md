# Client Handover Audit Fixes

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all critical, high, medium, and low issues identified in the full application audit before client handover.

**Architecture:** Fixes are independent and ordered by severity. Each task is self-contained, touching minimal files. Admin authorization uses the established pattern from `jobs.ts` (verify user via `supabaseServer()` + profile role check).

**Tech Stack:** Next.js 15 (App Router), Supabase (Auth + Storage + DB), TypeScript

---

## Chunk 1: Critical Security & Bug Fixes

### Task 1: Remove debug/test API endpoints

**Files:**
- Delete: `src/app/api/debug-env/route.ts`
- Delete: `src/app/api/test-oauth-url/route.ts`

- [ ] **Step 1: Delete the debug-env endpoint**

Delete `src/app/api/debug-env/route.ts` entirely.

- [ ] **Step 2: Delete the test-oauth-url endpoint**

Delete `src/app/api/test-oauth-url/route.ts` entirely.

- [ ] **Step 3: Verify no imports reference these endpoints**

Run: `grep -r "debug-env\|test-oauth-url" src/`
Expected: No matches

- [ ] **Step 4: Commit**

```bash
git add -u src/app/api/debug-env/ src/app/api/test-oauth-url/
git commit -m "fix(security): remove debug and test API endpoints"
```

---

### Task 2: Add admin authorization to server actions

The correct pattern exists in `src/lib/actions/jobs.ts:103-119`. First extract a reusable helper, then apply it to all unprotected actions.

**Files:**
- Create: `src/lib/utils/admin-auth.ts`
- Modify: `src/lib/actions/coupons.ts`
- Modify: `src/lib/actions/exhibitions.ts`
- Modify: `src/lib/actions/stores.ts`
- Modify: `src/lib/actions/media.ts`
- Modify: `src/lib/actions/catalogues.ts`
- Modify: `src/lib/actions/catalogue-categories.ts`
- Modify: `src/lib/actions/about-sections.ts`

- [ ] **Step 1: Create reusable admin verification helper**

Create `src/lib/utils/admin-auth.ts`:

```typescript
"use server";

import { supabaseServer } from "@/lib/supabase/server";

export async function verifyAdmin() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Admin privileges required");
  }

  return { supabase, user };
}
```

- [ ] **Step 2: Add `verifyAdmin()` to exhibitions.ts**

In `src/lib/actions/exhibitions.ts`, add `await verifyAdmin()` at the top of:
- `createExhibition()` (before the `getAdminSupabase()` call)
- `updateExhibition()` (before the `getAdminSupabase()` call)
- `deleteExhibition()` (before the `getAdminSupabase()` call)
- `toggleExhibitionStatus()` (before the `getAdminSupabase()` call)

Import: `import { verifyAdmin } from "@/lib/utils/admin-auth";`

Pattern for each function — add as first line inside try block:
```typescript
await verifyAdmin();
```

- [ ] **Step 3: Add `verifyAdmin()` to stores.ts**

Same pattern as Step 2. Add to: `createStore()`, `updateStore()`, `deleteStore()`

- [ ] **Step 4: Add `verifyAdmin()` to coupons.ts**

Same pattern. Add to: `createCoupon()`, `updateCoupon()`, `deleteCoupon()`, `toggleCouponStatus()`

- [ ] **Step 5: Add `verifyAdmin()` to media.ts**

Same pattern. Add to: `uploadMediaItem()`, `deleteMediaItem()`, `updateMediaItem()`
Note: `getMediaItems()` is a read operation used by admin UI — leave as-is.

- [ ] **Step 6: Add `verifyAdmin()` to catalogues.ts**

Same pattern. Add to: `createCatalogue()`, `updateCatalogue()`, `deleteCatalogue()`

- [ ] **Step 7: Add `verifyAdmin()` to catalogue-categories.ts**

Same pattern. Add to: `createCatalogueCategory()`, `updateCatalogueCategory()`, `deleteCatalogueCategory()`

- [ ] **Step 8: Add `verifyAdmin()` to about-sections.ts**

Same pattern. Add to: `updateAboutSection()`, `toggleAboutSectionStatus()`

- [ ] **Step 9: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: "Compiled successfully"

- [ ] **Step 10: Commit**

```bash
git add src/lib/utils/admin-auth.ts src/lib/actions/
git commit -m "fix(security): add admin authorization checks to all server actions"
```

---

### Task 3: Fix missing OG image

**Files:**
- Modify: `src/app/layout.tsx:70` (google verification placeholder)

Note: An actual og-image.png file needs to be created/provided by the client. For now, we'll use a generated placeholder.

- [ ] **Step 1: Generate a simple OG image placeholder**

Use the existing hero image as a temporary OG image:
```bash
cp public/images/hero/heroImg2.png public/og-image.png
```

- [ ] **Step 2: Remove placeholder google-site-verification**

In `src/app/layout.tsx:70`, remove or comment out the placeholder:

Change:
```typescript
google: "google-site-verification-code",
```
To:
```typescript
// google: "ADD_REAL_VERIFICATION_CODE_HERE",
```

- [ ] **Step 3: Commit**

```bash
git add public/og-image.png src/app/layout.tsx
git commit -m "fix: add OG image placeholder and remove fake google verification"
```

---

### Task 4: Fix contact page — use constants for contact info and social links

**Files:**
- Modify: `src/lib/constants/app.ts`
- Modify: `src/app/contact/page.tsx`

- [ ] **Step 1: Update app constants with correct social links**

In `src/lib/constants/app.ts`, update `SOCIAL_LINKS` with real URLs (or leave as `""` with a comment so client knows to fill them in):

```typescript
export const SOCIAL_LINKS = {
  facebook: "", // TODO: Add company Facebook URL
  instagram: "", // TODO: Add company Instagram URL
  twitter: "", // TODO: Add company Twitter/X URL
  linkedin: "", // TODO: Add company LinkedIn URL
  website: "https://reliabledrapes.com",
};
```

- [ ] **Step 2: Update contact page to use constants**

In `src/app/contact/page.tsx`:

Add import:
```typescript
import { CONTACT_EMAIL, COMPANY_PHONE, SOCIAL_LINKS } from "@/lib/constants/app";
```

Replace hardcoded `contactItems` (lines 233-248):
- Line 237: `"Contact@reliabledrapes.org"` → `CONTACT_EMAIL`
- Line 242: `"+91 85069 31948"` → `COMPANY_PHONE`

Replace hardcoded `socialLinks` (lines 251-272):
Use `SOCIAL_LINKS` constants. Filter out empty links so they don't show dead links.

Replace hardcoded phone on line 369:
`"+91 96257 31948"` → `COMPANY_PHONE`

- [ ] **Step 3: Commit**

```bash
git add src/lib/constants/app.ts src/app/contact/page.tsx
git commit -m "fix: use constants for contact info, remove inconsistent phone numbers"
```

---

## Chunk 2: High Priority Fixes

### Task 5: Remove development artifacts

**Files:**
- Delete: `.claude/settings.local.json`
- Modify: `package.json` (remove `"3"` dependency)

- [ ] **Step 1: Remove .claude/settings.local.json from git tracking**

```bash
git rm --cached .claude/settings.local.json
```

Add to `.gitignore` if not already present:
```
.claude/settings.local.json
```

- [ ] **Step 2: Remove unused `"3"` package from dependencies**

In `package.json`, remove the line `"3": "^2.1.0"` from dependencies.

Run: `npm install`

- [ ] **Step 3: Commit**

```bash
git add .gitignore package.json package-lock.json
git commit -m "chore: remove dev artifacts and unused dependencies"
```

---

### Task 6: Create .env.example for client

**Files:**
- Create: `.env.example`

- [ ] **Step 1: Create .env.example with all required variables**

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Configuration (Required)
ADMIN_EMAILS=admin@yourcompany.com

# App URLs (Required)
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com/

# Google OAuth (Required for Google login)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Razorpay Payment Gateway (Required for payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Apple OAuth (Optional - for Apple Sign-In)
NEXT_PUBLIC_APPLE_CLIENT_ID=your_apple_client_id
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY="your_apple_private_key"

# SendGrid Email (Optional - for newsletters)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=newsletter@yourdomain.com
SENDGRID_FROM_NAME=Your Company Name

# Trader Portal (Optional - leave empty to show "coming soon")
NEXT_PUBLIC_TRADER_PORTAL_URL=
```

- [ ] **Step 2: Verify .env.example is NOT in .gitignore**

Check that `.gitignore` has the pattern `.env*` but excludes `.env.example`:
```
.env*.local
!.env.example
```

- [ ] **Step 3: Commit**

```bash
git add .env.example .gitignore
git commit -m "chore: add .env.example template for client setup"
```

---

## Chunk 3: Medium Priority Fixes

### Task 7: Clean up console statements and TODOs

**Files:**
- Modify: `src/app/admin/products/page.tsx` (remove console.warn at lines ~982, ~1001)
- Modify: `src/app/shop/page.tsx` (remove TODO at line ~271)

- [ ] **Step 1: Remove console.warn from products page**

In `src/app/admin/products/page.tsx`, find and remove the `console.warn()` calls around lines 982 and 1001.

- [ ] **Step 2: Remove TODO from shop page**

In `src/app/shop/page.tsx`, remove the TODO comment at line ~271.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/products/page.tsx src/app/shop/page.tsx
git commit -m "chore: remove debug console.warn and TODO comments"
```

---

### Task 8: Fix contact email capitalization

**Files:**
- Modify: `src/app/contact/page.tsx`

Note: This may already be fixed by Task 4 if the import was applied. Verify and fix if needed.

- [ ] **Step 1: Verify contact page uses CONTACT_EMAIL constant**

If Task 4 was applied, this is already done. Otherwise, replace `"Contact@reliabledrapes.org"` with the imported `CONTACT_EMAIL` constant.

- [ ] **Step 2: Commit if changes were needed**

---

## Chunk 4: Low Priority & Final Cleanup

### Task 9: Add gem_assessed_logo_size migration

**Files:**
- Create: `supabase/migrations/20260311000001_add_gem_logo_size_to_site_settings.sql`

- [ ] **Step 1: Create migration**

```sql
-- Add gem_assessed_logo_size column to site_settings
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS gem_assessed_logo_size TEXT DEFAULT 'medium';
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260311000001_add_gem_logo_size_to_site_settings.sql
git commit -m "feat: add gem_assessed_logo_size column to site_settings"
```

---

### Task 10: Final verification and push

- [ ] **Step 1: Run build to verify everything compiles**

Run: `npm run build 2>&1 | tail -10`
Expected: "Compiled successfully"

- [ ] **Step 2: Push all changes**

```bash
git push
```
