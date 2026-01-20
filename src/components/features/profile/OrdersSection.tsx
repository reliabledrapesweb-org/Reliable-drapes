"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  Package,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  ChevronDown,
  ShoppingBag,
  ArrowRight,
  ExternalLink,
  X,
  MapPin,
  Calendar,
  FileText,
} from "lucide-react";
import { getOrdersAction } from "@/lib/actions/orders";
import { Button } from "@/components/ui/button";
import { useToast, ToastContainer } from "@/components/ui/Toast";

interface OrderItem {
  id: string;
  quantity: number;
  product_id: string;
  price_snapshot: number | null;
  product?: {
    name: string;
    image_url: string | null;
  };
}

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  tracking_number?: string;
  tracking_url?: string;
  expected_delivery_date?: string;
  current_location?: string;
  invoice_url?: string;
  order_items: OrderItem[];
}

export function OrdersSection() {
  const { toasts, addToast, removeToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const result = await getOrdersAction();
        if (result.success) {
          // Cast purely because we know the join structure matches our interface
          setOrders((result.orders as unknown as Order[]) || []);
        } else {
          setError((result as any).error || "Failed to fetch orders");
        }
      } catch (err) {
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const toggleOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-50 text-green-700 border-green-200 ring-green-500/10";
      case "shipped":
        return "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10";
      case "processing":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 ring-yellow-500/10";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200 ring-red-500/10";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 ring-gray-500/10";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "processing":
        return <Clock className="h-4 w-4" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-6 flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-8 w-32 rounded-lg bg-gray-200" />
                <div className="h-4 w-48 rounded bg-gray-100" />
              </div>
              <div className="h-10 w-24 rounded-full bg-gray-100" />
            </div>
            <div className="h-32 rounded-2xl bg-gray-50" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50/50 p-8 text-center text-red-600">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
        <p className="text-lg font-medium">{error}</p>
        <Button
          variant="outline"
          className="mt-6 border-red-200 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white py-24 text-center shadow-sm">
        <div className="mb-6 rounded-full bg-[#2f2582]/5 p-8">
          <ShoppingBag className="h-12 w-12 text-[#2f2582]" />
        </div>
        <h3 className="mb-3 text-2xl font-bold text-[#161616]">
          No orders yet
        </h3>
        <p className="mx-auto mb-8 max-w-sm text-gray-500">
          You typically see your order history here once you've made your first
          purchase.
        </p>
        <Link
          href="/shop"
          className="flex items-center gap-2 rounded-full bg-[#2f2582] px-8 py-4 text-base font-semibold tracking-[2px] text-white uppercase transition-all hover:bg-[#241c66] hover:shadow-lg"
        >
          Browse Products
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2 border-b border-gray-100 pb-4 sm:flex-row sm:items-end sm:justify-between sm:pb-6"
      >
        <div>
          <h2 className="text-xl font-bold text-[#161616] sm:text-2xl lg:text-3xl">
            Order History
          </h2>
          <p className="mt-1 text-sm text-gray-500 sm:mt-2 sm:text-base">
            View details and track your recent purchases
          </p>
        </div>
      </motion.div>

      <div className="grid gap-6">
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`group overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 ${
              expandedOrder === order.id
                ? "border-[#2f2582]/20 shadow-lg ring-1 ring-[#2f2582]/10"
                : "border-gray-100 hover:border-gray-200 hover:shadow-md"
            }`}
          >
            {/* Order Card Header (Always Visible) */}
            <div
              onClick={() => toggleOrder(order.id)}
              className="relative cursor-pointer p-4 sm:p-6 lg:p-8"
            >
              <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
                {/* Visual Order Snapshot */}
                <div className="flex flex-1 items-start gap-3 sm:gap-4">
                  <div className="flex -space-x-3 overflow-hidden py-1 sm:-space-x-4">
                    {order.order_items.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 border-white bg-gray-50 shadow-sm sm:h-16 sm:w-16 sm:rounded-xl"
                      >
                        {item.product?.image_url ? (
                          <Image
                            src={item.product.image_url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-100">
                            <Package className="h-4 w-4 text-gray-400 sm:h-6 sm:w-6" />
                          </div>
                        )}
                      </div>
                    ))}
                    {order.order_items.length > 3 && (
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 border-white bg-gray-100 text-xs font-bold text-gray-500 shadow-sm sm:h-16 sm:w-16 sm:rounded-xl">
                        +{order.order_items.length - 3}
                      </div>
                    )}
                  </div>

                  <div className="ml-1 min-w-0 sm:ml-2">
                    <h3 className="truncate text-base font-semibold text-[#161616] sm:text-lg">
                      Order #{order.id.slice(0, 8)}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500 sm:mt-1 sm:text-sm">
                      {order.order_items.length}{" "}
                      {order.order_items.length === 1 ? "Item" : "Items"} •{" "}
                      {format(new Date(order.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                {/* Status & Action */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:justify-end lg:gap-6">
                  <div className="flex flex-col items-start gap-0.5 sm:items-end sm:gap-1">
                    <span className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase sm:text-xs">
                      Total Amount
                    </span>
                    <span className="text-lg font-bold text-[#161616] sm:text-xl">
                      {formatPrice(order.total)}
                    </span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide sm:gap-2 sm:px-4 sm:py-2 sm:text-sm ${getStatusColor(order.status)}`}
                  >
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status}</span>
                  </div>

                  <ChevronDown
                    className={`ml-auto h-4 w-4 text-gray-400 transition-transform duration-300 sm:h-5 sm:w-5 lg:ml-0 ${expandedOrder === order.id ? "rotate-180" : ""}`}
                  />
                </div>
              </div>
            </div>

            {/* Expanded Details Section */}
            <AnimatePresence>
              {expandedOrder === order.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-gray-50/50"
                >
                  <div className="border-t border-gray-100 p-4 sm:p-6 lg:p-8">
                    <h4 className="mb-3 text-xs font-semibold tracking-wider text-[#161616] uppercase sm:mb-4 sm:text-sm">
                      Items in this order
                    </h4>
                    <div className="grid gap-3 sm:gap-4">
                      {order.order_items.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-3 sm:flex-row sm:items-center sm:gap-4 sm:rounded-2xl sm:p-4"
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-20 sm:w-20 sm:rounded-xl">
                              {item.product?.image_url ? (
                                <Image
                                  src={item.product.image_url}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-300 sm:h-8 sm:w-8" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1 sm:hidden">
                              <h5 className="truncate text-sm font-medium text-[#161616]">
                                {item.product?.name || "Unknown Product"}
                              </h5>
                              <p className="mt-0.5 text-xs text-gray-500">
                                Qty: {item.quantity} ×{" "}
                                {formatPrice(item.price_snapshot || 0)}
                              </p>
                            </div>
                            <div className="text-sm font-semibold text-[#161616] sm:hidden">
                              {formatPrice(
                                (item.price_snapshot || 0) * item.quantity,
                              )}
                            </div>
                          </div>
                          <div className="hidden min-w-0 flex-1 sm:block">
                            <h5 className="truncate pr-4 text-base font-medium text-[#161616]">
                              {item.product?.name || "Unknown Product"}
                            </h5>
                            <p className="mt-1 text-sm text-gray-500">
                              Qty: {item.quantity} ×{" "}
                              {formatPrice(item.price_snapshot || 0)}
                            </p>
                          </div>
                          <div className="hidden text-right font-semibold text-[#161616] sm:block">
                            {formatPrice(
                              (item.price_snapshot || 0) * item.quantity,
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 border-t border-gray-100/50 pt-4 sm:mt-8 sm:flex-row sm:justify-end sm:gap-4 sm:pt-6">
                      <Button
                        variant="outline"
                        className="w-full rounded-xl border-gray-200 text-sm sm:w-auto sm:text-base"
                        onClick={() => {
                          if (order.invoice_url) {
                            window.open(order.invoice_url, "_blank");
                          } else {
                            addToast(
                              "Invoice not yet available for this order.",
                              "info",
                            );
                          }
                        }}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Download Invoice
                      </Button>
                      <Button
                        className="w-full rounded-xl bg-[#2f2582] text-sm text-white hover:bg-[#241c66] sm:w-auto sm:text-base"
                        onClick={() => setTrackingOrder(order)}
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        Track Package
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Tracking Modal */}
      <AnimatePresence>
        {trackingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTrackingOrder(null)}
              className="absolute inset-0 bg-[#161616]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-hidden overflow-y-auto rounded-2xl bg-white shadow-2xl sm:rounded-[2.5rem]"
            >
              {/* Modal Header */}
              <div className="relative border-b border-gray-100 p-4 pb-4 sm:p-6 sm:pb-6 lg:p-8">
                <h3 className="pr-10 text-lg font-bold text-[#161616] sm:text-xl lg:text-2xl">
                  Track Order #{trackingOrder.id.slice(0, 8)}
                </h3>
                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                  Real-time status of your shipment
                </p>
                <button
                  onClick={() => setTrackingOrder(null)}
                  className="absolute top-3 right-3 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#161616] sm:top-6 sm:right-6 sm:p-2"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              <div className="p-4 sm:p-6 lg:p-8">
                {/* Visual Progress Bar */}
                <div className="relative mb-6 sm:mb-10">
                  <div className="absolute top-4 left-0 h-1 w-full rounded-full bg-gray-100 sm:top-5 sm:h-1.5" />
                  <div
                    className="absolute top-4 left-0 h-1 rounded-full bg-[#2f2582] transition-all duration-1000 sm:top-5 sm:h-1.5"
                    style={{
                      width:
                        trackingOrder.status === "delivered"
                          ? "100%"
                          : trackingOrder.status === "shipped"
                            ? "66%"
                            : trackingOrder.status === "processing"
                              ? "33%"
                              : "5%",
                    }}
                  />
                  <div className="relative flex justify-between">
                    {[
                      { label: "Pending", icon: Package, status: "pending" },
                      {
                        label: "Processing",
                        icon: Clock,
                        status: "processing",
                      },
                      { label: "Shipped", icon: Truck, status: "shipped" },
                      {
                        label: "Delivered",
                        icon: CheckCircle,
                        status: "delivered",
                      },
                    ].map((step, i) => {
                      const isActive =
                        [
                          "pending",
                          "processing",
                          "shipped",
                          "delivered",
                        ].indexOf(trackingOrder.status.toLowerCase()) >= i;

                      return (
                        <div
                          key={i}
                          className="flex flex-col items-center gap-1.5 sm:gap-3"
                        >
                          <div
                            className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-sm transition-all duration-300 sm:h-10 sm:w-10 sm:border-4 ${isActive ? "bg-[#2f2582] text-white" : "bg-gray-200 text-gray-400"}`}
                          >
                            <step.icon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                          </div>
                          <span
                            className={`text-center text-[9px] leading-tight font-bold tracking-tight uppercase sm:text-xs ${isActive ? "text-[#2f2582]" : "text-gray-400"}`}
                          >
                            <span className="hidden sm:inline">
                              {step.label}
                            </span>
                            <span className="sm:hidden">
                              {step.label.slice(0, 4)}
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tracking Details */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-gray-50/80 p-4 sm:grid-cols-2 sm:gap-6 sm:rounded-3xl sm:p-6">
                    <div className="space-y-0.5 sm:space-y-1">
                      <span className="text-[9px] font-bold tracking-[1px] text-gray-400 uppercase sm:text-[10px]">
                        Tracking Number
                      </span>
                      <p className="flex items-center gap-2 text-sm font-bold text-[#161616] sm:text-base">
                        {trackingOrder.tracking_number || "Awaiting Number"}
                        {trackingOrder.tracking_url && (
                          <a
                            href={trackingOrder.tracking_url}
                            target="_blank"
                            className="text-[#2f2582] hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </p>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      <span className="text-[9px] font-bold tracking-[1px] text-gray-400 uppercase sm:text-[10px]">
                        Expected Delivery
                      </span>
                      <p className="flex items-center gap-1.5 text-sm font-bold text-[#161616] sm:text-base">
                        <Calendar className="h-3 w-3 text-[#2f2582] sm:h-3.5 sm:w-3.5" />
                        {trackingOrder.expected_delivery_date
                          ? format(
                              new Date(trackingOrder.expected_delivery_date),
                              "MMM d, yyyy",
                            )
                          : "Calculating..."}
                      </p>
                    </div>
                    <div className="space-y-0.5 sm:col-span-2 sm:space-y-1">
                      <span className="text-[9px] font-bold tracking-[1px] text-gray-400 uppercase sm:text-[10px]">
                        Current Location
                      </span>
                      <p className="flex items-center gap-1.5 text-sm font-bold text-[#161616] sm:text-base">
                        <MapPin className="h-3 w-3 text-[#2f2582] sm:h-3.5 sm:w-3.5" />
                        {trackingOrder.current_location ||
                          "Processing at Warehouse"}
                      </p>
                    </div>
                  </div>

                  {!trackingOrder.tracking_number && (
                    <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3 sm:items-center sm:gap-3 sm:rounded-2xl sm:p-4">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 sm:mt-0 sm:h-5 sm:w-5" />
                      <p className="text-[11px] font-medium text-amber-700 sm:text-xs">
                        Shipment details are usually updated within 24-48 hours
                        after processing.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 p-4 sm:flex-row sm:gap-4 sm:p-6 lg:p-8">
                <Button
                  className="order-2 w-full rounded-xl border-gray-200 bg-white text-sm text-[#161616] hover:bg-gray-100 sm:order-1 sm:flex-1 sm:rounded-2xl sm:text-base"
                  variant="outline"
                  onClick={() => setTrackingOrder(null)}
                >
                  Close
                </Button>
                {trackingOrder.tracking_url && (
                  <Button
                    className="order-1 w-full rounded-xl bg-[#2f2582] text-sm text-white shadow-lg shadow-[#2f2582]/20 hover:bg-[#241c66] sm:order-2 sm:flex-1 sm:rounded-2xl sm:text-base"
                    onClick={() =>
                      window.open(trackingOrder.tracking_url, "_blank")
                    }
                  >
                    Track on Website
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
