"use client";

import type { Store } from "@/lib/actions/stores";

type StoreGridProps = {
  stores: Store[];
};

export function StoreGrid({ stores }: StoreGridProps) {
  if (stores.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">
          No stores found for the selected filter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stores.map((store) => (
        <div
          key={store.id}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="bg-[#2F2582] px-4 py-2.5 text-center">
            <p className="text-xs font-bold tracking-widest text-white uppercase">
              {store.state || store.city}
            </p>
          </div>
          <div className="p-4">
            <p className="text-sm font-bold text-gray-900">{store.name}</p>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              {store.address}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
