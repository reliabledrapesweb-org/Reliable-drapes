"use client";

import { useEffect, useState } from "react";
import { ImageIcon, Loader, Award, Camera, Newspaper } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Breadcrumb, PageHero } from "@/components/shared";
import {
  YearTabs,
  SubSectionTabs,
  NewsArticleCard,
  ExhibitionCard,
} from "@/components/features/exhibitions";
import {
  getExhibitionYears,
  getExhibitionItems,
} from "@/lib/actions/exhibitions";
import type { ExhibitionYear, ExhibitionItem } from "@/lib/actions/exhibitions";

const TYPE_META: Record<string, { title: string; subtitle: string; icon: typeof Award }> = {
  exhibition: {
    title: "Exhibitions",
    subtitle: "Our presence at leading trade shows and industry events across India and the world.",
    icon: Award,
  },
  moment: {
    title: "Moments",
    subtitle: "Capturing milestones, celebrations, and behind-the-scenes highlights from our journey.",
    icon: Camera,
  },
  news: {
    title: "In the News",
    subtitle: "Media coverage and press features highlighting our brand story.",
    icon: Newspaper,
  },
};

export default function ExhibitionsEventsPage() {
  const [years, setYears] = useState<ExhibitionYear[]>([]);
  const [activeYearId, setActiveYearId] = useState<string>("");
  const [activeType, setActiveType] = useState<string>("exhibition");
  const [items, setItems] = useState<ExhibitionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const activeYear = years.find((y) => y.id === activeYearId);
  const meta = TYPE_META[activeType] ?? TYPE_META.exhibition;
  const Icon = meta.icon;

  useEffect(() => {
    getExhibitionYears().then((result) => {
      if (result.success && result.data?.length) {
        setYears(result.data);
        setActiveYearId(result.data[0].id);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!activeYearId) return;
    setLoading(true);
    getExhibitionItems(activeYearId, activeType).then((result) => {
      setItems(result.success ? (result.data ?? []) : []);
      setLoading(false);
    });
  }, [activeYearId, activeType]);

  return (
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[68px] xl:mt-[72px]">
      <PageHero
        heading="Exhibitions & Moments"
        backgroundImage="/images/heroes/exhibitions-hero.jpg"
      />
      <Breadcrumb />

      <section className="bg-gradient-to-b from-[#f8f8f8] to-white py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          {/* Controls row */}
          {years.length > 0 && (
            <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <YearTabs
                years={years}
                activeYear={activeYearId}
                onYearChange={setActiveYearId}
              />
              <SubSectionTabs
                activeType={activeType}
                onTypeChange={setActiveType}
              />
            </div>
          )}

          {/* Section header */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeYearId}-${activeType}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="mb-10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2F2582]/10">
                  <Icon className="h-5 w-5 text-[#2F2582]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                    {meta.title}
                    {activeYear && (
                      <span className="ml-2 text-[#2F2582]">{activeYear.year}</span>
                    )}
                  </h2>
                  <p className="mt-0.5 text-sm text-gray-500">{meta.subtitle}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader className="h-8 w-8 animate-spin text-[#2F2582]" />
            </div>
          ) : items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-dashed border-gray-300 bg-[#fafafa] px-6 py-24 text-center"
            >
              <ImageIcon className="mx-auto mb-4 h-14 w-14 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900">
                Nothing here yet
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                Content for this section will be published shortly. Check back soon!
              </p>
            </motion.div>
          ) : activeType === "news" ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, i) => (
                <NewsArticleCard key={item.id} item={item} index={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, i) => (
                <ExhibitionCard key={item.id} item={item} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
