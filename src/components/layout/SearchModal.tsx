"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Loader2, BookOpen, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getProducts, type Product } from "@/lib/actions/products";
import { getCatalogues, type Catalogue } from "@/lib/actions/catalogues";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/constants/app";
import { useCommerceFeatures } from "@/components/providers";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchResult =
  | { type: "catalogue"; data: Catalogue }
  | { type: "product"; data: Product };

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const { commerceFeaturesEnabled } = useCommerceFeatures();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetSearchState = () => {
    setSearchQuery("");
    setResults([]);
    setHasSearched(false);
  };

  const handleClose = () => {
    onClose();
    resetSearchState();
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Search catalogues and products
  useEffect(() => {
    const performSearch = async () => {
      const normalizedQuery = searchQuery.trim().toLowerCase();
      if (normalizedQuery.length < 2) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setIsSearching(true);
      setHasSearched(true);

      try {
        // Search catalogues and products in parallel
        const [catalogueResult, productResult] = await Promise.all([
          getCatalogues(),
          getProducts({ search: normalizedQuery, limit: 5 }),
        ]);

        const combined: SearchResult[] = [];

        // Filter catalogues client-side by title/description
        if (catalogueResult.success && catalogueResult.data) {
          const matchingCatalogues = catalogueResult.data
            .filter(
              (c) =>
                c.title.toLowerCase().includes(normalizedQuery) ||
                c.description?.toLowerCase().includes(normalizedQuery) ||
                c.subtitle?.toLowerCase().includes(normalizedQuery),
            )
            .slice(0, 5);

          matchingCatalogues.forEach((c) =>
            combined.push({ type: "catalogue", data: c }),
          );
        }

        // Add product results
        if (productResult.success && productResult.data) {
          productResult.data.forEach((p) =>
            combined.push({ type: "product", data: p }),
          );
        }

        setResults(combined);
      } catch {
        setResults([]);
      }

      setIsSearching(false);
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "catalogue") {
      router.push(
        `/e-catalogue?open=${encodeURIComponent(result.data.id)}`,
      );
    } else {
      if (!commerceFeaturesEnabled) {
        router.push("/shop");
      } else {
        router.push(`/shop/${result.data.id}`);
      }
    }
    handleClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    } else if (e.key === "Enter" && searchQuery.trim().length >= 2) {
      e.preventDefault();
      router.push(
        `/e-catalogue?search=${encodeURIComponent(searchQuery.trim())}`,
      );
      handleClose();
    }
  };

  const catalogueResults = results.filter((r) => r.type === "catalogue");
  const productResults = results.filter((r) => r.type === "product");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-20 left-1/2 z-[9999] w-full max-w-2xl -translate-x-1/2 px-4"
          >
            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
              {/* Search Input */}
              <div className="flex items-center gap-3 border-b border-[#d0d0d0] p-4">
                <Search className="h-5 w-5 text-[#575757]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search catalogues and products..."
                  className="flex-1 text-base text-[#161616] placeholder:text-[#898989] focus:outline-none"
                />
                {isSearching && (
                  <Loader2 className="h-5 w-5 animate-spin text-[#2f2582]" />
                )}
                <button
                  onClick={handleClose}
                  className="rounded-full p-1.5 text-[#575757] transition-colors hover:bg-gray-100"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search Results */}
              <div className="max-h-[400px] overflow-y-auto">
                {searchQuery.trim().length < 2 ? (
                  <div className="flex flex-col items-center justify-center px-4 py-12">
                    <Search className="mb-3 h-12 w-12 text-gray-300" />
                    <p className="text-sm text-[#898989]">
                      Type at least 2 characters to search
                    </p>
                  </div>
                ) : isSearching ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#2f2582]" />
                  </div>
                ) : results.length > 0 ? (
                  <div>
                    {/* Catalogue Results */}
                    {catalogueResults.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2">
                          <BookOpen className="h-3.5 w-3.5 text-[#575757]" />
                          <span className="text-xs font-semibold tracking-wide text-[#575757] uppercase">
                            Catalogues
                          </span>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {catalogueResults.map((result) => {
                            const catalogue = result.data as Catalogue;
                            return (
                              <motion.button
                                key={catalogue.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => handleResultClick(result)}
                                className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-gray-50"
                              >
                                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                  <Image
                                    src={
                                      catalogue.thumbnail_url ||
                                      catalogue.image_url ||
                                      DEFAULT_PRODUCT_IMAGE
                                    }
                                    alt={catalogue.title}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="line-clamp-1 text-sm font-semibold text-[#161616]">
                                    {catalogue.title}
                                  </h4>
                                  {catalogue.description && (
                                    <p className="mt-0.5 line-clamp-1 text-xs text-[#898989]">
                                      {catalogue.description}
                                    </p>
                                  )}
                                  {catalogue.category?.name && (
                                    <p className="mt-1 text-xs font-medium text-[#2f2582]">
                                      {catalogue.category.name}
                                    </p>
                                  )}
                                </div>
                                <svg
                                  className="h-5 w-5 flex-shrink-0 text-[#898989]"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Product Results */}
                    {productResults.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2">
                          <ShoppingBag className="h-3.5 w-3.5 text-[#575757]" />
                          <span className="text-xs font-semibold tracking-wide text-[#575757] uppercase">
                            Products
                          </span>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {productResults.map((result) => {
                            const product = result.data as Product;
                            return (
                              <motion.button
                                key={product.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => handleResultClick(result)}
                                className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-gray-50"
                              >
                                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                  <Image
                                    src={product.image_url || DEFAULT_PRODUCT_IMAGE}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="line-clamp-1 text-sm font-semibold text-[#161616]">
                                    {product.name}
                                  </h4>
                                  {product.description && (
                                    <p className="mt-0.5 line-clamp-1 text-xs text-[#898989]">
                                      {product.description}
                                    </p>
                                  )}
                                  <p className="mt-1 text-sm font-bold text-[#2f2582]">
                                    {new Intl.NumberFormat("en-IN", {
                                      style: "currency",
                                      currency: "INR",
                                      minimumFractionDigits: 0,
                                    }).format(product.price)}
                                  </p>
                                </div>
                                <svg
                                  className="h-5 w-5 flex-shrink-0 text-[#898989]"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : hasSearched ? (
                  <div className="flex flex-col items-center justify-center px-4 py-12">
                    <div className="mb-4 rounded-full bg-gray-100 p-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-[#161616]">
                      No results found
                    </h3>
                    <p className="mb-4 text-center text-sm text-[#898989]">
                      We couldn&apos;t find anything matching &quot;{searchQuery}
                      &quot;
                    </p>
                    <button
                      onClick={() => {
                        router.push("/e-catalogue");
                        handleClose();
                      }}
                      className="rounded-full bg-[#2f2582] px-6 py-2.5 text-sm font-medium tracking-[1.5px] text-white uppercase transition-all hover:bg-[#241c66] hover:shadow-lg"
                    >
                      Browse All Catalogues
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Keyboard Hints */}
              {results.length > 0 && (
                <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-[#898989]">
                  <span className="font-medium">Tip:</span> Press{" "}
                  <kbd className="rounded border border-gray-300 bg-white px-1.5 py-0.5 font-mono">
                    Enter
                  </kbd>{" "}
                  to view all catalogue results
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
