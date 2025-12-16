"use client";

import { CategoryCard } from "./CategoryCard";
import { useEffect, useRef, useState } from "react";
import { getFeaturedCategories, type CategoryFull } from "@/lib/actions/products";

// Fallback categories when no data from database
const fallbackCategories = [
  {
    id: "1",
    name: "Curtains",
    slug: "curtains",
    image_url: "https://images.unsplash.com/photo-1651936020103-65154077c003?w=600&h=600&fit=crop",
  },
  {
    id: "2",
    name: "Upholstery",
    slug: "upholstery",
    image_url: "https://images.unsplash.com/photo-1718587608491-f40ae3b13273?w=600&h=600&fit=crop",
  },
  {
    id: "3",
    name: "Sheers",
    slug: "sheers",
    image_url: "https://images.unsplash.com/photo-1759517857499-7f27b61aad5d?w=600&h=600&fit=crop",
  },
  {
    id: "4",
    name: "Bed Sheets",
    slug: "bed-sheets",
    image_url: "https://images.unsplash.com/photo-1669989657165-d9f8e6cb6366?w=600&h=600&fit=crop",
  },
];

export function CategoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [categories, setCategories] = useState<CategoryFull[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories from database
  useEffect(() => {
    async function fetchCategories() {
      try {
        const result = await getFeaturedCategories();
        if (result.success && result.data && result.data.length > 0) {
          setCategories(result.data);
        } else {
          // Use fallback if no categories in database
          setCategories(fallbackCategories as CategoryFull[]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories(fallbackCategories as CategoryFull[]);
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

      // infinite loop effect
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
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div>
        <h2 className="px-6 md:px-16 max-w-6xl mx-auto text-[28px] font-medium lg:text-[36px] tracking-[-2px] mb-12 text-black">
          Our Categories
        </h2>

        {isLoading ? (
          <div className="flex gap-4 px-6 md:px-16 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-[236px] md:w-[280px] aspect-square rounded-2xl bg-gray-200 animate-pulse shrink-0"
              />
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="overflow-x-auto w-full hide-scrollbar"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onTouchStart={() => setIsHovering(true)}
            onTouchEnd={() => setIsHovering(false)}
          >
            <div className="flex gap-4 w-max pb-4 px-6 md:px-16">
              {displayCategories.map((category, index) => (
                <CategoryCard
                  key={`${category.id}-${index}`}
                  image={category.image_url || "https://images.unsplash.com/photo-1651936020103-65154077c003?w=600&h=600&fit=crop"}
                  title={category.name}
                  slug={category.slug}
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
