"use client";

import { Check } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CatalogueCategory } from "@/lib/actions/catalogue-categories";

interface CatalogFilterSidebarProps {
  selectedFilters: string[];
  onToggleFilter: (categoryName: string) => void;
  onClearFilters: () => void;
  categories: CatalogueCategory[];
}

export function CatalogFilterSidebar({
  selectedFilters,
  onToggleFilter,
  onClearFilters,
  categories,
}: CatalogFilterSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters = selectedFilters.length > 0;

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
              <div className="mt-4 space-y-5 md:mt-5">
                {/* Categories */}
                {categories.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="mb-3 text-[16px] font-semibold text-[#161616] md:text-[17px]">
                      Categories
                    </h3>
                    {categories.map((category) => {
                      const isChecked = selectedFilters.includes(category.name);
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
                            onChange={() => onToggleFilter(category.name)}
                            className="sr-only"
                          />
                        </motion.label>
                      );
                    })}
                  </div>
                )}

                {/* Reset Button */}
                <motion.button
                  onClick={onClearFilters}
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
