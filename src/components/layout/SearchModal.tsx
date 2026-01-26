"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getProducts, type Product } from "@/lib/actions/products";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/constants/app";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Search products
  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setHasSearched(false);
        return;
      }

      setIsSearching(true);
      setHasSearched(true);

      try {
        const result = await getProducts({ search: searchQuery, limit: 5 });
        if (result.success && result.data) {
          setSearchResults(result.data);
        } else {
          setSearchResults([]);
        }
      } catch (error) {

        setSearchResults([]);
      }

      setIsSearching(false);
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleProductClick = (productId: string) => {
    router.push(`/shop/${productId}`);
    onClose();
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter" && searchResults.length === 1) {
      handleProductClick(searchResults[0].id);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const fallbackImage = DEFAULT_PRODUCT_IMAGE;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                  placeholder="Search for products..."
                  className="flex-1 text-base text-[#161616] placeholder:text-[#898989] focus:outline-none"
                />
                {isSearching && (
                  <Loader2 className="h-5 w-5 animate-spin text-[#2f2582]" />
                )}
                <button
                  onClick={onClose}
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
                ) : searchResults.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {searchResults.map((product) => (
                      <motion.button
                        key={product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => handleProductClick(product.id)}
                        className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-gray-50"
                      >
                        {/* Product Image */}
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          <Image
                            src={product.image_url || fallbackImage}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>

                        {/* Product Info */}
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
                            {formatPrice(product.price)}
                          </p>
                        </div>

                        {/* Arrow */}
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
                    ))}

                    {/* View All Results */}
                    {searchResults.length === 5 && (
                      <button
                        onClick={() => {
                          router.push(
                            `/shop?search=${encodeURIComponent(searchQuery)}`,
                          );
                          onClose();
                          setSearchQuery("");
                        }}
                        className="w-full border-t border-[#d0d0d0] p-4 text-center text-sm font-medium text-[#2f2582] transition-colors hover:bg-gray-50"
                      >
                        View all results for "{searchQuery}"
                      </button>
                    )}
                  </div>
                ) : hasSearched ? (
                  <div className="flex flex-col items-center justify-center px-4 py-12">
                    <div className="mb-4 rounded-full bg-gray-100 p-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-[#161616]">
                      No products found
                    </h3>
                    <p className="mb-4 text-center text-sm text-[#898989]">
                      We couldn't find any products matching "{searchQuery}"
                    </p>
                    <button
                      onClick={() => {
                        router.push("/shop");
                        onClose();
                        setSearchQuery("");
                      }}
                      className="rounded-full bg-[#2f2582] px-6 py-2.5 text-sm font-medium tracking-[1.5px] text-white uppercase transition-all hover:bg-[#241c66] hover:shadow-lg"
                    >
                      Browse All Products
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Keyboard Hints */}
              {searchResults.length > 0 && (
                <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-[#898989]">
                  <span className="font-medium">Tip:</span> Press{" "}
                  <kbd className="rounded border border-gray-300 bg-white px-1.5 py-0.5 font-mono">
                    Enter
                  </kbd>{" "}
                  {searchResults.length === 1 && "to view product"}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
