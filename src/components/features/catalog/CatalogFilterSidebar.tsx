"use client";

import { Check, ChevronRight, ChevronDown } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CatalogueCategory } from "@/lib/actions/catalogue-categories";

interface CatalogFilterSidebarProps {
  selectedFilters: string[];
  onToggleFilter: (categoryName: string) => void;
  onClearFilters: () => void;
  categories: CatalogueCategory[];
}

// Build tree from flat categories
function buildCategoryTree(
  categories: CatalogueCategory[],
  parentId: string | null = null,
): Array<
  CatalogueCategory & { children?: CatalogueCategory[]; level?: number }
> {
  return categories
    .filter((cat) => cat.parent_id === parentId)
    .map((cat) => ({
      ...cat,
      level: parentId === null ? 0 : 1,
      children: buildCategoryTree(categories, cat.id).map((c) => ({
        ...c,
        level: 1,
      })),
    }));
}

export function CatalogFilterSidebar({
  selectedFilters,
  onToggleFilter,
  onClearFilters,
  categories,
}: CatalogFilterSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => {
      // Auto-expand categories that have selected children
      const expanded = new Set<string>();
      const tree = buildCategoryTree(categories);
      const checkSelected = (cats: typeof tree) => {
        for (const cat of cats) {
          if (cat.children?.some((c) => selectedFilters.includes(c.name))) {
            expanded.add(cat.id);
          }
          if (cat.children) checkSelected(cat.children as typeof tree);
        }
      };
      checkSelected(tree);
      return expanded;
    },
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters = selectedFilters.length > 0;

  const toggleCategoryExpanded = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Build category tree
  const categoryTree = buildCategoryTree(categories);

  // Recursive render for category tree
  const renderCategoryTree = (
    cats: Array<
      CatalogueCategory & { children?: CatalogueCategory[]; level?: number }
    >,
  ): JSX.Element[] => {
    return cats.map((category) => {
      const isChecked = selectedFilters.includes(category.name);
      const hasChildren = category.children && category.children.length > 0;
      const isCategoryExpanded = expandedCategories.has(category.id);
      const paddingLeft = (category.level || 0) * 16;

      return (
        <div key={category.id}>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex cursor-pointer items-center justify-between py-1"
            style={{ paddingLeft: `${paddingLeft}px` }}
          >
            <div className="flex items-center gap-2">
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCategoryExpanded(category.id);
                  }}
                  className="flex h-5 w-5 items-center justify-center rounded hover:bg-gray-100"
                >
                  {isCategoryExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              )}
              {!hasChildren && <div className="w-5" />}
              <span
                onClick={() => onToggleFilter(category.name)}
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
              onClick={() => onToggleFilter(category.name)}
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
          {isCategoryExpanded && hasChildren && (
            <div>{renderCategoryTree(category.children || [])}</div>
          )}
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
              <div className="mt-4 space-y-5 md:mt-5">
                {/* Categories */}
                {categories.length > 0 && (
                  <div className="space-y-1">
                    <h3 className="mb-3 text-[16px] font-semibold text-[#161616] md:text-[17px]">
                      Categories
                    </h3>
                    {renderCategoryTree(categoryTree)}
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
