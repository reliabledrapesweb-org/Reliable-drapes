# Reliable Drapes - Luxury Home Furnishings E-Commerce Platform

A comprehensive, production-ready e-commerce platform for luxury home furnishings built with **Next.js 15**, **TypeScript**, **Supabase**, and **Tailwind CSS v4**. Optimized for high-performance deployment on **Cloudflare Pages** using **OpenNext**.

---

## ✨ Key Features

### 🛍️ E-Commerce Core

- **Product Catalog**: Advanced filtering, search, sorting, and pagination
- **Product Details**: Multi-image galleries, variants, specifications, related products
- **Shopping Cart**: Persistent cart with Zustand state management
- **Wishlist**: Save favorite products for later (persistent with Zustand)
- **Categories & Collections**: Organized product browsing with featured collections
- **Related Products**: Smart recommendations based on shared categories
- **SKU Support**: Unique identifiers for every product variant
- **Bulk Import**: Excel/CSV product import for admin efficiency

### 🎨 Customer Experience

- **Style Expert Consultation**: Multi-step booking system with room type, style preferences, and scheduling
- **Store Locator**: Interactive map with store details and directions
- **E-Catalogue**: Digital product catalogues with PDF preview and download
- **Newsletter**: Subscription system with campaign management
- **Contact Forms**: Multiple contact points (general, consultation, careers)

### 👤 Authentication & User Management

- **Complete Auth System**: Email/password with Supabase Auth
- **Social Auth**: Google and Apple OAuth integration
- **Password Recovery**: Forgot password and reset flows
- **OTP Verification**: Email-based one-time password verification
- **User Profiles**: Account management, addresses, and order history
- **Role-Based Access**: Admin and customer roles with RLS policies

### 🎯 Admin Dashboard

- **Dashboard Overview**: Real-time stats, analytics, and notifications
- **Product Management**: Full CRUD with images, variants, specifications, bulk import
- **Category Management**: Hierarchical categories with featured options
- **Collection Management**: Seasonal and promotional collections
- **Order Management**: Order tracking, fulfillment, and status notifications
- **Customer Management**: User accounts and activity tracking
- **Media Library**: Centralized image management with usage tracking
- **Communications Hub**:
  - Contact submissions with status tracking
  - Consultation requests management
  - Newsletter campaigns with rich text composer
  - Subscriber management with segmentation
- **Catalogue Management**: Upload and manage PDF catalogues
- **Store Management**: Physical store locations and details
- **Career Management**: Job postings and applications
- **Dark Mode**: Full dark theme support for admin interface

### 📧 Newsletter System

- **Subscriber Management**: Active/unsubscribed status tracking
- **Campaign Composer**: Rich text editor with preview
- **Recipient Selection**: Send to all or select specific subscribers
- **Campaign History**: Track sent campaigns
- **CSV Export**: Export subscriber lists

### 💼 Career Portal

- **Job Listings**: Dynamic job postings with filtering
- **Application System**: Online application forms with resume upload
- **Admin Management**: Review and manage applications with status updates

### 🎨 Design & UX

- **Premium UI**: Modern design with glassmorphism and smooth animations
- **Responsive**: Fully optimized for mobile, tablet, and desktop
- **Animations**: Framer Motion for smooth interactions
- **Accessibility**: Semantic HTML and ARIA labels
- **Dark Mode**: Admin dashboard with full dark theme support

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.1.0 | React framework with App Router |
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.x | Type safety (strict mode) |
| **Tailwind CSS** | 4.x | Utility-first styling (CSS-based config) |
| **Framer Motion** | 12.23.24 | Animations (via `motion` package) |
| **Lucide React** | 0.544.0 | Icon library |
| **React Hook Form** | 7.63.0 | Form management |
| **Zod** | 4.1.9 | Schema validation |

### Backend & Database

| Technology | Purpose |
|------------|---------|
| **Supabase** | PostgreSQL database + Auth + Storage |
| **Supabase SSR** | Server-side rendering with cookie-based sessions |
| **Row Level Security (RLS)** | Database-level access control |

### State Management

| Technology | Purpose |
|------------|---------|
| **Zustand** | Global state (auth, cart, wishlist, admin preferences) |
| **Persist middleware** | LocalStorage persistence for cart/wishlist |

### Deployment

| Technology | Purpose |
|------------|---------|
| **Cloudflare Pages** | Edge deployment platform |
| **OpenNext** | Next.js adapter for Cloudflare |
| **Wrangler** | Cloudflare CLI for deployment |

### Testing

| Technology | Purpose |
|------------|---------|
| **Vitest** | Unit testing framework |
| **React Testing Library** | Component testing |
| **jsdom** | DOM environment for tests |

---

## 📁 Project Structure

