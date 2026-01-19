"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useAdmin } from "@/lib/hooks";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAdminPreferencesStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAdmin, isLoading } = useAdmin({ redirectIfNotAdmin: true });
  const { themeMode, fontSize, sidebarLayout } = useAdminPreferencesStore();

  // Apply dark mode class to html element
  useEffect(() => {
    const root = window.document.documentElement;
    if (themeMode === "dark") {
      root.classList.add("dark");
    } else if (themeMode === "light") {
      root.classList.remove("dark");
    } else {
      // System preference
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      if (systemDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [themeMode]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAdmin) {
    return null; // Redirecting...
  }

  const fontSizeClass = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  }[fontSize];

  return (
    <div
      className={cn(
        "flex h-screen w-full overflow-hidden bg-gray-50 transition-colors duration-200 dark:bg-gray-900",
        fontSizeClass,
      )}
    >
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        compact={sidebarLayout === "compact"}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 dark:text-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
