"use client";

import type { ExhibitionYear } from "@/lib/actions/exhibitions";

type YearTabsProps = {
  years: ExhibitionYear[];
  activeYear: string;
  onYearChange: (yearId: string) => void;
};

export function YearTabs({ years, activeYear, onYearChange }: YearTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {years.map((y) => (
        <button
          key={y.id}
          onClick={() => onYearChange(y.id)}
          className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            activeYear === y.id
              ? "bg-[#2F2582] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {y.year}
        </button>
      ))}
    </div>
  );
}
