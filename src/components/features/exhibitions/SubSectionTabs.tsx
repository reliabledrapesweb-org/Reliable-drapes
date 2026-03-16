"use client";

import { Award, Camera, Newspaper } from "lucide-react";

const SUB_SECTIONS = [
  { key: "exhibition", label: "Exhibitions", icon: Award },
  { key: "moment", label: "Moments", icon: Camera },
  { key: "news", label: "In the News", icon: Newspaper },
] as const;

type SubSectionTabsProps = {
  activeType: string;
  onTypeChange: (type: string) => void;
};

export function SubSectionTabs({
  activeType,
  onTypeChange,
}: SubSectionTabsProps) {
  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto">
      {SUB_SECTIONS.map((section) => {
        const Icon = section.icon;
        const isActive = activeType === section.key;
        return (
          <button
            key={section.key}
            onClick={() => onTypeChange(section.key)}
            className={`flex shrink-0 items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${
              isActive
                ? "border-[#2F2582] bg-[#2F2582]/5 text-[#2F2582] shadow-sm"
                : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Icon className="h-4 w-4" />
            {section.label}
          </button>
        );
      })}
    </div>
  );
}
