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
    ArrowRight
} from "lucide-react";
import { getOrdersAction } from "@/lib/actions/orders";
import { Button } from "@/components/ui/button";

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
    order_items: OrderItem[];
}

export function OrdersSection() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

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
                    <div key={i} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm animate-pulse">
                        <div className="flex justify-between items-start mb-6">
                            <div className="space-y-2">
                                <div className="h-8 w-32 bg-gray-200 rounded-lg" />
                                <div className="h-4 w-48 bg-gray-100 rounded" />
                            </div>
                            <div className="h-10 w-24 bg-gray-100 rounded-full" />
                        </div>
                        <div className="h-32 bg-gray-50 rounded-2xl" />
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-3xl border border-red-100 bg-red-50/50 p-8 text-center text-red-600">
                <AlertCircle className="h-10 w-10 mx-auto mb-4 text-red-500" />
                <p className="font-medium text-lg">{error}</p>
                <Button
                    variant="outline"
                    className="mt-6 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
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
                <h3 className="mb-3 text-2xl font-bold text-[#161616]">No orders yet</h3>
                <p className="mb-8 text-gray-500 max-w-sm mx-auto">
                    You typically see your order history here once you've made your first purchase.
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
                        className={`group overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 ${expandedOrder === order.id
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
                                <div className="flex items-start gap-4 flex-1">
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
                                        <h3 className="font-semibold text-[#161616] text-lg">
                                            Order #{order.id.slice(0, 8)}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {order.order_items.length} {order.order_items.length === 1 ? 'Item' : 'Items'} • {format(new Date(order.created_at), "MMM d, yyyy")}
                                        </p>
                                    </div>
                                </div>

                                {/* Status & Action */}
                                <div className="flex items-center justify-between gap-6 lg:justify-end">
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Amount</span>
                                        <span className="text-xl font-bold text-[#161616]">{formatPrice(order.total)}</span>
                                    </div>

                                    <div className={`px-4 py-2 rounded-full border flex items-center gap-2 text-sm font-semibold tracking-wide ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        <span className="capitalize">{order.status}</span>
                                    </div>

                                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${expandedOrder === order.id ? "rotate-180" : ""}`} />
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
                                        <h4 className="font-semibold text-[#161616] mb-4 text-sm uppercase tracking-wider">Items in this order</h4>
                                        <div className="grid gap-4">
                                            {order.order_items.map((item) => (
                                                <div key={item.id} className="flex items-center gap-4 rounded-2xl bg-white p-4 border border-gray-100">
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
                                                    <div className="flex-1 min-w-0">
                                                        <h5 className="font-medium text-[#161616] text-base truncate pr-4">
                                                            {item.product?.name || "Unknown Product"}
                                                        </h5>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Qty: {item.quantity} × {formatPrice(item.price_snapshot || 0)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right font-semibold text-[#161616]">
                                                        {formatPrice((item.price_snapshot || 0) * item.quantity)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-gray-100/50">
                                            <Button variant="outline" className="rounded-xl border-gray-200">
                                                Download Invoice
                                            </Button>
                                            <Button className="rounded-xl bg-[#2f2582] text-white hover:bg-[#241c66]">
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
        </div>
    );
}
