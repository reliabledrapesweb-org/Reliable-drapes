"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Package,
  Grid3X3,
  LayoutGrid,
  SlidersHorizontal,
} from "lucide-react";
import { Breadcrumb } from "@/components/shared";
import { ShopProductGrid } from "@/components/features/shop";
import {
  getActiveCollections,
  getCollectionProducts,
  type Collection,
  type Product,
} from "@/lib/actions/products";
import { format, isAfter } from "date-fns";

export default function CollectionDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch collection details
        const collectionsResult = await getActiveCollections();
        if (collectionsResult.success && collectionsResult.data) {
          const found = collectionsResult.data.find((c) => c.slug === slug);
          if (found) {
            setCollection(found);
          } else {
            setError("Collection not found");
            setIsLoading(false);
            return;
          }
        }

        // Fetch products in collection
        const productsResult = await getCollectionProducts(slug);
        if (productsResult.success && productsResult.data) {
          setProducts(productsResult.data);
        }
      } catch (err) {
        console.error("Error fetching collection:", err);
        setError("Failed to load collection");
      }

      setIsLoading(false);
    }

    if (slug) {
      fetchData();
    }
  }, [slug]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "newest":
        return sorted.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "featured":
      default:
        return sorted; // Keep original order (featured_order from DB)
    }
  }, [products, sortBy]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const fallbackBanner =
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&h=400&fit=crop";

  // Check if collection is ending soon
  const isEndingSoon = collection?.end_date
    ? (() => {
        const end = new Date(collection.end_date);
        const now = new Date();
        const diffDays = Math.ceil(
          (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        return diffDays <= 7 && diffDays > 0;
      })()
    : false;

  // Loading skeleton
  if (isLoading) {
    return (
      <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
        {/* Banner skeleton */}
        <div className="relative h-64 animate-pulse bg-gray-200 sm:h-80 lg:h-96" />
        <Breadcrumb />
        <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-lg bg-gray-200"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !collection) {
    return (
      <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
        <Breadcrumb />
        <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
          <Package className="h-16 w-16 text-gray-300" />
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            {error || "Collection not found"}
          </h2>
          <p className="mt-2 text-gray-500">
            The collection you&apos;re looking for doesn&apos;t exist or has
            been removed.
          </p>
          <Link
            href="/collections"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#2F2582] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#241c66]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Collections
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
      {/* Hero Banner */}
      <div className="relative h-64 overflow-hidden sm:h-80 lg:h-96">
        <Image
          src={collection.banner_url || collection.image_url || fallbackBanner}
          alt={collection.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="mx-auto w-full max-w-[1440px] px-4 pb-8 sm:px-6 sm:pb-12 lg:px-8">
            {/* Badges */}
            <div className="mb-4 flex flex-wrap gap-2">
              {isEndingSoon && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                  <Calendar className="h-3 w-3" />
                  Ending Soon
                </span>
              )}
              {collection.end_date && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  Until {format(new Date(collection.end_date), "MMM d, yyyy")}
                </span>
              )}
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
            >
              {collection.name}
            </motion.h1>

            {collection.description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-3 max-w-2xl text-base text-white/80 sm:text-lg"
              >
                {collection.description}
              </motion.p>
            )}
          </div>
        </div>
      </div>

      <Breadcrumb />

      {/* Products Section */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          {/* Toolbar */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/collections"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-[#2F2582]"
              >
                <ArrowLeft className="h-4 w-4" />
                All Collections
              </Link>
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm text-gray-600">
                {products.length}{" "}
                {products.length === 1 ? "product" : "products"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>
              </div>

              {/* View toggle */}
              <div className="hidden items-center gap-1 rounded-lg border border-gray-200 p-1 sm:flex">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-md p-1.5 transition-colors ${
                    viewMode === "grid"
                      ? "bg-[#2F2582] text-white"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("compact")}
                  className={`rounded-md p-1.5 transition-colors ${
                    viewMode === "compact"
                      ? "bg-[#2F2582] text-white"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title="Compact view"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Empty state */}
          {products.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 py-16 text-center">
              <Package className="h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No products in this collection
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Products will appear here once they&apos;re added to this
                collection.
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#2F2582] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#241c66]"
              >
                Browse All Products
              </Link>
            </div>
          )}

          {/* Products Grid */}
          {products.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <ShopProductGrid products={sortedProducts} />
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}
