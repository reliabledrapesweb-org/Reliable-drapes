"use client";

import { useState, useMemo, useEffect } from "react";
import { Breadcrumb, PageHero, PageHeader } from "@/components/shared";
import { StoreGrid } from "@/components/features/store-locator";
import { StoreGridSkeleton } from "@/components/features/store-locator/StoreGridSkeleton";
import { getStores, type Store } from "@/lib/actions/stores";

export default function StoreLocatorPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stores on mount
  useEffect(() => {
    const fetchStores = async () => {
      setIsLoading(true);
      setError(null);
      
      const result = await getStores();
      
      if (result.success && result.stores) {
        setStores(result.stores);
      } else {
        setError(result.error || "Failed to load stores");
      }
      
      setIsLoading(false);
    };

    fetchStores();
  }, []);

  // Filter stores based on search query
  const filteredStores = useMemo(() => {
    if (!searchQuery) return stores;
    
    const query = searchQuery.toLowerCase();
    return stores.filter((store) =>
      store.name.toLowerCase().includes(query) ||
      store.city.toLowerCase().includes(query) ||
      (store.state && store.state.toLowerCase().includes(query)) ||
      store.address.toLowerCase().includes(query) ||
      store.country.toLowerCase().includes(query)
    );
  }, [searchQuery, stores]);

  const handleLocateStore = (store: Store) => {
    // Just pass the store, the modal will handle everything
    // No external navigation needed
  };

  return (
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
      <PageHero heading="Store Locator" />
      <Breadcrumb />
      <div className="w-full py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <PageHeader
            category="Store Locator"
            title="Find Our Stores"
            description={
              error 
                ? error
                : isLoading
                ? "Loading stores..."
                : `Find our stores near you - ${filteredStores.length} store${filteredStores.length !== 1 ? 's' : ''} available`
            }
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search by city, state, or store name..."
          />

          {/* Store Grid Section */}
          <div className="flex flex-col gap-8 md:gap-12">
            {isLoading ? (
              <StoreGridSkeleton />
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-red-600">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 rounded-lg bg-[#2f2581] px-6 py-2 text-white hover:bg-[#221a5f]"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : filteredStores.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-gray-600">
                    {searchQuery
                      ? `No stores found matching "${searchQuery}"`
                      : "No stores available at the moment"}
                  </p>
                </div>
              </div>
            ) : (
              <StoreGrid
                stores={filteredStores}
                onLocateStore={handleLocateStore}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}