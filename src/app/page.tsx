"use client";

import { HeroSection } from "@/components/homepageComponents/HeroSection";
import { FeaturesSection } from "@/components/homepageComponents/FeaturesSection";
import { AboutSection } from "@/components/homepageComponents/AboutSection";
import { CategoriesSection } from "@/components/homepageComponents/CategoriesSection";
import { BenefitsSection } from "@/components/homepageComponents/BenefitsSection";
import { BestsellerSection } from "@/components/homepageComponents/BestsellerSection";
import { NewsletterSection } from "@/components/homepageComponents/NewsletterSection";
import { CTASection } from "@/components/CTASection";
import { MessageCircle } from "lucide-react";

export default function HomePage() {
  return (
    <main>
      <HeroSection />

      <FeaturesSection />

      <AboutSection />

      <CategoriesSection />

      <BenefitsSection />

      <BestsellerSection />

      <NewsletterSection />

      <CTASection />

      {/* WhatsApp Floating Button */}
      <button
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#2F2582] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50 cursor-pointer"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle className="w-8 h-8 text-white" />
      </button>
    </main>
  );
}
