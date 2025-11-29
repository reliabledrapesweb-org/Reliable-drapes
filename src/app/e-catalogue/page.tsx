"use client";

import { Breadcrumb } from "@/components/Breadcrumb";
import { FilterSidebar } from "@/components/eCatalogueComponents/FilterSidebar";
import {
  ProductGrid,
  products,
} from "@/components/eCatalogueComponents/ProductGrid";
import { SearchBar } from "@/components/SearchBar";
import { PageHero } from "@/components/PageHero";
import { useMemo, useState } from "react";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Get unique categories from products
  const availableCategories = useMemo(() => {
    const categories = products.map((p) => p.category);
    return Array.from(new Set(categories)).sort();
  }, []);

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
  }, [searchQuery, selectedFilters]);

  return (
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
      <PageHero heading="E-catalogue" />
      <Breadcrumb />
      <div className="w-full py-8 md:py-12 lg:py-16">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8 md:mb-10 lg:mb-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-3">
                <p className="text-[12px] font-medium tracking-[6px] text-[#575757] uppercase md:text-[14px] md:tracking-[8px]">
                  E-catalogue
                </p>
                <h1 className="text-[28px] leading-tight font-medium text-[#161616] md:text-[32px] lg:text-[36px]">
                  All About Catalogue
                </h1>
                <p className="mt-1 text-sm text-[#898989] md:text-base">
                  Showing {filteredProducts.length} of {products.length}{" "}
                  products
                </p>
              </div>

              <div className="w-full lg:w-auto lg:min-w-[420px]">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex flex-col gap-6 md:gap-8 lg:flex-row lg:gap-10 xl:gap-12">
            {/* Filter Sidebar - Sticky on desktop */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <FilterSidebar
                selectedFilters={selectedFilters}
                onFilterChange={setSelectedFilters}
                availableCategories={availableCategories}
              />
            </div>

            {/* Product Grid */}
            <div className="min-w-0 flex-1">
              <ProductGrid filteredProducts={filteredProducts} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
