# Mobile Responsiveness Fix Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix mobile responsiveness issues across the entire app — mobile menu layout, exhibitions tabs scrolling, and a thorough audit of all public + admin pages.

**Architecture:** CSS/Tailwind-only changes. No new components or architectural changes. Fix existing responsive breakpoints, overflow handling, and spacing.

**Tech Stack:** Tailwind CSS 4, Next.js 15 App Router, Framer Motion

---

## Chunk 1: Priority Fixes

### Task 1: Fix Mobile Menu Layout

**Files:**
- Modify: `src/components/layout/MobileMenu.tsx`

**Problem:** The X close button floats awkwardly next to "The Brand" text. Menu items with `space-y-6` overflow on small phones (8 nav items + 2 login buttons). Login buttons get cut off at the bottom.

- [ ] **Step 1: Fix mobile menu layout**

Replace the entire MobileMenu component body (inside the `<AnimatePresence>`) with:

1. Add a proper top bar with the X button aligned right at the same height as the header
2. Make the menu content scrollable with reduced spacing on small screens
3. Reduce text sizes on small screens to prevent overflow
4. Push login buttons to the bottom with proper spacing

```tsx
<motion.div
  variants={menuVariants}
  initial="initial"
  animate="animate"
  exit="exit"
  className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-black lg:hidden"
>
  {/* Top bar with close button */}
  <div className="flex h-14 shrink-0 items-center justify-end px-4 md:h-16 md:px-6">
    <motion.button
      onClick={() => setIsOpen(false)}
      className="cursor-pointer rounded-full p-2 text-white transition-colors hover:bg-white/10"
      whileHover={{ scale: 1.1, rotate: 90 }}
      whileTap={{ scale: 0.9 }}
    >
      <X className="h-6 w-6 md:h-8 md:w-8" />
    </motion.button>
  </div>

  {/* Scrollable menu content */}
  <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-4">
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="initial"
      className="flex flex-col items-center space-y-4 sm:space-y-5 md:space-y-6"
    >
      {navLinks.map((item, i) => (
        <motion.div key={i} variants={linkVariants} className="overflow-hidden">
          <a
            href={item.link}
            onClick={() => setIsOpen(false)}
            className="group relative flex items-center gap-4 text-2xl font-light tracking-tight text-white transition-colors hover:text-white/90 sm:text-3xl md:text-4xl"
          >
            <span className="relative z-10">{item.name}</span>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileHover={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="hidden md:block"
            >
              <ArrowRight className="h-8 w-8 md:h-10 md:w-10" />
            </motion.span>
            <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-white transition-all duration-300 group-hover:w-full" />
          </a>
        </motion.div>
      ))}

      {!user && (
        <motion.div
          variants={linkVariants}
          className="flex w-full max-w-xs flex-col items-center gap-3 pt-6 sm:max-w-sm sm:pt-8"
        >
          <motion.a
            href="/login"
            onClick={() => setIsOpen(false)}
            className="inline-flex w-full transform cursor-pointer items-center justify-center rounded-full border border-white/40 bg-white/10 px-6 py-2.5 text-base font-medium text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-white/20 hover:shadow-xl active:translate-y-0 sm:px-8 sm:py-3 sm:text-lg md:px-10 md:py-4 md:text-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Login
          </motion.a>
          <motion.a
            href="/trader-login"
            onClick={() => setIsOpen(false)}
            className="inline-flex w-full transform cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-base font-medium text-black shadow-lg transition-all hover:-translate-y-1 hover:bg-gray-100 hover:shadow-xl active:translate-y-0 sm:px-8 sm:py-3 sm:text-lg md:px-10 md:py-4 md:text-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Building2 className="h-5 w-5" />
            Trader Login
          </motion.a>
        </motion.div>
      )}
    </motion.div>
  </div>

  {/* Background gradient */}
  <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-black/20 to-transparent" />
</motion.div>
```

Key changes:
- Changed from `items-center justify-center` (vertically centered, could overflow) to `flex-col` with a proper top bar and scrollable content area
- X button is in a header bar matching the main header height (`h-14 md:h-16`)
- Reduced spacing: `space-y-4 sm:space-y-5 md:space-y-6` (was `space-y-6 md:space-y-8`)
- Reduced text: `text-2xl sm:text-3xl md:text-4xl` (was `text-3xl md:text-4xl`)
- Added `overflow-y-auto` so content scrolls on small screens instead of overflowing
- Reduced button padding/sizing on small screens
- Login buttons use `max-w-xs sm:max-w-sm` for tighter mobile sizing

- [ ] **Step 2: Verify mobile menu visually**

