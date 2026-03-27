# Performance Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate site-wide slow page loads by removing the loading gate, converting key pages to server components, adding ISR caching, consolidating animation imports, and optimizing images.

**Architecture:** Replace the blocking `template.tsx` loading screen with a CSS fade-in. Convert homepage, e-catalogue, and shop pages from client to server components that fetch data server-side and pass it to interactive client children. Add ISR via Cloudflare KV. Standardize animation imports and add image optimization.

**Tech Stack:** Next.js 15 App Router, Cloudflare Pages (OpenNext), Supabase, motion/react, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-03-22-performance-overhaul-design.md`

---

## File Structure

### Files to Create
- `src/app/template.css` — CSS fade-in animation for page transitions
- `src/app/e-catalogue/ECatalogueClient.tsx` — Client component extracted from e-catalogue page
- `src/app/shop/ShopClient.tsx` — Client component extracted from shop page

### Files to Modify
- `src/app/template.tsx` — Replace loading gate with CSS fade-in (server component)
- `src/app/page.tsx` — Convert to server component, fetch hero data server-side
- `src/components/features/home/HeroSection.tsx` — Accept `images` prop instead of fetching
- `src/app/about/page.tsx` — Remove `force-dynamic`, add `revalidate`
- `src/app/e-catalogue/page.tsx` — Convert to server component with ISR
- `src/app/shop/page.tsx` — Convert to server component with ISR
- `wrangler.toml` — Add KV namespace binding for ISR cache
- `next.config.ts` — Image optimization changes
- 55 files with `framer-motion` imports → `motion/react`
- `src/components/providers/AuthProvider.tsx` — Render children immediately

### Files to Delete (if unused elsewhere)
- `src/components/ui/LoadingScreen.tsx` — Only used by `template.tsx` and `src/app/admin/layout.tsx`

---

## Task 1: Replace `template.tsx` Loading Gate with CSS Fade-In

**Files:**
- Create: `src/app/template.css`
- Modify: `src/app/template.tsx`

- [ ] **Step 1: Create CSS fade-in animation**

```css
/* src/app/template.css */
.template-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

- [ ] **Step 2: Replace `template.tsx` with server component**

Replace the entire contents of `src/app/template.tsx` with:

```tsx
import "./template.css";

export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="template-fade-in">{children}</div>;
}
```

This removes `"use client"`, all motion imports, the `LoadingScreen` import, the asset-waiting logic, and the `AnimatePresence` wrapper.

- [ ] **Step 3: Check if `LoadingScreen` is used elsewhere**

Run: `grep -r "LoadingScreen" src/ --include="*.tsx" --include="*.ts"`

Expected: Only `src/app/admin/layout.tsx` should still reference it. Do NOT delete `LoadingScreen` — the admin layout still uses it.

- [ ] **Step 4: Verify build succeeds**

Run: `npx next build` (or `npm run cf:build`)
Expected: Build succeeds with no new errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/template.tsx src/app/template.css
git commit -m "perf(template): replace loading gate with CSS fade-in

Remove asset-waiting logic and AnimatePresence from template.tsx.
Replace with a pure CSS fade-in animation, converting it from a
client component to a server component. This eliminates the 500ms-12s
loading screen that blocked every page navigation."
```

---

## Task 2: Convert Homepage to Server Component

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/features/home/HeroSection.tsx`

- [ ] **Step 1: Add `images` prop to HeroSection**

In `src/components/features/home/HeroSection.tsx`, change the component signature and remove the `useEffect` that fetches site settings (lines 33-54):

```tsx
// Change the export signature from:
export function HeroSection() {
// To:
export function HeroSection({ images }: { images?: string[] }) {
```

Replace the `useState` and fetch `useEffect` (lines 26-54) with:

```tsx
const [currentIndex, setCurrentIndex] = useState(0);
const [carouselImages, setCarouselImages] = useState<string[]>(
  images?.length ? images : [...DEFAULT_HERO_CAROUSEL_IMAGES],
);
```

Remove the entire `useEffect` block that calls `getSiteSettings()` (lines 33-54). Remove the `getSiteSettings` import (line 7) if no longer used.

Keep all other `useEffect` hooks (preload, auto-slide, keyboard nav) — they handle client-side interactivity.

- [ ] **Step 2: Convert `src/app/page.tsx` to server component**

Replace the entire file with:

