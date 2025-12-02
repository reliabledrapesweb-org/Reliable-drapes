"use client";

import {
  FounderSection,
  WhyChooseSection,
  FeaturesGrid,
  VisionMissionSection,
} from "@/components/features/about";
import { CTASection, PageHero } from "@/components/shared";

export default function AboutPage() {
  return (
    <main className="mt-14 md:mt-16 lg:mt-[72px]">
      <PageHero heading="About Reliable Drapes" />
      <FounderSection />
      <WhyChooseSection />
      <FeaturesGrid />
      <VisionMissionSection />
      <CTASection />
    </main>
  );
}
