import { SearchBar } from "./SearchBar";

interface PageHeaderProps {
  category: string;
  title: string;
  description?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
}

export function PageHeader({
  category,
  title,
  description,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search..."
}: PageHeaderProps) {
  return (
    <div className="mb-12 md:mb-16 lg:mb-20">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-4">
          <p className="text-xs font-medium tracking-[6px] text-[#575757] uppercase md:text-sm md:tracking-[8px]">
            {category}
          </p>
          <h1 className="text-2xl leading-tight font-bold text-[#161616] md:text-[32px]">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-base text-[#898989] md:text-lg">
              {description}
            </p>
          )}
        </div>

        <div className="w-full lg:w-auto lg:min-w-[420px]">
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        </div>
      </div>
    </div>
  );
}