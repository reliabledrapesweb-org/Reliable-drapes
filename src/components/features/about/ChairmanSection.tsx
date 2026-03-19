"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { AboutSection } from "@/lib/actions/about-sections";

type Props = {
  section?: AboutSection;
};

export function ChairmanSection({ section }: Props) {
  if (!section) return null;

  const contentJson = (section.content_json as Record<string, string>) || {};
  const title = section.title;
  const subtitle = section.subtitle;
  const content = section.content;
  const role = contentJson.role;
  const quote = contentJson.quote;
  const contentHeading = contentJson.content_heading;
  const imageUrl = section.image_url_2 || section.image_url;

  return (
    <section className="overflow-hidden bg-gray-50 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
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
              {imageUrl && (
                <div className="absolute inset-0 h-72 w-72 md:h-80 md:w-80 lg:h-96 lg:w-96">
                  <Image
                    width={400}
                    height={400}
                    src={imageUrl}
                    alt={subtitle ?? title}
                    className="h-full w-full -translate-x-2 translate-y-2 transform rounded-3xl border-4 border-white object-cover shadow-lg transition-transform duration-500 group-hover:translate-x-0 group-hover:translate-y-0"
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            className="max-w-2xl flex-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="mb-8 text-2xl font-semibold text-black lg:text-3xl">
              {title}
            </h2>

            {(subtitle || imageUrl) && (
              <div className="mb-8 flex w-fit items-center gap-5 rounded-2xl bg-white p-4">
                {imageUrl && (
                  <Image
                    width={60}
                    height={60}
                    src={imageUrl}
                    alt={subtitle ?? title}
                    className="h-14 w-14 rounded-full border-2 border-white object-cover shadow-md"
                  />
                )}
                {(subtitle || role) && (
                  <div>
                    {subtitle && (
                      <h3 className="text-xl font-semibold text-black">
                        {subtitle}
                      </h3>
                    )}
                    {role && (
                      <p className="text-sm font-medium text-[#575757] md:text-[18px]">
                        {role}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-6 text-lg leading-relaxed text-[#575757]">
              {content && (
                <div>
                  {contentHeading && (
                    <h4 className="mb-2 font-semibold">{contentHeading}</h4>
                  )}
                  <p>{content}</p>
                </div>
              )}

              {quote && (
                <p className="border-l-4 border-[#2F2582] pl-4 text-gray-600 italic">
                  &ldquo;{quote}&rdquo;
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
