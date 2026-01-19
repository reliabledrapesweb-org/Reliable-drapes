"use client";

import { motion } from "framer-motion";
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
  Layers,
  BookOpen,
  Store,
  Eye,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { getUserStats } from "@/lib/actions/users";
import { getProducts } from "@/lib/actions/products";
import { getContactSubmissions } from "@/lib/actions/communications";
import { getApplicationStats } from "@/lib/actions/job-applications";
import { getAdminOrdersAction } from "@/lib/actions/orders";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { AdminPageSkeleton } from "@/components/ui/AdminPageSkeleton";

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
    <div className="relative flex items-start justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">
          {title}
        </p>
        {isLoading ? (
          <div className="mt-1 h-7 w-16 animate-pulse rounded bg-gray-200 sm:mt-2 sm:h-8 sm:w-20" />
        ) : (
          <h3 className="mt-1 text-xl font-bold text-gray-900 sm:mt-2 sm:text-3xl dark:text-white">
            {value}
          </h3>
        )}
        {change && trend && !isLoading && (
          <div className="mt-1 flex items-center gap-1 sm:mt-2">
            <TrendingUp
              className={`h-3 w-3 ${
                trend === "up" ? "text-green-600" : "rotate-180 text-red-600"
              }`}
            />
            <span
              className={`text-xs font-semibold ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {change}
            </span>
            <span className="hidden text-xs text-gray-500 sm:inline dark:text-gray-400">
              vs last month
            </span>
          </div>
        )}
      </div>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color} transition-transform duration-300 group-hover:scale-110 sm:h-12 sm:w-12`}
      >
        {icon}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="group h-full cursor-pointer rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-[#2F2582] hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-[#a099ff]"
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
      className="group h-full rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
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

function QuickAction({
  title,
  description,
  href,
  icon,
  color,
}: QuickActionProps) {
  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className="group flex h-full cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-[#2F2582] hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-[#a099ff]"
      >
        <div
          className={`rounded-lg ${color} p-2 transition-transform group-hover:scale-110 sm:p-3`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-gray-900 transition-colors group-hover:text-[#2F2582] sm:text-base dark:text-white">
            {title}
          </h4>
          <p className="mt-0.5 line-clamp-2 text-xs text-gray-600 sm:mt-1 sm:text-sm dark:text-gray-400">
            {description}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-[#2F2582] sm:h-5 sm:w-5 dark:text-gray-500" />
      </motion.div>
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

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [userStats, products, applications, contacts, orders] =
          await Promise.all([
            getUserStats(),
            getProducts({ limit: 1 }),
            getApplicationStats(),
            getContactSubmissions(),
            getAdminOrdersAction(1, 5, "all"),
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
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
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
      title: "Collections",
      description: "Create and manage product collections",
      href: "/admin/collections",
      icon: <Layers className="h-5 w-5 text-[#2F2582] dark:text-[#a099ff]" />,
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
    return <AdminPageSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl dark:text-white">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="mt-1 text-xs text-gray-600 sm:mt-2 sm:text-base dark:text-gray-400">
          Here's an overview of your store's performance and quick access to key
          features.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="mb-3 text-base font-semibold text-gray-900 sm:mb-4 sm:text-lg dark:text-white">
          Overview
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          {dashboardStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.1 + index * 0.05,
                type: "spring",
                stiffness: 100,
              }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="mb-3 text-base font-semibold text-gray-900 sm:mb-4 sm:text-lg dark:text-white">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <QuickAction {...action} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="border-b border-gray-200 p-4 sm:p-6 dark:border-gray-700">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900 sm:text-lg dark:text-white">
                Recent Orders
              </h2>
              <p className="mt-0.5 text-xs text-gray-600 sm:mt-1 sm:text-sm dark:text-gray-400">
                Latest customer orders and their status
              </p>
            </div>
            <Link href="/admin/orders">
              <Button
                variant="outline"
                className="w-full border-[#2F2582] text-[#2F2582] hover:bg-[#2F2582]/10 sm:w-auto dark:border-[#a099ff] dark:text-[#a099ff] dark:hover:bg-[#a099ff]/10"
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-0">
          {recentOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="m-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center sm:m-6 dark:border-gray-700 dark:bg-gray-700/50"
            >
              <ShoppingCart className="mx-auto h-6 w-6 text-gray-400 sm:h-8 sm:w-8 dark:text-gray-500" />
              <p className="mt-2 text-xs text-gray-600 sm:text-sm dark:text-gray-400">
                No orders found.
              </p>
            </motion.div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="divide-y divide-gray-100 sm:hidden dark:divide-gray-700">
                {recentOrders.map((order, index) => {
                  const status =
                    statusConfig[order.status] || statusConfig.pending;
                  const StatusIcon = status.icon;

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="space-y-2 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-gray-500">
                          #{order.id.slice(0, 8)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">
                          {order.user?.full_name || "Guest"}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ₹
                          {(order.total || 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {format(
                          new Date(order.created_at),
                          "MMM d, yyyy • h:mm a",
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden overflow-x-auto sm:block">
                <div className="min-w-[800px] space-y-3 p-6">
                  {/* Table Header */}
                  <div className="grid grid-cols-5 gap-4 border-b border-gray-200 pb-3 text-sm font-medium text-gray-600 dark:border-gray-700 dark:text-gray-400">
                    <div>Order ID</div>
                    <div>Customer</div>
                    <div>Date</div>
                    <div>Total</div>
                    <div>Status</div>
                  </div>

                  {/* Rows */}
                  {recentOrders.map((order, index) => {
                    const status =
                      statusConfig[order.status] || statusConfig.pending;
                    const StatusIcon = status.icon;

                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                        className="grid grid-cols-5 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-700 dark:bg-gray-700/50"
                      >
                        <div className="font-mono text-gray-500">
                          #{order.id.slice(0, 8)}
                        </div>
                        <div className="text-gray-700 dark:text-gray-300">
                          {order.user?.full_name || "Guest"}
                          {order.user?.email && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {order.user.email}
                            </div>
                          )}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {format(new Date(order.created_at), "MMM d, yyyy")}
                          <div className="text-xs text-gray-500">
                            {format(new Date(order.created_at), "h:mm a")}
                          </div>
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          ₹
                          {(order.total || 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                        <div>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
