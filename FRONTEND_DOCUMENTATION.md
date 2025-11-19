# Frontend Documentation

## Overview
This project is a modern, responsive web application built with **Next.js 15**, designed to showcase luxury home furnishings. The frontend emphasizes visual elegance, smooth animations, and a seamless user experience across all devices.

## Technology Stack
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) (`motion/react`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Fonts**: Geist (Next.js Font optimization)

## Design System

### Color Palette
- **Primary Brand Color**: `#2F2582` (Deep Blue) - Used for buttons, accents, and the mobile menu background.
- **Text Colors**:
  - Headings: `text-black` or `text-white` (on dark backgrounds).
  - Body: `#575757` (Dark Grey) - Used for paragraph text to reduce eye strain.
- **Backgrounds**:
  - White: `bg-white` - Primary background.
  - Light Grey: `#f8f8f8` - Secondary background for sections like `FeaturesGrid`.

### Typography
- **Headings**: Clean, often `font-light` or `font-medium` for a sophisticated look.
- **Body**: Readable sans-serif with generous line height (`leading-relaxed`).

### UI Philosophy
- **Glassmorphism**: Used in the Header and overlays (backdrop blur).
- **Minimalism**: ample whitespace, clean lines, and focus on high-quality imagery.
- **Motion**: Subtle entrance animations and interactive hover states to make the UI feel alive.

## Component Architecture

The application follows a modular component structure organized by page and function.

### Directory Structure
```
src/
├── app/                 # Next.js App Router pages
├── components/          # React Components
│   ├── aboutpageComponents/  # Components specific to the About Page
│   ├── homepageComponents/   # Components specific to the Home Page
│   ├── ui/                   # Shared UI components (buttons, inputs)
│   ├── Header.tsx            # Global Header
│   ├── MobileMenu.tsx        # Mobile Navigation Overlay
│   └── Footer.tsx            # Global Footer
└── lib/                 # Utilities and Business Logic
```

### Key Components

#### 1. Header & Navigation
- **`Header.tsx`**: Responsive navigation bar. Adapts transparency and text color based on the route (Home vs. others).
- **`MobileMenu.tsx`**: A fullscreen overlay menu for mobile devices.
  - **Design**: "Fullscreen Reveal" with a circular clip-path animation.
  - **Features**: Staggered link animations, hover effects with arrow indicators.

#### 2. About Page Components (`src/components/aboutpageComponents/`)
- **`AboutHero.tsx`**: Hero section with a background image, gradient overlay, and animated text.
- **`FounderSection.tsx`**: Showcases the founder with a rotated image effect and slide-in animations.
- **`WhyChooseSection.tsx`**: Highlights unique selling points with overlapping image layouts.
- **`FeaturesGrid.tsx`**: A 3-column grid displaying key features with staggered entrance animations.
- **`VisionMissionSection.tsx`**: Alternating layout for Vision and Mission statements, optimized for mobile stacking.

## Animations & Interactivity

We use **Framer Motion** to enhance the user experience without overwhelming the content.

### Common Patterns
- **Scroll Animations**: Elements fade in (`opacity: 0` -> `1`) and slide up (`y: 20` -> `0`) as they enter the viewport.
- **Staggered Lists**: Grids and lists (like the Mobile Menu links) animate items one by one for a polished feel.
- **Hover Effects**: Buttons and links scale slightly (`scale: 1.05`) or show additional elements (arrows) on hover.
- **Page Transitions**: Smooth transitions between states, such as the Mobile Menu reveal.

## Responsiveness

The application is built with a **mobile-first** approach using Tailwind's responsive prefixes (`md:`, `lg:`, `xl:`).

- **Mobile**: Stacked layouts, larger touch targets, hamburger menu.
- **Tablet**: Adjusted padding and font sizes.
- **Desktop**: Multi-column layouts, horizontal navigation, hover interactions.

## Recent Updates (UI)

### About Page Overhaul
- **Objective**: Improve responsiveness and add scroll animations.
- **Changes**:
  - Added `motion` components to all sections.
  - Fixed layout issues on mobile (e.g., overlapping images in `WhyChooseSection`).
  - Standardized spacing and typography across the page.

### Mobile Menu Redesign
- **Objective**: Create a more engaging mobile navigation experience.
- **Changes**:
  - Refactored dropdown logic into `MobileMenu.tsx`.
  - Implemented a "Fullscreen Reveal" animation.
  - Aligned design with the brand's Deep Blue identity.
