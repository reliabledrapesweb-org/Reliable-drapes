"use client";

import {
  Breadcrumb,
  ComingSoonNotice,
  PageHero,
  PageHeader,
} from "@/components/shared";
import { ShopProductGrid, ShopFilterSidebar } from "@/components/features/shop";
import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  getProducts,
  getProductsByCategory,
} from "@/lib/actions/products";
import type { Product, Category } from "@/lib/actions/products";
import type { SiteSettings } from "@/lib/actions/site-settings";
import type { Coupon } from "@/lib/actions/coupons";
import {
  SlidersHorizontal,
  X,
  Tag,
  Copy,
  Check,
  FileText,
  Truck,
  HelpCircle,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type ShopClientProps = {
  initialProducts: Product[];
  initialCategories: Category[];
  initialSiteSettings: SiteSettings | null;
  initialCoupons: Coupon[];
  urlSearchQuery: string;
  urlCategory: string;
};

const parseCategoriesFromUrl = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

export default function ShopClient({
  initialProducts,
  initialCategories,
  initialSiteSettings,
  initialCoupons,
  urlSearchQuery,
  urlCategory,
}: ShopClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    parseCategoriesFromUrl(urlCategory),
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [allProducts] = useState<Product[]>(initialProducts);
  const [categories] = useState<Category[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [siteSettings] = useState<SiteSettings | null>(initialSiteSettings);
  const [coupons] = useState<Coupon[]>(initialCoupons);
  const [copiedCouponId, setCopiedCouponId] = useState<string | null>(null);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategories.length > 0) count += selectedCategories.length;
    if (priceRange[0] > 0 || priceRange[1] < 10000) count += 1;
    if (sortBy !== "newest") count += 1;
    return count;
  }, [selectedCategories, priceRange, sortBy]);

  const updateShopUrl = useCallback(
    (nextSearchQuery: string, nextCategories: string[]) => {
      const normalizedSearchQuery = nextSearchQuery.trim();
      const nextCategory = nextCategories.join(",");

      const params = new URLSearchParams();
      if (normalizedSearchQuery) {
        params.set("search", normalizedSearchQuery);
      }

      if (nextCategory) {
        params.set("category", nextCategory);
      }

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      updateShopUrl(value, selectedCategories);
    },
    [selectedCategories, updateShopUrl],
  );

  const handleCategoryChange = useCallback(
    (categories: string[]) => {
      setSelectedCategories(categories);
      updateShopUrl(searchQuery, categories);
    },
    [searchQuery, updateShopUrl],
  );

  // Re-fetch products when category selection changes
  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        if (selectedCategories.length === 0) {
          const result = await getProducts();
          if (!cancelled && result.success && result.data) {
            setProducts(result.data);
          }
        } else {
          const allFetched: Product[] = [];
          const seenIds = new Set<string>();

          for (const categorySlug of selectedCategories) {
            const result = await getProductsByCategory(categorySlug);
            if (result.success && result.data) {
              for (const product of result.data) {
                if (!seenIds.has(product.id)) {
                  seenIds.add(product.id);
                  allFetched.push(product);
                }
              }
            }
          }

          if (!cancelled) {
            setProducts(allFetched);
          }
        }
      } catch {
        // Keep existing products on error
      }
      if (!cancelled) {
        setIsLoading(false);
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [selectedCategories]);

  const copyCouponCode = async (code: string, couponId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCouponId(couponId);
      setTimeout(() => setCopiedCouponId(null), 2000);
    } catch {
      // Handle error silently
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = products;
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (normalizedQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(normalizedQuery) ||
          (product.sku &&
            product.sku.toLowerCase().includes(normalizedQuery)) ||
          product.description?.toLowerCase().includes(normalizedQuery),
      );
    }

    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1],
    );

    switch (sortBy) {
      case "price-low":
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case "popularity":
        break;
      case "newest":
      default:
        filtered = [...filtered].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
    }

    return filtered;
  }, [products, searchQuery, priceRange, sortBy]);

  const isDoorMatsOnlyPage =
    selectedCategories.length === 1 && selectedCategories[0] === "door-mats";

  return (
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[68px] xl:mt-20">
      <PageHero heading="Shop" backgroundImage="/images/heroes/shop-hero.jpg" />
      <Breadcrumb />
      <div className="w-full py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          {coupons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#2F2582] to-[#4a3db8] p-6 text-white shadow-lg"
            >
              <div className="mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Special Offers</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm"
                  >
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-mono text-sm font-bold tracking-wider uppercase">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => copyCouponCode(coupon.code, coupon.id)}
                          className="rounded p-1 transition-colors hover:bg-white/20"
                          title="Copy code"
                        >
                          {copiedCouponId === coupon.id ? (
                            <Check className="h-4 w-4 text-green-300" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-white/80">
                        {coupon.discount_type === "percentage"
                          ? `${coupon.discount_value}% off`
                          : `Rs ${coupon.discount_value} off`}
                        {coupon.min_order_value
                          ? ` on orders above Rs ${coupon.min_order_value}`
                          : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {siteSettings && !siteSettings.shop_enabled ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#2F2582]/10">
                <Tag className="h-10 w-10 text-[#2F2582]" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
                Coming Soon
              </h2>
              <p className="mx-auto max-w-md text-gray-600">
                {siteSettings.coming_soon_message ||
                  "Our new collection will be available shortly."}
              </p>
              <motion.a
                href="/contact"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#2F2582] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#241c66]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Contact Us for Inquiries
              </motion.a>
            </motion.div>
          ) : (
            <>
              <PageHeader
                category="Shop"
                title="B2B Product Catalogue"
                description={
                  isLoading
                    ? "Loading..."
                    : `Showing ${filteredProducts.length} of ${allProducts.length} products`
                }
                searchValue={searchQuery}
                onSearchChange={handleSearchChange}
                searchPlaceholder="Search products"
              />

              <div className="flex flex-col gap-8 md:gap-12 lg:flex-row lg:gap-16">
                <div className="lg:hidden">
                  <button
                    onClick={() => setIsFilterSheetOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#2F2582] bg-white px-6 py-3 text-sm font-semibold text-[#2F2582] transition-all hover:bg-[#2F2582] hover:text-white"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2F2582] text-xs text-white group-hover:bg-white group-hover:text-[#2F2582]">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </div>

                <div className="hidden lg:sticky lg:top-24 lg:block lg:w-64 lg:shrink-0 lg:self-start">
                  <ShopFilterSidebar
                    selectedCategories={selectedCategories}
                    onCategoryChange={handleCategoryChange}
                    categories={categories}
                    priceRange={priceRange}
                    onPriceRangeChange={setPriceRange}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    maxPrice={10000}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  {isLoading ? (
                    <div className="grid w-full grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 lg:gap-8">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="h-72 animate-pulse rounded-lg bg-gray-200 sm:h-96"
                        />
                      ))}
                    </div>
                  ) : (
                    <>
                      {isDoorMatsOnlyPage ? (
                        <ComingSoonNotice
                          title="Door Mats Coming Soon"
                          message="Door Mats will be available soon in our catalogue."
                        />
                      ) : (
                        <ShopProductGrid
                          products={filteredProducts}
                          coupons={coupons}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {isFilterSheetOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsFilterSheetOpen(false)}
                      className="fixed inset-0 z-50 bg-black/50 lg:hidden"
                    />

                    <motion.div
                      initial={{ x: "100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "100%" }}
                      transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 300,
                      }}
                      className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl lg:hidden"
                    >
                      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                        <h2 className="text-lg font-bold text-gray-900">
                          Filters
                        </h2>
                        <button
                          onClick={() => setIsFilterSheetOpen(false)}
                          className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="h-[calc(100%-140px)] overflow-y-auto px-6 py-6">
                        <ShopFilterSidebar
                          selectedCategories={selectedCategories}
                          onCategoryChange={handleCategoryChange}
                          categories={categories}
                          priceRange={priceRange}
                          onPriceRangeChange={setPriceRange}
                          sortBy={sortBy}
                          onSortChange={setSortBy}
                          maxPrice={10000}
                        />
                      </div>

                      <div className="absolute inset-x-0 bottom-0 border-t border-gray-100 bg-white px-6 py-4">
                        <button
                          onClick={() => setIsFilterSheetOpen(false)}
                          className="w-full rounded-full bg-[#2F2582] px-6 py-3 text-sm font-semibold tracking-wide text-white transition-all hover:bg-[#241c66]"
                        >
                          Show {filteredProducts.length} Products
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              <div className="mt-16 border-t border-gray-200 pt-12">
                <h3 className="mb-6 text-center text-lg font-semibold text-gray-900">
                  Shop Policies
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <a
                    href="/return-policy"
                    className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition-all hover:border-[#2F2582] hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2F2582]/10">
                      <FileText className="h-5 w-5 text-[#2F2582]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Return Policy</p>
                      <p className="text-xs text-gray-500">
                        Learn about returns
                      </p>
                    </div>
                  </a>

                  <a
                    href="/shipping-info"
                    className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition-all hover:border-[#2F2582] hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2F2582]/10">
                      <Truck className="h-5 w-5 text-[#2F2582]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Shipping Info</p>
                      <p className="text-xs text-gray-500">Delivery details</p>
                    </div>
                  </a>

                  <a
                    href="/faq"
                    className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition-all hover:border-[#2F2582] hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2F2582]/10">
                      <HelpCircle className="h-5 w-5 text-[#2F2582]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">FAQ</p>
                      <p className="text-xs text-gray-500">Common questions</p>
                    </div>
                  </a>

                  <a
                    href="/privacy-policy"
                    className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition-all hover:border-[#2F2582] hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2F2582]/10">
                      <Shield className="h-5 w-5 text-[#2F2582]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Privacy Policy
                      </p>
                      <p className="text-xs text-gray-500">
                        Your privacy matters
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
