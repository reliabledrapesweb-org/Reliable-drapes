"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Menu, Search, User, ShoppingCart, LogOut, Heart } from "lucide-react";
import { MobileMenu } from "./MobileMenu";
import { SearchModal } from "./SearchModal";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useScrollPosition } from "@/lib/hooks";
import { useAuthStore, useCartStore, useWishlistStore } from "@/lib/store";
import { NAV_LINKS } from "@/lib/constants";
import { supabaseClient } from "@/lib/supabase/client";
import { LogoutModal } from "@/components/features/profile/LogoutModal";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const isScrolled = useScrollPosition(50);

  const { user, logout } = useAuthStore();
  const { getTotalItems, toggleCart } = useCartStore();
  const { getTotalItems: getWishlistTotal } = useWishlistStore();
  const totalItems = getTotalItems();
  const wishlistTotal = getWishlistTotal();
  const shouldUseWhiteText = isHome || isScrolled;

  // Reusable action buttons component
  const ActionButtons = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      <motion.button
        onClick={() => setShowSearchModal(true)}
        className={`${shouldUseWhiteText ? "text-white" : "text-black"
          } cursor-pointer`}
        aria-label="Search"
        whileHover={{ scale: 1.1, opacity: isMobile ? 1 : 0.8 }}
        transition={{ duration: 0.2 }}
      >
        <Search
          className={
            isMobile ? "h-4 w-4 md:h-5 md:w-5" : "h-4 w-4 xl:h-5 xl:w-5"
          }
        />
      </motion.button>

      <motion.a
        href="/wishlist"
        className={`${shouldUseWhiteText ? "text-white" : "text-black"
          } relative cursor-pointer`}
        aria-label="Wishlist"
        whileHover={{ scale: 1.1, opacity: isMobile ? 1 : 0.8 }}
        transition={{ duration: 0.2 }}
      >
        <Heart
          className={
            isMobile ? "h-4 w-4 md:h-5 md:w-5" : "h-4 w-4 xl:h-5 xl:w-5"
          }
        />
        {wishlistTotal > 0 && (
          <span
            className={
              isMobile
                ? "absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white md:h-4 md:w-4 md:text-xs"
                : "absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white"
            }
          >
            {wishlistTotal}
          </span>
        )}
      </motion.a>

      <motion.button
        onClick={toggleCart}
        className={`${shouldUseWhiteText ? "text-white" : "text-black"
          } relative cursor-pointer`}
        aria-label="Cart"
        whileHover={{ scale: 1.1, opacity: isMobile ? 1 : 0.8 }}
        transition={{ duration: 0.2 }}
      >
        <ShoppingCart
          className={
            isMobile ? "h-4 w-4 md:h-5 md:w-5" : "h-4 w-4 xl:h-5 xl:w-5"
          }
        />
        {totalItems > 0 && (
          <span
            className={
              isMobile
                ? "absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#2f2581] text-[10px] text-white md:h-4 md:w-4 md:text-xs"
                : "absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#2f2581] text-xs text-white"
            }
          >
            {totalItems}
          </span>
        )}
      </motion.button>
    </>
  );

  // User avatar component
  const UserAvatar = ({ size = "md" }: { size?: "sm" | "md" }) => {
    const sizeClasses = size === "sm"
      ? "h-6 w-6 md:h-7 md:w-7"
      : "h-7 w-7 xl:h-8 xl:w-8";

    if (user?.avatar_url) {
      return (
        <div className={`${sizeClasses} relative overflow-hidden rounded-full ring-2 ring-white/30`}>
          <Image
            src={user.avatar_url}
            alt={user.full_name || "User avatar"}
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      );
    }

    return (
      <User
        className={size === "sm" ? "h-5 w-5 md:h-6 md:w-6" : "h-5 w-5 xl:h-6 xl:w-6"}
      />
    );
  };

  // Reusable user menu component
  const UserMenu = ({ isMobile = false }: { isMobile?: boolean }) =>
    user ? (
      <div className="relative">
        <motion.button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`${shouldUseWhiteText ? "text-white" : "text-black"
            } cursor-pointer flex items-center`}
          aria-label="User account menu"
          whileHover={{ scale: 1.1, opacity: isMobile ? 1 : 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <UserAvatar size={isMobile ? "sm" : "md"} />
        </motion.button>

        {showUserMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 z-[110] mt-3 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
          >
            {/* User Info Header */}
            <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 flex items-center gap-3">
              {user.avatar_url ? (
                <div className="h-10 w-10 relative overflow-hidden rounded-full ring-2 ring-gray-200">
                  <Image
                    src={user.avatar_url}
                    alt={user.full_name || "User avatar"}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-[#2f2582]/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-[#2f2582]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.full_name || user.email.split("@")[0]}
                </p>
                <p className="truncate text-xs text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="p-1">
              <Link
                href="/profile"
                className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                onClick={() => setShowUserMenu(false)}
              >
                <User className="h-4 w-4" />
                Your Profile
              </Link>
            </div>

            <button
              onClick={() => {
                setShowUserMenu(false);
                setShowLogoutModal(true);
              }}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </motion.div>
        )}
      </div>
    ) : (
      <motion.a
        href="/login"
        className={`${shouldUseWhiteText ? "text-white" : "text-black"
          } hidden cursor-pointer text-sm tracking-tight lg:inline-block xl:text-base`}
        whileHover={{ scale: 1.05, opacity: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        Trader Log In
      </motion.a>
    );

  return (
    <header className="fixed top-0 left-0 z-[100] w-full">
      {/* NAV */}
      <nav
        className={`backdrop-blur-[5.1px] ${isScrolled ? "bg-black/80" : "bg-[rgba(0,0,0,0.1)]"
          } h-14 transition-colors duration-300 md:h-16 lg:h-[72px]`}
      >
        <div className="container mx-auto flex h-full items-center justify-between px-4 md:px-6 lg:px-8">
          {/* LOGO */}
          <motion.div
            className="flex cursor-pointer items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Link href={"/"}>
              <Image
                src={
                  shouldUseWhiteText
                    ? "/images/logo.png"
                    : "/images/defaultlogo.png"
                }
                alt="Logo"
                width={100}
                height={100}
                className="object-contain md:w-[130px] lg:w-[140px]"
                priority
              />
            </Link>
          </motion.div>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden items-center gap-6 lg:flex xl:gap-8">
            {NAV_LINKS.map((item, i) => (
              <motion.a
                key={i}
                href={item.link}
                className={`${shouldUseWhiteText ? "text-white" : "text-black"
                  } ${pathname === item.name && "font-semibold"
                  } cursor-pointer text-sm tracking-tight xl:text-base`}
                whileHover={{ scale: 1.05, opacity: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                {item.name}
              </motion.a>
            ))}
          </div>

          {/* DESKTOP ACTIONS */}
          <div className="hidden items-center gap-6 lg:flex xl:gap-8">
            <div className="flex items-center gap-4 xl:gap-6">
              <ActionButtons />
            </div>
            <UserMenu />
          </div>

          {/* MOBILE/TABLET ACTIONS */}
          <div className="flex items-center gap-3 md:gap-4 lg:hidden">
            <ActionButtons isMobile={true} />
            <UserMenu isMobile={true} />

            {/* MENU BUTTON */}
            <motion.button
              className={`${shouldUseWhiteText ? "text-white" : "text-black"
                } cursor-pointer`}
              aria-label="Menu"
              onClick={() => setIsOpen(true)}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <Menu className="h-6 w-6" />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </nav>

      <MobileMenu
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        navLinks={NAV_LINKS}
        user={user}
      />

      {/* SEARCH MODAL */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      {/* LOGOUT MODAL */}
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
