import {
  HeroSection,
  FeaturesSection,
  AboutSection,
  CategoriesSection,
  GoogleReviewsSection,
  NewsletterSection,
} from "@/components/features/home";
import { getSiteSettings } from "@/lib/actions/site-settings";
import { DEFAULT_HERO_CAROUSEL_IMAGES } from "@/lib/constants/app";

const normalizeCarouselImages = (images: unknown): string[] => {
  const fallbackImages = [...DEFAULT_HERO_CAROUSEL_IMAGES];
  if (!Array.isArray(images)) return fallbackImages;
  return fallbackImages.map((defaultImage, index) => {
    const value = images[index];
    return typeof value === "string" && value.trim().length > 0
      ? value.trim()
      : defaultImage;
  });
};

export const revalidate = 3600;

export default async function HomePage() {
  let heroImages: string[] = [...DEFAULT_HERO_CAROUSEL_IMAGES];

  try {
    const result = await getSiteSettings();
    if (result.success && result.settings) {
      heroImages = normalizeCarouselImages(
        result.settings.hero_carousel_images,
      );
    }
  } catch {
    // Keep fallback images
  }

  return (
    <main>
      <HeroSection images={heroImages} />

      <FeaturesSection />

      <AboutSection />

      <CategoriesSection />

      <GoogleReviewsSection />

      <NewsletterSection />
    </main>
  );
}
