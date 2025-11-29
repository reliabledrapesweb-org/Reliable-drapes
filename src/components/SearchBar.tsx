import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="w-full">
      <div className="group relative flex items-center justify-between border-b-2 border-[#d0d0d0] pb-3 transition-colors focus-within:border-[#2f2582]">
        <input
          type="text"
          placeholder="Search products..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-[15px] text-[#0e0e0e] outline-none placeholder:text-[#a0a0a0] md:text-[16px]"
        />
        <div className="flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex-shrink-0 rounded-full p-1 transition-all hover:bg-gray-200"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-[#575757]" />
            </button>
          )}
          <button
            type="button"
            className="flex-shrink-0 p-0 transition-all hover:scale-110"
            aria-label="Search"
          >
            <Search className="h-5 w-5 text-[#0e0e0e]" />
          </button>
        </div>
      </div>
    </div>
  );
}
