"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { AboutSection } from "@/lib/actions/about-sections";

interface FounderSectionProps {
  section?: AboutSection;
}

export function FounderSection({ section }: FounderSectionProps) {
  // Default content as fallback
  const defaults = {
    title: "Our Founder",
    subtitle: "Mr. Sumit Narang",
    content:
      "Our founder envisioned a home furnishings brand that combines elegance, quality, and innovation. With a deep passion for design and decades of experience in textiles, they built Reliable Drapes on the principles of craftsmanship, creativity, and timeless style.",
    role: "Founder & CEO",
    quote:
      "To inspire every home with beautiful, functional, and personalized furnishings that bring comfort, elegance, and a sense of individuality to living spaces.",
    image_url: "/images/founderPic.png",
  };

  // Use CMS data if available, otherwise use defaults
  const contentJson = (section?.content_json as Record<string, string>) || {};
  const title = section?.title || defaults.title;
  const subtitle = section?.subtitle || defaults.subtitle;
  const content = section?.content || defaults.content;
  const role = contentJson.role || defaults.role;
  const quote = contentJson.quote || defaults.quote;
  const imageUrl = section?.image_url || defaults.image_url;

  return (
    <section className="overflow-hidden bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
          {/* Image */}
          <motion.div
            className="flex-shrink-0"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="group relative">
              <div className="h-72 w-72 rotate-[-6deg] transform rounded-3xl bg-gray-100 shadow-xl transition-transform duration-500 group-hover:rotate-[-3deg] md:h-80 md:w-80 lg:h-96 lg:w-96" />
              <div className="absolute inset-0 h-72 w-72 md:h-80 md:w-80 lg:h-96 lg:w-96">
                <Image
                  width={400}
                  height={400}
                  src={imageUrl}
                  alt="Founder portrait"
                  className="h-full w-full translate-x-2 translate-y-2 transform rounded-3xl border-4 border-white object-cover shadow-lg transition-transform duration-500 group-hover:translate-x-0 group-hover:translate-y-0"
                />
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            className="max-w-2xl flex-1"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="mb-8 text-2xl font-semibold text-black lg:text-3xl">
              {title}
            </h2>

            {/* Founder Info */}
            <div className="mb-8 flex w-fit items-center gap-5 rounded-2xl bg-gray-50 p-4">
              <Image
                width={60}
                height={60}
                src={imageUrl}
                alt={subtitle}
                className="h-14 w-14 rounded-full border-2 border-white object-cover shadow-md"
              />
              <div>
                <h3 className="text-xl font-semibold text-black">{subtitle}</h3>
                <p className="text-sm font-medium text-[#575757] md:text-[18px]">
                  {role}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-6 text-lg leading-relaxed text-[#575757]">
              <div>
                <h4 className="mb-2 font-semibold">
                  His Vision Behind Reliable Drapes
                </h4>
                <p>{content}</p>
              </div>

              <p className="border-l-4 border-[#2F2582] pl-4 text-gray-600 italic">
                &ldquo;{quote}&rdquo;
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
