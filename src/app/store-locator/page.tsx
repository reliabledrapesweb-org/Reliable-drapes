"use client";

import { useState, useMemo } from "react";
import { Breadcrumb, PageHero, PageHeader } from "@/components/shared";
import { StoreGrid } from "@/components/features/store-locator";

// Mock store data
const mockStores = [
  {
    id: "1",
    name: "Reliable Drapes, Panipat Store",
    address: "Plot no 140-141 sector 25 part-1 huda panipat-132103 (Haryana)",
    phone: "+91 70156 80991",
    city: "Panipat",
    state: "Haryana",
  },
  {
    id: "2",
    name: "Reliable Drapes, Delhi Store",
    address: "Plot no 140-141 sector 25 part-1 huda panipat-132103 (Haryana)",
    phone: "+91 70156 80991",
    city: "Delhi",
    state: "Delhi",
  },
  {
    id: "3",
    name: "Reliable Drapes, Delhi Store",
    address: "Plot no 140-141 sector 25 part-1 huda panipat-132103 (Haryana)",
    phone: "+91 70156 80991",
    city: "Delhi",
    state: "Delhi",
  },
  {
    id: "4",
    name: "Reliable Drapes, Delhi Store",
    address: "Plot no 140-141 sector 25 part-1 huda panipat-132103 (Haryana)",
    phone: "+91 70156 80991",
    city: "Delhi",
    state: "Delhi",
  },
  {
    id: "5",
    name: "Reliable Drapes, Mumbai Store",
    address: "Shop no 45-46, Ground Floor, Phoenix Mills Compound, Lower Parel, Mumbai-400013 (Maharashtra)",
    phone: "+91 22 4567 8901",
    city: "Mumbai",
    state: "Maharashtra",
  },
  {
    id: "6",
    name: "Reliable Drapes, Bangalore Store",
    address: "No. 123, Brigade Road, Bangalore-560001 (Karnataka)",
    phone: "+91 80 2345 6789",
    city: "Bangalore",
    state: "Karnataka",
  },
  {
    id: "7",
    name: "Reliable Drapes, Chennai Store",
    address: "No. 456, Anna Salai, Chennai-600002 (Tamil Nadu)",
    phone: "+91 44 3456 7890",
    city: "Chennai",
    state: "Tamil Nadu",
  },
  {
    id: "8",
    name: "Reliable Drapes, Kolkata Store",
    address: "789, Park Street, Kolkata-700016 (West Bengal)",
    phone: "+91 33 4567 8901",
    city: "Kolkata",
    state: "West Bengal",
  },
];

export default function StoreLocatorPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter stores based on search query
  const filteredStores = useMemo(() => {
    if (!searchQuery) return mockStores;
    
    return mockStores.filter((store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleLocateStore = (store: typeof mockStores[0]) => {
    // Handle store location action (e.g., open in maps)
    console.log("Locating store:", store);
    // You can implement Google Maps integration here
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`;
    window.open(mapsUrl, '_blank');
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
            description={`Find our stores near you - ${filteredStores.length} stores available`}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search by city, state, or store name..."
          />

          {/* Store Grid Section */}
          <div className="flex flex-col gap-8 md:gap-12">
            <StoreGrid
              stores={filteredStores}
              onLocateStore={handleLocateStore}
            />
          </div>
        </div>
      </div>
    </main>
  );
}