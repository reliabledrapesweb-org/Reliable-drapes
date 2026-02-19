"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader, ImageIcon, Sparkles } from "lucide-react";
import Image from "next/image";
import { Breadcrumb, PageHero } from "@/components/shared";
import { getExhibitions, type Exhibition } from "@/lib/actions/exhibitions";

const aspectClassCycle = [
  "aspect-[4/5]",
  "aspect-square",
  "aspect-[3/4]",
  "aspect-[5/6]",
  "aspect-[9/10]",
];

function getAspectClass(index: number) {
  return aspectClassCycle[index % aspectClassCycle.length];
}

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
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
      <PageHero heading="Exhibitions & Moments" />
      <Breadcrumb />

      <section className="relative overflow-hidden bg-gradient-to-b from-[#f8f8f8] via-white to-[#f8f8f8] py-12 md:py-16 lg:py-20">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-[#2F2582]/10 blur-3xl"
          animate={{ scale: [1, 1.08, 1], opacity: [0.22, 0.35, 0.22] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute right-[-120px] bottom-[-120px] h-80 w-80 rounded-full bg-[#b9b1ff]/30 blur-3xl"
          animate={{ scale: [1.05, 1, 1.05], opacity: [0.24, 0.4, 0.24] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="container relative z-10 mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mx-auto mb-12 max-w-3xl text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-[#2F2582]/10 px-4 py-2">
              <Sparkles className="h-4 w-4 text-[#2F2582]" />
              <span className="text-xs font-semibold tracking-[0.12em] text-[#2F2582] uppercase">
                Live Gallery
              </span>
            </div>
            <h1 className="mt-4 text-[28px] font-medium tracking-[-1.5px] text-black lg:text-[36px]">
              Exhibition Moments
            </h1>
            <p className="mt-3 text-sm text-[#575757] md:text-base">
              A visual showcase of our exhibitions and moments.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="h-8 w-8 animate-spin text-[#2F2582]" />
            </div>
          ) : galleryItems.length === 0 ? (
            <div className="rounded-2xl border border-[#d9d9d9] bg-[#fafafa] px-6 py-20 text-center">
              <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h2 className="text-lg font-semibold text-gray-900">
                No Exhibition Photos Yet
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                We will publish recent event photos here shortly.
              </p>
            </div>
          ) : (
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
              {galleryItems.map((item, index) => (
                <motion.a
                  key={item.id}
                  href={item.image_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.45, delay: index * 0.04 }}
                  whileHover={{ y: -4 }}
                  className="group relative mb-5 block break-inside-avoid overflow-hidden rounded-3xl border border-[#d2d2d2] bg-white shadow-sm"
                >
                  <div
                    className={`relative overflow-hidden bg-[#ededed] ${getAspectClass(index)}`}
                  >
                    <Image
                      src={item.image_url!}
                      alt={item.title || `Exhibition image ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="absolute right-3 bottom-3 left-3 flex items-end justify-between">
                      <div>
                        <p className="line-clamp-1 text-sm font-semibold text-white">
                          {item.title || "Exhibition Photo"}
                        </p>
                      </div>
                      <span className="rounded-full border border-white/40 bg-black/30 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white uppercase backdrop-blur">
                        View
                      </span>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
