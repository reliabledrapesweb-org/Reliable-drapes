"use client";

import { Breadcrumb, PageHero, PageHeader } from "@/components/shared";
import { ShopProductGrid, ShopFilterSidebar } from "@/components/features/shop";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  getProducts,
  getCategories,
  getProductsByCategory,
  type Product,
  type Category,
} from "@/lib/actions/products";
import { SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ShopPage() {
  const searchParams = useSearchParams();
  const urlSearchQuery = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "";

  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    urlCategory ? [urlCategory] : [],
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Count active filters for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategories.length > 0) count += selectedCategories.length;
    if (priceRange[0] > 0 || priceRange[1] < 10000) count += 1;
    if (sortBy !== "newest") count += 1;
    return count;
  }, [selectedCategories, priceRange, sortBy]);

  // Update search query and category when URL params change
  useEffect(() => {
    if (urlSearchQuery) {
      setSearchQuery(urlSearchQuery);
    }
    if (urlCategory) {
      setSelectedCategories([urlCategory]);
    }
  }, [urlSearchQuery, urlCategory]);

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const categoriesResult = await getCategories();
        if (categoriesResult.success && categoriesResult.data) {
          setCategories(categoriesResult.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }
    fetchCategories();
  }, []);

  // Fetch products based on selected categories
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      if (selectedCategories.length === 1) {
        // Fetch products for the selected category
        const result = await getProductsByCategory(selectedCategories[0]);
        if (result.success && result.data) {
          setProducts(result.data);
        } else {
          setProducts([]);
        }
      } else if (selectedCategories.length > 1) {
        // Fetch products for multiple categories and combine
        const results = await Promise.all(
          selectedCategories.map((slug) => getProductsByCategory(slug)),
        );
        const combinedProducts: Product[] = [];
        const seenIds = new Set<string>();

        results.forEach((result) => {
          if (result.success && result.data) {
            result.data.forEach((product) => {
              if (!seenIds.has(product.id)) {
                seenIds.add(product.id);
                combinedProducts.push(product);
              }
            });
          }
        });
        setProducts(combinedProducts);
      } else {
        // No category selected, fetch all products
        const result = await getProducts();
        if (result.success && result.data) {
          setProducts(result.data);
          setAllProducts(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
    setIsLoading(false);
  }, [selectedCategories]);

  // Fetch all products on mount for total count
  useEffect(() => {
    async function fetchAllProducts() {
      const result = await getProducts();
      if (result.success && result.data) {
        setAllProducts(result.data);
      }
    }
    fetchAllProducts();
  }, []);

  // Fetch products when categories change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter and sort products (client-side filtering for search and price)
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by price range
    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1],
    );

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case "popularity":
        // TODO: Add popularity sorting once we have the data
        break;
      case "newest":
      default:
        filtered = [...filtered].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
    }

    return filtered;
  }, [products, searchQuery, priceRange, sortBy]);

  return (
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
      <PageHero heading="Shop" />
      <Breadcrumb />
      <div className="w-full py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <PageHeader
            category="Shop"
            title="Premium Home Furnishings"
            description={
              isLoading
                ? "Loading..."
                : `Showing ${filteredProducts.length} of ${allProducts.length} products`
            }
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search products"
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
              <ShopFilterSidebar
                selectedCategories={selectedCategories}
                onCategoryChange={setSelectedCategories}
                categories={categories}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                sortBy={sortBy}
                onSortChange={setSortBy}
                maxPrice={10000}
              />
            </div>

            {/* Product Grid */}
            <div className="min-w-0 flex-1">
              {isLoading ? (
                <div className="grid w-full grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 lg:gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-72 animate-pulse rounded-lg bg-gray-200 sm:h-96"
                    />
                  ))}
                </div>
              ) : (
                <ShopProductGrid products={filteredProducts} />
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
                    <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                    <button
                      onClick={() => setIsFilterSheetOpen(false)}
                      className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Sheet Content */}
                  <div className="h-[calc(100%-140px)] overflow-y-auto px-6 py-6">
                    <ShopFilterSidebar
                      selectedCategories={selectedCategories}
                      onCategoryChange={setSelectedCategories}
                      categories={categories}
                      priceRange={priceRange}
                      onPriceRangeChange={setPriceRange}
                      sortBy={sortBy}
                      onSortChange={setSortBy}
                      maxPrice={10000}
                    />
                  </div>

                  {/* Sheet Footer */}
                  <div className="absolute inset-x-0 bottom-0 border-t border-gray-100 bg-white px-6 py-4">
                    <button
                      onClick={() => setIsFilterSheetOpen(false)}
                      className="w-full rounded-full bg-[#2F2582] px-6 py-3 text-sm font-semibold tracking-wide text-white transition-all hover:bg-[#241c66]"
                    >
                      Show {filteredProducts.length} Products
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
