# Reliable Drapes - Luxury Home Furnishings

A modern, responsive web application built with **Next.js 15** to showcase luxury home furnishings. The application features a premium design with smooth animations, a comprehensive product catalogue, and an immersive user experience.

## Features

- **Modern UI/UX**: Premium design with glassmorphism, smooth transitions, and responsive layouts.
- **Home Page**: Engaging hero section, featured products, and brand storytelling.
- **About Page**: Detailed company information, vision/mission, and founder spotlight.
- **E-Catalogue**: Browsable product catalogue with filtering, search, and detailed product cards.
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices.
- **Animations**: Powered by Framer Motion for a fluid feel.
- **Backend**: Powered by Supabase with Server Actions and Server Components.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL, Auth)
- **Architecture**: Server Actions & Server Components (Edge Compatible)

## Documentation

For detailed backend documentation, including data models and server functions, please refer to [BACKEND_DOCUMENTATION.md](./BACKEND_DOCUMENTATION.md).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy on Cloudflare Pages

This application is optimized for deployment on **Cloudflare Pages**.

1. Connect your repository to Cloudflare Pages.
2. Select **Next.js** as the framework preset.
3. Add your environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
