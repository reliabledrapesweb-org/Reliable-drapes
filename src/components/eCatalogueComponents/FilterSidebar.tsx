"use client";

import { Check, Filter } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between border-b border-[#d0d0d0] pb-4"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-[#2f2582]" />
            <h2 className="text-[18px] font-medium text-[#161616] md:text-[20px]">
              Filter By
            </h2>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 0 : 90 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <span className="text-xl font-light text-black">
              {isExpanded ? "−" : "+"}
            </span>
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
              <div className="mt-6 space-y-3 md:mt-8 md:space-y-4">
                {availableCategories.map((category, index) => {
                  const isChecked = selectedFilters.includes(category);
                  return (
                    <motion.label
                      key={category}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      whileHover={{ x: 4 }}
                      className="group flex cursor-pointer items-center justify-between py-1"
                    >
                      <span className="text-[16px] text-[#575757] transition-colors group-hover:text-[#2f2582] md:text-[18px]">
                        {category}
                      </span>
                      <motion.div
                        animate={{
                          scale: isChecked ? 1.1 : 1,
                          backgroundColor: isChecked ? "#2f2582" : "#d9d9d9",
                          borderColor: isChecked ? "#2f2582" : "#d9d9d9",
                        }}
                        transition={{ duration: 0.2 }}
                        className="flex h-5 w-5 items-center justify-center rounded border"
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
                        onChange={() => toggleFilter(category)}
                        className="sr-only"
                      />
                    </motion.label>
                  );
                })}
              </div>

              <motion.button
                onClick={resetFilters}
                disabled={selectedFilters.length === 0}
                whileHover={{ scale: selectedFilters.length > 0 ? 1.02 : 1 }}
                whileTap={{ scale: selectedFilters.length > 0 ? 0.98 : 1 }}
                className="mt-6 w-full rounded-full bg-[#2f2582] px-6 py-2.5 text-[14px] font-medium tracking-[2px] text-white uppercase transition-all hover:bg-[#241c66] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#2f2582] disabled:hover:shadow-none md:mt-8 md:px-8 md:py-3 md:text-[16px]"
              >
                Reset Filters
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </aside>
  );
}
