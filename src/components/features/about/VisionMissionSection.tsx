"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { AboutSection } from "@/lib/actions/about-sections";

interface VisionMissionSectionProps {
  section?: AboutSection;
}

export function VisionMissionSection({ section }: VisionMissionSectionProps) {
  if (!section) return null;

  const contentJson = (section.content_json as Record<string, unknown>) || {};
  const title = section.title;
  const content = section.content;
  const missionContent =
    (typeof contentJson.mission_content === "string"
      ? contentJson.mission_content
      : null) ||
    (typeof contentJson.mission === "string" ? contentJson.mission : null);
  const imageUrl = section.image_url;
  const missionImageUrl = section.image_url_2 || imageUrl;
  const iconUrl = "/images/target.png";

  return (
    <section className="overflow-hidden bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="mb-16 flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Image
            src={iconUrl}
            alt=""
            width={200}
            height={200}
            className="h-12 w-12 text-black md:h-14 md:w-14"
          />
          <h2 className="text-2xl font-semibold tracking-tight text-black lg:text-[32px]">
            {title}
          </h2>
        </motion.div>

        {/* Content */}
        <div className="space-y-20 lg:space-y-32">
          {/* Vision */}
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
                {imageUrl && (
                  <div className="absolute inset-0 h-72 w-72 md:h-80 md:w-80 lg:h-96 lg:w-96">
                    <Image
                      width={400}
                      height={400}
                      src={imageUrl}
                      alt="Vision"
                      className="h-full w-full translate-x-4 translate-y-4 transform rounded-3xl border-4 border-white object-cover shadow-lg transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2"
                    />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              className="max-w-2xl flex-1"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {content && (
                <div className="space-y-6 text-lg leading-relaxed text-[#575757]">
                  <p>{content}</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Mission */}
          <div className="flex flex-col items-center gap-12 lg:flex-row-reverse lg:gap-20">
            {/* Image */}
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="group relative">
                <div className="h-72 w-72 rotate-[6deg] transform rounded-3xl bg-gray-100 shadow-xl transition-transform duration-500 group-hover:rotate-[3deg] md:h-80 md:w-80 lg:h-96 lg:w-96" />
                {missionImageUrl && (
                  <div className="absolute inset-0 h-72 w-72 md:h-80 md:w-80 lg:h-96 lg:w-96">
                    <Image
                      width={400}
                      height={400}
                      src={missionImageUrl}
                      alt="Mission"
                      className="h-full w-full -translate-x-4 translate-y-4 transform rounded-3xl border-4 border-white object-cover shadow-lg transition-transform duration-500 group-hover:-translate-x-2 group-hover:translate-y-2"
                    />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              className="max-w-2xl flex-1"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {missionContent && (
                <div className="space-y-6 text-lg leading-relaxed text-[#575757]">
                  <p>{missionContent}</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
