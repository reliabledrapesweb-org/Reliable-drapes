# Reliable Drapes — Luxury Home Furnishings E-Commerce Platform

A production-ready e-commerce platform for luxury home furnishings built with **Next.js 15**, **TypeScript**, **Supabase**, and **Tailwind CSS v4**. Deployed on **Cloudflare Pages** via **OpenNext**.

- **Live site**: [reliabledrapes.org](https://reliabledrapes.org)
- **Client repo**: [reliabledrapesweb-org/Reliable-drapes](https://github.com/reliabledrapesweb-org/Reliable-drapes)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| State | Zustand |
| Database | Supabase (PostgreSQL 17) |
| Auth | Supabase Auth (email, Google, Apple OAuth) |
| Storage | Supabase Storage |
| Payments | Razorpay (live) |
| Email | Resend API |
| Deployment | Cloudflare Pages + OpenNext |
| Testing | Vitest + React Testing Library |

---

## Features

### Storefront
- Product catalogue with filtering, search, sorting, and pagination
- Product detail pages with multi-image galleries, variants, and specifications
- Persistent shopping cart and wishlist (Zustand)
- Collections and category browsing
- Razorpay payment integration with webhook verification
- Coupon and discount code support

### Customer Pages
- Style Expert consultation booking (multi-step form)
- Store Locator with India map and state filtering
- E-Catalogue with PDF preview and download
- Exhibitions & Moments gallery
- Newsletter subscription
- Contact, FAQ, Shipping, Returns, Privacy, Terms pages
- Career portal with job listings and applications

### Authentication
- Email/password with OTP verification
- Google and Apple OAuth
- Password recovery flow
- Role-based access (admin / customer) with Supabase RLS
- B2B Trader Login portal (external iframe)

### Admin Dashboard (`/admin`)
- Dashboard overview with real-time stats
- Product, category, and collection management
- Order management with tracking and invoice upload
- Customer management
- Communications hub (contact, consultations, newsletter, style-expert)
- Catalogue management (PDF upload)
- Store and exhibition management
- Career and job application management
- Site settings (social links, hero video, shop toggle)
- Media library

---

## Project Structure

```
reliable-drapes/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── (auth)/           # Login, signup, OTP, trader login
│   │   ├── admin/            # Admin dashboard routes
│   │   ├── api/              # Payment & webhook API routes
│   │   └── ...               # Storefront pages
│   ├── components/
│   │   ├── features/         # Feature-specific components
│   │   ├── layout/           # Header, Footer, Mobile menu
│   │   ├── shared/           # PageHero, Breadcrumb, etc.
│   │   └── ui/               # Base UI primitives
│   └── lib/
│       ├── actions/          # Server actions (all business logic)
│       ├── constants/        # App-wide constants
│       ├── hooks/            # Custom React hooks
│       ├── store/            # Zustand stores
│       ├── supabase/         # Supabase clients (browser, server, admin)
│       ├── types/            # TypeScript types
│       └── validators/       # Zod schemas
├── supabase/
│   ├── migrations/           # Database migrations (45+)
│   └── config.toml
├── public/
│   └── images/               # Static image assets
├── wrangler.toml             # Cloudflare Pages config
└── package.json
```

---

## Local Development

### Prerequisites

- Node.js 20+
- Supabase CLI
- Wrangler CLI

### Setup

```bash
git clone https://github.com/reliabledrapesweb-org/Reliable-drapes.git
cd reliable-drapes
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAILS=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
npm run dev
```

### Available Scripts

```bash
npm run dev            # Start dev server
npm run build          # Standard Next.js build
npm run cf:build       # Build for Cloudflare Pages
npm run cf:preview     # Local Cloudflare preview via Wrangler
npm run cf:deploy      # Deploy to Cloudflare Pages
npm run test           # Run tests
npm run test:ui        # Run tests with Vitest UI
npm run test:coverage  # Test coverage report
npm run db:types       # Regenerate Supabase TypeScript types
npm run lint           # ESLint
```

---

## Database

Managed by Supabase. Migrations are in `supabase/migrations/`.

```bash
# Apply pending migrations to remote
npx supabase db push

# Pull schema changes from remote
npx supabase db pull

# Regenerate TypeScript types
npm run db:types
```

---

## Deployment

Hosted on **Cloudflare Pages**. Secrets are stored as Cloudflare Pages secrets (not in `wrangler.toml`).

```bash
npm run cf:build
npm run cf:deploy
```

---

## Security Notes

- All tables have Row Level Security (RLS) enabled
- Razorpay webhooks verified with HMAC-SHA256 signature
- Admin access controlled via `profiles.role = 'admin'` + Supabase RLS
- Rate limiting configured on payment endpoints via Cloudflare WAF
- Server secrets never exposed to the client

---

© 2026 Reliable Drapes (Shree Ambica Furnishings India Pvt. Ltd.) — All rights reserved.
