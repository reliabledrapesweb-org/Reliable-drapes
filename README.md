# Reliable Drapes - Luxury Home Furnishings E-Commerce

A modern, full-featured e-commerce web application for luxury home furnishings built with **Next.js 15**, **TypeScript**, and **Supabase**. Features a premium design, comprehensive authentication system, interactive product catalogue, and complete test coverage.

## ✨ Features

### Core Features
- **Premium UI/UX**: Modern glassmorphism design with smooth animations and transitions
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop devices
- **Home Page**: Engaging hero section, featured products, categories, and brand storytelling
- **About Page**: Company information with vision/mission and founder spotlight
- **E-Catalogue**: Advanced product catalogue with filtering, search, and detailed product cards

### Authentication & User Management
- **Complete Auth System**: Email/password login and signup
- **Social Auth**: Sign in with Google and Apple (OAuth)
- **Password Recovery**: Forgot password and reset password flows
- **Global State**: Zustand for centralized auth state management
- **User Profile**: Display logged-in user information with logout functionality

### Legal & Compliance
- **Terms of Service**: Comprehensive legal terms (editable via constants)
- **Privacy Policy**: Complete privacy documentation (editable via constants)
- **Legal Content**: Centralized management in `/src/lib/constants/legal.ts`

### Technical Features
- **Server Actions**: Type-safe backend operations
- **Server Components**: Optimized rendering with Next.js 15
- **Animation Library**: Framer Motion for smooth interactions
- **Form Validation**: Zod for runtime type safety
- **Testing**: Vitest with React Testing Library (80+ tests passing)
- **Type Safety**: Full TypeScript strict mode enabled

## 🛠 Tech Stack

- **Frontend Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL, Authentication)
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Testing**: Vitest + React Testing Library
- **Architecture**: Server Actions & Server Components

## 📁 Project Structure

```
reliable-drapes/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                  # Auth route group (layout: /login, /signup, etc.)
│   │   │   ├── login/               # Login page
│   │   │   ├── signup/              # Sign up page
│   │   │   ├── forgot-password/     # Forgot password page
│   │   │   └── reset-password/      # Reset password page
│   │   ├── about/                   # About page
│   │   ├── e-catalogue/             # E-catalogue page
│   │   ├── privacy-policy/          # Privacy policy page
│   │   ├── terms-of-service/        # Terms of service page
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Home page
│   │   ├── template.tsx             # Page template
│   │   └── globals.css              # Global styles
│   │
│   ├── components/
│   │   ├── features/                # Feature-specific components
│   │   │   ├── auth/                # Auth components (AuthForm, etc.)
│   │   │   ├── home/                # Home page components
│   │   │   ├── about/               # About page components
│   │   │   ├── catalog/             # Product catalogue components
│   │   │   └── index.ts             # Barrel export
│   │   ├── layout/                  # Layout components
│   │   │   ├── Header.tsx           # Navigation header
│   │   │   ├── Footer.tsx           # Footer
│   │   │   ├── MobileMenu.tsx       # Mobile menu
│   │   │   └── index.ts             # Barrel export
│   │   ├── shared/                  # Shared/reusable components
│   │   │   ├── SearchBar.tsx
│   │   │   ├── Breadcrumb.tsx
│   │   │   ├── CTASection.tsx
│   │   │   ├── PageHero.tsx
│   │   │   ├── ImageWithFallback.tsx
│   │   │   └── index.ts             # Barrel export
│   │   └── ui/                      # UI primitives
│   │
│   └── lib/
│       ├── actions/                 # Server actions
│       │   ├── auth.ts              # Auth operations (login, signup, forgot password)
│       │   └── index.ts             # Barrel export
│       ├── constants/               # App constants
│       │   ├── app.ts               # App configuration
│       │   ├── navigation.ts        # Navigation links
│       │   ├── legal.ts             # Legal content (Terms & Privacy)
│       │   └── index.ts             # Barrel export
│       ├── hooks/                   # Custom React hooks
│       │   ├── useScrollPosition.ts # Scroll detection hook
│       │   └── index.ts             # Barrel export
│       ├── store/                   # Zustand stores
│       │   ├── authStore.ts         # Auth state management
│       │   └── index.ts             # Barrel export
│       ├── supabase/                # Supabase clients
│       │   ├── client.ts            # Client-side client
│       │   ├── server.ts            # Server-side client
│       │   ├── admin.ts             # Admin client
│       │   ├── anon.ts              # Anonymous client
│       │   └── index.ts             # Barrel export
│       ├── types/                   # TypeScript definitions
│       │   ├── auth.types.ts        # Auth-related types
│       │   ├── product.types.ts     # Product types
│       │   ├── category.types.ts    # Category types
│       │   ├── common.types.ts      # Common types
│       │   └── index.ts             # Barrel export
│       ├── utils/                   # Utility functions
│       │   ├── cn.ts                # Class name utility
│       │   ├── format.ts            # Formatting utilities
│       │   └── index.ts             # Barrel export
│       ├── validators/              # Zod validation schemas
│       │   ├── auth.validators.ts   # Auth validation
│       │   └── index.ts             # Barrel export
│       └── data/                    # Static data
│
├── public/                          # Static assets (images, fonts, etc.)
├── vitest.config.ts                 # Vitest configuration
├── vitest.setup.ts                  # Vitest setup
├── CLAUDE.md                        # Development guidelines
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
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Visit [http://localhost:3000](http://localhost:3000)

## 📚 Development Guide

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm test             # Run all tests
npm test -- --watch  # Run tests in watch mode
```

