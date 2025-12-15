"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/shared";
import { useCartStore } from "@/lib/store";
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
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

  const totalItems = getTotalItems();
  const subtotal = getTotalPrice();
  const shipping = totalItems > 0 ? 0 : 0; // Free shipping for now
  const tax = subtotal * 0.18; // 18% GST (India)
  const total = subtotal + shipping + tax;

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

  const fallbackImage = "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop&crop=center";

  return (
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
      <Breadcrumb />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl font-bold text-[#161616] md:text-4xl lg:text-5xl">
            Shopping Cart
          </h1>
          <p className="mt-2 text-base text-[#575757] md:text-lg">
            {totalItems === 0
              ? "Your cart is empty"
              : `${totalItems} ${totalItems === 1 ? "item" : "items"} in your cart`}
          </p>
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
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#161616] md:text-2xl">
                  Cart Items
                </h2>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="text-sm font-medium text-red-600 transition-colors hover:text-red-700 hover:underline"
                >
                  Clear Cart
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-4 rounded-xl border-2 border-[#e0e0e0] p-4 transition-all hover:border-[#d0d0d0] md:gap-6 md:p-6"
                  >
                    {/* Product Image */}
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 md:h-32 md:w-32">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 96px, 128px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingCart className="h-10 w-10 text-gray-400 md:h-12 md:w-12" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="text-base font-bold text-[#161616] md:text-lg">
                          {item.name}
                        </h3>
                        {item.variantName && (
                          <p className="mt-1 text-sm text-[#575757]">
                            Variant: {item.variantName}
                          </p>
                        )}
                        <p className="mt-2 text-lg font-bold text-[#2f2582] md:text-xl">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {/* Quantity and Actions */}
                      <div className="mt-4 flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center rounded-lg border-2 border-[#e0e0e0]">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-2 text-[#575757] transition-colors hover:bg-gray-50 md:px-4"
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="min-w-[3rem] text-center text-base font-semibold text-[#161616]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-2 text-[#575757] transition-colors hover:bg-gray-50 md:px-4"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id, item.name)}
                          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden md:inline">Remove</span>
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="mt-3 text-right">
                        <p className="text-sm text-[#575757]">Subtotal:</p>
                        <p className="text-lg font-bold text-[#161616] md:text-xl">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Continue Shopping */}
              <Link
                href="/shop"
                className="mt-6 flex items-center gap-2 text-sm font-medium text-[#2f2582] transition-colors hover:text-[#241c66] hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl border-2 border-[#e0e0e0] bg-gray-50 p-6">
                <h2 className="mb-6 text-xl font-bold text-[#161616] md:text-2xl">
                  Order Summary
                </h2>

                <div className="space-y-4 border-b border-[#d0d0d0] pb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-base text-[#575757]">
                      Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
                    </span>
                    <span className="text-base font-semibold text-[#161616]">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-base text-[#575757]">Shipping</span>
                    <span className="text-base font-semibold text-green-600">
                      {shipping === 0 ? "FREE" : formatPrice(shipping)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-base text-[#575757]">Tax (7.5%)</span>
                    <span className="text-base font-semibold text-[#161616]">
                      {formatPrice(tax)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-lg font-bold text-[#161616]">Total</span>
                  <span className="text-2xl font-bold text-[#2f2582]">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#2f2582] px-6 py-4 text-base font-semibold tracking-[2px] text-white uppercase transition-all hover:bg-[#241c66] hover:shadow-lg"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-5 w-5" />
                </button>

                {/* Payment Methods */}
                <div className="mt-6 text-center">
                  <p className="mb-3 text-xs text-[#898989] uppercase tracking-wider">
                    We Accept
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex h-8 w-12 items-center justify-center rounded bg-white text-[10px] font-bold text-gray-600 shadow">
                      VISA
                    </div>
                    <div className="flex h-8 w-12 items-center justify-center rounded bg-white text-[10px] font-bold text-gray-600 shadow">
                      MC
                    </div>
                    <div className="flex h-8 w-12 items-center justify-center rounded bg-white text-[10px] font-bold text-gray-600 shadow">
                      VERVE
                    </div>
                  </div>
                </div>

                {/* Security Note */}
                <p className="mt-6 text-center text-xs text-[#898989]">
                  Your payment information is processed securely. We do not store credit card details.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
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
