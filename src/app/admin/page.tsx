"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowRight,
  DollarSign,
  Briefcase,
  Mail,
  FileText,
  Store,
  FolderTree,
  Layers,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { getUserStats } from "@/lib/actions/users";
import { getRecentOrdersAction } from "@/lib/actions/orders";
import { useAuthStore } from "@/lib/store";
import { mapStatusToColor } from "@/lib/utils"; // You might need to create this or inline it

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  icon: React.ReactNode;
  color: string;
  href?: string;
}

function StatCard({
  title,
  value,
  change,
  trend,
  icon,
  color,
  href,
}: StatCardProps) {
  const content = (
    <div className="relative flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-600 sm:text-sm">{title}</p>
        <h3 className="mt-1 text-xl font-bold text-gray-900 sm:mt-2 sm:text-3xl">{value}</h3>
        {change && trend && (
          <div className="mt-1 flex items-center gap-1 sm:mt-2">
            <TrendingUp
              className={`h-3 w-3 ${trend === "up" ? "text-green-600" : "rotate-180 text-red-600"}`}
            />
            <span
              className={`text-xs font-semibold ${trend === "up" ? "text-green-600" : "text-red-600"}`}
            >
              {change}
            </span>
            <span className="hidden text-xs text-gray-500 sm:inline">vs last month</span>
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
          className="group h-full cursor-pointer rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-[#2F2582] hover:shadow-md sm:p-5"
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
      className="group h-full rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5"
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
        className="group flex h-full cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-[#2F2582] hover:shadow-md sm:gap-4 sm:p-5"
      >
        <div
          className={`rounded-lg ${color} p-2 transition-transform group-hover:scale-110 sm:p-3`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-gray-900 transition-colors group-hover:text-[#2F2582] sm:text-base">
            {title}
          </h4>
          <p className="mt-0.5 text-xs text-gray-600 line-clamp-2 sm:mt-1 sm:text-sm">{description}</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-[#2F2582] sm:h-5 sm:w-5" />
      </motion.div>
    </Link>
  );
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [customerCount, setCustomerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [userStatsResult, ordersResult] = await Promise.all([
          getUserStats(),
          getRecentOrdersAction(5)
        ]);

        const customers = userStatsResult.success
          ? userStatsResult.data?.customers || 0
          : 0;
        setCustomerCount(customers);

        if (ordersResult.success) {
          setRecentOrders(ordersResult.orders || []);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  // Get first name from user data
  const firstName = user?.full_name?.split(" ")[0] || "Admin";

  const dashboardStats = [
    {
      title: "Total Customers",
      value: isLoading ? "..." : customerCount.toString(),
      change: "+8%",
      trend: "up" as const,
      icon: <Users className="h-6 w-6 text-[#2F2582]" />,
      color: "bg-[#2F2582]/10",
      href: "/admin/customers",
    },
    {
      title: "Total Products",
      value: "156*",
      change: "+12%*",
      trend: "up" as const,
      icon: <Package className="h-6 w-6 text-[#2F2582]" />,
      color: "bg-[#2F2582]/10",
      href: "/admin/products",
    },
    {
      title: "Job Applications",
      value: "24*",
      change: "+5%*",
      trend: "up" as const,
      icon: <Briefcase className="h-6 w-6 text-[#2F2582]" />,
      color: "bg-[#2F2582]/10",
      href: "/admin/careers/applications",
    },
    {
      title: "Contact Submissions",
      value: "89*",
      change: "+15%*",
      trend: "up" as const,
      icon: <Mail className="h-6 w-6 text-[#2F2582]" />,
      color: "bg-[#2F2582]/10",
      href: "/admin/communications/contact",
    },
  ];

  const quickActions = [
    {
      title: "Manage Products",
      description: "View and manage your product catalog",
      href: "/admin/products",
      icon: <Package className="h-5 w-5 text-[#2F2582]" />,
      color: "bg-[#2F2582]/10",
    },
    {
      title: "Categories",
      description: "Organize products with categories",
      href: "/admin/categories",
      icon: <FolderTree className="h-5 w-5 text-[#2F2582]" />,
      color: "bg-[#2F2582]/10",
    },
    {
      title: "Collections",
      description: "Create and manage product collections",
      href: "/admin/collections",
      icon: <Layers className="h-5 w-5 text-[#2F2582]" />,
      color: "bg-[#2F2582]/10",
    },
    {
      title: "Catalogues",
      description: "Upload and manage PDF catalogues",
      href: "/admin/catalogues",
      icon: <BookOpen className="h-5 w-5 text-[#2F2582]" />,
      color: "bg-[#2F2582]/10",
    },
    {
      title: "Store Locations",
      description: "Manage physical store locations",
      href: "/admin/stores",
      icon: <Store className="h-5 w-5 text-[#2F2582]" />,
      color: "bg-[#2F2582]/10",
    },
    {
      title: "Job Listings",
      description: "Post and manage career opportunities",
      href: "/admin/careers",
      icon: <Briefcase className="h-5 w-5 text-[#2F2582]" />,
      color: "bg-[#2F2582]/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <div className="h-6 w-48 animate-pulse rounded bg-gray-200 sm:h-8 sm:w-64" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200 sm:w-96" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-gray-200 sm:h-32"
            />
          ))}
        </div>
        <div>
          <div className="mb-3 h-5 w-24 animate-pulse rounded bg-gray-200 sm:mb-4 sm:h-6 sm:w-32" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl bg-gray-200 sm:h-24"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="mt-1 text-xs text-gray-600 sm:mt-2 sm:text-base">
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
        <h2 className="mb-3 text-base font-semibold text-gray-900 sm:mb-4 sm:text-lg">Overview</h2>
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
        <h2 className="mb-3 text-base font-semibold text-gray-900 sm:mb-4 sm:text-lg">
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
        className="rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="border-b border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                Recent Orders
              </h2>
              <p className="mt-0.5 text-xs text-gray-600 sm:mt-1 sm:text-sm">
                Latest customer orders and their status
              </p>
            </div>
            <Link href="/admin/orders">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2F2582] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#241c66] sm:w-auto"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
          </div>
        </div>

        <div className="p-0">
          {recentOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="m-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center sm:m-6"
            >
              <ShoppingCart className="mx-auto h-6 w-6 text-gray-400 sm:h-8 sm:w-8" />
              <p className="mt-2 text-xs text-gray-600 sm:text-sm">
                No orders found.
              </p>
            </motion.div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="divide-y divide-gray-100 sm:hidden">
                {recentOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-gray-500">#{order.id.slice(0, 8)}</span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium 
                                ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{order.user?.full_name || "Guest"}</span>
                      <span className="font-semibold text-gray-900">
                        ${(order.total || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <div className="min-w-[700px] space-y-4 p-6">
                  {/* Table Header */}
                  <div className="grid grid-cols-5 gap-4 border-b border-gray-200 pb-3 text-sm font-medium text-gray-600">
                    <div>Order ID</div>
                    <div>Customer</div>
                    <div>Date</div>
                    <div>Total</div>
                    <div>Status</div>
                  </div>

                  {/* Rows */}
                  {recentOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="grid grid-cols-5 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm"
                    >
                      <div className="font-mono text-gray-500">
                        #{order.id.slice(0, 8)}
                      </div>
                      <div className="text-gray-700">{order.user?.full_name || "Guest"}</div>
                      <div className="text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                      <div className="font-semibold text-gray-900">
                        ${(order.total || 0).toFixed(2)}
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                                ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                  'bg-blue-100 text-blue-700'}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Note about placeholder data */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:p-4"
      >
        <p className="text-xs text-blue-800 sm:text-sm">
          <span className="font-semibold">Note:</span> Statistics marked with *
          are placeholder values and will be replaced with real data once the
          respective features are implemented.
        </p>
      </motion.div>
    </div>
  );
}
