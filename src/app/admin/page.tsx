"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowRight,
  IndianRupeeIcon,
} from "lucide-react";
import Link from "next/link";
import { getUserStats } from "@/lib/actions/users";
import { useAuthStore } from "@/lib/store";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, change, trend, icon, color }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      className="group relative overflow-hidden rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50/50 p-6 shadow-md transition-all duration-300 hover:border-gray-200"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-gray-100/50 to-transparent opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">{title}</p>
          <h3 className="mt-3 text-4xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-gray-800">
            {value}
          </h3>
          <div className="mt-3 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1.5 w-fit">
            <TrendingUp
              className={`h-4 w-4 ${trend === "up" ? "text-green-600" : "text-red-600 rotate-180"}`}
            />
            <span
              className={`text-sm font-bold ${trend === "up" ? "text-green-700" : "text-red-700"}`}
            >
              {change}
            </span>
            <span className="text-xs font-medium text-gray-600">vs last month</span>
          </div>
        </div>
        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${color} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:shadow-xl`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

interface QuickActionProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

function QuickAction({ title, description, href, icon }: QuickActionProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-[#2F2582] hover:shadow-md"
      >
        <div className="rounded-lg bg-[#2F2582]/10 p-3 text-[#2F2582]">{icon}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-[#2F2582]" />
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
        const customers = userStatsResult.success ? userStatsResult.data?.customers || 0 : 0;
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
  const firstName = user?.full_name?.split(' ')[0] || 'Admin';

  const dashboardStats = [
    {
      title: "Total Products",
      value: "156*",
      change: "+12%*",
      trend: "up" as const,
      icon: <Package className="h-6 w-6 text-white" />,
      color: "bg-blue-500",
    },
    {
      title: "Total Orders",
      value: "342*",
      change: "+23%*",
      trend: "up" as const,
      icon: <ShoppingCart className="h-6 w-6 text-white" />,
      color: "bg-green-500",
    },
    {
      title: "Revenue",
      value: "45,231*",
      change: "+18%*",
      trend: "up" as const,
      icon: <IndianRupeeIcon className="h-6 w-6 text-white" />,
      color: "bg-purple-500",
    },
    {
      title: "Customers",
      value: isLoading ? "..." : customerCount.toString(),
      change: "+8%",
      trend: "up" as const,
      icon: <Users className="h-6 w-6 text-white" />,
      color: "bg-orange-500",
    },
  ];

  const quickActions = [
    {
      title: "Add New Product",
      description: "Create and publish a new product to your catalog",
      href: "/admin/products/new",
      icon: <Package className="h-5 w-5" />,
    },
    {
      title: "View Orders",
      description: "Manage and process customer orders",
      href: "/admin/orders",
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      title: "Manage Categories",
      description: "Organize products with categories",
      href: "/admin/categories",
      icon: <Package className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
          Welcome back, {firstName}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Recent Orders</h2>
        <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-gray-500">
            Recent orders will appear here once implemented
          </p>
        </div>
      </div>
    </div>
  );
}
