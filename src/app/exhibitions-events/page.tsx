"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ImageIcon, Loader } from "lucide-react";
import { Breadcrumb, PageHero } from "@/components/shared";
import {
  YearTabs,
  SubSectionTabs,
  NewsArticleCard,
} from "@/components/features/exhibitions";
import {
  getExhibitionYears,
  getExhibitionItems,
} from "@/lib/actions/exhibitions";
import type { ExhibitionYear, ExhibitionItem } from "@/lib/actions/exhibitions";

export default function ExhibitionsEventsPage() {
  const [years, setYears] = useState<ExhibitionYear[]>([]);
  const [activeYearId, setActiveYearId] = useState<string>("");
  const [activeType, setActiveType] = useState<string>("exhibition");
  const [items, setItems] = useState<ExhibitionItem[]>([]);
  const [loading, setLoading] = useState(true);

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

      <section className="bg-gradient-to-b from-[#f8f8f8] via-white to-[#f8f8f8] py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {years.length > 0 && (
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="h-8 w-8 animate-spin text-[#2F2582]" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-[#d9d9d9] bg-[#fafafa] px-6 py-20 text-center">
              <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900">
                Nothing here yet
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Content for this section will be published shortly.
              </p>
            </div>
          ) : activeType === "news" ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <NewsArticleCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {item.image_url && (
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-gray-900">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
