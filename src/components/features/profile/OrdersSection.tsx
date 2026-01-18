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
        className="flex items-end justify-between border-b border-gray-100 pb-6"
      >
        <div>
          <h2 className="text-3xl font-bold text-[#161616]">Order History</h2>
          <p className="mt-2 text-base text-gray-500">
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
              className="relative cursor-pointer p-6 sm:p-8"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                {/* Visual Order Snapshot */}
                <div className="flex flex-1 items-start gap-4">
                  <div className="flex -space-x-4 overflow-hidden py-1">
                    {order.order_items.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-white bg-gray-50 shadow-sm"
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
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    ))}
                    {order.order_items.length > 3 && (
                      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-white bg-gray-100 text-xs font-bold text-gray-500 shadow-sm">
                        +{order.order_items.length - 3}
                      </div>
                    )}
                  </div>

                  <div className="ml-2">
                    <h3 className="text-lg font-semibold text-[#161616]">
                      Order #{order.id.slice(0, 8)}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {order.order_items.length}{" "}
                      {order.order_items.length === 1 ? "Item" : "Items"} •{" "}
                      {format(new Date(order.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                {/* Status & Action */}
                <div className="flex items-center justify-between gap-6 lg:justify-end">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                      Total Amount
                    </span>
                    <span className="text-xl font-bold text-[#161616]">
                      {formatPrice(order.total)}
                    </span>
                  </div>

                  <div
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold tracking-wide ${getStatusColor(order.status)}`}
                  >
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status}</span>
                  </div>

                  <ChevronDown
                    className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${expandedOrder === order.id ? "rotate-180" : ""}`}
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
                  <div className="border-t border-gray-100 p-6 sm:p-8">
                    <h4 className="mb-4 text-sm font-semibold tracking-wider text-[#161616] uppercase">
                      Items in this order
                    </h4>
                    <div className="grid gap-4">
                      {order.order_items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4"
                        >
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                            {item.product?.image_url ? (
                              <Image
                                src={item.product.image_url}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package className="h-8 w-8 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="truncate pr-4 text-base font-medium text-[#161616]">
                              {item.product?.name || "Unknown Product"}
                            </h5>
                            <p className="mt-1 text-sm text-gray-500">
                              Qty: {item.quantity} ×{" "}
                              {formatPrice(item.price_snapshot || 0)}
                            </p>
                          </div>
                          <div className="text-right font-semibold text-[#161616]">
                            {formatPrice(
                              (item.price_snapshot || 0) * item.quantity,
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 flex justify-end gap-4 border-t border-gray-100/50 pt-6">
                      <Button
                        variant="outline"
                        className="rounded-xl border-gray-200"
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
                        className="rounded-xl bg-[#2f2582] text-white hover:bg-[#241c66]"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
              className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
            >
              {/* Modal Header */}
              <div className="relative border-b border-gray-100 p-8 pb-6">
                <h3 className="text-2xl font-bold text-[#161616]">
                  Track Order #{trackingOrder.id.slice(0, 8)}
                </h3>
                <p className="mt-1 text-gray-500">
                  Real-time status of your shipment
                </p>
                <button
                  onClick={() => setTrackingOrder(null)}
                  className="absolute top-6 right-6 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#161616]"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-8">
                {/* Visual Progress Bar */}
                <div className="relative mb-10">
                  <div className="absolute top-1/2 left-0 h-1.5 w-full -translate-y-1/2 rounded-full bg-gray-100" />
                  <div
                    className="absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full bg-[#2f2582] transition-all duration-1000"
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
                          className="flex flex-col items-center gap-3"
                        >
                          <div
                            className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white shadow-sm transition-all duration-300 ${isActive ? "bg-[#2f2582] text-white" : "bg-gray-200 text-gray-400"}`}
                          >
                            <step.icon className="h-5 w-5" />
                          </div>
                          <span
                            className={`text-xs font-bold tracking-tight uppercase ${isActive ? "text-[#2f2582]" : "text-gray-400"}`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tracking Details */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6 rounded-3xl border border-gray-100 bg-gray-50/80 p-6">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold tracking-[1px] text-gray-400 uppercase">
                        Tracking Number
                      </span>
                      <p className="flex items-center gap-2 font-bold text-[#161616]">
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
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold tracking-[1px] text-gray-400 uppercase">
                        Expected Delivery
                      </span>
                      <p className="flex items-center gap-1.5 font-bold text-[#161616]">
                        <Calendar className="h-3.5 w-3.5 text-[#2f2582]" />
                        {trackingOrder.expected_delivery_date
                          ? format(
                              new Date(trackingOrder.expected_delivery_date),
                              "MMM d, yyyy",
                            )
                          : "Calculating..."}
                      </p>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <span className="text-[10px] font-bold tracking-[1px] text-gray-400 uppercase">
                        Current Location
                      </span>
                      <p className="flex items-center gap-1.5 font-bold text-[#161616]">
                        <MapPin className="h-3.5 w-3.5 text-[#2f2582]" />
                        {trackingOrder.current_location ||
                          "Processing at Warehouse"}
                      </p>
                    </div>
                  </div>

                  {!trackingOrder.tracking_number && (
                    <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                      <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                      <p className="text-xs font-medium text-amber-700">
                        Shipment details are usually updated within 24-48 hours
                        after processing.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 border-t border-gray-100 bg-gray-50 p-8">
                <Button
                  className="flex-1 rounded-2xl border-gray-200 bg-white text-[#161616] hover:bg-gray-100"
                  variant="outline"
                  onClick={() => setTrackingOrder(null)}
                >
                  Close
                </Button>
                {trackingOrder.tracking_url && (
                  <Button
                    className="flex-1 rounded-2xl bg-[#2f2582] text-white shadow-lg shadow-[#2f2582]/20 hover:bg-[#241c66]"
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
