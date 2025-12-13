"use client";

import { Breadcrumb, PageHero, PageHeader } from "@/components/shared";
import { ShopProductGrid, ShopFilterSidebar } from "@/components/features/shop";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getProducts, getCategories, type Product, type Category } from "@/lib/actions/products";

export default function ShopPage() {
  const searchParams = useSearchParams();
  const urlSearchQuery = searchParams.get("search") || "";
  
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Update search query when URL params change
  useEffect(() => {
    if (urlSearchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [urlSearchQuery]);

  // Fetch products and categories from database
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [productsResult, categoriesResult] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);

        if (productsResult.success && productsResult.data) {
          setProducts(productsResult.data);
        } else {
          console.error("Failed to fetch products:", productsResult.error);
        }

        if (categoriesResult.success && categoriesResult.data) {
          setCategories(categoriesResult.data);
        } else {
          console.error("Failed to fetch categories:", categoriesResult.error);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setIsLoading(false);
    }

    fetchData();
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by categories
    // TODO: When we have product-category associations, filter by them
    // For now, skip category filtering since we don't have the junction data
    // if (selectedCategories.length > 0) {
    //   filtered = filtered.filter((product) =>
    //     selectedCategories.some((cat) => product.categories?.includes(cat))
    //   );
    // }

    // Filter by price range
    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
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
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }

    return filtered;
  }, [products, searchQuery, selectedCategories, priceRange, sortBy]);

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
                : `Showing ${filteredProducts.length} of ${products.length} products`
            }
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search products"
          />

          {/* Content Section */}
          <div className="flex flex-col gap-8 md:gap-12 lg:flex-row lg:gap-16">
            {/* Filter Sidebar - Sticky on desktop */}
            <div className="lg:sticky lg:top-24 lg:self-start lg:w-64 lg:shrink-0">
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
                <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-10 xl:gap-12">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-96 animate-pulse rounded-lg bg-gray-200"
                    />
                  ))}
                </div>
              ) : (
                <ShopProductGrid products={filteredProducts} />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
