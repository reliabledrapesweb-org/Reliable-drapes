import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import path from "path";

const nextConfig: NextConfig = {
  // Force Next.js to use this project as tracing root.
  // Prevents incorrect workspace inference when other lockfiles exist on the machine.
  outputFileTracingRoot: path.resolve(__dirname),
  // Ignore ESLint errors during build (fix them separately)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during build (fix them separately)
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Disable image optimization for Cloudflare compatibility
    // This setting works for both Vercel and Cloudflare
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh4.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh5.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh6.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
    ],
  },
};

export default nextConfig;

// Initialize OpenNext Cloudflare for local development
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}
