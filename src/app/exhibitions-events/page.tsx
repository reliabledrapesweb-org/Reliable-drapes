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
    <main className="mt-14 min-h-screen bg-[#faf9f7] md:mt-16 lg:mt-[68px] xl:lg:mt-[72px]">
      <PageHero heading="Exhibitions & Moments" />
      <Breadcrumb />

      {/* Editorial intro section */}
      <section className="relative overflow-hidden">
        {/* Subtle texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative mx-auto max-w-[1440px] px-5 py-16 sm:px-8 md:py-20 lg:px-12 lg:py-24 xl:px-16">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-14 max-w-2xl md:mb-16 lg:mb-20"
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-[#2F2582]" />
              <span className="text-xs font-medium tracking-[0.2em] text-[#2F2582] uppercase">
                Gallery
              </span>
            </div>
            <h2 className="text-3xl font-medium tracking-[-0.03em] text-[#161616] md:text-4xl lg:text-[42px]">
              Moments from our
              <br className="hidden sm:block" />
              <span className="text-[#2F2582]"> exhibitions</span>
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[#575757] md:text-base">
              A curated look at our showcase events, product displays, and the
              craftsmanship behind every drape.
            </p>
          </motion.div>

          {/* Gallery */}
          {isLoading ? (
            <div className="flex items-center justify-center py-28">
              <Loader className="h-7 w-7 animate-spin text-[#2F2582]" />
            </div>
          ) : galleryItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-2xl border border-[#e8e6e1] bg-white px-8 py-24 text-center"
            >
              <ImageIcon className="mx-auto mb-4 h-10 w-10 text-[#c5c0b8]" />
              <h3 className="text-lg font-medium text-[#161616]">
                No Exhibition Photos Yet
              </h3>
              <p className="mt-2 text-sm text-[#898989]">
                We will publish recent event photos here shortly.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {galleryItems.map((item, index) => {
                const isFeature = index % 5 === 0;
                return (
                  <motion.a
                    key={item.id}
                    href={item.image_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{
                      duration: 0.5,
                      delay: (index % 6) * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={`group relative block overflow-hidden rounded-xl bg-[#ededed] ${
                      isFeature
                        ? "sm:col-span-2 lg:col-span-2 lg:row-span-2"
                        : ""
                    }`}
                  >
                    <div
                      className={`relative overflow-hidden ${
                        isFeature
                          ? "aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[520px]"
                          : "aspect-[4/5]"
                      }`}
                    >
                      <Image
                        src={item.image_url!}
                        alt={item.title || `Exhibition image ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.04]"
                        sizes={
                          isFeature
                            ? "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 66vw"
                            : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        }
                      />

                      {/* Gradient overlay */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />

                      {/* Content overlay */}
                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 sm:p-6">
                        <div className="min-w-0 flex-1">
                          <p
                            className={`line-clamp-2 font-medium text-white ${
                              isFeature
                                ? "text-lg sm:text-xl"
                                : "text-sm sm:text-base"
                            }`}
                          >
                            {item.title || "Exhibition Photo"}
                          </p>
                          {item.description && isFeature && (
                            <p className="mt-1.5 line-clamp-2 text-sm text-white/70">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <span className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-all duration-300 group-hover:border-white/50 group-hover:bg-white/20 sm:h-10 sm:w-10">
                          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