### Code Organization

#### Component Structure

Components are organized by feature and purpose:

- **Feature Components** (`src/components/features/`): Domain-specific components (auth, home, catalog)
- **Layout Components** (`src/components/layout/`): Header, Footer, Navigation
- **Shared Components** (`src/components/shared/`): Reusable components across features
- **UI Components** (`src/components/ui/`): Base UI primitives

#### Server Actions

Server actions are organized by domain:

- **Auth Actions** (`src/lib/actions/auth.ts`): Login, signup, password reset

#### Constants & Configuration

- **Navigation** (`src/lib/constants/navigation.ts`): NAV_LINKS array
- **App Config** (`src/lib/constants/app.ts`): Application configuration
- **Legal Content** (`src/lib/constants/legal.ts`): Terms and Privacy Policy (easily editable)

### Authentication Flow

1. User navigates to `/login` or `/signup`
2. `AuthForm` component handles form submission
3. Server action (`loginAction` or `signupAction`) processes request
4. Supabase authenticates user
5. User data stored in Zustand auth store
6. Header/MobileMenu update to show logged-in state

### Adding New Features

1. **Create feature folder**: `src/components/features/your-feature/`
2. **Add components**: Create your feature components
3. **Create barrel export**: Add `index.ts` with named exports
4. **Add types**: Define types in `src/lib/types/`
5. **Add tests**: Create `.spec.ts` files alongside code
6. **Add server actions** (if needed): `src/lib/actions/your-action.ts`

### Styling Guidelines

- Use **Tailwind CSS** utility classes
- Follow **mobile-first** responsive design
- Use `cn()` utility for conditional classes:
  ```tsx
  import { cn } from '@/lib/utils';
  
  <div className={cn('base-class', isActive && 'active-class')} />
  ```
- Maintain consistent spacing and typography
- Use design tokens from Tailwind config

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

Tests are colocated with source code using `.spec.ts` or `.spec.tsx` extension:

```
src/
├── lib/
│   ├── utils/
│   │   ├── cn.ts
│   │   └── cn.spec.ts          # Unit test
│   ├── validators/
│   │   ├── auth.validators.ts
│   │   └── auth.validators.spec.ts  # Validation tests
│   └── actions/
│       ├── auth.ts
│       └── auth.spec.ts        # Integration tests
└── components/
    └── features/
        └── auth/
            ├── AuthForm.tsx
            └── AuthForm.spec.tsx   # Component tests
```

### Test Types

- **Unit Tests**: Test utility functions, validators, and hooks
- **Component Tests**: Test React components in isolation
- **Integration Tests**: Test server actions and data flow

### Writing Tests

Example unit test:
```ts
import { describe, it, expect } from 'vitest';
import { myUtility } from '@/lib/utils';

describe('myUtility', () => {
  it('should return expected value', () => {
    expect(myUtility('input')).toBe('output');
  });
});
```

Example component test:
```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MyComponent } from '@/components/shared';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## 🚢 Deployment

**Cloudflare Pages:**
```bash
npm run build
# Follow Cloudflare Pages deployment instructions
```

## 📋 Development Standards

This project follows the **CLAUDE.md** development guidelines:

- **C-1 to C-9**: Code organization, naming conventions, and structure
- **T-1 to T-6**: Testing best practices and coverage expectations
- See `CLAUDE.md` for detailed guidelines

### Commit Message Format

```
<type>: <subject>

<body>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example: `feat: add password reset functionality`

## 📦 Key Dependencies

```json
{
  "next": "15.x",
  "react": "19.x",
  "typescript": "5.x",
  "tailwindcss": "3.x",
  "framer-motion": "latest",
  "zustand": "latest",
  "supabase": "latest",
  "zod": "latest",
  "vitest": "latest",
  "@testing-library/react": "latest"
}
```

## 🔒 Security

- **Environment Variables**: Store sensitive keys in `.env.local`
- **Type Safety**: Full TypeScript strict mode
- **Validation**: Zod schemas for all inputs
- **Auth**: Supabase-managed authentication
- **CORS**: Configured for Supabase

## 📝 License

This project is private and proprietary. All rights reserved.

## 📞 Support

For questions or support, please contact: **Helloreliable@gmail.com**

---

**Last Updated**: December 2025
**Maintainers**: Kolade