```
reliable-drapes/
├── scripts/                          # Build & automation scripts
│   └── flatten-assets.js             # Asset optimizer for Cloudflare
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth routes (login, signup, forgot-password, reset-password, verify-otp)
│   │   ├── admin/                    # Admin dashboard
│   │   │   ├── careers/              # Job postings & applications
│   │   │   ├── catalogues/           # PDF catalogue management
│   │   │   ├── categories/           # Category management
│   │   │   ├── collections/          # Collection management
│   │   │   ├── communications/       # Contact, consultations, newsletter
│   │   │   ├── customers/            # Customer management
│   │   │   ├── media/                # Media library
│   │   │   ├── notifications/        # Admin notifications
│   │   │   ├── orders/               # Order management
│   │   │   ├── products/             # Product management
│   │   │   ├── settings/             # Admin settings
│   │   │   └── stores/               # Store locator management
│   │   ├── about/                    # About page
│   │   ├── careers/                  # Career portal (public)
│   │   ├── cart/                     # Shopping cart
│   │   ├── collections/              # Product collections
│   │   ├── contact/                  # Contact page
│   │   ├── e-catalogue/              # Digital catalogues
│   │   ├── privacy-policy/           # Privacy policy
│   │   ├── profile/                  # User profile & orders
│   │   ├── shop/                     # Product catalog
│   │   ├── store-locator/            # Store finder
│   │   ├── style-expert/             # Consultation booking
│   │   ├── terms-of-service/         # Terms of service
│   │   ├── wishlist/                 # User wishlist
│   │   └── page.tsx                  # Home page
│   │
│   ├── components/
│   │   ├── admin/                    # Admin-specific components
│   │   ├── features/                 # Feature-specific components
│   │   │   ├── home/                 # Homepage sections
│   │   │   ├── shop/                 # Shopping components
│   │   │   ├── auth/                 # Authentication forms
│   │   │   ├── catalog/              # Product catalog
│   │   │   ├── consultation/         # Style expert
│   │   │   ├── profile/              # User profile
│   │   │   ├── careers/              # Job listings
│   │   │   ├── about/                # About page
│   │   │   └── store-locator/        # Store finder
│   │   ├── layout/                   # Header, Footer, MobileMenu
│   │   ├── providers/                # Context providers
│   │   ├── shared/                   # Shared/reusable components
│   │   └── ui/                       # UI primitives (shadcn/ui)
│   │
│   ├── lib/
│   │   ├── actions/                  # Server Actions
│   │   ├── constants/                # App constants
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── store/                    # Zustand stores
│   │   ├── supabase/                 # Supabase clients (browser, server, admin, anon)
│   │   ├── types/                    # TypeScript types
│   │   ├── utils/                    # Utility functions
│   │   ├── validators/               # Zod validation schemas
│   │   └── email/                    # Email templates
│   │
│   └── public/                       # Static assets (at root, not in src)
│       ├── _routes.json              # Cloudflare Pages routing rules
│       └── images/                   # Image assets
│
├── supabase/
│   ├── migrations/                   # 41+ database migrations
│   └── config.toml                   # Supabase config
│
├── wrangler.toml                     # Cloudflare configuration
├── next.config.ts                    # Next.js configuration
├── open-next.config.ts               # OpenNext configuration
├── vitest.config.ts                  # Vitest configuration
└── package.json                      # Dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ and npm
- **Supabase** account and project
- **Cloudflare** account (for deployment)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Kolade-dotcom/reliable-drapes.git
   cd reliable-drapes
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory:

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Admin Access (comma-separated emails)
   ADMIN_EMAILS=admin@reliabledrapes.com,another@admin.com
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

---

## 🚢 Deployment (Cloudflare Pages)

This project is optimized for Cloudflare Pages using `@opennextjs/cloudflare`.

### Local Build & Preview

```bash
# Build for Cloudflare
npm run cf:build

# Preview locally using Wrangler
npm run cf:preview
```

### Deployment Commands

```bash
# Deploy to Cloudflare Pages
npm run cf:deploy
```

**Note**: Ensure your Cloudflare Pages project settings point to the `.open-next` directory as the "Build output directory" and use `npm run cf:build` as the "Build command".

---

## 📚 Development Guide

### Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for standard production
npm run cf:build         # Build for Cloudflare (includes asset flattening)
npm run cf:preview       # Preview Cloudflare build locally
npm run cf:deploy        # Deploy to Cloudflare Pages
npm run test             # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:ui          # Run tests with Vitest UI
npm run lint             # Run ESLint
```

### Testing

This project uses Vitest and React Testing Library. Tests are located alongside the components/files they test (e.g., `ComponentName.spec.tsx`).

```bash
npm run test             # Run tests once
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Run tests with Vitest UI
```

---

## 🔐 Security

- **Supabase Auth**: Industry-standard authentication with OAuth support
- **Row Level Security (RLS)**: Database-level access control for all tables (41+ migrations)
- **Multi-Client Supabase**: Separate clients for browser, server, admin, and anonymous access
- **Service Role Isolation**: Admin operations use isolated service role client
- **Environment-Based Admin Access**: Admins configured via `ADMIN_EMAILS` environment variable
- **Input Validation**: Zod schemas validate all form inputs
- **Secure Cookies**: HttpOnly, Secure, and SameSite cookie settings
- **Cloudflare Routing**: `_routes.json` configured to optimize asset delivery

---

## 🗄 Database Schema

The project includes **41+ Supabase migrations** covering:

- **Core Tables**: `profiles`, `products`, `orders`, `order_items`
- **Categories**: `categories`, `product_categories`
- **Collections**: `collections`, `product_collections`
- **Media**: `product_images`, `media_library`
- **Career Portal**: `jobs`, `job_applications`
- **Communications**: `contact_submissions`, `consultations`, `newsletter_campaigns`, `subscribers`
- **Stores**: `stores`
- **Notifications**: `notifications` with triggers
- **Catalogues**: `catalogues`
- **Storage Policies**: Secure file upload/download policies

---

## 📞 Support & Contact

- **Email**: Helloreliable@gmail.com
- **Website**: [Reliable Drapes](https://reliabledrapes.com)
- **GitHub**: [Kolade-dotcom/reliable-drapes](https://github.com/Kolade-dotcom/reliable-drapes)

---

## 📝 License

This project is private and proprietary. All rights reserved.

© 2026 Reliable Drapes (Shree Ambica Furnishings India Pvt. Ltd.)

---

**Version**: 0.1.0  
**Last Updated**: January 27, 2026  
**Status**: Production Ready (Cloudflare Optimized)  
**Maintainer**: Kolade
