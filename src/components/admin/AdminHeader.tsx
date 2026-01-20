"use client";

import Image from "next/image";
import { useState } from "react";
import { Menu, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { supabaseClient } from "@/lib/supabase/client";
import { NotificationDropdown } from "./NotificationDropdown";
import { useAdminPreferencesStore, ACCENT_COLORS } from "@/lib/store";
import { LogoutModal } from "@/components/features/profile/LogoutModal";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, logout } = useAuthStore();
  const { accentColor, showBreadcrumbs } = useAdminPreferencesStore();
  const router = useRouter();

  const accent = ACCENT_COLORS[accentColor];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:h-20 lg:px-8 dark:border-gray-700 dark:bg-gray-800">
      {/* Left: Mobile Menu + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-gray-100 lg:hidden dark:text-gray-200 dark:hover:bg-gray-700"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div>
          {/* If breadcrumbs are hidden, show simpler title or context */}
          <h1 className="text-xl font-semibold text-gray-900 lg:text-2xl dark:text-gray-100">
            Admin Dashboard
          </h1>
          {/* Placeholder for breadcrumbs implementation if enabled */}
          {showBreadcrumbs && (
            <p className="hidden text-xs text-gray-500 lg:block dark:text-gray-400">
              Dashboard
            </p>
          )}
        </div>
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
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50 lg:px-4 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            {user?.avatar_url ? (
              <div className="relative h-8 w-8 overflow-hidden rounded-full lg:h-10 lg:w-10">
                <Image
                  src={user.avatar_url}
                  alt={user.full_name || "User avatar"}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-white lg:h-10 lg:w-10"
                style={{ backgroundColor: accent.primary }}
              >
                <User className="h-4 w-4 lg:h-5 lg:w-5" />
              </div>
            )}
            <div className="hidden text-left lg:block">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                {user?.full_name || user?.email?.split("@")[0] || "Admin"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Administrator
              </p>
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
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
              >
                {/* User Info */}
                <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-700/50">
                  {user?.avatar_url ? (
                    <div className="relative h-10 w-10 overflow-hidden rounded-full">
                      <Image
                        src={user.avatar_url}
                        alt={user.full_name || "User avatar"}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: accent.primary }}
                    >
                      <User className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-200">
                      {user?.full_name || user?.email?.split("@")[0] || "Admin"}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      router.push("/admin/settings");
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <User className="h-4 w-4" />
                    Profile Settings
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowLogoutModal(true);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
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

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={async () => {
          await supabaseClient.auth.signOut();
          logout();
          router.push("/");
        }}
      />
    </header>
  );
}
