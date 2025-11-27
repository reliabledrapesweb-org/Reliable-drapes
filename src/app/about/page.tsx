"use client";

import { FounderSection } from "@/components/aboutpageComponents/FounderSection";
import { WhyChooseSection } from "@/components/aboutpageComponents/WhyChooseSection";
import { FeaturesGrid } from "@/components/aboutpageComponents/FeaturesGrid";
import { VisionMissionSection } from "@/components/aboutpageComponents/VisionMissionSection";
import { CTASection } from "@/components/CTASection";
import { PageHero } from "@/components/PageHero";

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
