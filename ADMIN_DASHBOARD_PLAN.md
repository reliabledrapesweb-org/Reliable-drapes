# 🎯 Admin Dashboard Implementation Plan

> **Project:** Reliable Drapes - Admin Dashboard  
> **Created:** December 8, 2024  
> **Estimated Timeline:** 2-3 weeks  
> **Priority:** High

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture & Design](#architecture--design)
3. [Phase 1: Foundation & Authentication](#phase-1-foundation--authentication)
4. [Phase 2: Core Modules](#phase-2-core-modules)
5. [Phase 3: Advanced Features](#phase-3-advanced-features)
6. [Phase 4: Polish & Testing](#phase-4-polish--testing)
7. [Technical Stack](#technical-stack)
8. [Database Requirements](#database-requirements)
9. [File Structure](#file-structure)
10. [Task Breakdown](#task-breakdown)

---

## 🎯 Overview

### Objectives
Build a comprehensive admin dashboard for managing:
- Products, Categories, Collections
- Orders & Customers
- Content Management
- Analytics & Reporting
- User Roles & Permissions

### Target Users
- Admin users with full access
- Future: Content managers, Order processors (role-based)

### Key Features
- ✅ Secure authentication (admin role required)
- 📊 Real-time analytics dashboard
- 📦 Complete product management (CRUD)
- 📂 Category & collection management
- 🛒 Order processing & tracking
- 👥 User management
- 📧 Contact & consultation requests
- 💼 Job posting management
- 📰 Newsletter subscriber management
- 📁 File upload & media library

---

## 🏗️ Architecture & Design

### Design Principles
1. **Consistency**: Follow existing app design patterns (Framer Motion, Tailwind)
2. **Responsiveness**: Mobile-first, works on tablets and desktops
3. **Performance**: Optimized data loading, pagination, lazy loading
4. **Security**: Role-based access, protected routes, secure API calls
5. **User Experience**: Intuitive navigation, clear feedback, error handling

### UI/UX Approach
- **Dark Mode Admin Theme**: Professional dark sidebar with light content area
- **Sidebar Navigation**: Fixed left sidebar with collapsible sections
- **Dashboard Cards**: Stats overview with charts and graphs
- **Data Tables**: Sortable, filterable, searchable tables with pagination
- **Forms**: Modal-based for create/edit operations
- **Notifications**: Toast notifications for success/error states

---

## 📅 Phase 1: Foundation & Authentication

### Duration: 2-3 days

### 1.1 Route Protection & Middleware
**Tasks:**
- [ ] Create admin route protection middleware
- [ ] Build `useAdmin()` hook for role verification
- [ ] Create `AdminGuard` wrapper component
- [ ] Implement redirect logic for non-admin users
- [ ] Add loading states during auth check

**Files to Create:**
```
src/lib/hooks/useAdmin.ts
src/components/providers/AdminProvider.tsx
src/middleware.ts (if needed)
```

**Implementation:**
```typescript
// useAdmin hook
- Check if user exists
- Verify user.role === 'admin'
- Fetch from profiles table
- Return { isAdmin, isLoading, error }
```

---

### 1.2 Admin Layout & Navigation
**Tasks:**
- [ ] Create admin layout component
- [ ] Build sidebar navigation with icons
- [ ] Implement mobile-responsive sidebar (hamburger menu)
- [ ] Add breadcrumb navigation
- [ ] Create admin header with user info & logout
- [ ] Add active route highlighting

**Files to Create:**
```
src/app/admin/layout.tsx
src/components/admin/AdminSidebar.tsx
src/components/admin/AdminHeader.tsx
src/components/admin/AdminBreadcrumb.tsx
```

**Navigation Structure:**
```
📊 Dashboard
📦 Products
  ├── All Products
  ├── Add Product
  └── Categories
🛒 Orders
  ├── All Orders
  ├── Pending
  └── Completed
👥 Customers
📂 Collections
📧 Communications
  ├── Contact Submissions
  ├── Consultations
  └── Newsletter
💼 Careers
  ├── Job Openings
  └── Applications
⚙️ Settings
```

---

### 1.3 Dashboard Overview Page
**Tasks:**
- [ ] Create dashboard homepage (`/admin`)
- [ ] Build stats cards component (total products, orders, revenue, customers)
- [ ] Add recent orders section
- [ ] Add recent customers section
- [ ] Create simple charts (order trends, revenue)
- [ ] Display quick actions (Add Product, View Orders, etc.)

**Files to Create:**
```
src/app/admin/page.tsx
src/components/admin/dashboard/StatsCard.tsx
src/components/admin/dashboard/RecentOrders.tsx
src/components/admin/dashboard/QuickActions.tsx
src/components/admin/dashboard/Charts.tsx
```

**Data Sources:**
- Total products: `SELECT COUNT(*) FROM products`
- Total orders: `SELECT COUNT(*) FROM orders`
- Total revenue: `SELECT SUM(total) FROM orders WHERE status='paid'`
- Recent orders: Last 10 orders with customer info

---

## 📅 Phase 2: Core Modules

### Duration: 7-10 days

### 2.1 Product Management Module

#### 2.1.1 Product List Page
**Tasks:**
- [ ] Create products listing page (`/admin/products`)
- [ ] Build data table component with sorting & filtering
- [ ] Add search functionality
- [ ] Implement pagination
- [ ] Add bulk actions (delete, publish/unpublish)
- [ ] Display product image, name, price, category, status
- [ ] Add edit/delete action buttons

**Files:**
```
src/app/admin/products/page.tsx
src/components/admin/products/ProductTable.tsx
src/components/admin/products/ProductRow.tsx
src/components/shared/DataTable.tsx (reusable)
```

**Features:**
- Server-side pagination (20 items per page)
- Filter by category, status, price range
- Search by name, description
- Sort by name, price, created date

---

#### 2.1.2 Add/Edit Product Form
**Tasks:**
- [ ] Create add product page (`/admin/products/new`)
- [ ] Create edit product page (`/admin/products/[id]`)
- [ ] Build product form component (modal or full page)
- [ ] Add form validation (Zod schema)
- [ ] Implement image upload (Supabase Storage)
- [ ] Add multiple image gallery support
- [ ] Category selection (dropdown/multi-select)
- [ ] Product variants (colors, sizes)
- [ ] Product specifications (key-value pairs)
- [ ] Rich text editor for description
- [ ] Price and inventory fields
- [ ] Publish/draft toggle

**Files:**
```
src/app/admin/products/new/page.tsx
src/app/admin/products/[id]/page.tsx
src/components/admin/products/ProductForm.tsx
src/components/admin/products/ImageUpload.tsx
src/components/admin/products/VariantManager.tsx
src/lib/validators/product.validators.ts
src/lib/actions/products.ts
```

**Server Actions:**
```typescript
createProductAction(data: CreateProductInput)
updateProductAction(id: string, data: UpdateProductInput)
deleteProductAction(id: string)
uploadProductImageAction(file: File)
```

---

### 2.2 Category Management

**Tasks:**
- [ ] Create categories page (`/admin/categories`)
- [ ] Display hierarchical category tree
- [ ] Add/edit/delete category modal
- [ ] Drag-and-drop for reordering
- [ ] Parent category selection
- [ ] Category image upload
- [ ] Slug auto-generation
- [ ] Featured category toggle

**Files:**
```
src/app/admin/categories/page.tsx
src/components/admin/categories/CategoryTree.tsx
src/components/admin/categories/CategoryForm.tsx
src/lib/actions/categories.ts (update existing)
```

**Features:**
- Visual tree structure with expand/collapse
- Inline editing
- Move category to different parent
- Display product count per category

---

### 2.3 Order Management

#### 2.3.1 Orders List
**Tasks:**
- [ ] Create orders page (`/admin/orders`)
- [ ] Display orders table with filters
- [ ] Filter by status (pending, paid, shipped, cancelled)
- [ ] Search by order ID, customer name/email
- [ ] Date range filter
- [ ] Export orders to CSV
- [ ] Order status badges with colors

**Files:**
```
src/app/admin/orders/page.tsx
src/components/admin/orders/OrderTable.tsx
src/components/admin/orders/StatusBadge.tsx
```

---

#### 2.3.2 Order Details & Processing
**Tasks:**
- [ ] Create order detail page (`/admin/orders/[id]`)
- [ ] Display customer information
- [ ] Show order items with product details
- [ ] Order timeline (created, paid, shipped, delivered)
- [ ] Update order status
- [ ] Add order notes (admin comments)
- [ ] Print invoice/receipt

**Files:**
```
src/app/admin/orders/[id]/page.tsx
src/components/admin/orders/OrderDetails.tsx
src/components/admin/orders/OrderTimeline.tsx
src/components/admin/orders/StatusUpdater.tsx
src/lib/actions/orders.ts (update)
```

---

### 2.4 Customer Management

**Tasks:**
- [ ] Create customers page (`/admin/customers`)
- [ ] Display user list with roles
- [ ] View customer profile
- [ ] Show customer order history
- [ ] Filter by role (customer, admin)
- [ ] Search by name, email
- [ ] View customer stats (total orders, total spent)
- [ ] Block/unblock user (optional)

**Files:**
```
src/app/admin/customers/page.tsx
src/app/admin/customers/[id]/page.tsx
src/components/admin/customers/CustomerTable.tsx
src/components/admin/customers/CustomerProfile.tsx
src/lib/actions/customers.ts
```

---

## 📅 Phase 3: Advanced Features

### Duration: 5-7 days

### 3.1 Collections Management

**Tasks:**
- [ ] Create collections page (`/admin/collections`)
- [ ] Add/edit collection form
- [ ] Assign products to collections
- [ ] Set collection active dates (start/end)
- [ ] Upload collection banner images
- [ ] Reorder collections
- [ ] Featured collection toggle

**Files:**
```
src/app/admin/collections/page.tsx
src/components/admin/collections/CollectionForm.tsx
src/components/admin/collections/ProductSelector.tsx
src/lib/actions/collections.ts
```

---

### 3.2 Communications Hub

#### 3.2.1 Contact Form Submissions
**Tasks:**
- [ ] Create contact submissions page
- [ ] Display unread/read status
- [ ] Mark as resolved
- [ ] Reply via email (optional)
- [ ] Archive messages

**Database:**
```sql
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  status TEXT DEFAULT 'unread', -- unread, read, resolved
  created_at TIMESTAMP
);
```

---

#### 3.2.2 Style Expert Consultations
**Tasks:**
- [ ] Display consultation requests
- [ ] View uploaded files (floor plans, images)
- [ ] Update consultation status
- [ ] Add admin notes
- [ ] Schedule appointments

**Database:**
```sql
CREATE TABLE consultations (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  budget TEXT,
  location TEXT,
  requirements TEXT,
  design_preferences TEXT,
  floor_plan_url TEXT,
  images TEXT[], -- array of URLs
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  appointment_date TIMESTAMP,
  created_at TIMESTAMP
);
```

---

#### 3.2.3 Newsletter Subscribers
**Tasks:**
- [ ] Display subscriber list
- [ ] Export to CSV
- [ ] Filter by subscription date
- [ ] Search by email
- [ ] View subscription stats

**Database:**
```sql
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  status TEXT DEFAULT 'active',
  subscribed_at TIMESTAMP,
  unsubscribed_at TIMESTAMP
);
```

---

### 3.3 Careers Module

#### 3.3.1 Job Postings
**Tasks:**
- [ ] Create job openings page
- [ ] Add/edit job posting form
- [ ] Rich text editor for job description
- [ ] Set job status (active/closed)
- [ ] View application count per job

**Database:**
```sql
CREATE TABLE job_openings (
  id UUID PRIMARY KEY,
  title TEXT,
  department TEXT,
  location TEXT,
  type TEXT, -- full-time, part-time, contract
  description TEXT,
  requirements TEXT,
  salary_range TEXT,
  status TEXT DEFAULT 'active',
  posted_at TIMESTAMP,
  closes_at TIMESTAMP,
  created_at TIMESTAMP
);
```

---

#### 3.3.2 Job Applications
**Tasks:**
- [ ] Display applications per job
- [ ] View applicant details
- [ ] Download resume
- [ ] Update application status (reviewing, shortlisted, rejected, hired)
- [ ] Add interview notes

**Database:**
```sql
CREATE TABLE job_applications (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES job_openings(id),
  name TEXT,
  email TEXT,
  phone TEXT,
  resume_url TEXT,
  cover_letter TEXT,
  status TEXT DEFAULT 'new',
  admin_notes TEXT,
  applied_at TIMESTAMP,
  created_at TIMESTAMP
);
```

---

### 3.4 Media Library (File Management)

**Tasks:**
- [ ] Create media library page
- [ ] Display uploaded images in grid
- [ ] Upload multiple files
- [ ] Delete files from storage
- [ ] Copy image URL
- [ ] Filter by file type
- [ ] Search by filename
- [ ] Display file size and upload date

**Files:**
```
src/app/admin/media/page.tsx
src/components/admin/media/MediaGrid.tsx
src/components/admin/media/FileUploader.tsx
src/lib/actions/media.ts
```

**Supabase Storage Buckets:**
- `products` - Product images
- `categories` - Category images
- `collections` - Collection banners
- `consultations` - Floor plans and reference images
- `resumes` - Job application resumes

---

### 3.5 Settings & Configuration

**Tasks:**
- [ ] Site settings page
- [ ] Update business information
- [ ] Contact details (email, phone, address)
- [ ] Social media links
- [ ] SEO settings (meta titles, descriptions)
- [ ] Email notification preferences
- [ ] Admin user management

**Files:**
```
src/app/admin/settings/page.tsx
src/components/admin/settings/SiteSettings.tsx
src/components/admin/settings/AdminUsers.tsx
```

---

## 📅 Phase 4: Polish & Testing

### Duration: 3-4 days

### 4.1 Analytics & Reporting

**Tasks:**
- [ ] Revenue charts (daily, weekly, monthly)
- [ ] Order status breakdown (pie chart)
- [ ] Top-selling products
- [ ] Customer growth chart
- [ ] Export reports to PDF/CSV

**Libraries:**
- `recharts` or `chart.js` for visualizations

---

### 4.2 UI Components Library

**Shared Components to Build:**
- [ ] `DataTable` - Reusable table with sorting, filtering, pagination
- [ ] `Modal` - Confirmation dialogs, forms
- [ ] `Tabs` - For organizing content
- [ ] `Badge` - Status indicators
- [ ] `Pagination` - Page navigation
- [ ] `DatePicker` - Date selection
- [ ] `RichTextEditor` - WYSIWYG editor (Tiptap or similar)
- [ ] `FileUpload` - Drag-and-drop file uploader
- [ ] `ConfirmDialog` - Delete confirmations
- [ ] `EmptyState` - No data placeholders

**Files:**
```
src/components/ui/data-table.tsx
src/components/ui/modal.tsx
src/components/ui/tabs.tsx
src/components/ui/badge.tsx
src/components/ui/pagination.tsx
src/components/ui/date-picker.tsx
src/components/ui/rich-text-editor.tsx
```

---

### 4.3 Error Handling & Validation

**Tasks:**
- [ ] Implement comprehensive error boundaries
- [ ] Add form validation for all inputs
- [ ] Display user-friendly error messages
- [ ] Handle network errors gracefully
- [ ] Add loading states for all async operations
- [ ] Implement toast notifications for success/error

---

### 4.4 Testing

**Tasks:**
- [ ] Unit tests for server actions
- [ ] Component tests for forms
- [ ] Integration tests for CRUD operations
- [ ] E2E tests for critical flows (create product, process order)
- [ ] Test role-based access control
- [ ] Test file upload functionality

---

## 🛠️ Technical Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **State**: Zustand (for global admin state if needed)
- **Charts**: Recharts or Chart.js
- **Rich Text**: Tiptap or Quill
- **Date Picker**: react-datepicker or shadcn date-picker

### Backend
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Auth**: Supabase Auth (admin role check)
- **Server Actions**: Next.js Server Actions
- **Validation**: Zod schemas

### DevOps
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier
- **Version Control**: Git

---

## 🗄️ Database Requirements

### New Tables to Create

```sql
-- Contact submissions
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'resolved')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Consultations
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  budget TEXT,
  location TEXT,
  requirements TEXT,
  design_preferences TEXT,
  floor_plan_url TEXT,
  images TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
  admin_notes TEXT,
  appointment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Newsletter subscribers
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  subscribed_at TIMESTAMP DEFAULT NOW(),
  unsubscribed_at TIMESTAMP
);

-- Job openings
CREATE TABLE job_openings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT,
  location TEXT,
  type TEXT CHECK (type IN ('full-time', 'part-time', 'contract')),
  description TEXT,
  requirements TEXT,
  salary_range TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  posted_at TIMESTAMP DEFAULT NOW(),
  closes_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Job applications
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES job_openings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  cover_letter TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'shortlisted', 'rejected', 'hired')),
  admin_notes TEXT,
  applied_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- FAQs (for customer service)
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  sort_order INT DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### RLS Policies

```sql
-- Admin-only access for all admin tables
-- Public read for FAQs

-- Example for contact_submissions
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all contact submissions"
  ON contact_submissions FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);
```

---

## 📁 File Structure

```
src/
├── app/
│   └── admin/
│       ├── layout.tsx                    # Admin layout with sidebar
│       ├── page.tsx                      # Dashboard overview
│       ├── products/
│       │   ├── page.tsx                  # Products list
│       │   ├── new/page.tsx              # Add product
│       │   └── [id]/page.tsx             # Edit product
│       ├── categories/
│       │   └── page.tsx                  # Categories management
│       ├── collections/
│       │   └── page.tsx                  # Collections management
│       ├── orders/
│       │   ├── page.tsx                  # Orders list
│       │   └── [id]/page.tsx             # Order details
│       ├── customers/
│       │   ├── page.tsx                  # Customers list
│       │   └── [id]/page.tsx             # Customer profile
│       ├── communications/
│       │   ├── contact/page.tsx          # Contact submissions
│       │   ├── consultations/page.tsx    # Consultation requests
│       │   └── newsletter/page.tsx       # Newsletter subscribers
│       ├── careers/
│       │   ├── jobs/page.tsx             # Job openings
│       │   └── applications/page.tsx     # Job applications
│       ├── media/
│       │   └── page.tsx                  # Media library
│       └── settings/
│           └── page.tsx                  # Settings
│
├── components/
│   └── admin/
│       ├── AdminSidebar.tsx              # Main sidebar navigation
│       ├── AdminHeader.tsx               # Top header
│       ├── AdminBreadcrumb.tsx           # Breadcrumb navigation
│       ├── dashboard/
│       │   ├── StatsCard.tsx
│       │   ├── RecentOrders.tsx
│       │   ├── QuickActions.tsx
│       │   └── Charts.tsx
│       ├── products/
│       │   ├── ProductTable.tsx
│       │   ├── ProductForm.tsx
│       │   ├── ImageUpload.tsx
│       │   └── VariantManager.tsx
│       ├── categories/
│       │   ├── CategoryTree.tsx
│       │   └── CategoryForm.tsx
│       ├── orders/
│       │   ├── OrderTable.tsx
│       │   ├── OrderDetails.tsx
│       │   ├── StatusBadge.tsx
│       │   └── StatusUpdater.tsx
│       ├── customers/
│       │   ├── CustomerTable.tsx
│       │   └── CustomerProfile.tsx
│       └── shared/
│           ├── DataTable.tsx             # Reusable data table
│           └── EmptyState.tsx
│
├── lib/
│   ├── actions/
│   │   ├── products.ts                   # Product CRUD
│   │   ├── categories.ts                 # (update existing)
│   │   ├── collections.ts                # Collection CRUD
│   │   ├── orders.ts                     # (update existing)
│   │   ├── customers.ts                  # Customer actions
│   │   ├── contact.ts                    # Contact submissions
│   │   ├── consultations.ts              # Consultation actions
│   │   ├── newsletter.ts                 # Newsletter actions
│   │   ├── careers.ts                    # Job & applications
│   │   └── media.ts                      # File upload/delete
│   │
│   ├── hooks/
│   │   ├── useAdmin.ts                   # Admin role verification
│   │   └── usePagination.ts              # Pagination logic
│   │
│   └── validators/
│       ├── product.validators.ts         # Product form schemas
│       ├── category.validators.ts        # Category schemas
│       ├── collection.validators.ts      # Collection schemas
│       ├── contact.validators.ts         # Contact form schemas
│       └── career.validators.ts          # Job/application schemas
```

---

## ✅ Task Breakdown (For Project Tracking)

### Foundation (Week 1)
- [ ] **Day 1-2**: Route protection, admin layout, sidebar navigation
- [ ] **Day 3**: Dashboard overview page with stats
- [ ] **Day 4-5**: Shared UI components (DataTable, Modal, Badge, etc.)

### Core Modules (Week 2)
- [ ] **Day 1-2**: Product management (list, add, edit, delete)
- [ ] **Day 3**: Category management
- [ ] **Day 4**: Order list and order details
- [ ] **Day 5**: Customer management

### Advanced Features (Week 3)
- [ ] **Day 1**: Collections management
- [ ] **Day 2**: Communications hub (contact, consultations, newsletter)
- [ ] **Day 3**: Careers module (jobs, applications)
- [ ] **Day 4**: Media library
- [ ] **Day 5**: Settings page

### Polish & Testing (Week 3-4)
- [ ] **Day 1**: Analytics and charts
- [ ] **Day 2**: Error handling and validation
- [ ] **Day 3**: Testing (unit, integration)
- [ ] **Day 4**: Bug fixes and refinements

---

## 🎨 Design Guidelines

### Color Scheme
- **Primary**: `#2F2582` (brand purple)
- **Sidebar**: `#1a1a1a` (dark gray)
- **Background**: `#f5f5f5` (light gray)
- **Success**: `#10b981` (green)
- **Warning**: `#f59e0b` (orange)
- **Danger**: `#ef4444` (red)
- **Info**: `#3b82f6` (blue)

### Typography
- **Headings**: DM Sans (existing brand font)
- **Body**: DM Sans
- **Code/Numbers**: Monospace

### Icons
- **Library**: Lucide React (already in use)
- **Sidebar Icons**: 20x20px
- **Action Icons**: 16x16px

---

## 🚀 Next Steps (Getting Started)

### Immediate Actions
1. ✅ Review and approve this plan
2. ⚙️ Set up database migrations for new tables
3. 🔧 Create admin route structure
4. 🎨 Build admin layout and sidebar
5. 📊 Implement dashboard overview
6. 📦 Start with product management module

### Questions to Decide
- Should we use modals or full pages for create/edit forms?
- What chart library should we use? (Recharts recommended)
- Do we need real-time updates (Supabase Realtime)?
- Should we implement activity logs (audit trail)?
- Email integration for notifications? (SendGrid, Resend, etc.)

---

## 📝 Notes

- **Security First**: All admin routes must verify admin role server-side
- **Performance**: Use pagination, lazy loading, and caching
- **Responsiveness**: Admin panel should work on tablets (iPad size minimum)
- **Accessibility**: Follow WCAG guidelines, keyboard navigation
- **Error Handling**: Comprehensive error messages and validation
- **User Feedback**: Toast notifications for all actions

---

**Ready to Start?** Let's begin with Phase 1! 🚀
