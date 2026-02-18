"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Breadcrumb, ComingSoonNotice, ConfirmModal } from "@/components/shared";
import { useWishlistStore, useCartStore } from "@/lib/store";
import { Heart, ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { ShopProductCard } from "@/components/features/shop/ShopProductCard";
import type { Product } from "@/lib/actions/products";
import { useCommerceFeatures } from "@/components/providers";
import type { WishlistItem } from "@/lib/store";

export default function WishlistPage() {
  const { toasts, addToast, removeToast } = useToast();
  const { items, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const {
    commerceFeaturesEnabled,
    comingSoonMessage,
    isLoading: isCommerceFeaturesLoading,
  } = useCommerceFeatures();

  const handleAddToCart = (productId: string) => {
    const item = items.find((i) => i.productId === productId);
    if (!item) return;

    addItem({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    });
    addToast(`${item.name} added to cart!`, "success", 3000);
  };

  // Map WishlistItem to a Product object for ShopProductCard
  const mapItemToProduct = (item: WishlistItem): Product => ({
    id: item.productId,
    name: item.name,
    sku: null,
    price: item.price,
    image_url: item.image,
    description: null,
    created_at: new Date().toISOString(),
  });

  if (isCommerceFeaturesLoading) {
    return (
      <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
        <Breadcrumb />
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2f2582] border-t-transparent" />
        </div>
      </main>
    );
  }

  if (!commerceFeaturesEnabled) {
    return (
      <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
        <Breadcrumb />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
          <ComingSoonNotice message={comingSoonMessage} />
        </div>
      </main>
    );
  }

  return (
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
      <Breadcrumb />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-[#161616] uppercase md:text-4xl">
              Your Wishlist
            </h1>
            {items.length > 0 && (
              <p className="mt-2 text-sm text-[#575757]">
                {items.length} {items.length === 1 ? "item" : "items"} saved for
                later
              </p>
            )}
          </div>
          {items.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-sm font-medium text-red-600 transition-colors hover:text-red-700"
            >
              Clear All
            </button>
          )}
        </motion.div>

        {items.length === 0 ? (
          /* Empty Wishlist State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-16 md:py-24"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6 rounded-full bg-gray-100 p-8"
            >
              <Heart className="h-16 w-16 text-gray-400 md:h-20 md:w-20" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-3 text-2xl font-bold text-[#161616] md:text-3xl"
            >
              Your wishlist is empty
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8 text-center text-base text-[#575757] md:text-lg"
            >
              Save items you love to find them easily later
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                href="/shop"
                className="flex items-center gap-2 rounded-full bg-[#2f2582] px-8 py-4 text-base font-semibold tracking-[2px] text-white uppercase transition-all hover:bg-[#241c66] hover:shadow-lg"
              >
                Browse Products
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item, index) => (
              <ShopProductCard
                key={item.productId}
                product={mapItemToProduct(item)}
                animationDelay={index * 50}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex justify-center"
          >
            <Link
              href="/shop"
              className="flex items-center gap-2 text-sm font-bold tracking-[1px] text-[#575757] uppercase transition-colors hover:text-[#2f2582]"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </motion.div>
        )}
      </div>

      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          clearWishlist();
          addToast("Wishlist cleared", "success", 2000);
        }}
        title="Clear Wishlist?"
        description="Are you sure you want to remove all items from your wishlist? This action cannot be undone."
        confirmText="Clear All"
        icon={AlertTriangle}
        variant="danger"
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </main>
  );
}
