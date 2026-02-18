"use client";

import { useState, useMemo, useEffect } from "react";
import { Breadcrumb, PageHero, PageHeader } from "@/components/shared";
import { StoreGrid } from "@/components/features/store-locator";
import { StoreGridSkeleton } from "@/components/features/store-locator/StoreGridSkeleton";
import { getStores, type Store } from "@/lib/actions/stores";
import { MapPin } from "lucide-react";
import { motion } from "motion/react";

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
    return stores.filter(
      (store) =>
        store.name.toLowerCase().includes(query) ||
        store.city.toLowerCase().includes(query) ||
        (store.state && store.state.toLowerCase().includes(query)) ||
        store.address.toLowerCase().includes(query) ||
        store.country.toLowerCase().includes(query),
    );
  }, [searchQuery, stores]);

  const handleLocateStore = (store: Store) => {
    // Store selection is handled within the modal in StoreGrid.
    void store;
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
            title="All Across India"
            description={
              error
                ? error
                : isLoading
                  ? "Loading stores..."
                  : `Find our stores near you - ${filteredStores.length} store${filteredStores.length !== 1 ? "s" : ""} available`
            }
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search by city, state, or store name..."
          />

          {/* India Map Section */}
          {!isLoading && !error && stores.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg"
            >
              <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
                <MapPin className="h-5 w-5 text-[#2F2582]" />
                <h3 className="font-semibold text-gray-900">
                  Our Stores Across India
                </h3>
              </div>
              <div className="relative aspect-[16/9] w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671904.7585123926!2d68!3d22!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30635ff06b92b797%3A0xd78c4751851fbb5a!2sIndia!5e0!3m2!1sen!2sin!4v1708000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Store Locations in India"
                  className="absolute inset-0"
                />
              </div>
              <div className="border-t border-gray-100 px-6 py-4">
                <p className="text-center text-sm text-gray-600">
                  Visit any of our{" "}
                  <span className="font-semibold text-[#2F2582]">
                    {stores.length} stores
                  </span>{" "}
                  across India for trade consultations and B2B sourcing support
                </p>
              </div>
            </motion.div>
          )}

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
