"use client";

import { CategoryCard } from "./CategoryCard";
import { useEffect, useRef, useState } from "react";
import {
  getCatalogueCategories,
  type CatalogueCategory,
} from "@/lib/actions/catalogue-categories";

const fallbackCategories: Array<{ id: string; name: string; image_url: string | null }> = [
  {
    id: "1",
    name: "Curtains",
    image_url:
      "https://images.unsplash.com/photo-1651936020103-65154077c003?w=600&h=600&fit=crop",
  },
  {
    id: "2",
    name: "Upholstery",
    image_url:
      "https://images.unsplash.com/photo-1718587608491-f40ae3b13273?w=600&h=600&fit=crop",
  },
  {
    id: "3",
    name: "Sheers",
    image_url:
      "https://images.unsplash.com/photo-1759517857499-7f27b61aad5d?w=600&h=600&fit=crop",
  },
  {
    id: "4",
    name: "Bed Linens",
    image_url:
      "https://images.unsplash.com/photo-1669989657165-d9f8e6cb6366?w=600&h=600&fit=crop",
  },
];

export function CategoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string; image_url: string | null }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const result = await getCatalogueCategories();
        if (result.success && result.data && result.data.length > 0) {
          const active = result.data
            .filter((c: CatalogueCategory) => c.is_active !== false)
            .sort((a: CatalogueCategory, b: CatalogueCategory) => a.sort_order - b.sort_order)
            .map((c: CatalogueCategory) => ({
              id: c.id,
              name: c.name,
              image_url: c.image_url,
            }));
          setCategories(active.length > 0 ? active : fallbackCategories);
        } else {
          setCategories(fallbackCategories);
        }
      } catch {
        setCategories(fallbackCategories);
      }
      setIsLoading(false);
    }

    fetchCategories();
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isHovering || isLoading) return;

    let animationId: number;
    const speed = 0.6;

    const autoScroll = () => {
      if (!scrollContainer || isHovering) return;

      scrollContainer.scrollLeft += speed;

      const halfWidth = scrollContainer.scrollWidth / 2;
      if (scrollContainer.scrollLeft >= halfWidth) {
        scrollContainer.scrollLeft = 0;
      }

      animationId = requestAnimationFrame(autoScroll);
    };

    animationId = requestAnimationFrame(autoScroll);

    return () => cancelAnimationFrame(animationId);
  }, [isHovering, isLoading]);

  // Double the categories for infinite scroll effect
  const displayCategories = [...categories, ...categories];

  return (
    <section className="bg-white py-12 md:py-16 lg:py-20">
      <div>
        <div className="container mx-auto px-6">
          <h2 className="mx-auto mb-12 max-w-6xl text-[28px] font-medium tracking-[-2px] text-black lg:text-[36px]">
            Our Categories
          </h2>
        </div>

        {isLoading ? (
          <div className="flex gap-4 overflow-hidden px-6 md:px-16">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-square w-[236px] shrink-0 animate-pulse rounded-2xl bg-gray-200 md:w-[280px]"
              />
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="hide-scrollbar w-full overflow-x-auto"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onTouchStart={() => setIsHovering(true)}
            onTouchEnd={() => setIsHovering(false)}
          >
            <div className="flex w-max gap-4 px-6 pb-4 md:px-16">
              {displayCategories.map((category, index) => (
                <CategoryCard
                  key={`${category.id}-${index}`}
                  image={
                    category.image_url ||
                    "https://images.unsplash.com/photo-1651936020103-65154077c003?w=600&h=600&fit=crop"
                  }
                  title={category.name}
                  href={`/e-catalogue?category=${encodeURIComponent(category.name)}`}
                  className="w-[236px] md:w-[280px]"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
