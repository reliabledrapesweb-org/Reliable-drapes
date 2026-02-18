"use client";

import { Check } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Category } from "@/lib/actions/products";

interface ShopFilterSidebarProps {
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  categories: Category[];
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  maxPrice?: number;
}

// Build tree from flat categories
function buildCategoryTree(
  categories: Category[],
  parentId: string | null = null,
  level = 0,
): Array<Category & { children?: Category[]; level?: number }> {
  return categories
    .filter((cat) => cat.parent_id === parentId)
    .map((cat) => ({
      ...cat,
      level,
      children: buildCategoryTree(categories, cat.id, level + 1),
    }));
}

export function ShopFilterSidebar({
  selectedCategories,
  onCategoryChange,
  categories,
  priceRange,
  onPriceRangeChange,
  sortBy,
  onSortChange,
  maxPrice = 10000,
}: ShopFilterSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedSort, setSelectedSort] = useState<string>(sortBy);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => {
      // Auto-expand categories that have selected children
      const expanded = new Set<string>();
      const tree = buildCategoryTree(categories);
      const checkSelected = (cats: typeof tree) => {
        for (const cat of cats) {
          if (cat.children?.some((c) => selectedCategories.includes(c.slug))) {
            expanded.add(cat.id);
          }
          if (cat.children) checkSelected(cat.children as typeof tree);
        }
      };
      checkSelected(tree);
      return expanded;
    },
  );
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback((categoryId: string) => {
    setHoveredCategory(categoryId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredCategory(null);
  }, []);

  const toggleCategory = (categorySlug: string) => {
    if (selectedCategories.includes(categorySlug)) {
      onCategoryChange(selectedCategories.filter((c) => c !== categorySlug));
    } else {
      onCategoryChange([...selectedCategories, categorySlug]);
    }
  };

  const resetFilters = () => {
    onCategoryChange([]);
    onPriceRangeChange([0, maxPrice]);
    onSortChange("newest");
    setSelectedSort("newest");
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < maxPrice ||
    sortBy !== "newest";

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "popularity", label: "Most Popular" },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSortChange = (value: string) => {
    setSelectedSort(value);
    onSortChange(value);
    setIsSortDropdownOpen(false);
  };

  const currentSortLabel =
    sortOptions.find((opt) => opt.value === selectedSort)?.label ||
    "Newest First";

  // Build category tree
  const categoryTree = buildCategoryTree(categories);

  // Recursive render for category tree
  const renderCategoryTree = (
    cats: Array<Category & { children?: Category[]; level?: number }>,
  ): JSX.Element[] => {
    return cats.map((category) => {
      const isChecked = selectedCategories.includes(category.slug);
      const hasChildren = category.children && category.children.length > 0;
      const isCategoryExpanded =
        expandedCategories.has(category.id) ||
        hoveredCategory === category.id ||
        hoveredCategory?.startsWith(`${category.id}:`);
      const paddingLeft = (category.level || 0) * 16;

      return (
        <div key={category.id}>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex cursor-pointer items-center justify-between py-1"
            style={{ paddingLeft: `${paddingLeft}px` }}
            onMouseEnter={() => hasChildren && handleMouseEnter(category.id)}
          >
            <div className="flex items-center gap-2">
              <span
                onClick={() => toggleCategory(category.slug)}
                className={`text-[16px] transition-colors hover:text-[#2f2582] md:text-[18px] ${
                  isChecked ? "font-medium text-[#2f2582]" : "text-[#575757]"
                }`}
              >
                {category.name}
              </span>
            </div>
            <motion.div
              animate={{
                backgroundColor: isChecked ? "#2f2582" : "#e8e8e8",
                borderColor: isChecked ? "#2f2582" : "#e8e8e8",
              }}
              transition={{ duration: 0.2 }}
              onClick={() => toggleCategory(category.slug)}
              className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-sm border-2"
            >
              <AnimatePresence>
                {isChecked && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Check className="h-3 w-3 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
          <AnimatePresence>
            {isCategoryExpanded && hasChildren && (
              <motion.div
                initial={{ opacity: 0, height: 0, x: -10 }}
                animate={{ opacity: 1, height: "auto", x: 12 }}
                exit={{ opacity: 0, height: 0, x: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {renderCategoryTree(category.children || [])}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    });
  };

  return (
    <aside className="w-full shrink-0">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="p-0"
      >
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between border-b border-[#d0d0d0] pb-3"
        >
          <h2 className="text-[18px] font-bold text-[#161616] md:text-[20px]">
            Filter By
          </h2>
          <motion.div
            animate={{ rotate: isExpanded ? 0 : 180 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <span className="text-xl font-light text-black">−</span>
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              ref={containerRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`overflow-hidden ${isExpanded ? "overflow-visible" : ""}`}
              onAnimationStart={() => {
                if (containerRef.current)
                  containerRef.current.style.overflow = "hidden";
              }}
              onAnimationComplete={() => {
                if (containerRef.current && isExpanded)
                  containerRef.current.style.overflow = "visible";
              }}
            >
              <div className="mt-4 space-y-5 md:mt-5 md:space-y-6">
                {/* Sort By Dropdown */}
                <div>
                  <div className="relative">
                    <button
                      onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                      className="flex w-full items-center justify-between rounded-lg border-2 border-[#e0e0e0] bg-white px-4 py-3 text-left font-medium text-[#161616] transition-colors hover:border-[#d0d0d0]"
                    >
                      <span className="text-[16px] md:text-[18px]">
                        {currentSortLabel}
                      </span>
                      <motion.svg
                        animate={{ rotate: isSortDropdownOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="h-4 w-4 text-[#161616]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </motion.svg>
                    </button>

                    <AnimatePresence>
                      {isSortDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full right-0 left-0 z-50 mt-2 rounded-lg border-2 border-[#e0e0e0] bg-white shadow-lg"
                        >
                          {sortOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleSortChange(option.value)}
                              className={`flex w-full items-center justify-between px-4 py-3 text-left text-[16px] transition-colors md:text-[18px] ${
                                selectedSort === option.value
                                  ? "bg-[#f5f5f5] font-medium text-[#2f2582]"
                                  : "text-[#575757] hover:bg-[#f9f9f9]"
                              }`}
                            >
                              <span>{option.label}</span>
                              {selectedSort === option.value && (
                                <Check className="h-4 w-4 text-[#2f2582]" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Categories */}
                {categories.length > 0 && (
                  <div className="space-y-1" onMouseLeave={handleMouseLeave}>
                    <h3 className="mb-3 text-[16px] font-semibold text-[#161616] md:text-[17px]">
                      Categories
                    </h3>
                    {renderCategoryTree(categoryTree)}
                  </div>
                )}

                {/* Price Range */}
                <div className="space-y-3">
                  <h3 className="text-[16px] font-semibold text-[#161616] md:text-[17px]">
                    Price Range
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={0}
                        max={priceRange[1]}
                        value={priceRange[0]}
                        onChange={(e) =>
                          onPriceRangeChange([
                            parseInt(e.target.value) || 0,
                            priceRange[1],
                          ])
                        }
                        className="w-full rounded-lg border-2 border-[#e0e0e0] px-3 py-2 text-sm transition-colors focus:border-[#2f2582] focus:outline-none"
                        placeholder="Min"
                      />
                      <span className="text-[#898989]">-</span>
                      <input
                        type="number"
                        min={priceRange[0]}
                        max={maxPrice}
                        value={priceRange[1]}
                        onChange={(e) =>
                          onPriceRangeChange([
                            priceRange[0],
                            parseInt(e.target.value) || maxPrice,
                          ])
                        }
                        className="w-full rounded-lg border-2 border-[#e0e0e0] px-3 py-2 text-sm transition-colors focus:border-[#2f2582] focus:outline-none"
                        placeholder="Max"
                      />
                    </div>
                    <p className="text-center text-xs text-[#898989]">
                      {formatPrice(priceRange[0])} -{" "}
                      {formatPrice(priceRange[1])}
                    </p>
                  </div>
                </div>

                {/* Reset Button */}
                <motion.button
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                  whileHover={{ scale: hasActiveFilters ? 1.02 : 1 }}
                  whileTap={{ scale: hasActiveFilters ? 0.98 : 1 }}
                  className="mt-5 w-full rounded-full bg-[#2f2582] px-6 py-2.5 text-[14px] font-medium tracking-[2px] text-white uppercase transition-all hover:bg-[#241c66] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#2f2582] disabled:hover:shadow-none md:text-[16px]"
                >
                  Reset Filters
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </aside>
  );
}
