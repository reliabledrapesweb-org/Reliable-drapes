# Reliable Drapes - Luxury Home Furnishings E-Commerce Platform

A comprehensive, production-ready e-commerce platform for luxury home furnishings built with **Next.js 15**, **TypeScript**, **Supabase**, and **Tailwind CSS v4**. Optimized for high-performance deployment on **Cloudflare Pages** using **OpenNext**.

## ✨ Key Features

### 🛍️ E-Commerce Core

- **Product Catalog**: Advanced filtering, search, sorting, and pagination
- **Product Details**: Multi-image galleries, variants, specifications, related products
- **Shopping Cart**: Persistent cart with Zustand state management
- **Categories & Collections**: Organized product browsing with featured collections
- **Related Products**: Smart recommendations based on shared categories
- **SKU Support**: Unique identifiers for every product variant

### 🎨 Customer Experience

- **Style Expert Consultation**: Multi-step booking system with room type, style preferences, and scheduling
- **Store Locator**: Interactive map with store details and directions
- **E-Catalogue**: Digital product catalogues with PDF preview and download
- **Newsletter**: Subscription system with campaign management
- **Contact Forms**: Multiple contact points (general, consultation, careers)

### 👤 Authentication & User Management

- **Complete Auth System**: Email/password with Supabase
- **Social Auth**: Google and Apple OAuth integration
- **Password Recovery**: Forgot password and reset flows
- **User Profiles**: Account management and order history
- **Role-Based Access**: Admin and customer roles with RLS policies

### 🎯 Admin Dashboard

- **Dashboard Overview**: Real-time stats and analytics
- **Product Management**: Full CRUD with images, variants, specifications
- **Category Management**: Hierarchical categories with featured options
- **Collection Management**: Seasonal and promotional collections
- **Order Management**: Order tracking and fulfillment
- **Customer Management**: User accounts and activity
- **Communications Hub**:
  - Contact submissions with status tracking
  - Consultation requests management
  - Newsletter campaigns with composer
  - Subscriber management with segmentation
- **Catalogue Management**: Upload and manage PDF catalogues
- **Store Management**: Physical store locations and details
- **Career Management**: Job postings and applications

### 📧 Newsletter System

- **Subscriber Management**: Active/unsubscribed status tracking
- **Campaign Composer**: Rich text editor with preview
- **Recipient Selection**: Send to all or select specific subscribers
- **Campaign History**: Track sent campaigns with analytics
- **CSV Export**: Export subscriber lists

### 💼 Career Portal

- **Job Listings**: Dynamic job postings with filtering
- **Application System**: Online application forms with file upload
- **Admin Management**: Review and manage applications

### 🎨 Design & UX

- **Premium UI**: Modern design with glassmorphism and smooth animations
- **Responsive**: Fully optimized for mobile, tablet, and desktop
- **Animations**: Framer Motion for smooth interactions
- **Accessibility**: WCAG compliant with semantic HTML
- **Dark Mode Ready**: Admin dashboard with dark theme

## 🛠 Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **State**: Zustand for global state

### Backend

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with RLS
- **Storage**: Supabase Storage for images/files
- **API**: Server Actions (type-safe)
- **Deployment**: Cloudflare Pages + OpenNext

### Development

- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier with Tailwind plugin
- **Type Safety**: Full TypeScript coverage

## 📁 Project Structure

```
reliable-drapes/
├── scripts/                          # Build & automation scripts
│   └── flatten-assets.js             # Asset optimizer for Cloudflare
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                  # Auth routes (login, signup, etc.)
│   │   ├── admin/                   # Admin dashboard
│   │   ├── about/                   # About page
│   │   ├── careers/                 # Career portal
│   │   ├── e-catalogue/             # Digital catalogues
│   │   ├── shop/                    # Product catalog
│   │   ├── cart/                    # Shopping cart
│   │   ├── store-locator/           # Store finder
│   │   ├── style-expert/            # Consultation booking
│   │   ├── contact/                 # Contact page
│   │   └── page.tsx                 # Home page
│   │
│   ├── components/
│   │   ├── features/                # Feature-specific components
│   │   ├── layout/                  # Layout components
│   │   ├── shared/                  # Shared components
│   │   └── ui/                      # UI primitives
│   │
│   ├── lib/
│   │   ├── actions/                 # Server actions
│   │   ├── constants/               # App constants
│   │   ├── hooks/                   # Custom hooks
│   │   ├── store/                   # Zustand stores
│   │   ├── supabase/                # Supabase clients
│   │   ├── types/                   # TypeScript types
│   │   └── validators/              # Zod schemas
│   │
│   └── public/                       # Static assets
│       ├── _routes.json             # Cloudflare Pages routing rules
│       └── images/                  # Image assets
│
├── supabase/
│   ├── migrations/                  # Database migrations
│   └── config.toml                  # Supabase config
│
├── wrangler.toml                     # Cloudflare configuration
├── next.config.ts                   # Next.js configuration
├── tailwind.config.js               # Tailwind configuration
└── package.json                     # Dependencies
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ and npm/yarn/pnpm
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

## 📚 Development Guide

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for standard production
npm run cf:build     # Build for Cloudflare (includes asset flattening)
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
```

### Testing

This project uses Vitest and React Testing Library. Tests are located alongside the components/files they test (e.g., `ComponentName.spec.tsx`).

```bash
npm run test         # Run tests once
npm run test:ui      # Run tests with Vitest UI
```

## 🔐 Security

- **Supabase Auth**: Industry-standard authentication
- **Row Level Security (RLS)**: Database-level access control for all tables
- **Cloudflare Routing**: `_routes.json` configured to optimize asset delivery and worker security

## 📞 Support & Contact

- **Email**: Helloreliable@gmail.com
- **Website**: [Reliable Drapes](https://reliabledrapes.com)
- **GitHub**: [Kolade-dotcom/reliable-drapes](https://github.com/Kolade-dotcom/reliable-drapes)

## 📝 License

This project is private and proprietary. All rights reserved.

© 2026 Reliable Drapes (Shree Ambica Furnishings India Pvt. Ltd.)

---

**Last Updated**: January 25, 2026  
**Version**: 2.1.0  
**Status**: Production Ready (Cloudflare Optimized)  
**Maintainer**: Kolade
