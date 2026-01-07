"use client";

import { Check } from "lucide-react";
import { useState, useRef } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

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
              className="overflow-hidden"
              onAnimationStart={() => {
                if (containerRef.current)
                  containerRef.current.style.overflow = "hidden";
              }}
              onAnimationComplete={() => {
                if (containerRef.current && isExpanded)
                  containerRef.current.style.overflow = "visible";
              }}
            >
              <div className="mt-4 space-y-3 md:mt-5 md:space-y-4">
                {/* Category Dropdown */}
                <div>
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex w-full items-center justify-between rounded-lg border-2 border-[#e0e0e0] bg-white px-4 py-3 text-left font-medium text-[#161616] transition-colors hover:border-[#d0d0d0]"
                    >
                      <span className="text-[16px] md:text-[18px]">
                        {selectedCategory}
                      </span>
                      <motion.svg
                        animate={{ rotate: isDropdownOpen ? 180 : 0 }}
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
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full right-0 left-0 z-50 mt-2 rounded-lg border-2 border-[#e0e0e0] bg-white shadow-lg"
                        >
                          {CATEGORY_OPTIONS.map((option) => (
                            <button
                              key={option}
                              onClick={() => {
                                setSelectedCategory(option);
                                setIsDropdownOpen(false);
                              }}
                              className={`flex w-full items-center justify-between px-4 py-3 text-left text-[16px] transition-colors md:text-[18px] ${
                                selectedCategory === option
                                  ? "bg-[#f5f5f5] font-medium text-[#2f2582]"
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
                <div className="space-y-2">
                  {["Main Curtains", "Sheer Curtains", "Blackout Curtains"].map(
                    (item) => {
                      const isChecked = selectedFilters.includes(item);
                      return (
                        <motion.label
                          key={item}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ x: 4 }}
                          className="flex cursor-pointer items-center justify-between py-0.5"
                        >
                          <span className="text-[16px] text-[#575757] transition-colors hover:text-[#2f2582] md:text-[18px]">
                            {item}
                          </span>
                          <motion.div
                            animate={{
                              scale: isChecked ? 1 : 1,
                              backgroundColor: isChecked
                                ? "#2f2582"
                                : "#e8e8e8",
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
                    },
                  )}
                </div>

                {/* Reset Button */}
                <motion.button
                  onClick={resetFilters}
                  disabled={selectedFilters.length === 0}
                  whileHover={{ scale: selectedFilters.length > 0 ? 1.02 : 1 }}
                  whileTap={{ scale: selectedFilters.length > 0 ? 0.98 : 1 }}
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
