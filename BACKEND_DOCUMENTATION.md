# Backend Documentation

This project uses a modern, edge-compatible backend architecture built with **Next.js Server Actions**, **Server Components**, and **Supabase**.

## Architecture Overview

The application has moved away from traditional API routes (`/api/*`) to a direct-to-database approach using Server Actions for mutations (writes) and Server Components for data fetching (reads). This architecture is fully compatible with **Cloudflare Pages** and other edge environments.

### Key Technologies

- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Cookie-based)
- **Data Fetching**: React Server Components (RSC) with `cache()`
- **Mutations**: Next.js Server Actions (`'use server'`)
- **Runtime**: Edge-compatible (no Node.js specific APIs)

## Directory Structure

```
src/lib/
├── actions/           # Server Actions (Write operations)
│   ├── auth.ts        # Signup, Login
│   ├── categories.ts  # Create category (Admin)
│   └── orders.ts      # Create order, Get user orders
├── data/              # Server Components Data Fetchers (Read operations)
│   ├── categories.ts  # Get categories, Get category by slug
│   └── products.ts    # Get products (Pagination, Filtering)
├── supabaseAdmin.ts   # Admin client (Service Role Key)
├── supabaseAnon.ts    # Anonymous client (Public Key)
├── supabaseClient.ts  # Client-side helper
├── supabaseServer.ts  # Server-side helper (Cookie handling)
└── validators.ts      # Zod schemas for input validation
```

## Authentication

Authentication is handled via Supabase Auth using **HTTP-only cookies**.

- **Signup/Login**: Handled by `signupAction` and `loginAction` in `src/lib/actions/auth.ts`.
- **Session Management**: Supabase middleware (if configured) and helper functions manage session tokens in cookies (`sb-access-token`).
- **Authorization**:
  - **Server Actions**: Check for valid session cookies and verify user roles (e.g., `admin`) before proceeding.
  - **Server Components**: Access cookies to determine the current user and their role for conditional data fetching (e.g., showing admin-only products).

## Data Models

### Users & Profiles

- **`auth.users`**: Managed by Supabase Auth.
- **`public.profiles`**: Extends user data.
  - `id`: References `auth.users.id`
  - `full_name`: User's display name
  - `role`: `'customer'` or `'admin'`

### Categories

- **`categories`**
  - `id`, `name`, `slug`, `description`, `image_url`
  - `parent_id`: Self-reference for hierarchical categories
  - `is_featured`: Boolean for homepage display
  - `sort_order`: Integer for display order

### Products

- **`products`**
  - `id`, `name`, `description`, `price`
  - `image_url`: Main product image
  - `visible_to`: Array of roles (e.g., `['customer']`, `['admin']`)
  - `product_images`: Related table for multiple images

### Orders

- **`orders`**
  - `id`, `user_id`, `status`, `total`, `created_at`
- **`order_items`**
  - `order_id`, `product_id`, `quantity`, `price_snapshot`

## API Reference (Server Functions)

Since there are no REST API endpoints, interaction is done via importing these functions directly into your components.

### Authentication (`lib/actions/auth.ts`)

- `signupAction(formData)`: Registers a new user.
- `loginAction(formData)`: Authenticates a user.

### Categories

- **Read** (`lib/data/categories.ts`):
  - `getCategories({ includeProducts, parentOnly, featured })`: Returns a list or tree of categories.
  - `getCategoryBySlug(slug, { includeProducts, page, perPage })`: Returns details for a specific category.
- **Write** (`lib/actions/categories.ts`):
  - `createCategoryAction(data)`: Creates a new category (Admin only).

### Products

- **Read** (`lib/data/products.ts`):
  - `getProducts({ page, perPage })`: Returns a paginated list of products.

### Orders

- **Write** (`lib/actions/orders.ts`):
  - `createOrderAction({ total, items })`: Creates a new order for the authenticated user.
- **Read** (`lib/actions/orders.ts`):
  - `getOrdersAction()`: Returns all orders for the authenticated user.

## Deployment

This project is optimized for **Cloudflare Pages**.

1. **Build Command**: `npx @cloudflare/next-on-pages@1`
2. **Output Directory**: `.vercel/output/static`
3. **Compatibility Flags**: `nodejs_compat` (optional, but good practice)

Ensure your Supabase environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are set in your deployment environment.
