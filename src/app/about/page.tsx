import {
  FounderSection,
  ChairmanSection,
  LeadershipRow,
  WhyChooseSection,
  FeaturesGrid,
  VisionMissionSection,
} from "@/components/features/about";
import { PageHero, Breadcrumb } from "@/components/shared";
import { getAboutSections } from "@/lib/actions/about-sections";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const result = await getAboutSections();
  const sections = result.success ? result.data : [];

  const sectionsMap = new Map(
    sections?.map((section) => [section.section_key, section]),
  );

  const founderSection = sectionsMap.get("founder");
  const chairmanSection = sectionsMap.get("chairman");
  const directorSection = sectionsMap.get("director");

  const leadershipMembers = [
    {
      name: founderSection?.title || "Founder",
      designation: "Founder",
      imageUrl: founderSection?.image_url || null,
    },
    {
      name: chairmanSection?.title || "Chairman",
      designation: "Chairman",
      imageUrl: chairmanSection?.image_url || null,
    },
    {
      name: directorSection?.title || "Director",
      designation: "Director",
      imageUrl: directorSection?.image_url || null,
    },
  ];

  return (
    <main className="mt-14 md:mt-16 lg:mt-[72px]">
      <PageHero heading="About Reliable Drapes" />
      <Breadcrumb />
      <LeadershipRow members={leadershipMembers} />
      <FounderSection section={founderSection} />
      <ChairmanSection section={chairmanSection} />
      <WhyChooseSection section={sectionsMap.get("why-choose")} />
      <FeaturesGrid section={sectionsMap.get("features")} />
      <VisionMissionSection section={sectionsMap.get("vision-mission")} />
    </main>
  );
}
