"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/shared";
import { useCartStore } from "@/lib/store";
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft, ArrowRight, Tag, ChevronRight } from "lucide-react";
import { useToast, ToastContainer } from "@/components/ui/Toast";

export default function CartPage() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCartStore();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);

  const totalItems = getTotalItems();
  const subtotal = getTotalPrice();
  const discount = appliedPromo ? subtotal * (appliedPromo.discount / 100) : 0;
  const shipping = totalItems > 0 ? (subtotal > 5000 ? 0 : 50) : 0; // Free shipping over ₹5000
  const total = subtotal - discount + shipping;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleRemoveItem = (itemId: string, itemName: string) => {
    removeItem(itemId);
    addToast(`${itemName} removed from cart`, "success", 2000);
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
    addToast("Cart cleared successfully", "success", 2000);
  };

  const handleCheckout = () => {
    // TODO: Implement checkout flow
    addToast("Checkout functionality coming soon!", "info", 3000);
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      addToast("Please enter a promo code", "error", 2000);
      return;
    }

    // Mock promo codes for demo
    const promoCodes: Record<string, number> = {
      "SAVE10": 10,
      "SAVE20": 20,
      "WELCOME": 15,
    };

    const discount = promoCodes[promoCode.toUpperCase()];
    if (discount) {
      setAppliedPromo({ code: promoCode.toUpperCase(), discount });
      addToast(`Promo code applied! ${discount}% off`, "success", 3000);
    } else {
      addToast("Invalid promo code", "error", 2000);
    }
  };

  const fallbackImage = "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop&crop=center";

  return (
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
      <Breadcrumb />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#161616] md:text-4xl">
            YOUR CART
          </h1>
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="flex flex-col items-center justify-center py-16 md:py-24">
            <div className="mb-6 rounded-full bg-gray-100 p-8">
              <ShoppingCart className="h-16 w-16 text-gray-400 md:h-20 md:w-20" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-[#161616] md:text-3xl">
              Your cart is empty
            </h2>
            <p className="mb-8 text-center text-base text-[#575757] md:text-lg">
              Looks like you haven't added anything to your cart yet
            </p>
            <Link
              href="/shop"
              className="flex items-center gap-2 rounded-full bg-[#2f2582] px-8 py-4 text-base font-semibold tracking-[2px] text-white uppercase transition-all hover:bg-[#241c66] hover:shadow-lg"
            >
              <ShoppingCart className="h-5 w-5" />
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-10">
            {/* Cart Items */}
            <div className="lg:col-span-3">
              <div className="space-y-5">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-4 rounded-2xl bg-[#F0F0F0] p-5 transition-all hover:bg-[#E8E8E8]"
                  >
                    {/* Product Image */}
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-white">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingCart className="h-10 w-10 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-[#000000]">
                            {item.name}
                          </h3>
                          {item.variantName && (
                            <p className="mt-1 text-sm text-[#00000099]">
                              Size: {item.variantName}
                            </p>
                          )}
                          <p className="mt-1 text-sm text-[#00000099]">
                            Color: {item.variantName || "Default"}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id, item.name)}
                          className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-bold text-[#000000]">
                          {formatPrice(item.price)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4 rounded-full bg-[#F0F0F0] px-5 py-2.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-[#000000] transition-opacity hover:opacity-70 disabled:opacity-30"
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="min-w-6 text-center text-sm font-medium text-[#000000]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-[#000000] transition-opacity hover:opacity-70"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 space-y-6">
                <div className="rounded-2xl border border-[#00000010] bg-white p-6">
                  <h2 className="mb-6 text-xl font-bold text-[#000000]">
                    Order Summary
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-base">
                      <span className="text-[#00000099]">Subtotal</span>
                      <span className="font-semibold text-[#000000]">
                        {formatPrice(subtotal)}
                      </span>
                    </div>

                    {appliedPromo && (
                      <div className="flex items-center justify-between text-base">
                        <span className="text-[#00000099]">
                          Discount (-{appliedPromo.discount}%)
                        </span>
                        <span className="font-semibold text-red-600">
                          -{formatPrice(discount)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-base">
                      <span className="text-[#00000099]">Delivery Fee</span>
                      <span className="font-semibold text-[#000000]">
                        {shipping === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          formatPrice(shipping)
                        )}
                      </span>
                    </div>

                    <div className="border-t border-[#00000010] pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-medium text-[#000000]">Total</span>
                        <span className="text-2xl font-bold text-[#000000]">
                          {formatPrice(total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div className="mt-6">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#00000066]" />
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Add promo code"
                          disabled={!!appliedPromo}
                          className="w-full rounded-full border border-[#00000010] bg-[#F0F0F0] py-3 pl-11 pr-4 text-sm text-[#000000] placeholder:text-[#00000066] focus:border-[#2f2582] focus:outline-none focus:ring-2 focus:ring-[#2f2582]/20 disabled:opacity-50"
                        />
                      </div>
                      <button
                        onClick={handleApplyPromo}
                        disabled={!!appliedPromo}
                        className="shrink-0 rounded-full bg-[#2f2582] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#241c66] disabled:opacity-50 disabled:hover:bg-[#2f2582]"
                      >
                        Apply
                      </button>
                    </div>
                    {appliedPromo && (
                      <p className="mt-2 text-xs text-green-600">
                        ✓ Promo code "{appliedPromo.code}" applied
                      </p>
                    )}
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#2f2582] px-6 py-4 text-base font-semibold text-white transition-all hover:bg-[#241c66] hover:shadow-lg"
                  >
                    Go to Checkout
                    <ArrowRight className="h-5 w-5" />
                  </button>

                  {/* Free Shipping Notice */}
                  {shipping > 0 && (
                    <p className="mt-4 text-center text-xs text-[#00000099]">
                      Add {formatPrice(5000 - subtotal)} more for free shipping
                    </p>
                  )}
                </div>

                {/* Continue Shopping Link */}
                <Link
                  href="/shop"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-[#000000] transition-colors hover:text-[#2f2582]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h3 className="mb-4 text-xl font-bold text-[#161616]">
              Clear Cart?
            </h3>
            <p className="mb-6 text-base text-[#575757]">
              Are you sure you want to remove all items from your cart? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 rounded-lg border-2 border-[#e0e0e0] px-4 py-3 text-sm font-semibold text-[#575757] transition-all hover:border-[#d0d0d0] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCart}
                className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-red-700 hover:shadow-lg"
              >
                Clear Cart
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </main>
  );
}
