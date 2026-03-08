"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  ComingSoonNotice,
  ConfirmModal,
} from "@/components/shared";
import { useCartStore } from "@/lib/store";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Tag,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { createPendingOrderAction } from "@/lib/actions/orders";
import { validateCouponAction } from "@/lib/actions/coupons";
import type { ValidatedCoupon } from "@/lib/actions/coupons";
import { getProfile } from "@/lib/actions/users";
import { useAuthStore } from "@/lib/store";
import { Loader } from "lucide-react";
import { useCommerceFeatures } from "@/components/providers";
import { trackBeginCheckout, trackPurchase } from "@/lib/analytics/gtag";

async function loadRazorpayScript() {
  if (typeof window === "undefined") return false;
  if (window.Razorpay) return true;

  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

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
  const [appliedPromo, setAppliedPromo] = useState<ValidatedCoupon | null>(
    null,
  );
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [hasAddress, setHasAddress] = useState<boolean | null>(null);
  const [userPhone, setUserPhone] = useState<string | undefined>(undefined);
  const { user } = useAuthStore();
  const {
    commerceFeaturesEnabled,
    comingSoonMessage,
    isLoading: isCommerceFeaturesLoading,
  } = useCommerceFeatures();

  // Check if user has address on mount
  useEffect(() => {
    async function checkAddress() {
      if (!user) {
        setHasAddress(null);
        return;
      }
      try {
        const result = await getProfile();
        if (result.success && result.data) {
          const profile = result.data;
          // Check if essential address fields are filled (trim to handle whitespace)
          const hasRequiredAddress = !!(
            profile.address_line1?.trim() &&
            profile.city?.trim() &&
            profile.country?.trim()
          );
          setHasAddress(hasRequiredAddress);
          if (profile.phone?.trim()) {
            setUserPhone(profile.phone.trim());
          }
        } else {
          setHasAddress(false);
        }
      } catch {
        setHasAddress(false);
      }
    }
    checkAddress();
  }, [user]);

  const totalItems = getTotalItems();
  const subtotal = getTotalPrice();
  const discount = appliedPromo ? appliedPromo.calculated_discount : 0;
  const shipping = totalItems > 0 ? (subtotal > 5000 ? 0 : 50) : 0;
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

  const handleCheckout = async () => {
    if (!user) {
      addToast("Please login to complete your purchase", "error", 3000);
      router.push("/login?redirect=/cart");
      return;
    }

    // Check if user has address
    if (!hasAddress) {
      addToast("Please add a shipping address before checkout", "error", 3000);
      router.push("/profile?tab=address");
      return;
    }

    setIsCheckingOut(true);
    let checkoutOpened = false;
    try {
      const orderData = {
        items: items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
        })),
        coupon_code: appliedPromo?.code,
      };

      const pendingOrderResult = await createPendingOrderAction(orderData);
      if (!pendingOrderResult.success || !pendingOrderResult.orderId) {
        addToast(
          pendingOrderResult.error || "Failed to create order",
          "error",
          3000,
        );
        setIsCheckingOut(false);
        return;
      }

      const checkoutItems = items.map((item) => ({
        item_id: item.productId,
        item_name: item.name,
        item_variant: item.variantName,
        price: item.price,
        quantity: item.quantity,
      }));

      trackBeginCheckout(
        checkoutItems,
        pendingOrderResult.pricing?.total ?? total,
      );

      const paymentOrderResponse = await fetch("/api/payments/razorpay/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: pendingOrderResult.orderId }),
      });

      const paymentOrderPayload = await paymentOrderResponse.json();
      if (!paymentOrderResponse.ok || !paymentOrderPayload.success) {
        addToast(
          paymentOrderPayload.error || "Failed to initiate payment",
          "error",
          3000,
        );
        setIsCheckingOut(false);
        return;
      }

      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded || !window.Razorpay) {
        addToast("Unable to load Razorpay checkout", "error", 3000);
        setIsCheckingOut(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: paymentOrderPayload.data.key,
        amount: paymentOrderPayload.data.amount,
        currency: paymentOrderPayload.data.currency,
        name: "Reliable Drapes",
        description: "Order payment",
        order_id: paymentOrderPayload.data.razorpayOrderId,
        timeout: 300,
        prefill: {
          name: user.full_name || undefined,
          email: user.email || undefined,
          contact: userPhone,
        },
        notes: {
          app_order_id: pendingOrderResult.orderId,
        },
        theme: {
          color: "#2f2582",
        },
        modal: {
          ondismiss: () => {
            setIsCheckingOut(false);
          },
        },
        handler: async (response) => {
          try {
            const verifyResponse = await fetch(
              "/api/payments/razorpay/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  orderId: pendingOrderResult.orderId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              },
            );

            const verifyPayload = await verifyResponse.json();
            if (!verifyResponse.ok || !verifyPayload.success) {
              addToast(
                verifyPayload.error || "Payment verification failed",
                "error",
                3000,
              );
              return;
            }

            trackPurchase({
              transactionId: pendingOrderResult.orderId,
              value: Number(
                verifyPayload.order?.total ??
                  pendingOrderResult.pricing?.total ??
                  total,
              ),
              items: checkoutItems,
            });

            clearCart();
            addToast("Payment successful! Order placed.", "success", 3000);
            router.push("/profile?tab=orders");
          } catch {
            addToast(
              "Payment completed but verification failed",
              "error",
              3000,
            );
          } finally {
            setIsCheckingOut(false);
          }
        },
      });

      razorpay.on("payment.failed", (failureResponse) => {
        addToast(
          failureResponse.error.description ||
            "Payment failed. Please try again.",
          "error",
          3000,
        );
        setIsCheckingOut(false);
      });

      razorpay.open();
      checkoutOpened = true;
    } catch {
      addToast("An unexpected error occurred", "error", 3000);
    } finally {
      // Keep the button disabled while checkout modal is open.
      if (!checkoutOpened) {
        setIsCheckingOut(false);
      }
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      addToast("Please enter a promo code", "error", 2000);
      return;
    }

    setIsApplyingPromo(true);
    try {
      const result = await validateCouponAction(promoCode, subtotal);
      if (result.success) {
        setAppliedPromo(result.data);
        setPromoCode("");
        const label =
          result.data.discount_type === "percentage"
            ? `${result.data.discount_value}% off`
            : `₹${result.data.discount_value} off`;
        addToast(`Coupon applied! ${label}`, "success", 3000);
      } else {
        addToast(result.error, "error", 2000);
      }
    } catch {
      addToast("Failed to validate coupon", "error", 2000);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    addToast("Coupon removed", "success", 2000);
  };

  if (isCommerceFeaturesLoading) {
    return (
      <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
        <Breadcrumb />
        <div className="flex items-center justify-center py-24">
          <Loader className="h-8 w-8 animate-spin text-[#2f2582]" />
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
            <h1 className="text-3xl font-bold text-[#161616] md:text-4xl">
              YOUR CART
            </h1>
            {items.length > 0 && (
              <p className="mt-2 text-sm text-[#575757]">
                {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
              </p>
            )}
          </div>
          {items.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setShowClearConfirm(true)}
              className="text-sm font-medium text-red-600 transition-colors hover:text-red-700"
            >
              Clear Cart
            </motion.button>
          )}
        </motion.div>

        {items.length === 0 ? (
          /* Empty Cart State */
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
              <ShoppingCart className="h-16 w-16 text-gray-400 md:h-20 md:w-20" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-3 text-2xl font-bold text-[#161616] md:text-3xl"
            >
              Your cart is empty
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8 text-center text-base text-[#575757] md:text-lg"
            >
              Looks like you haven&apos;t added anything to your cart yet
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
                <ShoppingCart className="h-5 w-5" />
                Continue Shopping
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-10">
            {/* Cart Items */}
            <div className="lg:col-span-3">
              <div className="space-y-5">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 100,
                    }}
                    whileHover={{ scale: 1.01 }}
                    className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
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
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
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
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
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
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-24 space-y-6"
              >
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
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
                          Discount
                          {appliedPromo.discount_type === "percentage"
                            ? ` (-${appliedPromo.discount_value}%)`
                            : ""}
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
                        <span className="text-base font-medium text-[#000000]">
                          Total
                        </span>
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
                        <Tag className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-[#00000066]" />
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Add promo code"
                          disabled={!!appliedPromo}
                          className="w-full rounded-full border border-[#00000010] bg-[#F0F0F0] py-3 pr-4 pl-11 text-sm text-[#000000] placeholder:text-[#00000066] focus:border-[#2f2582] focus:ring-2 focus:ring-[#2f2582]/20 focus:outline-none disabled:opacity-50"
                        />
                      </div>
                      <button
                        onClick={handleApplyPromo}
                        disabled={!!appliedPromo || isApplyingPromo}
                        className="shrink-0 rounded-full bg-[#2f2582] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#241c66] disabled:opacity-50 disabled:hover:bg-[#2f2582]"
                      >
                        {isApplyingPromo ? "..." : "Apply"}
                      </button>
                    </div>
                    {appliedPromo && (
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-green-600">
                          Coupon &quot;{appliedPromo.code}&quot; applied
                        </p>
                        <button
                          onClick={handleRemovePromo}
                          className="text-xs font-medium text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Address Warning */}
                  {user && hasAddress === false && (
                    <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">
                            Shipping address required
                          </p>
                          <p className="mt-1 text-xs text-yellow-700">
                            Please add your shipping address before you can
                            checkout.
                          </p>
                          <Link
                            href="/profile?tab=address"
                            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-yellow-800 underline hover:text-yellow-900"
                          >
                            Add Address <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  <motion.button
                    onClick={handleCheckout}
                    whileHover={{ scale: hasAddress === false ? 1 : 1.02 }}
                    whileTap={{ scale: hasAddress === false ? 1 : 0.98 }}
                    disabled={isCheckingOut || hasAddress === false}
                    className={`mt-6 flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-semibold text-white transition-all ${
                      hasAddress === false
                        ? "cursor-not-allowed bg-gray-300"
                        : "bg-[#2f2582] hover:bg-[#241c66] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                    }`}
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Go to Checkout
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </motion.button>

                  {/* Free Shipping Notice */}
                  {shipping > 0 && (
                    <p className="mt-4 text-center text-xs text-[#00000099]">
                      Add {formatPrice(5000 - subtotal)} more for free shipping
                    </p>
                  )}
                </div>

                {/* Continue Shopping Link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link
                    href="/shop"
                    className="flex items-center justify-center gap-2 text-sm font-medium text-[#000000] transition-colors hover:text-[#2f2582]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Continue Shopping
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearCart}
        title="Clear Cart?"
        description="Are you sure you want to remove all items from your cart? This action cannot be undone."
        confirmText="Clear Cart"
        icon={AlertTriangle}
        variant="danger"
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </main>
  );
}
