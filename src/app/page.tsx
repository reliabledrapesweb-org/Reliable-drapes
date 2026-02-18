"use client";

import {
  HeroSection,
  AboutSection,
  CategoriesSection,
  VideoSection,
  GoogleReviewsSection,
  NewsletterSection,
} from "@/components/features/home";

export default function HomePage() {
  return (
    <main>
      <HeroSection />

      <VideoSection />

      <AboutSection />

      <CategoriesSection />

      <GoogleReviewsSection />

      <NewsletterSection />
    </main>
  );
}
