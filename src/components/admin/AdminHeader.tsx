"use client";

import { Menu, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { supabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { NotificationDropdown } from "./NotificationDropdown";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:h-20 lg:px-8">
      {/* Left: Mobile Menu + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900 lg:text-2xl">
          Admin Dashboard
        </h1>
      </div>

      {/* Right: Notifications + User Menu */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Notifications */}
        <NotificationDropdown />

        {/* User Menu */}
        <div className="relative">
          <motion.button
            onClick={() => setShowUserMenu(!showUserMenu)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50 lg:px-4"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2F2582] text-white lg:h-10 lg:w-10">
              <User className="h-4 w-4 lg:h-5 lg:w-5" />
            </div>
            <div className="hidden text-left lg:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.full_name || user?.email?.split("@")[0] || "Admin"}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </motion.button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
              >
                {/* User Info */}
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.full_name || user?.email?.split("@")[0] || "Admin"}
                  </p>
                  <p className="truncate text-xs text-gray-500">{user?.email}</p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      router.push("/admin/settings");
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <User className="h-4 w-4" />
                    Profile Settings
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
