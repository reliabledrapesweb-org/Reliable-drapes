"use client";

import { Breadcrumb } from "@/components/Breadcrumb";
import { FilterSidebar } from "@/components/eCatalogueComponents/FilterSidebar";
import { ProductGrid } from "@/components/eCatalogueComponents/ProductGrid";
import { SearchBar } from "@/components/SearchBar";
import { AboutHero } from "@/components/aboutpageComponents/AboutHero";

export default function App() {
  return (
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
      <AboutHero />
      <Breadcrumb />
      <div className="w-full py-12">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="mb-8 flex flex-row justify-between">
            <div className="mb-6 flex flex-col gap-2">
              <p className="text-[14px] tracking-[8px] text-[#575757] uppercase">
                E- catalogue
              </p>
              <h1 className="text-[32px] text-[#161616]">
                All About Catalogue
              </h1>
            </div>

            <SearchBar />
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
            <FilterSidebar />

            <div className="flex-1">
              <ProductGrid />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
