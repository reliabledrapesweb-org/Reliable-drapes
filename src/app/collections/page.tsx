"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Package, Calendar, Sparkles } from "lucide-react";
import { Breadcrumb, PageHero } from "@/components/shared";
import { getActiveCollections, type Collection } from "@/lib/actions/products";
import { format, isAfter, isBefore } from "date-fns";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/constants/app";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCollections() {
      setIsLoading(true);
      const result = await getActiveCollections();
      if (result.success && result.data) {
        // Filter collections that are within their date range (if specified)
        const now = new Date();
        const validCollections = result.data.filter((collection) => {
          if (
            collection.start_date &&
            isBefore(now, new Date(collection.start_date))
          ) {
            return false; // Not started yet
          }
          if (
            collection.end_date &&
            isAfter(now, new Date(collection.end_date))
          ) {
            return false; // Already ended
          }
          return true;
        });
        setCollections(validCollections);
      }
      setIsLoading(false);
    }
    fetchCollections();
  }, []);

  const fallbackImage = DEFAULT_PRODUCT_IMAGE;

  // Check if collection is limited time
  const isLimitedTime = (collection: Collection) => {
    return collection.start_date || collection.end_date;
  };

  // Get remaining days for limited time collections
  const getRemainingDays = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
      <PageHero heading="Collections" />
      <Breadcrumb />

      <section className="py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#2F2582]/10 px-4 py-1.5 text-sm font-medium text-[#2F2582]">
              <Sparkles className="h-4 w-4" />
              Curated Selections
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Our Collections
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Discover handpicked selections of premium home furnishings,
              curated to transform your living spaces.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-2xl bg-gray-200"
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && collections.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-gray-50 py-24 text-center">
              <Package className="h-16 w-16 text-gray-300" />
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                No collections available
              </h3>
              <p className="mt-2 text-gray-500">
                Check back soon for new curated collections.
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#2F2582] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#241c66]"
              >
                Browse All Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Collections Grid */}
          {!isLoading && collections.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {collections.map((collection) => {
                const remainingDays = getRemainingDays(collection.end_date);
                const limited = isLimitedTime(collection);

                return (
                  <motion.div key={collection.id} variants={itemVariants}>
                    <Link
                      href={`/collections/${collection.slug}`}
                      className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-[#2F2582]/20 hover:shadow-xl"
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        <Image
                          src={collection.image_url || fallbackImage}
                          alt={collection.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                        {/* Limited Time Badge */}
                        {limited && (
                          <div className="absolute top-4 left-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                              <Calendar className="h-3 w-3" />
                              {remainingDays !== null && remainingDays <= 7
                                ? `${remainingDays} days left`
                                : "Limited Time"}
                            </span>
                          </div>
                        )}

                        {/* Product Count Badge */}
                        {collection.product_count !== undefined &&
                          collection.product_count > 0 && (
                            <div className="absolute top-4 right-4">
                              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-900 backdrop-blur-sm">
                                {collection.product_count}{" "}
                                {collection.product_count === 1
                                  ? "item"
                                  : "items"}
                              </span>
                            </div>
                          )}

                        {/* Title overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-6">
                          <h3 className="text-xl font-bold text-white sm:text-2xl">
                            {collection.name}
                          </h3>
                          {collection.description && (
                            <p className="mt-2 line-clamp-2 text-sm text-white/80">
                              {collection.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                        <span className="text-sm font-medium text-[#2F2582]">
                          View Collection
                        </span>
                        <ArrowRight className="h-5 w-5 text-[#2F2582] transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}