```tsx
import {
  HeroSection,
  FeaturesSection,
  AboutSection,
  CategoriesSection,
  GoogleReviewsSection,
  NewsletterSection,
} from "@/components/features/home";
import { getSiteSettings } from "@/lib/actions/site-settings";
import { DEFAULT_HERO_CAROUSEL_IMAGES } from "@/lib/constants/app";

const normalizeCarouselImages = (images: unknown): string[] => {
  const fallbackImages = [...DEFAULT_HERO_CAROUSEL_IMAGES];
  if (!Array.isArray(images)) return fallbackImages;
  return fallbackImages.map((defaultImage, index) => {
    const value = images[index];
    return typeof value === "string" && value.trim().length > 0
      ? value.trim()
      : defaultImage;
  });
};

export const revalidate = 3600;

export default async function HomePage() {
  let heroImages: string[] = [...DEFAULT_HERO_CAROUSEL_IMAGES];

  try {
    const result = await getSiteSettings();
    if (result.success && result.settings) {
      heroImages = normalizeCarouselImages(result.settings.hero_carousel_images);
    }
  } catch {
    // Keep fallback images
  }

  return (
    <main>
      <HeroSection images={heroImages} />
      <FeaturesSection />
      <AboutSection />
      <CategoriesSection />
      <GoogleReviewsSection />
      <NewsletterSection />
    </main>
  );
}
```

Note: `normalizeCarouselImages` is moved here from `HeroSection.tsx`. Remove it from `HeroSection.tsx` after this change.

- [ ] **Step 3: Verify build succeeds**

Run: `npx next build`
Expected: Build succeeds. Homepage now renders server-side with hero images pre-fetched.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/components/features/home/HeroSection.tsx
git commit -m "perf(home): convert homepage to server component

Fetch hero carousel images server-side and pass as props to
HeroSection. Removes client-side data fetch waterfall on homepage.
Adds 1-hour ISR revalidation."
```

---

## Task 3: Add ISR to About Page

**Files:**
- Modify: `src/app/about/page.tsx`

- [ ] **Step 1: Replace `force-dynamic` with `revalidate`**

In `src/app/about/page.tsx`, replace line 13:

```tsx
// Remove:
export const dynamic = "force-dynamic";

// Add:
export const revalidate = 3600;
```

- [ ] **Step 2: Verify build succeeds**

Run: `npx next build`
Expected: Build succeeds. About page is now ISR-cached for 1 hour instead of force-dynamic.

- [ ] **Step 3: Commit**

```bash
git add src/app/about/page.tsx
git commit -m "perf(about): replace force-dynamic with 1-hour ISR revalidation

About page content rarely changes. Remove force-dynamic which
prevented all caching, replace with revalidate = 3600."
```

---

## Task 4: Convert E-Catalogue Page to Server Component

**Files:**
- Create: `src/app/e-catalogue/ECatalogueClient.tsx`
- Modify: `src/app/e-catalogue/page.tsx`

- [ ] **Step 1: Create `ECatalogueClient.tsx`**

Extract all client-side logic from the current `page.tsx` into a new client component. This file receives pre-fetched data as props and handles filtering, search, and the mobile filter sheet.

Create `src/app/e-catalogue/ECatalogueClient.tsx` with the full contents of the current `page.tsx`, but with these changes:
- Keep `"use client"` at the top
- Change the component name to `ECatalogueClient`
- Add props interface for the server-fetched data and URL params:

```tsx
"use client";

// ... keep all existing imports EXCEPT:
// - Remove: getCatalogues, getCatalogueCategories imports (server actions)
// - Remove: useSearchParams import
// - Keep: all other imports (motion, lucide, components, useMemo, useState, useEffect)

import type { Catalogue } from "@/lib/actions/catalogues";
import type { CatalogueCategory } from "@/lib/actions/catalogue-categories";

interface ECatalogueClientProps {
  initialCatalogues: Catalogue[];
  initialCategories: CatalogueCategory[];
  urlCategory: string;
  urlSearch: string;
  openCatalogueId: string | null;
}

