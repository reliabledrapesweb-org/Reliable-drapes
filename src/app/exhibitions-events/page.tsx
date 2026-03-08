"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader, ImageIcon, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { Breadcrumb, PageHero } from "@/components/shared";
import { getExhibitions, type Exhibition } from "@/lib/actions/exhibitions";

export default function ExhibitionsEventsPage() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchExhibitions() {
      try {
        const result = await getExhibitions();
        if (result.success && result.exhibitions) {
          setExhibitions(result.exhibitions);
        }
      } catch {
        // Handle error silently
      }
      setIsLoading(false);
    }

    fetchExhibitions();
  }, []);

  const galleryItems = useMemo(
    () => exhibitions.filter((item) => Boolean(item.image_url)),
    [exhibitions],
  );

  return (
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[68px] xl:mt-[72px]">
      <PageHero
        heading="Exhibitions & Moments"
        backgroundImage="/images/heroes/exhibitions-hero.jpg"
      />
      <Breadcrumb />

      <section className="bg-gradient-to-b from-[#f8f8f8] via-white to-[#f8f8f8] py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10 max-w-2xl md:mb-14 lg:mb-16"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-[#2F2582]" />
              <span className="text-xs font-semibold tracking-[0.15em] text-[#2F2582] uppercase">
                Gallery
              </span>
            </div>
            <h2 className="text-[28px] font-medium tracking-[-0.02em] text-black md:text-[34px] lg:text-[38px]">
              Moments from our
              <span className="text-[#2F2582]"> exhibitions</span>
            </h2>
            <p className="mt-3 max-w-lg text-sm text-[#575757] md:text-base">
              A curated look at our showcase events, product displays, and the
              craftsmanship behind every drape.
            </p>
          </motion.div>

          {/* Gallery */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="h-8 w-8 animate-spin text-[#2F2582]" />
            </div>
          ) : galleryItems.length === 0 ? (
            <div className="rounded-2xl border border-[#d9d9d9] bg-[#fafafa] px-6 py-20 text-center">
              <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900">
                No Exhibition Photos Yet
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                We will publish recent event photos here shortly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {galleryItems.map((item, index) => {
                const isFeature = index % 5 === 0;
                return (
                  <motion.a
                    key={item.id}
                    href={item.image_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{
                      duration: 0.45,
                      delay: (index % 6) * 0.06,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileHover={{ y: -4 }}
                    className={`group relative block overflow-hidden rounded-2xl border border-[#d2d2d2] bg-white shadow-sm ${
                      isFeature
                        ? "sm:col-span-2 lg:col-span-2 lg:row-span-2"
                        : ""
                    }`}
                  >
                    <div
                      className={`relative overflow-hidden bg-[#ededed] ${
                        isFeature
                          ? "aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[500px]"
                          : "aspect-[9/10]"
                      }`}
                    >
                      <Image
                        src={item.image_url!}
                        alt={item.title || `Exhibition image ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes={
                          isFeature
                            ? "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 66vw"
                            : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        }
                      />

                      {/* Gradient overlay */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

                      {/* Content overlay */}
                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 sm:p-5">
                        <div className="min-w-0 flex-1">
                          <p
                            className={`line-clamp-2 font-semibold text-white ${
                              isFeature
                                ? "text-base sm:text-lg"
                                : "text-sm sm:text-base"
                            }`}
                          >
                            {item.title || "Exhibition Photo"}
                          </p>
                          {item.description && isFeature && (
                            <p className="mt-1 line-clamp-2 text-sm text-white/70">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <span className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/40 bg-black/30 text-white backdrop-blur transition-all duration-300 group-hover:bg-white/20 sm:h-9 sm:w-9">
                          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </div>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
