"use client";

const SUB_SECTIONS = [
  { key: "exhibition", label: "Exhibitions" },
  { key: "moment", label: "Moments" },
  { key: "news", label: "In the News" },
] as const;

type SubSectionTabsProps = {
  activeType: string;
  onTypeChange: (type: string) => void;
};

export function SubSectionTabs({ activeType, onTypeChange }: SubSectionTabsProps) {
  return (
    <div className="flex gap-2">
      {SUB_SECTIONS.map((section) => (
        <button
          key={section.key}
          onClick={() => onTypeChange(section.key)}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
            activeType === section.key
              ? "bg-[#2F2582]/10 text-[#2F2582] ring-1 ring-[#2F2582]/30"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          {section.label}
        </button>
      ))}
    </div>
  );
}
