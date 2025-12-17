/**
 * Unified Admin Page Layout Component
 * Provides consistent structure for all admin pages
 */

import { ReactNode } from "react";
import { Search, LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StatCard {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;
}

interface AdminPageLayoutProps {
  // Header
  title: string;
  description: string;
  
  // Stats (optional)
  stats?: StatCard[];
  
  // Search & Actions
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  
  // Primary action button
  primaryAction?: {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
  };
  
  // Additional filters (optional)
  filters?: ReactNode;
  
  // Main content (table, grid, etc.)
  children: ReactNode;
}

export function AdminPageLayout({
  title,
  description,
  stats,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  primaryAction,
  filters,
  children,
}: AdminPageLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">{title}</h1>
        <p className="mt-2 text-gray-600">{description}</p>
      </div>

      {/* Stats Cards */}
      {stats && stats.length > 0 && (
        <div className={`grid gap-6 ${stats.length === 2 ? 'sm:grid-cols-2' : stats.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.iconColor || 'text-blue-600'}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search & Filters */}
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search */}
              {onSearchChange && (
                <div className="relative flex-1 sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full rounded-lg border-2 border-gray-200 py-2 pl-10 pr-4 text-sm transition-colors focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                  />
                </div>
              )}
              
              {/* Additional Filters */}
              {filters}
            </div>

            {/* Primary Action Button */}
            {primaryAction && (
              <Button
                onClick={primaryAction.onClick}
                className="bg-[#2F2582] hover:bg-[#241c66]"
              >
                <primaryAction.icon className="mr-2 h-4 w-4" />
                {primaryAction.label}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