Run: `npm run dev`
Open on mobile viewport (375px, 414px). Verify:
- X button is clearly in top-right corner, not overlapping menu items
- All 8 nav items + login buttons fit without cutoff
- Menu scrolls if content exceeds viewport height
- Login/Trader Login buttons are fully visible

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/MobileMenu.tsx
git commit -m "fix(mobile-menu): improve layout and spacing for small screens"
```

---

### Task 2: Fix SubSectionTabs Horizontal Scrolling

**Files:**
- Modify: `src/components/features/exhibitions/SubSectionTabs.tsx`

**Problem:** Uses `flex gap-2` with no overflow handling. On mobile, the 3 tab buttons ("Exhibitions", "Moments", "In the News") can overflow horizontally.

- [ ] **Step 1: Add overflow-x-auto and scrollbar hiding**

Change the outer div from:
```tsx
<div className="flex gap-2">
```
to:
```tsx
<div className="scrollbar-hide flex gap-2 overflow-x-auto">
```

Also add `shrink-0` to each button so they don't compress:
```tsx
className={`flex shrink-0 items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${
```

- [ ] **Step 2: Verify tabs scroll on mobile**

Run: `npm run dev`
Open exhibitions page at 375px width. Verify tabs scroll horizontally without visible scrollbar.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/exhibitions/SubSectionTabs.tsx
git commit -m "fix(exhibitions): add horizontal scroll to subsection tabs on mobile"
```

---

### Task 3: Improve YearTabs Mobile Scrolling

**Files:**
- Modify: `src/components/features/exhibitions/YearTabs.tsx`

**Problem:** Already has `overflow-x-auto` but doesn't hide the scrollbar for a cleaner look.

- [ ] **Step 1: Add scrollbar hiding class**

Change the outer div from:
```tsx
<div className="flex items-center gap-1.5 overflow-x-auto rounded-xl bg-gray-100 p-1.5">
```
to:
```tsx
<div className="scrollbar-hide flex items-center gap-1.5 overflow-x-auto rounded-xl bg-gray-100 p-1.5">
```

- [ ] **Step 2: Verify year tabs scroll cleanly**

Run: `npm run dev`
Verify scrollbar is hidden on mobile while still scrollable.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/exhibitions/YearTabs.tsx
git commit -m "fix(exhibitions): hide scrollbar on year tabs for cleaner mobile UX"
```

---

### Task 4: Fix Exhibitions Page Controls Row on Mobile

**Files:**
- Modify: `src/app/exhibitions-events/page.tsx`

**Problem:** The controls row stacks YearTabs and SubSectionTabs vertically on mobile (`flex-col`), but SubSectionTabs takes full width without scroll handling. The section header text can also be cramped.

- [ ] **Step 1: Adjust controls row spacing**

No changes needed to the page layout itself — the SubSectionTabs fix in Task 2 handles the overflow. But verify the `gap-5` and `mb-10` spacing works well on mobile. If the gap is too large on small screens, change:

```tsx
<div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
```
to:
```tsx
<div className="mb-6 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
```

- [ ] **Step 2: Commit**

```bash
git add src/app/exhibitions-events/page.tsx
git commit -m "fix(exhibitions): tighten mobile spacing for controls row"
```

---

## Chunk 2: Full App Responsiveness Audit

### Task 5: Audit and Fix Public Pages

**Files to audit (read each, fix responsiveness issues found):**
- `src/app/page.tsx` (homepage)
- `src/app/about/page.tsx`
- `src/app/shop/page.tsx`
- `src/app/shop/[id]/page.tsx`
- `src/app/collections/page.tsx`
- `src/app/collections/[slug]/page.tsx`
- `src/app/e-catalogue/page.tsx`
- `src/app/store-locator/page.tsx`
- `src/app/style-expert/page.tsx`
- `src/app/contact/page.tsx`
- `src/app/careers/page.tsx`
- `src/app/cart/page.tsx`
- `src/app/wishlist/page.tsx`
- `src/app/profile/page.tsx`
- `src/app/faq/page.tsx`
- `src/app/privacy-policy/page.tsx`
- `src/app/return-policy/page.tsx`
- `src/app/shipping-info/page.tsx`
- `src/app/terms-of-service/page.tsx`

**Common issues to check for on each page:**
1. Text overflow or truncation on small screens
2. Horizontal overflow causing horizontal scroll on the page
3. Grid layouts that don't stack to single column on mobile
4. Fixed widths that don't adapt (e.g., `w-[500px]` without responsive alternative)
5. Padding/margin too large on mobile (e.g., `py-20` without `py-10` mobile variant)
6. Images that overflow their containers
7. Buttons or interactive elements too small for touch targets (< 44px)
8. Form inputs that don't go full-width on mobile
9. Tables without responsive handling
10. Modal/dialog components that don't fit on mobile screens

- [ ] **Step 1: Read and audit each public page file**

For each file, read the full content and check against the 10-point checklist above.

- [ ] **Step 2: Fix any issues found**

Apply Tailwind responsive fixes. Common patterns:
- Add `w-full` or responsive widths
- Add `overflow-x-auto` to tables
- Add `flex-col sm:flex-row` for stacking
- Reduce padding/margin on mobile: `p-4 md:p-6 lg:p-8`
- Add `text-sm sm:text-base` for text sizing

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "fix: improve mobile responsiveness across public pages"
```

---

### Task 6: Audit and Fix Auth Pages

**Files to audit:**
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/(auth)/reset-password/page.tsx`
- `src/app/(auth)/trader-login/page.tsx`
- `src/app/(auth)/verify-otp/page.tsx`

**Check for:**
- Form containers centered and properly sized on mobile
- Input fields full-width on mobile
- Submit buttons full-width on mobile
- Any decorative elements that break on mobile

- [ ] **Step 1: Read and audit each auth page**
- [ ] **Step 2: Fix any issues found**
- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "fix: improve mobile responsiveness on auth pages"
```

---

### Task 7: Audit and Fix Admin Pages

**Files to audit:**
- `src/components/admin/AdminSidebar.tsx`
- `src/components/admin/AdminHeader.tsx`
- `src/components/admin/AdminPageLayout.tsx`
- `src/components/admin/AdminModal.tsx`
- `src/components/admin/ResponsiveTable.tsx`
- `src/components/admin/FormField.tsx`
- `src/components/admin/FileUpload.tsx`
- `src/components/admin/NotificationDropdown.tsx`
- `src/components/admin/MediaPickerModal.tsx`
- `src/app/admin/page.tsx` (dashboard)
- `src/app/admin/products/page.tsx`
- `src/app/admin/orders/page.tsx`
- `src/app/admin/orders/[id]/page.tsx`
- `src/app/admin/customers/page.tsx`
- `src/app/admin/categories/page.tsx`
- `src/app/admin/collections/page.tsx`
- `src/app/admin/catalogues/page.tsx`
- `src/app/admin/exhibitions/page.tsx`
- `src/app/admin/stores/page.tsx`
- `src/app/admin/careers/page.tsx`
- `src/app/admin/careers/applications/page.tsx`
- `src/app/admin/coupons/page.tsx`
- `src/app/admin/media/page.tsx`
- `src/app/admin/about-sections/page.tsx`
- `src/app/admin/settings/page.tsx`
- `src/app/admin/notifications/page.tsx`
- `src/app/admin/communications/contact/page.tsx`
- `src/app/admin/communications/consultations/page.tsx`
- `src/app/admin/communications/newsletter/page.tsx`
- `src/app/admin/communications/style-expert/page.tsx`

**Check for:**
1. Admin dashboard stats cards stacking properly
2. Admin tables using ResponsiveTable (card view on mobile)
3. Admin modals fitting on mobile screens
4. Form layouts going full-width on mobile
5. Action buttons (add, edit, delete) accessible on mobile
6. Admin header notification dropdown positioning
7. Sidebar overlay working correctly on mobile
8. Settings page form layout
9. Order detail page layout on mobile

- [ ] **Step 1: Read and audit each admin component and page**
- [ ] **Step 2: Fix any issues found**
- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "fix: improve mobile responsiveness across admin pages"
```

---

### Task 8: Audit Shared Layout Components

**Files to audit:**
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/layout/LayoutContent.tsx`
- `src/components/shared/` (all shared components like Breadcrumb, PageHero, etc.)

**Check for:**
- Footer columns stacking properly on mobile
- Shared components (breadcrumb, page hero) fitting mobile widths
- Any shared modals or dialogs fitting mobile screens

- [ ] **Step 1: Read and audit each layout/shared component**
- [ ] **Step 2: Fix any issues found**
- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "fix: improve mobile responsiveness in shared layout components"
```

---

### Task 9: Final Verification

- [ ] **Step 1: Run type checking and linting**

```bash
npx turbo typecheck lint
```

- [ ] **Step 2: Run prettier**

```bash
npx prettier --write "src/**/*.tsx"
```

- [ ] **Step 3: Visual verification at key breakpoints**

Test at these widths:
- 375px (iPhone SE/small phones)
- 414px (iPhone 14/standard phones)
- 768px (iPad/tablets)
- 1024px (small laptops)
- 1440px (desktop)

Key pages to test:
- Homepage
- Exhibitions & Moments
- Shop
- Product detail
- Cart
- Admin dashboard
- Admin products
- Admin orders

- [ ] **Step 4: Final commit if any remaining fixes**

```bash
git add -A
git commit -m "fix: final responsiveness polish and formatting"
```
