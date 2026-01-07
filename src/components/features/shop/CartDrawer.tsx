"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    getTotalItems,
    getTotalPrice,
  } = useCartStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-9998 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed top-0 right-0 z-9999 h-full w-full max-w-md bg-white shadow-2xl"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-6"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <ShoppingCart className="h-6 w-6 text-[#2f2582]" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold text-[#161616]">
                      Shopping Cart
                    </h2>
                    {items.length > 0 && (
                      <p className="text-xs text-[#575757]">
                        {totalItems} {totalItems === 1 ? "item" : "items"}
                      </p>
                    )}
                  </div>
                </div>
                <motion.button
                  onClick={closeCart}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="rounded-full p-2 text-[#575757] transition-colors hover:bg-gray-200"
                  aria-label="Close cart"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </motion.div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex h-full flex-col items-center justify-center gap-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.3,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="rounded-full bg-gray-100 p-6"
                    >
                      <ShoppingCart className="h-12 w-12 text-gray-400" />
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-lg font-medium text-[#161616]"
                    >
                      Your cart is empty
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-center text-sm text-[#575757]"
                    >
                      Add some products to get started
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Link
                        href="/shop"
                        onClick={closeCart}
                        className="mt-4 rounded-full bg-[#2f2582] px-6 py-3 text-sm font-medium tracking-[1.5px] text-white uppercase transition-all hover:bg-[#241c66] hover:shadow-lg"
                      >
                        Continue Shopping
                      </Link>
                    </motion.div>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{
                          delay: index * 0.05,
                          type: "spring",
                          stiffness: 100,
                        }}
                        whileHover={{ scale: 1.02 }}
                        className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                      >
                        {/* Image */}
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ShoppingCart className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex flex-1 flex-col gap-2">
                          <div>
                            <h4 className="line-clamp-1 text-lg font-bold text-[#161616]">
                              {item.name}
                            </h4>
                            {item.variantName && (
                              <p className="text-sm text-[#575757]">
                                {item.variantName}
                              </p>
                            )}
                            <p className="mt-1 text-base font-bold text-[#2f2582]">
                              {formatPrice(item.price)}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center rounded-lg border-2 border-[#e0e0e0]">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="px-2 py-1 text-[#575757] transition-colors hover:bg-gray-50"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="min-w-8 text-center text-sm font-medium text-[#161616]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="px-2 py-1 text-[#575757] transition-colors hover:bg-gray-50"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="border-t border-gray-200 bg-gray-50 p-6"
                >
                  {/* Subtotal */}
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-base font-medium text-[#575757]">
                      Subtotal ({totalItems}{" "}
                      {totalItems === 1 ? "item" : "items"})
                    </span>
                    <span className="text-xl font-bold text-[#161616]">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>

                  {/* Checkout Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href="/cart"
                      onClick={closeCart}
                      className="block w-full rounded-full bg-[#2f2582] px-6 py-4 text-center text-sm font-semibold tracking-[2px] text-white uppercase transition-all hover:bg-[#241c66] hover:shadow-lg"
                    >
                      View Cart & Checkout
                    </Link>
                  </motion.div>

                  {/* Continue Shopping */}
                  <motion.button
                    onClick={closeCart}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-3 w-full rounded-full border-2 border-gray-300 px-6 py-4 text-center text-sm font-semibold tracking-[2px] text-[#575757] uppercase transition-all hover:border-gray-400 hover:bg-white"
                  >
                    Continue Shopping
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
