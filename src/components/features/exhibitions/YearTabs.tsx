"use client";

import type { ExhibitionYear } from "@/lib/actions/exhibitions";

type YearTabsProps = {
  years: ExhibitionYear[];
  activeYear: string;
  onYearChange: (yearId: string) => void;
};

export function YearTabs({ years, activeYear, onYearChange }: YearTabsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl bg-gray-100 p-1.5">
      {years.map((y) => (
        <button
          key={y.id}
          onClick={() => onYearChange(y.id)}
          className={`relative shrink-0 rounded-lg px-6 py-2.5 text-sm font-bold tracking-wide transition-all ${
            activeYear === y.id
              ? "bg-[#2F2582] text-white shadow-md shadow-[#2F2582]/25"
              : "text-gray-500 hover:bg-white hover:text-gray-800 hover:shadow-sm"
          }`}
        >
          {y.year}
        </button>
      ))}
    </div>
  );
}
