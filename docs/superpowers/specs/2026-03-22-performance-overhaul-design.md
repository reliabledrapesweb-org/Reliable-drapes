# Performance Overhaul — Design Spec

## Problem

Clients report slow page loads across the entire site. Key pages: homepage, about, e-catalogue. Root causes identified through codebase audit.

## Root Causes

1. **Loading gate in `template.tsx`** — Every page is held behind a loading screen that waits for all images to load and `document.readyState === "complete"` (500ms minimum, 12s timeout) before revealing content. This blocks every single page navigation.
2. **65% client-rendered components** — Massive JS bundle must download and hydrate before anything is interactive. Pages that could be server-rendered (homepage, catalogue) fetch data in `useEffect` instead.
3. **Waterfall data fetching** — Providers chain sequentially on mount: AuthProvider blocks rendering until auth resolves → CommerceFeaturesProvider fetches feature flags → LayoutContent checks phone status → page fetches its own data → child components fetch more data (e.g., HeroSection fetches site settings). Because AuthProvider renders `null` until restored, child providers physically cannot begin their fetches until auth completes.
4. **Image optimization disabled** — `next.config.ts` sets `unoptimized: true`. No WebP conversion, no responsive sizing, no CDN-level optimization.
5. **Inconsistent animation imports** — 55 files import from `"framer-motion"` and 41 from `"motion/react"`. These resolve to the same underlying code (no duplicate bundle), but the inconsistency creates maintenance confusion. Consolidation is a code hygiene task, not a bundle size win.
6. **No caching or ISR** — Every page load hits Supabase fresh. The about page explicitly sets `export const dynamic = "force-dynamic"`, which prevents any caching. Product data changes a few times a week but is fetched on every request.

## Design

### Tier 1 — Highest Impact

#### 1.1 Fix `template.tsx` Loading Gate

**Current:** `src/app/template.tsx` uses a `LoadingScreen` component that:
- Waits for all `<img>` elements to load
- Waits for `document.readyState === "complete"`
- Enforces a 500ms minimum display time
- Has a 12s timeout fallback
- Wraps everything in `AnimatePresence` with motion animations

**Change:** Replace the entire asset-waiting + motion-based loading gate with a pure CSS fade-in. This eliminates the `"use client"` directive from `template.tsx`, which means the motion library is no longer forced into every page's bundle.

**After:**
```tsx
// template.tsx — no "use client" needed
import "./template.css";

export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="template-fade-in">{children}</div>;
}
```

