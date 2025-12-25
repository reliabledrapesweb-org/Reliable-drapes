# Reliable Drapes - Luxury Home Furnishings E-Commerce Platform

A comprehensive, production-ready e-commerce platform for luxury home furnishings built with **Next.js 16**, **TypeScript**, **Supabase**, and **Tailwind CSS v4**. Features a premium design system, complete admin dashboard, consultation booking, newsletter campaigns, and full e-commerce functionality.

## ✨ Key Features

### 🛍️ E-Commerce Core
- **Product Catalog**: Advanced filtering, search, sorting, and pagination
- **Product Details**: Multi-image galleries, variants, specifications, related products
- **Shopping Cart**: Persistent cart with Zustand state management
- **Categories & Collections**: Organized product browsing with featured collections
- **Related Products**: Smart recommendations based on shared categories

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
- **Framework**: Next.js 16 (App Router, Turbopack)
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
- **Email**: Ready for Resend/SendGrid/AWS SES integration

### Development
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier with Tailwind plugin
- **Type Safety**: Full TypeScript coverage

## 📁 Project Structure

```
reliable-drapes/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                  # Auth routes (login, signup, etc.)
│   │   ├── admin/                   # Admin dashboard
│   │   │   ├── products/            # Product management
│   │   │   ├── categories/          # Category management
│   │   │   ├── collections/         # Collection management
│   │   │   ├── orders/              # Order management
│   │   │   ├── customers/           # Customer management
│   │   │   ├── communications/      # Communications hub
│   │   │   │   ├── contact/         # Contact submissions
│   │   │   │   ├── consultations/   # Consultation requests
│   │   │   │   └── newsletter/      # Newsletter campaigns
│   │   │   ├── catalogues/          # Catalogue management
│   │   │   ├── stores/              # Store management
│   │   │   ├── careers/             # Career management
│   │   │   └── layout.tsx           # Admin layout
│   │   ├── about/                   # About page
│   │   ├── careers/                 # Career portal
│   │   ├── e-catalogue/             # Digital catalogues
│   │   ├── shop/                    # Product catalog
│   │   │   └── [id]/                # Product details
│   │   ├── cart/                    # Shopping cart
│   │   ├── store-locator/           # Store finder
│   │   ├── style-expert/            # Consultation booking
│   │   ├── contact/                 # Contact page
│   │   ├── privacy-policy/          # Privacy policy
│   │   ├── terms-of-service/        # Terms of service
│   │   └── page.tsx                 # Home page
│   │
│   ├── components/
│   │   ├── features/                # Feature-specific components
│   │   │   ├── admin/               # Admin components
│   │   │   ├── auth/                # Auth components
│   │   │   ├── home/                # Home page sections
│   │   │   ├── about/               # About page sections
│   │   │   ├── catalog/             # Product catalogue
│   │   │   ├── shop/                # Shop components
│   │   │   ├── careers/             # Career components
│   │   │   ├── consultation/        # Consultation components
│   │   │   └── store-locator/       # Store locator components
│   │   ├── layout/                  # Layout components
│   │   │   ├── Header.tsx           # Main navigation
│   │   │   ├── Footer.tsx           # Footer
│   │   │   └── MobileMenu.tsx       # Mobile navigation
│   │   ├── shared/                  # Shared components
│   │   │   ├── Breadcrumb.tsx       # Navigation breadcrumb
│   │   │   ├── PageHero.tsx         # Page hero section
│   │   │   └── CTASection.tsx       # Call-to-action
│   │   └── ui/                      # UI primitives
│   │       ├── button.tsx           # Button component
│   │       ├── card.tsx             # Card component
│   │       ├── Toast.tsx            # Toast notifications
│   │       └── LoadingScreen.tsx    # Loading states
│   │
│   └── lib/
│       ├── actions/                 # Server actions
│       │   ├── auth.ts              # Authentication
│       │   ├── products.ts          # Product operations
│       │   ├── communications.ts    # Contact, newsletter, consultations
│       │   ├── jobs.ts              # Career management
│       │   └── stores.ts            # Store management
│       ├── constants/               # App constants
│       │   ├── navigation.ts        # Navigation links
│       │   ├── consultation.ts      # Consultation options
│       │   └── legal.ts             # Legal content
│       ├── hooks/                   # Custom hooks
│       │   ├── useAdmin.ts          # Admin access control
│       │   ├── useAuth.ts           # Auth state
│       │   └── useScrollPosition.ts # Scroll detection
│       ├── store/                   # Zustand stores
│       │   ├── authStore.ts         # Auth state
│       │   └── cartStore.ts         # Shopping cart
│       ├── supabase/                # Supabase clients
│       │   ├── client.ts            # Client-side
│       │   ├── server.ts            # Server-side
│       │   ├── admin.ts             # Admin client
│       │   └── anon.ts              # Anonymous client
│       ├── types/                   # TypeScript types
│       └── validators/              # Zod schemas
│
├── supabase/
│   ├── migrations/                  # Database migrations
│   └── config.toml                  # Supabase config
│
├── public/                          # Static assets
│   └── images/                      # Image assets
│
├── .env.local                       # Environment variables
├── next.config.ts                   # Next.js configuration
├── tailwind.config.js               # Tailwind configuration
├── tsconfig.json                    # TypeScript configuration
└── package.json                     # Dependencies
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **Supabase** account and project
- **Git** for version control

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
   
   # Email Service (Optional - for newsletter campaigns)
   # RESEND_API_KEY=your_resend_api_key
   # or
   # SENDGRID_API_KEY=your_sendgrid_api_key
   ```

