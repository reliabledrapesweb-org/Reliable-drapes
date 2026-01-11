"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
    Package,
    Search,
    Eye,
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle,
    Truck,
    AlertCircle,
    ShoppingBag,
} from "lucide-react";
import { format } from "date-fns";
import { getAdminOrdersAction } from "@/lib/actions/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdmin } from "@/lib/hooks/useAdmin";

interface AdminOrder {
    id: string;
    status: string;
    total: number;
    created_at: string;
    user?: {
        full_name: string;
    };
    order_items: {
        id: string;
        quantity: number;
        price_snapshot: number | null;
        product?: {
            name: string;
            image_url: string | null;
        };
    }[];
}

export default function AdminOrdersPage() {
    const { isAdmin, isLoading: adminLoading } = useAdmin();
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalOrders, setTotalOrders] = useState(0);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (isAdmin) {
            fetchOrders();
        }
    }, [isAdmin, page, statusFilter]);

    async function fetchOrders() {
        setIsLoading(true);
        try {
            const result = await getAdminOrdersAction(page, limit, statusFilter);
            if (result.success) {
                setOrders((result.orders as AdminOrder[]) || []);
                setTotalOrders(result.total || 0);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "delivered":
                return "bg-green-100 text-green-700";
            case "shipped":
                return "bg-blue-100 text-blue-700";
            case "processing":
                return "bg-yellow-100 text-yellow-700";
            case "cancelled":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "delivered":
                return <CheckCircle className="h-3.5 w-3.5" />;
            case "shipped":
                return <Truck className="h-3.5 w-3.5" />;
            case "processing":
                return <Clock className="h-3.5 w-3.5" />;
            case "cancelled":
                return <AlertCircle className="h-3.5 w-3.5" />;
            default:
                return <Package className="h-3.5 w-3.5" />;
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const totalPages = Math.ceil(totalOrders / limit);

    // Filter orders by search
    const filteredOrders = orders.filter(
        (order) =>
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Stats
    const pendingCount = orders.filter((o) => o.status === "pending").length;
    const processingCount = orders.filter((o) => o.status === "processing").length;
    const shippedCount = orders.filter((o) => o.status === "shipped").length;

    if (adminLoading || isLoading) {
        return (
            <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="h-6 w-48 animate-pulse rounded bg-gray-200 sm:h-8 sm:w-64" />
                        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200 sm:w-96" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-200 sm:h-24" />
                    ))}
                </div>
                <div className="h-64 animate-pulse rounded-xl bg-gray-200 sm:h-96" />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-500">Access denied</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
                        Orders Management
                    </h1>
                    <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                        Track and manage customer orders
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
                    <p className="text-xs font-medium text-gray-600 sm:text-sm">Total</p>
                    <p className="mt-1 text-lg font-bold text-gray-900 sm:text-2xl">{totalOrders}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
                    <p className="text-xs font-medium text-gray-600 sm:text-sm">Pending</p>
                    <p className="mt-1 text-lg font-bold text-yellow-600 sm:text-2xl">{pendingCount}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
                    <p className="text-xs font-medium text-gray-600 sm:text-sm">Shipped</p>
                    <p className="mt-1 text-lg font-bold text-blue-600 sm:text-2xl">{shippedCount}</p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by order ID or customer..."
                        className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-[#2F2582] focus:outline-none"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Orders List */}
            <Card>
                <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
                    <CardTitle className="text-base font-semibold sm:text-lg">
                        Orders ({filteredOrders.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                            <ShoppingBag className="h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-base font-medium text-gray-900 sm:text-lg">
                                {searchQuery ? "No orders found" : "No orders yet"}
                            </h3>
                            <p className="mt-2 text-xs text-gray-500 sm:text-sm">
                                {searchQuery
                                    ? "Try a different search term"
                                    : "Orders will appear here once customers start placing them."}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card View */}
                            <div className="divide-y divide-gray-100 sm:hidden">
                                {filteredOrders.map((order) => (
                                    <div key={order.id} className="p-4 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="flex -space-x-2 overflow-hidden">
                                                {order.order_items.slice(0, 2).map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border-2 border-white bg-gray-100"
                                                    >
                                                        {item.product?.image_url ? (
                                                            <Image
                                                                src={item.product.image_url}
                                                                alt={item.product.name || "Product"}
                                                                fill
                                                                className="object-cover"
                                                                sizes="40px"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center">
                                                                <Package className="h-4 w-4 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {order.order_items.length > 2 && (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-white bg-gray-100 text-xs font-medium text-gray-500">
                                                        +{order.order_items.length - 2}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-900 text-sm">
                                                    #{order.id.slice(0, 8)}
                                                </h3>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {order.user?.full_name || "Guest"}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {format(new Date(order.created_at), "MMM d, yyyy")}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900 text-sm">
                                                    {formatPrice(order.total)}
                                                </p>
                                                <span
                                                    className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(
                                                        order.status
                                                    )}`}
                                                >
                                                    {getStatusIcon(order.status)}
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">
                                                {order.order_items.length} item{order.order_items.length !== 1 && "s"}
                                            </span>
                                            <Link href={`/admin/orders/${order.id}`}>
                                                <Button variant="outline" size="sm" className="h-8 px-3">
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    View
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50">
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                                                Order
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                                                Customer
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                                                Date
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                                                Items
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                                                Total
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-600">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex -space-x-2 overflow-hidden">
                                                            {order.order_items.slice(0, 2).map((item) => (
                                                                <div
                                                                    key={item.id}
                                                                    className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border-2 border-white bg-gray-100"
                                                                >
                                                                    {item.product?.image_url ? (
                                                                        <Image
                                                                            src={item.product.image_url}
                                                                            alt={item.product.name || "Product"}
                                                                            fill
                                                                            className="object-cover"
                                                                            sizes="40px"
                                                                        />
                                                                    ) : (
                                                                        <div className="flex h-full w-full items-center justify-center">
                                                                            <Package className="h-4 w-4 text-gray-400" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            {order.order_items.length > 2 && (
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-white bg-gray-100 text-xs font-medium text-gray-500">
                                                                    +{order.order_items.length - 2}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <code className="text-sm font-mono text-gray-600">
                                                            #{order.id.slice(0, 8)}
                                                        </code>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm text-gray-900">
                                                        {order.user?.full_name || "Guest"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm text-gray-600">
                                                        {format(new Date(order.created_at), "MMM d, yyyy")}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                                                            order.status
                                                        )}`}
                                                    >
                                                        {getStatusIcon(order.status)}
                                                        <span className="capitalize">{order.status}</span>
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm text-gray-600">
                                                        {order.order_items.length}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {formatPrice(order.total)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end">
                                                        <Link href={`/admin/orders/${order.id}`}>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-gray-600 hover:text-[#2F2582]"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {filteredOrders.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
                    <p className="text-xs text-gray-500 sm:text-sm">
                        Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
                        <span className="font-medium">{Math.min(page * limit, totalOrders)}</span> of{" "}
                        <span className="font-medium">{totalOrders}</span>
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages}
                            onClick={() => setPage(page + 1)}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
