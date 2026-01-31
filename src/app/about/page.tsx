import {
  FounderSection,
  WhyChooseSection,
  FeaturesGrid,
  VisionMissionSection,
} from "@/components/features/about";
import { PageHero } from "@/components/shared";
import { getAboutSections } from "@/lib/actions/about-sections";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const result = await getAboutSections();
  const sections = result.success ? result.data : [];

  // Map sections by key for easy access
  const sectionsMap = new Map(
    sections?.map((section) => [section.section_key, section]),
  );

  return (
    <main className="mt-14 md:mt-16 lg:mt-[72px]">
      <PageHero heading="About Reliable Drapes" />
      <FounderSection section={sectionsMap.get("founder")} />
      <WhyChooseSection section={sectionsMap.get("why-choose")} />
      <FeaturesGrid section={sectionsMap.get("features")} />
      <VisionMissionSection section={sectionsMap.get("vision-mission")} />
    </main>
  );
}
