"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { getUserStats } from "@/lib/actions/users";
import { getAllCatalogues } from "@/lib/actions/catalogues";

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
      whileHover={{ y: -4 }}
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-gray-900">{value}</h3>
          <div className="mt-2 flex items-center gap-1">
            <TrendingUp
              className={`h-4 w-4 ${trend === "up" ? "text-green-500" : "text-red-500 rotate-180"}`}
            />
            <span
              className={`text-sm font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}
            >
              {change}
            </span>
            <span className="text-sm text-gray-500">vs last month</span>
          </div>
        </div>
        <div className={`rounded-lg ${color} p-3`}>{icon}</div>
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
  const [stats, setStats] = useState({
    customers: 0,
    catalogues: 0,
    totalDownloads: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [userStatsResult, cataloguesResult] = await Promise.all([
          getUserStats(),
          getAllCatalogues(),
        ]);

        const customerCount = userStatsResult.success ? userStatsResult.data?.customers || 0 : 0;
        const catalogueCount = cataloguesResult.success ? cataloguesResult.data?.length || 0 : 0;
        const totalDownloads = cataloguesResult.success 
          ? cataloguesResult.data?.reduce((sum, cat) => sum + (cat.download_count || 0), 0) || 0 
          : 0;

        setStats({
          customers: customerCount,
          catalogues: catalogueCount,
          totalDownloads,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  const dashboardStats = [
    {
      title: "Total Catalogues",
      value: isLoading ? "..." : stats.catalogues.toString(),
      change: "+12%",
      trend: "up" as const,
      icon: <Package className="h-6 w-6 text-white" />,
      color: "bg-blue-500",
    },
    {
      title: "Total Downloads",
      value: isLoading ? "..." : stats.totalDownloads.toString(),
      change: "+23%",
      trend: "up" as const,
      icon: <ShoppingCart className="h-6 w-6 text-white" />,
      color: "bg-green-500",
    },
    {
      title: "Revenue",
      value: "$45,231*",
      change: "+18%*",
      trend: "up" as const,
      icon: <DollarSign className="h-6 w-6 text-white" />,
      color: "bg-purple-500",
    },
    {
      title: "Customers",
      value: isLoading ? "..." : stats.customers.toString(),
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
          Welcome back, Admin!
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
