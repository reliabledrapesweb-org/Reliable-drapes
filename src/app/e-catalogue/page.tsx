"use client";

import { Breadcrumb, PageHero, PageHeader } from "@/components/shared";
import {
  CatalogFilterSidebar,
  ProductGrid,
} from "@/components/features/catalog";
import { ProductGridSkeleton } from "@/components/features/catalog/ProductGridSkeleton";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getCatalogues, type Catalogue } from "@/lib/actions/catalogues";
import {
  getCatalogueCategories,
  type CatalogueCategory,
} from "@/lib/actions/catalogue-categories";
import { motion, AnimatePresence } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";
import { DEFAULT_CATALOG_IMAGE } from "@/lib/constants/app";

// Collect all descendant category names for a given category name
function getDescendantCategoryNames(
  categoryName: string,
  allCategories: CatalogueCategory[],
): string[] {
  const category = allCategories.find((c) => c.name === categoryName);
  if (!category) return [categoryName];

  const names = [categoryName];
  const collectChildren = (parentId: string) => {
    for (const cat of allCategories) {
      if (cat.parent_id === parentId) {
        names.push(cat.name);
        collectChildren(cat.id);
      }
    }
  };
  collectChildren(category.id);
  return names;
}

// Transform database catalogue to product format
function transformCatalogueToProduct(catalogue: Catalogue) {
  const fallbackImage = DEFAULT_CATALOG_IMAGE;

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
    category: catalogue.category?.name || "Uncategorized",
    category_id: catalogue.category_id,
  };
}

export default function CataloguePage() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category") || "";
  const openCatalogueId = searchParams.get("open") || null;
  const urlSearch = searchParams.get("search") || "";

  const parseCategoriesFromUrl = (value: string): string[] =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(
    parseCategoriesFromUrl(urlCategory),
  );
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [categories, setCategories] = useState<CatalogueCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Fetch catalogues and categories from database
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [cataloguesResult, categoriesResult] = await Promise.all([
          getCatalogues(),
          getCatalogueCategories(),
        ]);

        if (cataloguesResult.success && cataloguesResult.data) {
          setCatalogues(cataloguesResult.data);
        } else {
          setCatalogues([]);
        }

        if (categoriesResult.success && categoriesResult.data) {
          setCategories(categoriesResult.data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        setCatalogues([]);
        setCategories([]);
      }
      setIsLoading(false);
    }

    fetchData();
  }, []);

  useEffect(() => {
    setSelectedFilters(parseCategoriesFromUrl(urlCategory));
  }, [urlCategory]);

  // Transform catalogues to products
  const products = useMemo(() => {
    return catalogues.map(transformCatalogueToProduct);
  }, [catalogues]);

  // Get unique categories from the categories table (not from products)
  // Treat null is_active as active (default behavior)
  const availableCategories = useMemo(() => {
    return categories
      .filter((c) => c.is_active !== false)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [categories]);

  // Expand selected filters to include all descendant category names
  const expandedFilterNames = useMemo(() => {
    const names = new Set<string>();
    for (const filter of selectedFilters) {
      for (const name of getDescendantCategoryNames(filter, categories)) {
        names.add(name);
      }
    }
    return names;
  }, [selectedFilters, categories]);

  // Filter products based on search and selected filters
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filter by search query
      const matchesSearch =
        searchQuery === "" ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by selected categories (including subcategories)
      const matchesFilter =
        selectedFilters.length === 0 ||
        expandedFilterNames.has(product.category);

      return matchesSearch && matchesFilter;
    });
  }, [products, searchQuery, selectedFilters, expandedFilterNames]);

  const toggleFilter = (categoryName: string) => {
    if (selectedFilters.includes(categoryName)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== categoryName));
    } else {
      setSelectedFilters([...selectedFilters, categoryName]);
    }
  };

  const clearFilters = () => {
    setSelectedFilters([]);
  };

  const activeFilterCount = selectedFilters.length;

  return (
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
      <PageHero
        heading="E-catalogue"
        backgroundImage="/images/heroes/e-catalogue-hero.jpg"
      />
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

            {/* Filter Sidebar - Desktop only */}
            <div className="hidden lg:sticky lg:top-24 lg:block lg:w-64 lg:shrink-0 lg:self-start">
              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 w-full animate-pulse rounded bg-gray-100"
                    />
                  ))}
                </div>
              ) : (
                <CatalogFilterSidebar
                  categories={availableCategories}
                  selectedFilters={selectedFilters}
                  onToggleFilter={toggleFilter}
                  onClearFilters={clearFilters}
                />
              )}
            </div>

            {/* Product Grid */}
            <div className="min-w-0 flex-1">
              {isLoading ? (
                <ProductGridSkeleton />
              ) : (
                <ProductGrid filteredProducts={filteredProducts} openCatalogueId={openCatalogueId} />
              )}
            </div>
          </div>

          {/* Mobile Filter Sheet */}
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

                {/* Sheet */}
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
                    {isLoading ? (
                      <div className="space-y-4">
                        <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="h-10 w-full animate-pulse rounded bg-gray-100"
                          />
                        ))}
                      </div>
                    ) : (
                      <CatalogFilterSidebar
                        categories={availableCategories}
                        selectedFilters={selectedFilters}
                        onToggleFilter={toggleFilter}
                        onClearFilters={clearFilters}
                      />
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
