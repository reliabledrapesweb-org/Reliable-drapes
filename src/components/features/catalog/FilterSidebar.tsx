"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORY_OPTIONS } from "@/lib/constants";

interface FilterSidebarProps {
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  availableCategories: string[];
}

export function FilterSidebar({
  selectedFilters,
  onFilterChange,
  availableCategories,
}: FilterSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("Curtains");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleFilter = (category: string) => {
    if (selectedFilters.includes(category)) {
      onFilterChange(selectedFilters.filter((f) => f !== category));
    } else {
      onFilterChange([...selectedFilters, category]);
    }
  };

  const resetFilters = () => {
    onFilterChange([]);
  };

  return (
    <aside className="w-full flex-shrink-0 lg:w-[260px]">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md md:p-6"
      >
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between border-b border-[#d0d0d0] pb-4"
        >
          <h2 className="text-[18px] font-medium text-[#161616] md:text-[20px]">
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
              <div className="mt-6 space-y-4 md:mt-8 md:space-y-5">
                {/* Category Dropdown */}
                <div>
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex w-full items-center justify-between rounded-lg border-2 border-[#e0e0e0] bg-white px-4 py-3 text-left font-medium text-[#161616] hover:border-[#d0d0d0] transition-colors"
                    >
                      <span className="text-[16px] md:text-[18px]">{selectedCategory}</span>
                      <motion.svg
                        animate={{ rotate: isDropdownOpen ? 180 : 0 }}
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
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 right-0 mt-2 z-50 rounded-lg border-2 border-[#e0e0e0] bg-white shadow-lg"
                        >
                          {CATEGORY_OPTIONS.map((option) => (
                            <button
                              key={option}
                              onClick={() => {
                                setSelectedCategory(option);
                                setIsDropdownOpen(false);
                              }}
                              className={`flex w-full items-center justify-between px-4 py-3 text-left text-[16px] md:text-[18px] transition-colors ${
                                selectedCategory === option
                                  ? "bg-[#f5f5f5] text-[#2f2582] font-medium"
                                  : "text-[#575757] hover:bg-[#f9f9f9]"
                              }`}
                            >
                              <span>{option}</span>
                              {selectedCategory === option && (
                                <Check className="h-4 w-4 text-[#2f2582]" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Filter Options */}
                <div className="space-y-3">
                  {["Main Curtains", "Sheer Curtains", "Blackout Curtains"].map((item) => {
                    const isChecked = selectedFilters.includes(item);
                    return (
                      <motion.label
                        key={item}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ x: 4 }}
                        className="flex cursor-pointer items-center justify-between py-1"
                      >
                        <span className="text-[16px] text-[#575757] transition-colors hover:text-[#2f2582] md:text-[18px]">
                          {item}
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
                          onChange={() => toggleFilter(item)}
                          className="sr-only"
                        />
                      </motion.label>
                    );
                  })}
                </div>

                {/* Reset Button */}
                <motion.button
                  onClick={resetFilters}
                  disabled={selectedFilters.length === 0}
                  whileHover={{ scale: selectedFilters.length > 0 ? 1.02 : 1 }}
                  whileTap={{ scale: selectedFilters.length > 0 ? 0.98 : 1 }}
                  className="mt-8 w-full rounded-full bg-[#2f2582] px-6 py-3 text-[14px] font-medium tracking-[2px] text-white uppercase transition-all hover:bg-[#241c66] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#2f2582] disabled:hover:shadow-none md:text-[16px]"
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
