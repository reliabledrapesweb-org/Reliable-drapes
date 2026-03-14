"use client";

import { useState, useEffect } from "react";
import { Breadcrumb, PageHero } from "@/components/shared";
import {
  StoreGrid,
  StoreGridSkeleton,
  StateFilterModal,
} from "@/components/features/store-locator";
import { getStores } from "@/lib/actions/stores";
import type { Store } from "@/lib/actions/stores";
import { STORES_PER_PAGE } from "@/lib/constants/app";
import { MapPin, SlidersHorizontal } from "lucide-react";
import { motion } from "motion/react";

export default function StoreLocatorPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(STORES_PER_PAGE);

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

  const uniqueStates = [
    ...new Set(stores.map((s) => s.state).filter(Boolean)),
  ].sort() as string[];

  const filtered =
    selectedStates.length === 0
      ? stores
      : stores.filter((s) => s.state && selectedStates.includes(s.state));

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  const handleApplyFilter = (states: string[]) => {
    setSelectedStates(states);
    setVisibleCount(STORES_PER_PAGE);
  };

  return (
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
      <PageHero
        heading="Store Locator"
        backgroundImage="/images/heroes/store-locator-hero.jpg"
      />
      <Breadcrumb />
      <div className="w-full py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-widest text-[#2F2582] uppercase">
                Store Locator
              </p>
              <h1 className="mt-1 text-3xl font-bold text-gray-900 md:text-4xl">
                All Across India
              </h1>
              {!isLoading && !error && (
                <p className="mt-2 text-sm text-gray-500">
                  {selectedStates.length > 0
                    ? `${filtered.length} store${filtered.length !== 1 ? "s" : ""} in ${selectedStates.length} state${selectedStates.length !== 1 ? "s" : ""}`
                    : `${stores.length} store${stores.length !== 1 ? "s" : ""} across India`}
                </p>
              )}
            </div>
            {!isLoading && !error && uniqueStates.length > 0 && (
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filter by States
                {selectedStates.length > 0 && (
                  <span className="ml-1 rounded-full bg-[#2F2582] px-2 py-0.5 text-xs text-white">
                    {selectedStates.length}
                  </span>
                )}
              </button>
            )}
          </div>

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
              <div className="relative aspect-[21/9] w-full">
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
            ) : (
              <>
                <StoreGrid stores={visible} />
                {hasMore && (
                  <div className="flex justify-center">
                    <button
                      onClick={() =>
                        setVisibleCount((c) => c + STORES_PER_PAGE)
                      }
                      className="rounded-lg border border-gray-200 bg-white px-8 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <StateFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        states={uniqueStates}
        selectedStates={selectedStates}
        onApply={handleApplyFilter}
      />
    </main>
  );
}
