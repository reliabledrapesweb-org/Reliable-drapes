"use client";

import { Breadcrumb, PageHero, PageHeader } from "@/components/shared";
import { ShopProductGrid, ShopFilterSidebar } from "@/components/features/shop";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { getProducts, getCategories, getProductsByCategory, type Product, type Category } from "@/lib/actions/products";

export default function ShopPage() {
  const searchParams = useSearchParams();
  const urlSearchQuery = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "";
  
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    urlCategory ? [urlCategory] : []
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          selectedCategories.map((slug) => getProductsByCategory(slug))
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
          product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

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
