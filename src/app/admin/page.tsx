"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowRight,
  Briefcase,
  Mail,
  FolderTree,
  BookOpen,
  Store,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Image as ImageIcon,
  FileText,
  Info,
} from "lucide-react";

import Link from "next/link";
import { format } from "date-fns";
import { getUserStats } from "@/lib/actions/users";
import { getProducts } from "@/lib/actions/products";
import { getContactSubmissions } from "@/lib/actions/communications";
import { getApplicationStats } from "@/lib/actions/job-applications";
import { getAdminOrdersAction } from "@/lib/actions/orders";
import { getMediaItems, type MediaItem } from "@/lib/actions/media";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { AdminDashboardSkeleton } from "@/components/ui/AdminSkeletons";
import Image from "next/image";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
  icon: React.ReactNode;
  color: string;
  href?: string;
  isLoading?: boolean;
}

function StatCard({
  title,
  value,
  change,
  trend,
  icon,
  color,
  href,
  isLoading,
}: StatCardProps) {
  const content = (
    <div className="relative flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${color} shadow-sm transition-transform duration-300 group-hover:scale-110`}
        >
          {icon}
        </div>
        {change && trend && !isLoading && (
          <div
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold ${
              trend === "up"
                ? "bg-green-50 text-green-600 dark:bg-green-900/20"
                : "bg-red-50 text-red-600 dark:bg-red-900/20"
            }`}
          >
            <TrendingUp
              className={`h-3 w-3 ${trend === "down" ? "rotate-180" : ""}`}
            />
            <span>{change}</span>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
          {title}
        </p>
        {isLoading ? (
          <div className="mt-1 h-8 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        ) : (
          <h3 className="mt-1 text-2xl font-black text-gray-900 sm:text-3xl dark:text-white">
            {typeof value === "number" ? value.toLocaleString() : value}
          </h3>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="group h-full cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-[#2F2582] hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-[#a099ff]"
        >
          {content}
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group h-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      {content}
    </motion.div>
  );
}

interface QuickActionProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

function ShortcutIcon({
  title,
  description,
  href,
  icon,
  color,
}: QuickActionProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={href} className="relative">
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -5, scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`flex h-14 w-14 items-center justify-center rounded-lg ${color} cursor-pointer shadow-sm transition-all duration-300 hover:shadow-lg`}
      >
        {icon}
      </motion.div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-1/2 z-50 mb-3 w-48 -translate-x-1/2 overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="relative z-10">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                {title}
              </h4>
              <p className="mt-1 text-[10px] leading-relaxed text-gray-500 dark:text-gray-400">
                {description}
              </p>
              <div className="mt-2 flex items-center gap-1 text-[10px] font-bold tracking-widest text-[#2F2582] uppercase dark:text-[#a099ff]">
                Open <ArrowRight className="h-2 w-2" />
              </div>
            </div>
            <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-white dark:bg-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </Link>
  );
}

interface AdminOrder {
  id: string;
  status: string;
  total: number;
  created_at: string;
  user?: {
    full_name: string;
    email: string;
    city?: string;
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

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    color: "bg-blue-100 text-blue-700",
    icon: Package,
  },
  shipped: {
    label: "Shipped",
    color: "bg-purple-100 text-purple-700",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // Stats state
  const [customerCount, setCustomerCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [applicationCount, setApplicationCount] = useState(0);
  const [contactCount, setContactCount] = useState(0);

  // Orders state
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  // Media state
  const [recentMedia, setRecentMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [userStats, products, applications, contacts, orders, media] =
          await Promise.all([
            getUserStats(),
            getProducts({ limit: 1 }),
            getApplicationStats(),
            getContactSubmissions(),
            getAdminOrdersAction(1, 5, "all"),
            getMediaItems({ limit: 6 }),
          ]);

        // Customer stats
        if (userStats.success && userStats.data) {
          setCustomerCount(userStats.data.customers || 0);
        }

        // Product stats
        if (products.success) {
          setProductCount(products.total || 0);
        }

        // Job application stats
        if (applications.success && applications.data) {
          setApplicationCount(applications.data.total || 0);
        }

        // Contact submission stats
        if (contacts.success && contacts.data) {
          setContactCount(contacts.data.length || 0);
        }

        // Orders
        if (orders.success && orders.orders) {
          setRecentOrders((orders.orders as AdminOrder[]) || []);
        }

        // Media
        if (media.success && media.data) {
          setRecentMedia(media.data);
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Get first name from user data
  const firstName = user?.full_name?.split(" ")[0] || "Admin";

  const dashboardStats = [
    {
      title: "Total Customers",
      value: customerCount,
      change: "+8%",
      trend: "up" as const,
      icon: <Users className="h-6 w-6 text-[#2F2582] dark:text-[#a099ff]" />,
      color: "bg-[#2F2582]/10 dark:bg-[#a099ff]/20",
      href: "/admin/customers",
      isLoading,
    },
    {
      title: "Total Products",
      value: productCount,
      icon: <Package className="h-6 w-6 text-[#2F2582] dark:text-[#a099ff]" />,
      color: "bg-[#2F2582]/10 dark:bg-[#a099ff]/20",
      href: "/admin/products",
      isLoading,
    },
    {
      title: "Job Applications",
      value: applicationCount,
      icon: (
        <Briefcase className="h-6 w-6 text-[#2F2582] dark:text-[#a099ff]" />
      ),
      color: "bg-[#2F2582]/10 dark:bg-[#a099ff]/20",
      href: "/admin/careers/applications",
      isLoading,
    },
    {
      title: "Contact Submissions",
      value: contactCount,
      icon: <Mail className="h-6 w-6 text-[#2F2582] dark:text-[#a099ff]" />,
      color: "bg-[#2F2582]/10 dark:bg-[#a099ff]/20",
      href: "/admin/communications/contact",
      isLoading,
    },
  ];

  const quickActions = [
    {
      title: "Manage Products",
      description: "View and manage your product catalog",
      href: "/admin/products",
      icon: <Package className="h-5 w-5 text-[#2F2582] dark:text-[#a099ff]" />,
      color: "bg-[#2F2582]/10 dark:bg-[#a099ff]/20",
    },
    {
      title: "Categories",
      description: "Organize products with categories",
      href: "/admin/categories",
      icon: (
        <FolderTree className="h-5 w-5 text-[#2F2582] dark:text-[#a099ff]" />
      ),
      color: "bg-[#2F2582]/10 dark:bg-[#a099ff]/20",
    },
    {
      title: "Catalogues",
      description: "Upload and manage PDF catalogues",
      href: "/admin/catalogues",
      icon: <BookOpen className="h-5 w-5 text-[#2F2582] dark:text-[#a099ff]" />,
      color: "bg-[#2F2582]/10 dark:bg-[#a099ff]/20",
    },
    {
      title: "Store Locations",
      description: "Manage physical store locations",
      href: "/admin/stores",
      icon: <Store className="h-5 w-5 text-[#2F2582] dark:text-[#a099ff]" />,
      color: "bg-[#2F2582]/10 dark:bg-[#a099ff]/20",
    },
    {
      title: "Job Listings",
      description: "Post and manage career opportunities",
      href: "/admin/careers",
      icon: (
        <Briefcase className="h-5 w-5 text-[#2F2582] dark:text-[#a099ff]" />
      ),
      color: "bg-[#2F2582]/10 dark:bg-[#a099ff]/20",
    },
  ];

  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            Welcome back,{" "}
            <span className="text-[#2F2582] dark:text-[#a099ff]">
              {firstName}
            </span>
            . Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/settings">
            <Button variant="outline" className="rounded-2xl border-gray-200">
              Settings
            </Button>
          </Link>
          <Link href="/admin/products">
            <Button className="rounded-2xl bg-[#2F2582] px-6 hover:bg-[#241c66]">
              Add Product
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Shortcuts Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="scrollbar-hide flex items-center gap-4 overflow-x-auto pb-2"
      >
        <div className="flex h-14 items-center gap-2 border-r border-gray-100 pr-4 dark:border-gray-800">
          <Info className="h-4 w-4 text-gray-400" />
          <span className="text-xs font-bold tracking-widest whitespace-nowrap text-gray-400 uppercase">
            Shortcuts
          </span>
        </div>
        <div className="flex items-center gap-4">
          {quickActions.map((action, index) => (
            <ShortcutIcon key={index} {...action} />
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Main Content Split */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Orders Section (Larger) */}
        <div className="space-y-6 lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-6 sm:px-8 dark:border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Recent Orders
                </h2>
                <p className="mt-1 text-sm font-medium text-gray-400">
                  Total {recentOrders.length} orders this week
                </p>
              </div>
              <Link href="/admin/orders">
                <Button
                  variant="ghost"
                  className="rounded-xl text-sm font-bold text-[#2F2582] hover:bg-[#2F2582]/5 dark:text-[#a099ff]"
                >
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="p-0">
              {recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800">
                    <ShoppingCart className="h-10 w-10 text-gray-300" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                    No orders yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    When customers buy products, they will appear here.
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="divide-y divide-gray-50 sm:hidden dark:divide-gray-800">
                    {recentOrders.map((order) => {
                      const status =
                        statusConfig[order.status] || statusConfig.pending;
                      const StatusIcon = status.icon;

                      return (
                        <div
                          key={order.id}
                          className="group p-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold tracking-tighter text-gray-400 uppercase">
                              #{order.id.slice(0, 8)}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase ${status.color}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </span>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">
                                {order.user?.full_name || "Guest Customer"}
                              </p>
                              <p className="text-xs font-medium text-gray-400">
                                {format(
                                  new Date(order.created_at),
                                  "MMM d, h:mm a",
                                )}
                              </p>
                            </div>
                            <p className="text-lg font-black text-gray-900 dark:text-white">
                              ₹{(order.total || 0).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden overflow-x-auto sm:block">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-left text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase dark:bg-gray-800">
                          <th className="px-8 py-5">Order</th>
                          <th className="px-6 py-5">Customer</th>
                          <th className="px-6 py-5">Date</th>
                          <th className="px-6 py-5 text-right">Amount</th>
                          <th className="px-8 py-5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {recentOrders.map((order) => {
                          const status =
                            statusConfig[order.status] || statusConfig.pending;
                          const StatusIcon = status.icon;

                          return (
                            <tr
                              key={order.id}
                              className="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <td className="px-8 py-6">
                                <span className="font-mono text-xs font-bold text-gray-400">
                                  #{order.id.slice(0, 8)}
                                </span>
                              </td>
                              <td className="px-6 py-6">
                                <div className="flex flex-col">
                                  <span className="font-bold text-gray-900 dark:text-white">
                                    {order.user?.full_name || "Guest Customer"}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {order.user?.email || "No email provided"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-6">
                                <span className="text-sm font-medium text-gray-500">
                                  {format(
                                    new Date(order.created_at),
                                    "MMM d, yyyy",
                                  )}
                                </span>
                              </td>
                              <td className="px-6 py-6 text-right">
                                <span className="text-base font-black text-gray-900 dark:text-white">
                                  ₹{(order.total || 0).toLocaleString("en-IN")}
                                </span>
                              </td>
                              <td className="px-8 py-6 text-center">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase ${status.color}`}
                                >
                                  <StatusIcon className="h-3 w-3" />
                                  {status.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* Recent Media */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Media
              </h2>
              <Link
                href="/admin/media"
                className="text-xs font-bold tracking-widest text-[#2F2582] uppercase hover:underline dark:text-[#a099ff]"
              >
                All
              </Link>
            </div>

            {recentMedia.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800">
                  <ImageIcon className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-xs font-medium text-gray-400">
                  No media found
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {recentMedia.map((item) => (
                  <Link
                    key={item.id}
                    href="/admin/media"
                    className="group relative aspect-square overflow-hidden rounded-lg bg-gray-50 transition-transform hover:scale-105 dark:bg-gray-800"
                  >
                    {item.mime_type.startsWith("image/") ? (
                      <Image
                        src={item.file_url}
                        alt={item.original_name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="100px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <FileText className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}

            <Link href="/admin/media">
              <Button
                variant="outline"
                className="mt-8 w-full rounded-xl border-gray-100 dark:border-gray-800"
              >
                Upload New File
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