export default function ECatalogueClient({
  initialCatalogues,
  initialCategories,
  urlCategory,
  urlSearch,
  openCatalogueId,
}: ECatalogueClientProps) {
  // Remove the useSearchParams() calls — use props instead
  // Remove the data-fetching useEffect (lines 83-111) — data comes from props
  // Initialize state from props:
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(
    parseCategoriesFromUrl(urlCategory),
  );
  const [catalogues] = useState<Catalogue[]>(initialCatalogues);
  const [categories] = useState<CatalogueCategory[]>(initialCategories);
  const [isLoading] = useState(false); // No loading — data is already here
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Keep the URL sync useEffect but use urlCategory prop:
  useEffect(() => {
    setSelectedFilters(parseCategoriesFromUrl(urlCategory));
  }, [urlCategory]);

  // ... rest of the component stays the same (useMemo, render, etc.)
  // But remove isLoading skeleton since data is pre-fetched
}
```

Keep all helper functions (`getDescendantCategoryNames`, `transformCatalogueToProduct`, `parseCategoriesFromUrl`) in this file.

- [ ] **Step 2: Rewrite `page.tsx` as server component**

Replace `src/app/e-catalogue/page.tsx` with:

```tsx
import { getCatalogues } from "@/lib/actions/catalogues";
import { getCatalogueCategories } from "@/lib/actions/catalogue-categories";
import ECatalogueClient from "./ECatalogueClient";

export const revalidate = 1800;

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; open?: string; search?: string }>;
}) {
  const params = await searchParams;

  const [cataloguesResult, categoriesResult] = await Promise.all([
    getCatalogues(),
    getCatalogueCategories(),
  ]);

  const catalogues = cataloguesResult.success ? (cataloguesResult.data ?? []) : [];
  const categories = categoriesResult.success ? (categoriesResult.data ?? []) : [];

  return (
    <ECatalogueClient
      initialCatalogues={catalogues}
      initialCategories={categories}
      urlCategory={params.category ?? ""}
      urlSearch={params.search ?? ""}
      openCatalogueId={params.open ?? null}
    />
  );
}
```

Note: In Next.js 15 App Router, `searchParams` is a Promise that must be awaited.

- [ ] **Step 3: Verify build succeeds**

Run: `npx next build`
Expected: Build succeeds. E-catalogue page fetches data server-side with 30-minute ISR.

- [ ] **Step 4: Commit**

```bash
git add src/app/e-catalogue/page.tsx src/app/e-catalogue/ECatalogueClient.tsx
git commit -m "perf(e-catalogue): convert to server component with ISR

Extract client interactivity to ECatalogueClient. Server page fetches
catalogues and categories via Promise.all and passes as props.
Adds 30-minute ISR revalidation."
```

---

## Task 5: Convert Shop Page to Server Component

**Files:**
- Create: `src/app/shop/ShopClient.tsx`
- Modify: `src/app/shop/page.tsx`

- [ ] **Step 1: Create `ShopClient.tsx`**

Same pattern as Task 4. Extract all client logic from `src/app/shop/page.tsx` into `src/app/shop/ShopClient.tsx`:

```tsx
"use client";

// Keep all existing imports EXCEPT:
// - Remove: getProducts, getCategories, getProductsByCategory, getSiteSettings, getActiveCoupons
// - Remove: useSearchParams, useRouter, usePathname
// - Keep: all other imports (motion, lucide, components, useMemo, useState, useEffect, useCallback)

import type { Product, Category } from "@/lib/actions/products";
import type { SiteSettings } from "@/lib/actions/site-settings";
import type { Coupon } from "@/lib/actions/coupons";

interface ShopClientProps {
  initialProducts: Product[];
  initialCategories: Category[];
  initialSiteSettings: SiteSettings | null;
  initialCoupons: Coupon[];
  urlSearchQuery: string;
  urlCategory: string;
}

export default function ShopClient({
  initialProducts,
  initialCategories,
  initialSiteSettings,
  initialCoupons,
  urlSearchQuery,
  urlCategory,
}: ShopClientProps) {
  // Initialize state from props instead of fetching:
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    parseCategoriesFromUrl(urlCategory),
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [products] = useState<Product[]>(initialProducts);
  const [allProducts] = useState<Product[]>(initialProducts);
  const [categories] = useState<Category[]>(initialCategories);
  const [isLoading] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [siteSettings] = useState<SiteSettings | null>(initialSiteSettings);
  const [coupons] = useState<Coupon[]>(initialCoupons);
  const [copiedCouponId, setCopiedCouponId] = useState<string | null>(null);

  // Remove ALL data-fetching useEffects (fetch categories, fetch settings, fetch products)
  // Remove useRouter, usePathname, useSearchParams usage
  // Remove updateShopUrl callback (no longer needed — URL params come from server)
  // Keep: activeFilterCount, filteredProducts useMemo, all UI rendering

  // ... rest of component (filtering, sorting, rendering)
}
```

Important: The current shop page uses `useRouter` and `usePathname` to update the URL when filters change. In the client component, keep `useRouter` and `usePathname` for URL updates on filter changes, but remove `useSearchParams` (initial values come from props).

- [ ] **Step 2: Rewrite `page.tsx` as server component**

Replace `src/app/shop/page.tsx` with:

```tsx
import { getProducts, getCategories } from "@/lib/actions/products";
import { getSiteSettings } from "@/lib/actions/site-settings";
import { getActiveCoupons } from "@/lib/actions/coupons";
import ShopClient from "./ShopClient";

