# Reliable Drapes - Luxury Home Furnishings

A modern, responsive e-commerce web application built with **Next.js 15**, featuring a premium design, comprehensive product catalogue, and an immersive user experience for luxury home furnishings.

## Features

- **Modern UI/UX**: Premium design with glassmorphism, smooth transitions, and responsive layouts
- **Home Page**: Engaging hero section carousel, featured products, and brand storytelling
- **About Page**: Detailed company information, vision/mission, founder spotlight, and feature grid
- **E-Catalogue**: Browsable product catalogue with filtering, search, and detailed product cards
- **Authentication**: Login system with social auth options (Google, Apple)
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices
- **Animations**: Powered by Framer Motion for fluid interactions
- **Backend**: Supabase integration with Server Actions and Server Components
- **Testing**: Comprehensive test coverage with Jest and React Testing Library

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React & React Icons
- **Backend**: Supabase (PostgreSQL, Auth)
- **Architecture**: Server Actions & Server Components (Edge Compatible)
- **Testing**: Jest, React Testing Library
- **Forms**: React Hook Form + Zod validation

## Documentation

- **Backend Documentation**: [BACKEND_DOCUMENTATION.md](./BACKEND_DOCUMENTATION.md)
- **Frontend Documentation**: [FRONTEND_DOCUMENTATION.md](./FRONTEND_DOCUMENTATION.md)

## Project Structure

```
reliable-drapes/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication route group
│   │   │   └── login/
│   │   ├── about/             # About page
│   │   ├── e-catalogue/       # Product catalogue
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── template.tsx       # Page template with loading
│   ├── components/
│   │   ├── features/          # Feature-specific components
│   │   │   ├── auth/          # Authentication components
│   │   │   ├── home/          # Home page components
│   │   │   ├── about/         # About page components
│   │   │   └── catalog/       # E-catalog components
│   │   ├── layout/            # Layout components (Header, Footer, etc.)
│   │   ├── shared/            # Shared/reusable components
│   │   └── ui/                # UI primitives
│   └── lib/
│       ├── actions/           # Server actions (by domain)
│       ├── constants/         # App constants
│       ├── data/              # Static data
│       ├── hooks/             # Custom React hooks
│       ├── supabase/          # Supabase clients
│       ├── types/             # TypeScript type definitions
│       ├── utils/             # Utility functions
│       └── validators/        # Zod validation schemas
├── __tests__/                 # Test files
│   ├── components/
│   ├── lib/
│   └── integration/
├── public/                    # Static assets
└── supabase/                  # Supabase configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd reliable-drapes
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Guide

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESL int
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

### Code Organization

#### Components

- **Feature components** (`src/components/features/`): Domain-specific components grouped by feature
- **Layout components** (`src/components/layout/`): Header, Footer, and other layout elements
- **Shared components** (`src/components/shared/`): Reusable components used across features
- **UI components** (`src/components/ui/`): Base UI primitives

#### Lib Structure

- **Actions** (`src/lib/actions/`): Server actions organized by domain (auth, categories, orders)
- **Constants** (`src/lib/constants/`): Application constants and configuration
- **Hooks** (`src/lib/hooks/`): Custom React hooks (e.g., `useScrollPosition`)
- **Types** (`src/lib/types/`): TypeScript type definitions for better type safety
- **Utils** (`src/lib/utils/`): Utility functions for common operations
- **Validators** (`src/lib/validators/`): Zod schemas for data validation

### Adding New Features

1. **Create feature directory**: Add a new folder in `src/components/features/`
2. **Add components**: Create your feature components
3. **Create barrel export**: Add `index.ts` for clean imports
4. **Update types**: Add type definitions in `src/lib/types/`
5. **Add tests**: Create tests in `__tests__/components/features/`

### Styling Guidelines

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use the `cn()` utility for conditional classes
- Maintain consistent spacing and typography

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

- **Unit tests**: Test utility functions, validators, and hooks
- **Component tests**: Test React components in isolation
- **Integration tests**: Test server actions and data flow

### Writing Tests

Example component test:
```tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/shared';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

Example unit test:
```ts
import { myUtility } from '@/lib/utils';

describe('myUtility', () => {
  it('should return expected value', () => {
    expect(myUtility('input')).toBe('output');
  });
});
```

## Deployment

### Deploy on Vercel

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables
4. Deploy!

### Deploy on Cloudflare Pages

1. Connect your repository to Cloudflare Pages
2. Select **Next.js** as the framework preset
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Code Quality

- **TypeScript**: Strict mode enabled for type safety
- **ESLint**: Configured with Next.js recommended rules
- **Prettier**: Code formatting with Tailwind CSS plugin
- **Testing**: Jest + React Testing Library for comprehensive coverage

## License

This project is private and proprietary.

## Contact

For questions or support, please contact: Helloreliable@gmail.com
