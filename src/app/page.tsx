"use client";

import { motion } from "motion/react";
import {
  HeroSection,
  FeaturesSection,
  AboutSection,
  CategoriesSection,
  BenefitsSection,
  BestsellerSection,
  NewsletterSection,
} from "@/components/features/home";
import { CTASection } from "@/components/shared";
import { FaWhatsapp } from "react-icons/fa";

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
      <motion.button
        className="fixed right-8 bottom-8 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#2F2582] shadow-lg transition-transform hover:scale-110"
        aria-label="Contact us on WhatsApp"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <FaWhatsapp className="h-8 w-8 text-white" />
      </motion.button>
    </main>
  );
}
