# AGENTS.md - Reliable Drapes Development Guide

This document provides guidelines for AI agents working on the Reliable Drapes e-commerce project.

## Project Overview

Next.js 16 e-commerce website for home furnishings (curtains, upholstery, sheers, bed sheets). Tech stack: Next.js, TypeScript, Tailwind CSS, Framer Motion, Supabase, Zustand, Vitest.

## Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Production build
npm run start                 # Start production server

# Linting & Type Checking
npm run lint                   # Run ESLint
npx tsc --noEmit              # TypeScript type check

# Testing
npm run test                   # Run all tests with Vitest
npm run test -- src/lib/utils/cn.spec.ts    # Run single test file
npm run test -- --run         # Run tests once (no watch)
npm run test -- --reporter=basic  # Basic reporter for CI
npm run test:coverage         # Run tests with coverage report
npm run test:watch            # Watch mode for development
```

## Code Style Guidelines

### Imports

Organize imports in this order with blank lines between groups:

1. React/Next.js imports (`"use client"`, imports from `react`, `next/image`, etc.)
2. Third-party libraries (Framer Motion, Zustand, Supabase, etc.)
3. Icon libraries (lucide-react, react-icons)
4. Path aliases (`@/lib/...`, `@/components/...`)

```tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
```

### TypeScript

- Use **interfaces** for object shapes and component props
- Use **types** for unions, intersections, and primitives
- Export interfaces alongside types for reusability
- Enable strict mode - no `any` without explicit annotation
- Use `null` for explicit null values, `undefined` for optional

```tsx
interface ProductCardProps {
  id?: string;
  title: string;
  onClick?: () => void;
}

type AuthResponse = {
  success: boolean;
  error?: string;
  userId?: string;
};
```

### Naming Conventions

- **Components**: PascalCase (`ProductCard`, `ContactForm`)
- **Files**: kebab-case for pages (`contact/page.tsx`), camelCase for utilities (`cn.ts`)
- **Variables/Functions**: camelCase (`isLoading`, `handleSubmit`)
- **Constants**: SCREAMING_SNAKE_CASE for config values, camelCase for local
- **CSS Classes**: Use Tailwind utility classes; avoid custom CSS unless necessary
- **Store hooks**: Prefix with `use` (`useCartStore`, `useAuthStore`)
- **Server actions**: Suffix with `Action` (`signupAction`, `loginAction`)

### Component Structure

```tsx
// 1. "use client" directive if using hooks
"use client";

import { useState } from "react";

// 2. Types/interfaces at top level
interface Props {
  title: string;
}

// 3. Helper functions/constants (outside component)
const ANIMATION_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// 4. Main component
export function ComponentName({ title }: Props) {
  // Hooks first
  const [state, setState] = useState(false);

  // Event handlers
  const handleClick = () => {
    /* ... */
  };

  // Early returns for loading/error states
  if (isLoading) return <LoadingSpinner />;

  // JSX return
  return <div>{title}</div>;
}
```

### Tailwind CSS

- Primary brand color: `#2F2582` (use as `bg-[#2F2582]` or define in theme)
- Use responsive prefixes: `md:`, `lg:` for breakpoints
- Use `container mx-auto` for page containers
- Use `group` pattern for hover effects on parent with child changes
- Merge classes with `cn()` utility for conditional classes

```tsx
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  disabled && "opacity-50 cursor-not-allowed"
)}>
```

### Framer Motion

- Use `viewport={{ once: true }}` for scroll animations (performance)
- Spring animations preferred: `{ type: "spring", stiffness: 100, damping: 15 }`
- Stagger children: `transition: { staggerChildren: 0.1 }`
- Define variants outside component for reusability

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

<motion.div
  variants={containerVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
>
```

### Server Actions & Error Handling

Return consistent response objects with `success` and `error` properties:

```tsx
type ActionResponse = {
  success: boolean;
  error?: string;
  message?: string;
  data?: unknown;
};

export async function serverAction(input: Input): Promise<ActionResponse> {
  try {
    const result = await db.operation();
    return { success: true, data: result };
  } catch (error) {
    console.error("Operation failed:", error);
    return { success: false, error: "Failed to complete operation" };
  }
}
```

### Form Validation

Use Zod schemas for validation:

```tsx
import { z } from "zod";

export const formSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
});

type FormInput = z.infer<typeof formSchema>;
```

### Testing

- Place tests alongside source files: `component.tsx` + `component.spec.tsx`
- Use Vitest with React Testing Library
- Mock external dependencies with `vi.mock()`
- Group tests with `describe()` blocks

```tsx
describe("ComponentName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders correctly", () => {
    render(<ComponentName title="Test" />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });
});
```

### File Organization

```
src/
├── app/                    # Next.js App Router pages
│   ├── contact/page.tsx
│   └── layout.tsx
├── components/
│   ├── ui/                # Reusable UI components (Button, Card, etc.)
│   ├── shared/            # Shared components (Breadcrumb, PageHero)
│   ├── features/          # Feature-specific components
│   └── layout/            # Layout components (Header, Footer)
├── lib/
│   ├── actions/           # Server actions
│   ├── constants/         # Static data (navigation, categories)
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API/service layer
│   ├── store/             # Zustand stores
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   └── validators/        # Zod schemas
└── public/images/         # Static images
```

### State Management

- **Zustand**: Global client state (cart, wishlist, auth)
- **useState/useReducer**: Local component state
- **Server actions**: Data mutations with Supabase
- **React Query (TanStack)**: Not currently used; prefer server actions

### Database (Supabase)

- Use typed clients: `getServerSupabase()`, `getAnonSupabase()`, `getAdminSupabase()`
- Profile data stored in `profiles` table
- Use RLS policies for row-level security
- Admin client for elevated operations (create user, etc.)

### Misc

- Use `lucide-react` for icons
- Prefer `Image` component from `next/image` with proper `alt` text
- Add `aria-label` for icon-only buttons
- Use English punctuation in code comments
- No console.log in production code (use proper logging or remove)