4. **Run database migrations**:
   ```bash
   # Using Supabase CLI
   supabase db push
   
   # Or apply migrations manually through Supabase dashboard
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

6. **Open in browser**:
   Visit [http://localhost:3000](http://localhost:3000)

### Admin Access

To access the admin dashboard:
1. Add your email to `ADMIN_EMAILS` in `.env.local`
2. Sign up/login with that email
3. Navigate to `/admin`

## 📊 Database Schema

### Core Tables
- **products**: Product catalog with images, variants, specifications
- **categories**: Hierarchical product categories
- **collections**: Seasonal and promotional collections
- **product_images**: Multiple images per product
- **product_variants**: Size, color, material variants
- **product_specifications**: Technical specifications
- **orders**: Customer orders and order items
- **customers**: Customer accounts and profiles

### Communication Tables
- **contact_submissions**: Contact form submissions
- **consultation_requests**: Style expert consultation bookings
- **newsletter_subscribers**: Email newsletter subscribers
- **newsletter_campaigns**: Email campaign history

### Content Tables
- **catalogues**: Digital product catalogues (PDFs)
- **stores**: Physical store locations
- **jobs**: Career opportunities
- **job_applications**: Job application submissions

## 🎨 Design System

### Colors
- **Primary**: `#2F2582` (Brand Purple)
- **Secondary**: `#241C66` (Dark Purple)
- **Accent**: `#4C3D9E` (Light Purple)
- **Text**: `#2A2A2A` (Dark Gray)
- **Muted**: `#575757` (Medium Gray)

### Typography
- **Font Family**: DM Sans
- **Headings**: Bold, 2xl-6xl
- **Body**: Regular, base-lg
- **Small**: Regular, sm-xs

### Components
- **Buttons**: Rounded-xl with hover effects
- **Cards**: Rounded-2xl with shadows
- **Inputs**: Rounded-lg with focus states
- **Modals**: Rounded-3xl with backdrop blur

## 📚 Development Guide

### Available Scripts

```bash
npm run dev          # Start development server (Turbopack)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm test             # Run all tests
npm test:watch       # Run tests in watch mode
npm test:coverage    # Run tests with coverage
npm test:ui          # Run tests with UI
```

### Key Features Implementation

#### Product Management
- Full CRUD operations with image upload
- Variant management (size, color, material)
- Specification management
- Category and collection assignment
- Related products algorithm

#### Consultation System
- Multi-step booking form with validation
- Room type and style preference selection
- Date and time scheduling
- Admin management dashboard
- Status tracking (pending, confirmed, completed, cancelled)

#### Newsletter Campaigns
- Subscriber management with status tracking
- Campaign composer with rich text
- Recipient selection (all or specific)
- Campaign history and analytics
- Ready for email service integration

#### Admin Dashboard
- Role-based access control
- Real-time statistics
- Unified admin layout and components
- Consistent design patterns
- Mobile-responsive interface

### Adding New Features

1. **Create feature folder**: `src/components/features/your-feature/`
2. **Add components**: Create your feature components
3. **Add server actions**: `src/lib/actions/your-action.ts`
4. **Add types**: Define types in `src/lib/types/`
5. **Create migration**: `supabase/migrations/YYYYMMDD_your_feature.sql`
6. **Add tests**: Create `.spec.ts` files alongside code
7. **Update navigation**: Add to `src/lib/constants/navigation.ts`

### Code Style Guidelines

- Use **TypeScript** strict mode
- Follow **Next.js App Router** conventions
- Use **Server Actions** for data mutations
- Implement **Server Components** where possible
- Use **Tailwind CSS** utility classes
- Follow **mobile-first** responsive design
- Add **Framer Motion** animations for interactions
- Write **tests** for critical functionality

### Database Migrations

Create new migrations in `supabase/migrations/`:

```sql
-- Example migration
CREATE TABLE IF NOT EXISTS your_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "policy_name"
  ON your_table
  FOR SELECT
  USING (true);
```

## 🧪 Testing

