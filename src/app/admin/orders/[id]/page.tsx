"use client";

import { useEffect, useState } from "react";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  MapPin,
  User,
  Mail,
  Phone,
  Package,
  CreditCard,
  Truck,
  Calendar,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import {
  getOrderByIdAction,
  updateOrderStatusAction,
} from "@/lib/actions/orders";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/lib/store";

interface OrderDetail {
  id: string;
  created_at: string;
  status: string;
  total: number;
  user_id: string;
  user: {
    full_name: string;
    email: string;
    phone: string;
    address_line1: string;
    city: string;
    country: string;
  };
  order_items: Array<{
    id: string;
    quantity: number;
    price_snapshot: number;
    product: {
      name: string;
      image_url: string;
      price: number;
    };
  }>;
}

const statusOptions = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      if (!params.id) return;
      try {
        const result = await getOrderByIdAction(params.id as string);
        if (result.success && result.order) {
          setOrder(result.order);
        } else {
          addToast(result.error || "Failed to fetch order", "error");
        }
      } catch (error) {
        console.error("Fetch order error", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrder();
  }, [params.id]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const result = await updateOrderStatusAction(order.id, newStatus);
      if (result.success) {
        setOrder({ ...order, status: newStatus });
        addToast(`Order status updated to ${newStatus}`, "success");
      } else {
        addToast(result.error || "Failed to update status", "error");
      }
    } catch (error) {
      addToast("An unexpected error occurred", "error");
    } finally {
      setIsUpdating(false);
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
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2f2582] border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-yellow-500" />
        <h2 className="text-xl font-bold text-gray-900">Order Not Found</h2>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.back()}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.id.slice(0, 8)}
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase ${
                  order.status === "delivered"
                    ? "bg-green-100 text-green-700"
                    : order.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                }`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Placed on {format(new Date(order.created_at), "PPP p")}
            </p>
          </div>
        </div>

                <div className="flex items-center gap-3">
                    {/* Status Changer */}
                    <Select 
                        value={order.status} 
                        onValueChange={handleStatusUpdate}
                        disabled={isUpdating}
                    >
                        <SelectTrigger className="w-[180px] bg-white">
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map(option => (
                                <SelectItem key={option} value={option}>
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Order Items */}
        <div className="space-y-6 lg:col-span-2">
          {/* Items Card */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="font-semibold text-gray-900">Order Items</h3>
            </div>
            <div className="divide-y divide-gray-100 p-6">
              {order.order_items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
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
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-gray-900">
                        {item.product?.name || "Unknown Product"}
                      </h4>
                      <p className="font-medium text-gray-900">
                        {formatPrice(
                          item.price_snapshot || item.product?.price || 0,
                        )}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-b-xl border-t border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <span>Total Amount</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Customer Info */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="font-semibold text-gray-900">Customer Details</h3>
            </div>
            <div className="space-y-6 p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-gray-100 p-2">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.user?.full_name || "Guest"}
                  </p>
                  <p className="text-xs text-gray-500">Customer</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-gray-100 p-2">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.user?.email}
                  </p>
                  <p className="text-xs text-gray-500">Email</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-gray-100 p-2">
                  <Phone className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.user?.phone || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">Phone</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="font-semibold text-gray-900">Shipping Address</h3>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-gray-100 p-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                </div>
                <div className="text-sm text-gray-600">
                  <p className="mb-1 font-medium text-gray-900">
                    Delivery Location
                  </p>
                  {order.user?.address_line1 || order.user?.city ? (
                    <>
                      <p>{order.user.address_line1}</p>
                      <p>
                        {order.user.city}, {order.user.country}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-400 italic">No address provided</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
