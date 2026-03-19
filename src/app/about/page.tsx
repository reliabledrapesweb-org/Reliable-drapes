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

  // Leadership row uses separate DB entries so editing doesn't affect individual sections
  const leadershipFounder = sectionsMap.get("leadership-founder");
  const leadershipChairman = sectionsMap.get("leadership-chairman");
  const leadershipDirector = sectionsMap.get("leadership-director");

  const leadershipMembers = [
    {
      name: leadershipFounder?.title || "Founder",
      designation: leadershipFounder?.subtitle || "FOUNDER",
      imageUrl: leadershipFounder?.image_url || null,
    },
    {
      name: leadershipChairman?.title || "Chairman",
      designation: leadershipChairman?.subtitle || "CHAIRMAN",
      imageUrl: leadershipChairman?.image_url || null,
    },
    {
      name: leadershipDirector?.title || "Director",
      designation: leadershipDirector?.subtitle || "DIRECTOR",
      imageUrl: leadershipDirector?.image_url || null,
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
