"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
  Filter,
  Download,
  MapPin,
  X,
  ArrowLeft,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import {
  getAdminOrdersAction,
  getOrderByIdAction,
  updateOrderStatusAction,
  updateOrderTrackingAction,
} from "@/lib/actions/orders";
import { FileUpload } from "@/components/admin/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdmin } from "@/lib/hooks/useAdmin";
import { useToast, ToastContainer } from "@/components/ui/Toast";

interface AdminOrder {
  id: string;
  status: string;
  total: number;
  created_at: string;
  user?: {
    full_name: string;
    city?: string;
    address_line1?: string;
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

interface OrderDetail {
  id: string;
  created_at: string;
  status: string;
  total: number;
  user_id: string;
  tracking_number?: string;
  tracking_url?: string;
  expected_delivery_date?: string;
  current_location?: string;
  invoice_url?: string;
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

type TabFilter = "all" | "pending" | "shipped" | "delivered" | "cancelled";

const statusOptions = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function AdminOrdersPage() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { toasts, addToast, removeToast } = useToast();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabFilter>("all");

  // Filter Modal State
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Order Details Modal State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);

  // Tracking Form State
  const [trackingData, setTrackingData] = useState({
    tracking_number: "",
    tracking_url: "",
    expected_delivery_date: "",
    current_location: "",
    invoice_url: "",
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    const selectedOrderId = searchParams.get("selectedOrder");
    if (selectedOrderId && isAdmin) {
      handleViewOrder(selectedOrderId);
    }
  }, [searchParams, isAdmin]);

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

  const handleViewOrder = async (orderId: string) => {
    setIsLoadingOrder(true);
    setShowOrderModal(true);
    try {
      const result = await getOrderByIdAction(orderId);
      if (result.success && result.order) {
        setSelectedOrder(result.order);
        setTrackingData({
          tracking_number: result.order.tracking_number || "",
          tracking_url: result.order.tracking_url || "",
          expected_delivery_date: result.order.expected_delivery_date
            ? new Date(result.order.expected_delivery_date)
                .toISOString()
                .split("T")[0]
            : "",
          current_location: result.order.current_location || "",
          invoice_url: result.order.invoice_url || "",
        });
      } else {
        addToast(result.error || "Failed to fetch order details", "error");
        setShowOrderModal(false);
      }
    } catch (error) {
      addToast("An unexpected error occurred", "error");
      setShowOrderModal(false);
    } finally {
      setIsLoadingOrder(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedOrder) return;
    setIsUpdatingStatus(true);
    try {
      const result = await updateOrderStatusAction(selectedOrder.id, newStatus);
      if (result.success) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
        setOrders(
          orders.map((o) =>
            o.id === selectedOrder.id ? { ...o, status: newStatus } : o,
          ),
        );
        addToast(`Order status updated to ${newStatus}`, "success");
      } else {
        addToast(result.error || "Failed to update status", "error");
      }
    } catch (error) {
      addToast("An unexpected error occurred", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleTrackingUpdate = async () => {
    if (!selectedOrder) return;
    setIsUpdatingTracking(true);
    try {
      const result = await updateOrderTrackingAction(
        selectedOrder.id,
        trackingData,
      );
      if (result.success) {
        setSelectedOrder({ ...selectedOrder, ...trackingData });
        addToast("Tracking information updated", "success");
      } else {
        addToast(result.error || "Failed to update tracking", "error");
      }
    } catch (error) {
      addToast("An unexpected error occurred", "error");
    } finally {
      setIsUpdatingTracking(false);
    }
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "text-green-600";
      case "shipped":
      case "processing":
        return "text-blue-600";
      case "pending":
        return "text-yellow-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
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

  const formatLocation = (user?: AdminOrder["user"]) => {
    if (!user) return "N/A";
    const parts = [user.address_line1, user.city].filter(Boolean);
    if (parts.length === 0) return "N/A";
    const location = parts.join(", ");
    return location.length > 25 ? location.slice(0, 22) + "..." : location;
  };

  const handleExportToExcel = () => {
    const exportData = filteredOrders.map((order) => ({
      "Order ID": `#${order.id.slice(0, 8)}`,
      Items: order.order_items.length,
      Customer: order.user?.full_name || "Guest",
      Location: formatLocation(order.user),
      Date: format(new Date(order.created_at), "dd MMM, yyyy"),
      Status: order.status,
      Total: formatPrice(order.total),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(
      workbook,
      `orders_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    addToast("Orders exported successfully", "success");
  };

  const applyFilters = () => {
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFilterStatus("all");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  const totalPages = Math.ceil(totalOrders / limit);

  // Apply tab and search filters
  let filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesTab = true;
    if (activeTab !== "all") {
      matchesTab = order.status === activeTab;
    }

    let matchesStatus = true;
    if (filterStatus !== "all") {
      matchesStatus = order.status === filterStatus;
    }

    let matchesDateRange = true;
    if (filterDateFrom) {
      matchesDateRange =
        matchesDateRange &&
        new Date(order.created_at) >= new Date(filterDateFrom);
    }
    if (filterDateTo) {
      matchesDateRange =
        matchesDateRange &&
        new Date(order.created_at) <= new Date(filterDateTo);
    }

    return matchesSearch && matchesTab && matchesStatus && matchesDateRange;
  });

  // Stats
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const processingCount = orders.filter(
    (o) => o.status === "processing",
  ).length;
  const shippedCount = orders.filter((o) => o.status === "shipped").length;

  const tabs: { key: TabFilter; label: string }[] = [
    { key: "all", label: "All Orders" },
    { key: "pending", label: "Pending" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" },
  ];

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
            <div
              key={i}
              className="h-20 animate-pulse rounded-lg bg-gray-200 sm:h-24"
            />
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
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
            Orders ({totalOrders})
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
          <p className="mt-1 text-lg font-bold text-gray-900 sm:text-2xl">
            {totalOrders}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p className="text-xs font-medium text-gray-600 sm:text-sm">
            Pending
          </p>
          <p className="mt-1 text-lg font-bold text-yellow-600 sm:text-2xl">
            {pendingCount}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p className="text-xs font-medium text-gray-600 sm:text-sm">
            Shipped
          </p>
          <p className="mt-1 text-lg font-bold text-blue-600 sm:text-2xl">
            {shippedCount}
          </p>
        </div>
      </div>

      {/* Tabs and Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-gray-200 pb-0 sm:gap-2 sm:border-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "border-b-2 border-[#2F2582] text-[#2F2582]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter and Export Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => setShowFilterModal(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button
            onClick={handleExportToExcel}
            variant="outline"
            disabled={filteredOrders.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by order ID or customer..."
          className="w-full rounded-lg border border-gray-200 py-2.5 pr-4 pl-10 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
        />
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
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
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
                  <div key={order.id} className="space-y-3 p-4">
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
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          #{order.id.slice(0, 8)}
                        </h3>
                        <p className="truncate text-xs text-gray-500">
                          {order.user?.full_name || "Guest"}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                          <MapPin className="h-3 w-3" />
                          {formatLocation(order.user)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {format(new Date(order.created_at), "MMM d, yyyy")}
                        </span>
                        <span className="text-xs text-gray-400">|</span>
                        <span className="text-xs font-medium text-[#2F2582]">
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Order ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Total
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
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
                                  className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border-2 border-white bg-gray-100"
                                >
                                  {item.product?.image_url ? (
                                    <Image
                                      src={item.product.image_url}
                                      alt={item.product.name || "Product"}
                                      fill
                                      className="object-cover"
                                      sizes="32px"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                      <Package className="h-3 w-3 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div>
                              <code className="text-sm font-semibold text-blue-600">
                                #CDH{order.id.slice(0, 4).toUpperCase()}
                              </code>
                              <p className="text-xs text-gray-500">
                                {order.order_items.length} item
                                {order.order_items.length !== 1 && "s"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900">
                            {order.user?.full_name || "Guest"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            {formatLocation(order.user)}
                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">
                            {format(new Date(order.created_at), "dd MMM, yyyy")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`flex items-center gap-1 text-sm font-medium ${getStatusColor(order.status)}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-900">
                            {formatPrice(order.total)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewOrder(order.id)}
                              className="h-8 w-8 p-0 text-gray-600 hover:text-[#2F2582]"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
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
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 sm:text-sm">
              {limit} Documents
            </span>
            <ChevronRight className="h-4 w-4 rotate-90 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="text-sm"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from(
                { length: Math.min(3, totalPages) },
                (_, i) => i + 1,
              ).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className={`h-8 w-8 p-0 ${page === pageNum ? "bg-[#2F2582]" : ""}`}
                >
                  {pageNum}
                </Button>
              ))}
              {totalPages > 3 && (
                <>
                  <span className="text-gray-400">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(totalPages)}
                    className="h-8 w-8 p-0"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="text-sm"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilterModal && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Filter Orders
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Narrow down your order list
                  </p>
                </div>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Order Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none"
                  >
                    <option value="all">All</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Date From
                    </label>
                    <input
                      type="date"
                      value={filterDateFrom}
                      onChange={(e) => setFilterDateFrom(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Date To
                    </label>
                    <input
                      type="date"
                      value={filterDateTo}
                      onChange={(e) => setFilterDateTo(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex-1"
                >
                  Clear
                </Button>
                <Button
                  onClick={applyFilters}
                  className="flex-1 bg-[#2F2582] hover:bg-[#241c66]"
                >
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Details Modal */}
      <AnimatePresence>
        {showOrderModal && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-2 border-gray-100 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {isLoadingOrder ? (
                <div className="flex items-center justify-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2F2582] border-t-transparent" />
                </div>
              ) : selectedOrder ? (
                <div>
                  {/* Modal Header */}
                  <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-6 py-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Order #{selectedOrder.id.slice(0, 8)}
                      </h2>
                      <p className="mt-1 text-sm text-gray-600">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase ${
                            selectedOrder.status === "delivered"
                              ? "bg-green-100 text-green-700"
                              : selectedOrder.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {selectedOrder.status.charAt(0).toUpperCase() +
                            selectedOrder.status.slice(1)}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={closeOrderModal}
                      className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="space-y-6 p-6">
                    {/* Status Updater */}
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium text-gray-700">
                        Update Status:
                      </label>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        disabled={isUpdatingStatus}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:border-[#2F2582] focus:outline-none disabled:opacity-50"
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </option>
                        ))}
                      </select>
                      {isUpdatingStatus && (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#2F2582] border-t-transparent" />
                      )}
                    </div>

                    {/* Customer Info */}
                    <div className="rounded-lg border border-gray-200 p-4">
                      <h3 className="mb-4 font-semibold text-gray-900">
                        Customer Details
                      </h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-gray-100 p-2">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedOrder.user?.full_name || "Guest"}
                            </p>
                            <p className="text-xs text-gray-500">Customer</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-gray-100 p-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedOrder.user?.email || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">Email</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-gray-100 p-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedOrder.user?.phone || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">Phone</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-gray-100 p-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedOrder.user?.address_line1 ||
                              selectedOrder.user?.city
                                ? `${selectedOrder.user?.address_line1 || ""} ${selectedOrder.user?.city || ""}, ${selectedOrder.user?.country || ""}`.trim()
                                : "No address provided"}
                            </p>
                            <p className="text-xs text-gray-500">Address</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="rounded-lg border border-gray-200">
                      <div className="border-b border-gray-200 px-4 py-3">
                        <h3 className="font-semibold text-gray-900">
                          Order Items
                        </h3>
                      </div>
                      <div className="divide-y divide-gray-100 p-4">
                        {selectedOrder.order_items.map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-4 py-3 first:pt-0 last:pb-0"
                          >
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                              {item.product?.image_url ? (
                                <Image
                                  src={item.product.image_url}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-300" />
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
                                    item.price_snapshot ||
                                      item.product?.price ||
                                      0,
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
                      <div className="rounded-b-lg border-t border-gray-200 bg-gray-50 px-4 py-3">
                        <div className="flex justify-between text-base font-semibold text-gray-900">
                          <span>Total Amount</span>
                          <span>{formatPrice(selectedOrder.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Management Section */}
                    <div className="rounded-lg border border-[#2F2582]/10 bg-[#2F2582]/5 p-6">
                      <h3 className="mb-4 flex items-center gap-2 font-bold text-[#2F2582]">
                        <Truck className="h-5 w-5" />
                        Order Tracking & Invoice
                      </h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                            Tracking Number
                          </label>
                          <input
                            type="text"
                            value={trackingData.tracking_number}
                            onChange={(e) =>
                              setTrackingData({
                                ...trackingData,
                                tracking_number: e.target.value,
                              })
                            }
                            placeholder="e.g. FEDEX123456"
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                            Expected Delivery
                          </label>
                          <input
                            type="date"
                            value={trackingData.expected_delivery_date}
                            onChange={(e) =>
                              setTrackingData({
                                ...trackingData,
                                expected_delivery_date: e.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                            Current Location
                          </label>
                          <input
                            type="text"
                            value={trackingData.current_location}
                            onChange={(e) =>
                              setTrackingData({
                                ...trackingData,
                                current_location: e.target.value,
                              })
                            }
                            placeholder="e.g. In Transit - Mumbai"
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                            Tracking URL (Optional)
                          </label>
                          <input
                            type="url"
                            value={trackingData.tracking_url}
                            onChange={(e) =>
                              setTrackingData({
                                ...trackingData,
                                tracking_url: e.target.value,
                              })
                            }
                            placeholder="https://track.courier.com/..."
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none"
                          />
                        </div>
                        <div className="col-span-full space-y-1.5">
                          <label className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                            Invoice Document
                          </label>
                          <FileUpload
                            label=""
                            accept="application/pdf,image/*"
                            bucket="catalogues"
                            folder="invoices"
                            onUploadComplete={(url) =>
                              setTrackingData({
                                ...trackingData,
                                invoice_url: url,
                              })
                            }
                            currentUrl={trackingData.invoice_url}
                            onRemove={() =>
                              setTrackingData({
                                ...trackingData,
                                invoice_url: "",
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="mt-6">
                        <Button
                          onClick={handleTrackingUpdate}
                          disabled={isUpdatingTracking}
                          className="w-full bg-[#2F2582] hover:bg-[#251e66]"
                        >
                          {isUpdatingTracking ? (
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <CheckCircle className="mr-2 h-4 w-4" />
                          )}
                          Save Management Details
                        </Button>
                      </div>
                    </div>

                    {/* Order Info */}
                    <div className="text-sm text-gray-500">
                      Placed on{" "}
                      {format(new Date(selectedOrder.created_at), "PPP p")}
                    </div>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
