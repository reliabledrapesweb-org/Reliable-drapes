"use client";

import { Breadcrumb, PageHero, PageHeader } from "@/components/shared";
import { FilterSidebar, ProductGrid } from "@/components/features/catalog";
import { ProductGridSkeleton } from "@/components/features/catalog/ProductGridSkeleton";
import { useMemo, useState, useEffect } from "react";
import { getCatalogues, type Catalogue } from "@/lib/actions/catalogues";
import { motion, AnimatePresence } from "motion/react";
import { SlidersHorizontal, X, Check } from "lucide-react";

// Transform database catalogue to product format
function transformCatalogueToProduct(catalogue: Catalogue) {
  const fallbackImage =
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center";

  // Debug: Log the catalogue data to see what image URLs we're getting
  console.log("Catalogue data:", {
    id: catalogue.id,
    title: catalogue.title,
    thumbnail_url: catalogue.thumbnail_url,
    image_url: catalogue.image_url,
  });

  // Use thumbnail_url first, then image_url, then fallback
  const imageUrl =
    catalogue.thumbnail_url || catalogue.image_url || fallbackImage;

  return {
    id: catalogue.id,
    title: catalogue.title,
    subtitle: catalogue.description || catalogue.subtitle || "",
    imageSrc: imageUrl,
    pdfUrl: catalogue.file_url || catalogue.pdf_url,
    badge: catalogue.badge,
    category: catalogue.category,
  };
}

export default function CataloguePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Fetch catalogues from database
  useEffect(() => {
    async function fetchCatalogues() {
      setIsLoading(true);
      try {
        const result = await getCatalogues();
        console.log("Catalogues API response:", result);
        if (result.success && result.data) {
          setCatalogues(result.data);
        } else {
          console.error("Failed to fetch catalogues:", result.error);
          setCatalogues([]);
        }
      } catch (error) {
        console.error("Network error fetching catalogues:", error);
        setCatalogues([]);
      }
      setIsLoading(false);
    }

    fetchCatalogues();
  }, []);

  // Transform catalogues to products
  const products = useMemo(() => {
    return catalogues.map(transformCatalogueToProduct);
  }, [catalogues]);

  // Get unique categories from products
  const availableCategories = useMemo(() => {
    const categories = products.map((p) => p.category);
    return Array.from(new Set(categories)).sort();
  }, [products]);

  // Filter products based on search and selected filters
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filter by search query
      const matchesSearch =
        searchQuery === "" ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by selected categories
      const matchesFilter =
        selectedFilters.length === 0 ||
        selectedFilters.includes(product.category);

      return matchesSearch && matchesFilter;
    });
  }, [products, searchQuery, selectedFilters]);

  const toggleFilter = (category: string) => {
    if (selectedFilters.includes(category)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== category));
    } else {
      setSelectedFilters([...selectedFilters, category]);
    }
  };

  const activeFilterCount = selectedFilters.length;

  return (
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
      <PageHero heading="E-catalogue" />
      <Breadcrumb />
      <div className="w-full py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <PageHeader
            category="E-catalogue"
            title="All About Catalogue"
            description={
              isLoading
                ? "Loading..."
                : `Showing ${filteredProducts.length} of ${products.length} products`
            }
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search"
          />

          {/* Content Section */}
          <div className="flex flex-col gap-8 md:gap-12 lg:flex-row lg:gap-16">
            {/* Mobile Filter Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#2F2582] bg-white px-6 py-3 text-sm font-semibold text-[#2F2582] transition-all hover:bg-[#2F2582] hover:text-white"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2F2582] text-xs text-white group-hover:bg-white group-hover:text-[#2F2582]">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Filter Sidebar - Hidden on mobile, visible on desktop */}
            <div className="hidden lg:sticky lg:top-24 lg:block lg:w-64 lg:shrink-0 lg:self-start">
              <FilterSidebar
                selectedFilters={selectedFilters}
                onFilterChange={setSelectedFilters}
                availableCategories={availableCategories}
              />
            </div>

            {/* Product Grid */}
            <div className="min-w-0 flex-1">
              {isLoading ? (
                <ProductGridSkeleton />
              ) : (
                <ProductGrid filteredProducts={filteredProducts} />
              )}
            </div>
          </div>

          {/* Mobile Filter Sheet - Slide from right like shop page */}
          <AnimatePresence>
            {isFilterSheetOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="fixed inset-0 z-50 bg-black/50 lg:hidden"
                />

                {/* Sheet - slides from right */}
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl lg:hidden"
                >
                  {/* Sheet Header */}
                  <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Filters
                      </h2>
                      {activeFilterCount > 0 && (
                        <p className="text-sm text-gray-500">
                          {activeFilterCount} filter
                          {activeFilterCount > 1 ? "s" : ""} applied
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setIsFilterSheetOpen(false)}
                      className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Sheet Content */}
                  <div className="h-[calc(100%-140px)] overflow-y-auto px-6 py-6">
                    {/* Category Filters */}
                    <div className="space-y-2">
                      <h3 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase">
                        Categories
                      </h3>
                      {availableCategories.length > 0 ? (
                        availableCategories.map((category) => {
                          const isChecked = selectedFilters.includes(category);
                          return (
                            <button
                              key={category}
                              type="button"
                              onClick={() => toggleFilter(category)}
                              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-all ${
                                isChecked
                                  ? "bg-[#2f2582] text-white"
                                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              <span className="font-medium">{category}</span>
                              {isChecked && <Check className="h-5 w-5" />}
                            </button>
                          );
                        })
                      ) : (
                        <p className="py-4 text-center text-sm text-gray-500">
                          No categories available
                        </p>
                      )}
                    </div>

                    {/* Reset Filters */}
                    {activeFilterCount > 0 && (
                      <button
                        onClick={() => setSelectedFilters([])}
                        className="mt-6 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>

                  {/* Sheet Footer */}
                  <div className="absolute inset-x-0 bottom-0 border-t border-gray-100 bg-white px-6 py-4">
                    <button
                      onClick={() => setIsFilterSheetOpen(false)}
                      className="w-full rounded-full bg-[#2F2582] px-6 py-3 text-sm font-semibold tracking-wide text-white transition-all hover:bg-[#241c66]"
                    >
                      Show {filteredProducts.length} Results
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
