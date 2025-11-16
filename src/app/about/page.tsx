"use client";

import { AboutHero } from "@/components/aboutpageComponents/AboutHero";
import { FounderSection } from "@/components/aboutpageComponents/FounderSection";
// import { WhyChooseSection } from "@/components/aboutpageComponents/WhyChooseSection";
// import { FeaturesGrid } from "@/components/aboutpageComponents/FeaturesGrid";
// import { VisionMissionSection } from "@/components/aboutpageComponents/VisionMissionSection";
import { CTASection } from "@/components/CTASection";

export default function AboutPage() {
  return (
    <main className="mt-14 md:mt-16 lg:mt-[72px]">
      <AboutHero />
      <FounderSection />
      {/* <WhyChooseSection /> */}
      {/* <FeaturesGrid /> */}
      {/* <VisionMissionSection /> */}
      <CTASection />
    </main>
  );
}