### Test Coverage
- Unit tests for utilities and validators
- Component tests for UI components
- Integration tests for server actions
- E2E tests for critical user flows

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage

# Run tests with UI
npm test:ui
```

### Writing Tests

Example component test:
```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## 🚢 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
ADMIN_EMAILS=admin@reliabledrapes.com
RESEND_API_KEY=your_email_service_key (optional)
```

### Build Optimization
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic with App Router
- **Bundle Analysis**: Run `npm run build` to see bundle sizes
- **Caching**: Configured for optimal performance

## 📦 Key Dependencies

```json
{
  "dependencies": {
    "next": "^16.0.7",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "typescript": "^5",
    "@supabase/supabase-js": "^2.57.4",
    "@supabase/ssr": "^0.7.0",
    "framer-motion": "^12.23.24",
    "motion": "^12.23.24",
    "zustand": "^5.0.9",
    "react-hook-form": "^7.63.0",
    "@hookform/resolvers": "^5.2.2",
    "zod": "^4.1.9",
    "lucide-react": "^0.544.0",
    "tailwindcss": "^4",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.1",
    "date-fns": "^4.1.0",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@tailwindcss/postcss": "^4",
    "@vitejs/plugin-react": "^5.1.1",
    "@vitest/coverage-v8": "^4.0.15",
    "@vitest/ui": "^4.0.15",
    "@testing-library/react": "^16.3.0",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/user-event": "^14.6.1",
    "vitest": "^4.0.15",
    "jsdom": "^27.2.0",
    "eslint": "^9",
    "eslint-config-next": "15.5.3",
    "prettier": "^3.6.2",
    "prettier-plugin-tailwindcss": "^0.7.1"
  }
}
```

## 🔐 Security

### Authentication
- **Supabase Auth**: Industry-standard authentication
- **Row Level Security**: Database-level access control
- **Role-Based Access**: Admin and customer roles
- **Password Hashing**: Automatic with Supabase
- **Session Management**: Secure cookie-based sessions

### Data Protection
- **Environment Variables**: Sensitive keys in `.env.local`
- **Type Safety**: Full TypeScript strict mode
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection**: Protected by Supabase RLS
- **XSS Protection**: React automatic escaping

### Best Practices
- Never commit `.env.local` to version control
- Use service role key only in server actions
- Implement proper RLS policies for all tables
- Validate all user inputs on server side
- Use HTTPS in production

## 🎯 Roadmap

### Phase 1: Core E-Commerce (✅ Complete)
- [x] Product catalog with filtering
- [x] Shopping cart functionality
- [x] Product details with variants
- [x] Related products
- [x] Category management
- [x] Collection management

### Phase 2: Admin Dashboard (✅ Complete)
- [x] Product management
- [x] Order management
- [x] Customer management
- [x] Communications hub
- [x] Newsletter campaigns
- [x] Consultation booking

### Phase 3: Customer Experience (✅ Complete)
- [x] Style expert consultation
- [x] Store locator with maps
- [x] Digital catalogues
- [x] Career portal
- [x] Newsletter subscription

### Phase 4: Enhancements (🚧 In Progress)
- [ ] Payment gateway integration (Stripe/Razorpay)
- [ ] Order tracking and notifications
- [ ] Customer reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced search with filters
- [ ] Email service integration (Resend/SendGrid)

### Phase 5: Advanced Features (📋 Planned)
- [ ] Loyalty program
- [ ] Referral system
- [ ] Live chat support
- [ ] AR product visualization
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

## 📖 Documentation

- **API Documentation**: See `src/lib/actions/` for server action documentation
- **Component Documentation**: See component files for prop types and usage
- **Database Schema**: See `supabase/migrations/` for table structures
- **Design System**: See `DESIGN_SYSTEM.md` for design guidelines

## 🤝 Contributing

This is a private project. For internal contributions:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes with proper commit messages
3. Test thoroughly: `npm test`
4. Push and create a pull request

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example: 
```
feat(newsletter): add campaign composer

- Add rich text editor for email content
- Implement recipient selection
- Add preview modal
```

## 🐛 Known Issues

- Newsletter email sending requires email service integration
- Store locator requires Google Maps API key for full functionality
- Some admin features require proper RLS policy configuration

## 📞 Support & Contact

- **Email**: Helloreliable@gmail.com
- **Website**: [Reliable Drapes](https://reliabledrapes.com)
- **GitHub**: [Kolade-dotcom/reliable-drapes](https://github.com/Kolade-dotcom/reliable-drapes)

## 📝 License

This project is private and proprietary. All rights reserved.

© 2025 Reliable Drapes (Shree Ambica Furnishings India Pvt. Ltd.)

---

**Last Updated**: December 25, 2025  
**Version**: 2.0.0  
**Status**: Production Ready  
**Maintainer**: Kolade