```css
/* template.css */
.template-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Tradeoff:** This loses the `AnimatePresence` exit animation (pages fade out before new page fades in). The enter fade-in is preserved via CSS. This is the right tradeoff because the exit animation was the reason the loading gate existed — you need to hold content to animate the exit. Removing it removes the need for the gate entirely.

The `LoadingScreen` component can be deleted if no other files reference it.

#### 1.2 Convert Key Pages to Server Components

**Homepage (`src/app/page.tsx`):**
- Remove `"use client"` from the page itself
- Fetch site settings, hero images, featured products on the server using `Promise.all`
- Pass data as props to client sub-components
- HeroSection stays client for carousel interactivity (auto-advance, keyboard nav, AnimatePresence transitions) but receives `images: string[]` as a prop instead of fetching in useEffect
- Other homepage sections that are purely presentational become server components

**About page (`src/app/about/page.tsx`):**
- Already a server component with server-side data fetching — no structural change needed
- Remove `export const dynamic = "force-dynamic"` (see 1.3)

**E-catalogue page (`src/app/e-catalogue/page.tsx`):**
- Remove `"use client"` from the page
- Fetch catalogues and categories on the server with `Promise.all`
- Pass initial data as props to a client `ECatalogueClient` component that handles filters/search
- **Note:** The current page uses `useSearchParams()` for URL query params (`category`, `open`, `search`). In the server component, replace this with the `searchParams` page prop that Next.js App Router provides to server pages.
- Pattern: server page fetches → client component receives initial data + searchParams + handles user interaction

**Shop page (`src/app/shop/page.tsx`):**
- Same pattern as e-catalogue: remove `"use client"`, fetch products/categories/coupons/settings on server, pass to client `ShopClient` component
- Same `useSearchParams` → `searchParams` prop migration applies

#### 1.3 Add ISR / Caching

**Prerequisite — Cloudflare KV for ISR:**
`@opennextjs/cloudflare` supports ISR but requires a KV namespace binding for the cache store. The current `wrangler.toml` has no KV binding configured.

**Infrastructure step:** Add a KV namespace binding to `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "NEXT_CACHE_WORKERS_KV"
id = "<kv-namespace-id>"
```
Create the KV namespace via Cloudflare dashboard or `wrangler kv namespace create NEXT_CACHE_WORKERS_KV`.

**Route-level revalidation** (controls how often the full page is regenerated):
- Homepage: `export const revalidate = 3600` (1 hour)
- About: `export const revalidate = 3600` — **must first remove `export const dynamic = "force-dynamic"`** which currently overrides any revalidation
- E-catalogue: `export const revalidate = 1800` (30 minutes)
- Shop: `export const revalidate = 1800`

**If ISR doesn't work on the current OpenNext version:** Fall back to CDN-level caching via Cloudflare Page Rules or `Cache-Control` headers set in middleware. This is a different mechanism (CDN cache vs application-level ISR) with coarser invalidation, but still effective for mostly-static pages.

### Tier 2 — Code Hygiene & Images

#### 2.1 Consolidate Animation Imports

**Current:** 55 files import from `"framer-motion"`, 41 from `"motion/react"`. The installed dependency is `motion`, which depends on `framer-motion` internally — both resolve to the same underlying engine at runtime. No bundle size impact, but the inconsistency should be cleaned up.

**Change:**
- Replace all `import ... from "framer-motion"` with `import ... from "motion/react"`
- Verify build succeeds
- This is a straightforward find-and-replace with no behavioral change

#### 2.2 Enable Cloudflare Image Optimization

**Current:** `next.config.ts` has `images: { unoptimized: true }` because Next.js built-in optimization doesn't work on Cloudflare Pages.

**Option A — Cloudflare Image Resizing (requires Pro plan or above):**
```ts
// next.config.ts
images: {
  loader: 'custom',
  loaderFile: './src/lib/cloudflare-image-loader.ts',
}
```
```ts
// src/lib/cloudflare-image-loader.ts
export default function cloudflareLoader({ src, width, quality }: {
  src: string; width: number; quality?: number;
}) {
  const params = [`width=${width}`, `quality=${quality || 75}`, 'format=auto'];
  return `/cdn-cgi/image/${params.join(',')}/${src}`;
}
```

**Option B — If Image Resizing isn't available on the plan:**
- Keep `unoptimized: true`
- Add explicit `width`, `height`, and `sizes` props to all `<Image>` components for proper layout hints
- Set `priority` on above-the-fold images (hero, logos), leave `loading="lazy"` (default) for the rest
- Pre-optimize images to WebP before uploading to Supabase storage

**Decision:** Check Cloudflare dashboard for Image Resizing availability before implementation. If unavailable, use Option B.

### Tier 3 — Incremental Gains

#### 3.1 Reduce Client Component Surface

Audit components that use `"use client"` but don't need full client rendering. Common pattern:
- A page-level component is marked `"use client"` because one child needs interactivity
- Fix: keep the parent as a server component, extract only the interactive piece as a client component

**Priority targets:**
- Homepage sections that are mostly static with one interactive element
- Catalogue listing (server-render the grid, client-render only filters)
- Any component using `"use client"` solely for `useEffect` data fetching (convert to server component)

This is incremental work done page-by-page during the Tier 1 server component conversions.

#### 3.2 Parallelize Provider Fetches

**Problem:** AuthProvider renders `null` until auth resolves, which blocks CommerceFeaturesProvider and LayoutContent from even mounting. A simple `Promise.all` across providers won't work because they're nested parent→child in the component tree.

**Change:** Flatten the provider hierarchy so auth and commerce features fetch independently:
- AuthProvider should render children immediately (in a loading state) rather than returning `null`
- CommerceFeaturesProvider should not depend on auth state — it fetches public feature flags
- This allows both providers to fire their fetches concurrently on mount

If restructuring providers is too invasive, the minimum viable change is: ensure AuthProvider renders children immediately while auth loads rather than blocking the entire tree. **UX risk:** This can cause a flash of logged-out content (FOLC) where auth-dependent UI (cart, wishlist, pricing) briefly shows a logged-out state. Mitigate with skeleton placeholders on auth-sensitive sections, or wrap them in `Suspense` boundaries that show loading states until auth resolves.

## Deployment Strategy

Changes should be deployed incrementally, not all at once:
1. **First deploy:** template.tsx fix only (biggest user-visible improvement, lowest risk)
2. **Second deploy:** Server component conversions + ISR
3. **Third deploy:** Animation import consolidation + image optimization
4. **Fourth deploy:** Provider parallelization + client component audit

Each deploy is independently valuable and can be rolled back without affecting the others.

## Out of Scope

- Redesigning the admin panel (not client-facing, lower priority)
- Changing the hosting provider (staying on Cloudflare Pages)
- Full SSG/static export (site has dynamic auth and commerce features)

## Success Criteria

- Largest Contentful Paint (LCP) under 2.5s on key pages (homepage, about, catalogue)
- First Contentful Paint (FCP) under 1.5s on key pages
- No visible loading screen blocking page navigation
- Lighthouse performance score improvement on mobile (target: 80+)
