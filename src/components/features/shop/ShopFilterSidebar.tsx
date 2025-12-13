"use client";

import { Check } from "lucide-react";
import { useState } from "react";
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
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSortChange = (value: string) => {
    setSelectedSort(value);
    onSortChange(value);
    setIsSortDropdownOpen(false);
  };

  const currentSortLabel = sortOptions.find(opt => opt.value === selectedSort)?.label || "Newest First";

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
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-5 md:mt-5 md:space-y-6">
                {/* Sort By Dropdown */}
                <div>
                  <div className="relative">
                    <button
                      onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                      className="flex w-full items-center justify-between rounded-lg border-2 border-[#e0e0e0] bg-white px-4 py-3 text-left font-medium text-[#161616] hover:border-[#d0d0d0] transition-colors"
                    >
                      <span className="text-[16px] md:text-[18px]">{currentSortLabel}</span>
                      <motion.svg
                        animate={{ rotate: isSortDropdownOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="h-4 w-4 text-[#161616]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </motion.svg>
                    </button>

                    <AnimatePresence>
                      {isSortDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 right-0 mt-2 z-50 rounded-lg border-2 border-[#e0e0e0] bg-white shadow-lg"
                        >
                          {sortOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleSortChange(option.value)}
                              className={`flex w-full items-center justify-between px-4 py-3 text-left text-[16px] md:text-[18px] transition-colors ${
                                selectedSort === option.value
                                  ? "bg-[#f5f5f5] text-[#2f2582] font-medium"
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
                  <div className="space-y-2">
                    <h3 className="text-[16px] font-semibold text-[#161616] md:text-[17px] mb-3">
                      Categories
                    </h3>
                    {categories.map((category) => {
                      const isChecked = selectedCategories.includes(category.slug);
                      return (
                        <motion.label
                          key={category.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ x: 4 }}
                          className="flex cursor-pointer items-center justify-between py-0.5"
                        >
                          <span className="text-[16px] text-[#575757] transition-colors hover:text-[#2f2582] md:text-[18px]">
                            {category.name}
                          </span>
                          <motion.div
                            animate={{
                              scale: isChecked ? 1 : 1,
                              backgroundColor: isChecked ? "#2f2582" : "#e8e8e8",
                              borderColor: isChecked ? "#2f2582" : "#e8e8e8",
                            }}
                            transition={{ duration: 0.2 }}
                            className="flex h-5 w-5 items-center justify-center rounded-sm border-2"
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
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCategory(category.slug)}
                            className="sr-only"
                          />
                        </motion.label>
                      );
                    })}
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
                        className="w-full rounded-lg border-2 border-[#e0e0e0] px-3 py-2 text-sm focus:border-[#2f2582] focus:outline-none transition-colors"
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
                        className="w-full rounded-lg border-2 border-[#e0e0e0] px-3 py-2 text-sm focus:border-[#2f2582] focus:outline-none transition-colors"
                        placeholder="Max"
                      />
                    </div>
                    <p className="text-xs text-[#898989] text-center">
                      {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
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
