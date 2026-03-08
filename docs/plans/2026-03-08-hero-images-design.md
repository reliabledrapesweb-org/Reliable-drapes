# Page Hero Images & Exhibitions UI Polish

## Problem

All nav pages use the same default hero background image (`/images/abouthero.png`). The exhibitions page editorial layout needs minor adjustments to match the app's standard styling conventions.

## Solution

### 1. Exhibitions page polish

Keep the editorial layout (left-aligned header, featured spanning cards, ArrowUpRight buttons) but align with app conventions:
- Use `bg-white` instead of `bg-[#faf9f7]`
- Drop the SVG texture overlay
- Use standard `container mx-auto` padding
- Keep the `#2F2582` accent, line accent, and card styles

### 2. Dedicated hero images

Download Unsplash images to `public/images/heroes/` for each page:

| Page | File | Image Theme |
|------|------|-------------|
| `/about` | `about-hero.jpg` | Luxury fabric/textile close-up |
| `/e-catalogue` | `e-catalogue-hero.jpg` | Elegant draped curtains in styled room |
| `/exhibitions-events` | `exhibitions-hero.jpg` | Exhibition hall / fabric displays |
| `/store-locator` | `store-locator-hero.jpg` | Modern retail storefront interior |
| `/shop` | `shop-hero.jpg` | Curated fabric swatches or textile rolls |
| `/style-expert` | `style-expert-hero.jpg` | Interior design / styled living room |
| `/careers` | `careers-hero.jpg` | Professional workspace |
| `/faq` | `faq-hero.jpg` | Warm inviting interior |
| `/shipping-info` | `shipping-hero.jpg` | Packaged goods / logistics |
| `/return-policy` | `return-policy-hero.jpg` | Clean trustworthy workspace |

### 3. Pass backgroundImage prop

Each page passes its dedicated image to `<PageHero backgroundImage="/images/heroes/xxx-hero.jpg" />`. No changes to the PageHero component itself.

## Files to modify

- `src/app/exhibitions-events/page.tsx` — polish styling
- `src/app/about/page.tsx` — add backgroundImage prop
- `src/app/e-catalogue/page.tsx` — add backgroundImage prop
- `src/app/store-locator/page.tsx` — add backgroundImage prop
- `src/app/shop/page.tsx` — add backgroundImage prop
- `src/app/style-expert/page.tsx` — add backgroundImage prop (2 instances)
- `src/app/careers/page.tsx` — add backgroundImage prop
- `src/app/faq/page.tsx` — add backgroundImage prop
- `src/app/shipping-info/page.tsx` — add backgroundImage prop
- `src/app/return-policy/page.tsx` — add backgroundImage prop
