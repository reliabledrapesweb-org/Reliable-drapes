"use client";

import { Breadcrumb, PageHero, PageHeader } from "@/components/shared";
import {
  FilterSidebar,
  ProductGrid,
} from "@/components/features/catalog";
import { ProductGridSkeleton } from "@/components/features/catalog/ProductGridSkeleton";
import { useMemo, useState, useEffect } from "react";
import { getCatalogues, type Catalogue } from "@/lib/actions/catalogues";

// Transform database catalogue to product format
function transformCatalogueToProduct(catalogue: Catalogue) {
  const fallbackImage = "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center";
  
  return {
    id: catalogue.id,
    title: catalogue.title,
    subtitle: catalogue.description || catalogue.subtitle || "", // Use description first, fallback to subtitle
    imageSrc: catalogue.thumbnail_url || catalogue.image_url || fallbackImage, // Use thumbnail_url first
    pdfUrl: catalogue.file_url || catalogue.pdf_url, // Use file_url first
    badge: catalogue.badge,
    category: catalogue.category,
  };
}

export default function CataloguePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch catalogues from database
  useEffect(() => {
    async function fetchCatalogues() {
      setIsLoading(true);
      try {
        const result = await getCatalogues();
        if (result.success && result.data) {
          setCatalogues(result.data);
        } else {
          console.error("Failed to fetch catalogues:", result.error);
          setCatalogues([]); // Set empty array instead of mock data
        }
      } catch (error) {
        console.error("Network error fetching catalogues:", error);
        setCatalogues([]); // Set empty array instead of mock data
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
            description={isLoading ? "Loading..." : `Showing ${filteredProducts.length} of ${products.length} products`}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search"
          />

          {/* Content Section */}
          <div className="flex flex-col gap-8 md:gap-12 lg:flex-row lg:gap-16">
            {/* Filter Sidebar - Sticky on desktop */}
            <div className="lg:sticky lg:top-24 lg:self-start lg:w-64 lg:shrink-0">
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
        </div>
      </div>
    </main>
  );
}
