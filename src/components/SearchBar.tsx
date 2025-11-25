import { Search } from "lucide-react";

export function SearchBar() {
  return (
    <div className="w-full max-w-[420px]">
      <div className="relative flex items-center justify-between border-b border-[#a0a0a0] pb-3">
        <input
          type="text"
          placeholder="Search"
          className="flex-1 bg-transparent text-[16px] text-[#a0a0a0] outline-none placeholder:text-[#a0a0a0]"
        />
        <button
          type="button"
          className="flex-shrink-0 p-0 transition-opacity hover:opacity-70"
          aria-label="Search"
        >
          <Search className="h-5 w-5 text-[#0e0e0e]" />
        </button>
      </div>
    </div>
  );
}