export const revalidate = 1800;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const params = await searchParams;

  const [productsResult, categoriesResult, settingsResult, couponsResult] =
    await Promise.all([
      getProducts(),
      getCategories(),
      getSiteSettings(),
      getActiveCoupons(),
    ]);

  const products = productsResult.success ? (productsResult.data ?? []) : [];
  const categories = categoriesResult.success ? (categoriesResult.data ?? []) : [];
  const siteSettings = settingsResult.success ? (settingsResult.settings ?? null) : null;
  const coupons = couponsResult.success ? (couponsResult.data ?? []) : [];

  return (
    <ShopClient
      initialProducts={products}
      initialCategories={categories}
      initialSiteSettings={siteSettings}
      initialCoupons={coupons}
      urlSearchQuery={params.search ?? ""}
      urlCategory={params.category ?? ""}
    />
  );
}
```

- [ ] **Step 3: Verify build succeeds**

Run: `npx next build`
Expected: Build succeeds. Shop page fetches all data server-side with 30-minute ISR.

- [ ] **Step 4: Commit**

```bash
git add src/app/shop/page.tsx src/app/shop/ShopClient.tsx
git commit -m "perf(shop): convert to server component with ISR

Extract client interactivity to ShopClient. Server page fetches
products, categories, settings, and coupons via Promise.all.
Adds 30-minute ISR revalidation."
```

---

## Task 6: Configure Cloudflare KV for ISR

**Files:**
- Modify: `wrangler.toml`

- [ ] **Step 1: Create KV namespace**

Run: `CLOUDFLARE_API_TOKEN=$(grep '^CLOUDFLARE_API_TOKEN=' .env.local | cut -d'=' -f2) wrangler kv namespace create NEXT_CACHE_WORKERS_KV`

Capture the returned namespace ID.

- [ ] **Step 2: Add KV binding to `wrangler.toml`**

Add to the end of `wrangler.toml`:

```toml

[[kv_namespaces]]
binding = "NEXT_CACHE_WORKERS_KV"
id = "<paste-namespace-id-here>"
```

- [ ] **Step 3: Verify build succeeds with KV binding**

Run: `npm run cf:build`
Expected: Build succeeds. The ISR cache will use this KV namespace in production.

- [ ] **Step 4: Commit**

```bash
git add wrangler.toml
git commit -m "infra: add Cloudflare KV namespace for ISR cache

Configure NEXT_CACHE_WORKERS_KV binding required by
@opennextjs/cloudflare for incremental static regeneration."
```

---

## Task 7: Consolidate Animation Imports

**Files:**
- Modify: ~55 files importing from `"framer-motion"`

- [ ] **Step 1: Find all framer-motion imports**

Run: `grep -rl "from \"framer-motion\"" src/ --include="*.tsx" --include="*.ts"`

This gives the list of files to update.

- [ ] **Step 2: Replace all imports**

For every file found, replace:
```tsx
import { ... } from "framer-motion";
```
with:
```tsx
import { ... } from "motion/react";
```

This is a straight find-and-replace. The APIs are identical since `motion/react` wraps `framer-motion`.

- [ ] **Step 3: Verify build succeeds**

Run: `npx next build`
Expected: Build succeeds with no import errors.

- [ ] **Step 4: Verify no framer-motion imports remain**

Run: `grep -r "from \"framer-motion\"" src/ --include="*.tsx" --include="*.ts"`
Expected: No results.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: consolidate framer-motion imports to motion/react

Replace all 'framer-motion' imports with 'motion/react' for
consistency. Both resolve to the same underlying engine."
```

---

## Task 8: Image Optimization

