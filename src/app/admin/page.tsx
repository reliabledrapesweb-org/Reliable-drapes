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
import { useAuthStore } from "@/lib/store";

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
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <h3 className="mt-2 text-3xl font-bold text-gray-900">{value}</h3>
        {change && trend && (
          <div className="mt-2 flex items-center gap-1">
            <TrendingUp
              className={`h-3 w-3 ${trend === "up" ? "text-green-600" : "rotate-180 text-red-600"}`}
            />
            <span
              className={`text-xs font-semibold ${trend === "up" ? "text-green-600" : "text-red-600"}`}
            >
              {change}
            </span>
            <span className="text-xs text-gray-500">vs last month</span>
          </div>
        )}
      </div>
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} transition-transform duration-300 group-hover:scale-110`}
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
          className="group h-full cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-[#2F2582] hover:shadow-md"
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
      className="group h-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
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
        className="group flex h-full cursor-pointer items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-[#2F2582] hover:shadow-md"
      >
        <div
          className={`rounded-lg ${color} p-3 transition-transform group-hover:scale-110`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-gray-900 transition-colors group-hover:text-[#2F2582]">
            {title}
          </h4>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-[#2F2582]" />
      </motion.div>
    </Link>
  );
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [customerCount, setCustomerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomerStats() {
      try {
        const userStatsResult = await getUserStats();
        const customers = userStatsResult.success
          ? userStatsResult.data?.customers || 0
          : 0;
        setCustomerCount(customers);
      } catch (error) {
        console.error("Failed to fetch customer stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCustomerStats();
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
      <div className="space-y-6">
        <div>
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-96 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-gray-200"
            />
          ))}
        </div>
        <div>
          <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl bg-gray-200"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="mt-2 text-gray-600">
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Orders
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Latest customer orders and their status
              </p>
            </div>
            <Link href="/admin/orders">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-lg bg-[#2F2582] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#241c66]"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
          </div>
        </div>

        <div className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[700px] space-y-4 p-6">
              {/* Table Header */}
              <div className="grid grid-cols-5 gap-4 border-b border-gray-200 pb-3 text-sm font-medium text-gray-600">
                <div>Order ID</div>
                <div>Customer</div>
                <div>Date</div>
                <div>Total</div>
                <div>Status</div>
              </div>

              {/* Placeholder Rows */}
              {[...Array(5)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="grid grid-cols-5 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm"
                >
                  <div className="font-mono text-gray-500">
                    #ORD-{1000 + index}
                  </div>
                  <div className="text-gray-700">Customer {index + 1}</div>
                  <div className="text-gray-600">
                    {new Date(
                      Date.now() - index * 86400000,
                    ).toLocaleDateString()}
                  </div>
                  <div className="font-semibold text-gray-900">
                    ${(Math.random() * 500 + 50).toFixed(2)}
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        index % 3 === 0
                          ? "bg-green-100 text-green-700"
                          : index % 3 === 1
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {index % 3 === 0
                        ? "Delivered"
                        : index % 3 === 1
                          ? "Processing"
                          : "Pending"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Info message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center"
          >
            <ShoppingCart className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              This is placeholder data. Real orders will appear here once the
              orders feature is implemented.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Note about placeholder data */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-lg border border-blue-200 bg-blue-50 p-4"
      >
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Note:</span> Statistics marked with *
          are placeholder values and will be replaced with real data once the
          respective features are implemented.
        </p>
      </motion.div>
    </div>
  );
}
