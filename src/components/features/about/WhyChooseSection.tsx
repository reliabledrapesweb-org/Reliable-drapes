import Image from "next/image";
import { motion } from "motion/react";
import type { AboutSection } from "@/lib/actions/about-sections";

interface WhyChooseSectionProps {
  section?: AboutSection;
}

export function WhyChooseSection({ section }: WhyChooseSectionProps) {
  // Default content as fallback
  const defaults = {
    title: "Why Choose Reliable Drapes?",
    content:
      "We combine decades of experience, exceptional craftsmanship, and a passion for design with a dedicated designing team to help you style your home. Our experts carefully select the finest collections to ensure every space feels vibrant, personalized, and effortlessly elegant.",
    paragraph_2:
      "From the richness of hand-worked embroidery to the finesse of contemporary patterns, our collections cater to every taste—whether you love classic luxury or modern minimalism.",
    image_url: "/images/whyReliablePic.png",
  };

  // Use CMS data if available, otherwise use defaults
  const contentJson = (section?.content_json as Record<string, string>) || {};
  const title = section?.title || defaults.title;
  const content = section?.content || defaults.content;
  const paragraph2 = contentJson.paragraph_2 || defaults.paragraph_2;
  const imageUrl = section?.image_url || defaults.image_url;

  return (
    <section className="overflow-hidden bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
          {/* Content */}
          <motion.div
            className="order-2 max-w-2xl flex-1 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-4 text-2xl font-semibold text-black lg:text-[32px]">
              {title}
            </h2>

            <div className="space-y-6 text-lg leading-relaxed text-[#575757]">
              <p>{content}</p>

              <p>{paragraph2}</p>
            </div>
          </motion.div>

          {/* Images */}
          <motion.div
            className="order-1 flex-shrink-0 lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative h-72 w-72 md:h-96 md:w-96">
              {/* Background rotated image */}
              <div className="absolute inset-0 translate-x-4 translate-y-4 transform md:translate-x-8 md:translate-y-8">
                <Image
                  width={400}
                  height={400}
                  src={imageUrl}
                  alt="Elegant curtains"
                  className="h-64 w-64 rotate-[-12deg] transform rounded-3xl border-4 border-white object-cover opacity-80 shadow-lg md:h-80 md:w-80"
                />
              </div>
              {/* Foreground image */}
              <div className="absolute top-0 left-0">
                <Image
                  width={400}
                  height={400}
                  src={imageUrl}
                  alt="Modern furnishings"
                  className="h-64 w-64 rounded-3xl border-4 border-white object-cover shadow-xl transition-transform duration-500 hover:scale-105 md:h-80 md:w-80"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