**Files:**
- Modify: `next.config.ts`
- Possibly create: `src/lib/cloudflare-image-loader.ts`

- [ ] **Step 1: Check Cloudflare Image Resizing availability**

Check if the Cloudflare account has Image Resizing enabled (requires Pro plan or above). This determines Option A vs Option B.

- [ ] **Step 2A: If Image Resizing is available**

Create `src/lib/cloudflare-image-loader.ts`:

```ts
export default function cloudflareLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const params = [`width=${width}`, `quality=${quality || 75}`, "format=auto"];
  return `/cdn-cgi/image/${params.join(",")}/${src}`;
}
```

Update `next.config.ts` images section:

```ts
images: {
  loader: "custom",
  loaderFile: "./src/lib/cloudflare-image-loader.ts",
  remotePatterns: [
    // ... keep existing remotePatterns
  ],
},
```

- [ ] **Step 2B: If Image Resizing is NOT available**

Keep `unoptimized: true`. Instead, audit key pages for missing `priority` props on above-the-fold images:
- Hero carousel images: already have `priority` — good
- Logo in header: verify `priority` is set
- Any other large above-the-fold images

Add explicit `sizes` props where missing to help browser select appropriate source.

- [ ] **Step 3: Verify build succeeds**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add next.config.ts src/lib/cloudflare-image-loader.ts
git commit -m "perf(images): enable Cloudflare image optimization

Use custom loader for Cloudflare Image Resizing with automatic
WebP conversion and responsive sizing."
```

(Adjust commit message based on which option was chosen.)

---

## Task 9: Unblock AuthProvider Rendering

**Files:**
- Modify: `src/components/providers/AuthProvider.tsx`

- [ ] **Step 1: Render children immediately while auth loads**

In `src/components/providers/AuthProvider.tsx`, change the render logic at lines 87-92:

```tsx
// BEFORE (blocks children until auth resolves):
if (!isRestored) {
  return null;
}
return <>{children}</>;

// AFTER (renders children immediately):
return <>{children}</>;
```

Remove the `isRestored` state entirely (line 14) and the `setIsRestored` call (line 80). The auth store's `setUser`/`setSession` calls already trigger re-renders in consuming components when auth resolves.

This means children mount immediately and start their own data fetches (CommerceFeaturesProvider, LayoutContent) in parallel with auth restoration.

- [ ] **Step 2: Verify no components break without waiting for auth**

Check that components consuming auth state handle the initial `null` user gracefully. The auth store should initialize with `null` user/session, and components should already handle this (showing logged-out UI until auth resolves).

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 3: Manual smoke test**

Test the following in the browser:
- Load homepage fresh — should render immediately without blank screen
- Header user menu should show logged-out state briefly, then update when auth resolves
- Cart/wishlist features should gracefully handle initial null auth state

- [ ] **Step 4: Commit**

```bash
git add src/components/providers/AuthProvider.tsx
git commit -m "perf(auth): render children immediately during auth restoration

Remove the null-return gate that blocked all children from mounting
until auth resolved. Children now render in parallel with auth
check, eliminating the provider waterfall."
```

---

## Task 10: Final Verification & Deploy

- [ ] **Step 1: Run full build**

Run: `npm run cf:build`
Expected: Build succeeds with no new errors.

- [ ] **Step 2: Run Lighthouse audit (before/after comparison)**

If the site is deployed, run Lighthouse on:
- Homepage
- About page
- E-catalogue page

Record FCP, LCP, and Performance score.

- [ ] **Step 3: Deploy**

Deploy to Cloudflare Pages following the project's deploy process.

- [ ] **Step 4: Post-deploy verification**

Verify in production:
- No loading screen on page navigation
- Homepage hero carousel loads with images
- E-catalogue page shows catalogues without delay
- Shop page shows products without delay
- About page loads quickly
- Auth flow still works (login, logout, profile)

---

## Deployment Order

Per the spec, deploy incrementally:

| Deploy | Tasks | Risk |
|--------|-------|------|
| 1st | Task 1 (template.tsx) | Low — removes loading screen |
| 2nd | Tasks 2-6 (server components + ISR + KV) | Medium — changes data flow |
| 3rd | Task 7 (animation imports) | Low — no behavioral change |
| 4th | Task 8 (image optimization) | Low-Medium — depends on plan |
| 5th | Task 9 (auth provider) | Medium — changes render timing |
