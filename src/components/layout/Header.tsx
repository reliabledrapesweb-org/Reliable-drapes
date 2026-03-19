"use client";

import Image from "next/image";
import { motion } from "motion/react";
import {
  Menu,
  Search,
  User,
  ShoppingCart,
  LogOut,
  Heart,
  Building2,
} from "lucide-react";
import { MobileMenu } from "./MobileMenu";
import { SearchModal } from "./SearchModal";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useScrollPosition } from "@/lib/hooks";
import { useAuthStore, useCartStore, useWishlistStore } from "@/lib/store";
import { NAV_LINKS, DEALER_CONFIG } from "@/lib/constants";
import { supabaseClient } from "@/lib/supabase/client";
import { LogoutModal } from "@/components/features/profile/LogoutModal";
import { useCommerceFeatures } from "@/components/providers";
import { ComingSoonModal } from "@/components/shared";
import { getGemAssessedLogoSettings } from "@/lib/actions/site-settings";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [gemAssessedLogo, setGemAssessedLogo] = useState<{
    enabled: boolean;
    url: string | null;
    size: "small" | "medium" | "large" | "extra-large";
  }>({
    enabled: false,
    url: null,
    size: "medium",
  });
  const isScrolled = useScrollPosition(50);

  const { user, logout, dealerSession, setDealerSession } = useAuthStore();
  const { getTotalItems, toggleCart } = useCartStore();
  const { getTotalItems: getWishlistTotal } = useWishlistStore();
  const { commerceFeaturesEnabled, comingSoonMessage } = useCommerceFeatures();
  const totalItems = getTotalItems();
  const wishlistTotal = getWishlistTotal();
  const shouldUseWhiteText = isHome || isScrolled;

  useEffect(() => {
    async function fetchGemLogoSettings() {
      try {
        const settings = await getGemAssessedLogoSettings();
        setGemAssessedLogo(settings);
      } catch {
        setGemAssessedLogo({ enabled: false, url: null, size: "medium" });
      }
    }

    fetchGemLogoSettings();
  }, []);

  // Reusable action buttons component
  const ActionButtons = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      <motion.button
        onClick={() => {
          setShowSearchModal(true);
        }}
        className={`${
          shouldUseWhiteText ? "text-white" : "text-black"
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
        className={`${
          shouldUseWhiteText ? "text-white" : "text-black"
        } relative cursor-pointer`}
        aria-label="Wishlist"
        onClick={(e) => {
          if (!commerceFeaturesEnabled) {
            e.preventDefault();
            setShowComingSoonModal(true);
          }
        }}
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
        onClick={() => {
          if (!commerceFeaturesEnabled) {
            setShowComingSoonModal(true);
            return;
          }
          toggleCart();
        }}
        className={`${
          shouldUseWhiteText ? "text-white" : "text-black"
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
    const sizeClasses =
      size === "sm" ? "h-6 w-6 md:h-7 md:w-7" : "h-7 w-7 xl:h-8 xl:w-8";

    if (user?.avatar_url) {
      return (
        <div
          className={`${sizeClasses} relative overflow-hidden rounded-full ring-2 ring-white/30`}
        >
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
        className={
          size === "sm" ? "h-5 w-5 md:h-6 md:w-6" : "h-5 w-5 xl:h-6 xl:w-6"
        }
      />
    );
  };

  // Reusable user menu component
  const UserMenu = ({ isMobile = false }: { isMobile?: boolean }) =>
    user ? (
      <div className="relative">
        <motion.button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`${
            shouldUseWhiteText ? "text-white" : "text-black"
          } flex cursor-pointer items-center`}
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
            <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3">
              {user.avatar_url ? (
                <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-gray-200">
                  <Image
                    src={user.avatar_url}
                    alt={user.full_name || "User avatar"}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2f2582]/10">
                  <User className="h-5 w-5 text-[#2f2582]" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
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
      <div className="hidden items-center gap-3 lg:flex xl:gap-4">
        {/* Customer Login */}
        <motion.a
          href="/login"
          className={`${
            shouldUseWhiteText ? "text-white" : "text-black"
          } cursor-pointer text-sm tracking-tight xl:text-base`}
          whileHover={{ scale: 1.05, opacity: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          Login
        </motion.a>

        {/* Divider */}
        <span
          className={`${
            shouldUseWhiteText ? "text-white/40" : "text-black/40"
          }`}
        >
          |
        </span>

        {/* Trader Login */}
        <motion.a
          href="/trader-login"
          className={`${
            shouldUseWhiteText ? "text-white" : "text-black"
          } flex cursor-pointer items-center gap-1.5 text-sm tracking-tight xl:text-base`}
          whileHover={{ scale: 1.05, opacity: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <Building2 className="h-4 w-4" />
          Trader Login
        </motion.a>
      </div>
    );

  const GemLogo = () =>
    gemAssessedLogo.enabled && gemAssessedLogo.url ? (
      <motion.div
        className="ml-3 flex items-center xl:ml-4"
        whileHover={{ scale: 1.03, opacity: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <Image
          src={gemAssessedLogo.url}
          alt="GEM Assessed Logo"
          width={300}
          height={300}
          unoptimized
          style={{
            height:
              ({
                small: 56,
                medium: 64,
                large: 72,
                "extra-large": 76,
              } as const)[gemAssessedLogo.size],
            width:
              ({
                small: 56,
                medium: 64,
                large: 72,
                "extra-large": 76,
              } as const)[gemAssessedLogo.size],
            objectFit: "contain",
          }}
        />
      </motion.div>
    ) : null;

  return (
    <header className="fixed top-0 left-0 z-[100] w-full">
      {/* NAV */}
      <nav
        className={`backdrop-blur-[5.1px] ${
          isScrolled ? "bg-black/80" : "bg-[rgba(0,0,0,0.1)]"
        } h-14 transition-colors duration-300 md:h-16 lg:h-[68px] xl:h-20`}
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 md:px-6 lg:px-6 xl:px-10">
          {/* LOGO */}
          <motion.div
            className="flex shrink-0 cursor-pointer items-center"
            whileHover={{ scale: 1.03 }}
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
                className="w-[90px] object-contain md:w-[120px] lg:w-[110px] xl:w-[130px]"
                priority
              />
            </Link>
          </motion.div>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden items-center lg:mx-3 lg:flex lg:gap-1 xl:mx-6 xl:gap-3 2xl:gap-4">
            {NAV_LINKS.map((item, i) => (
              <motion.a
                key={i}
                href={item.link}
                className={`${
                  shouldUseWhiteText ? "text-white" : "text-black"
                } ${
                  pathname === item.link ? "font-semibold" : "font-normal"
                } cursor-pointer rounded-full px-2 py-1 text-[13px] tracking-tight whitespace-nowrap transition-colors duration-200 xl:px-2.5 xl:text-sm 2xl:text-[15px] ${
                  shouldUseWhiteText ? "hover:bg-white/10" : "hover:bg-black/5"
                }`}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.15 }}
              >
                {item.name}
              </motion.a>
            ))}
          </div>

          {/* DESKTOP ACTIONS */}
          <div className="hidden shrink-0 items-center gap-4 lg:flex xl:gap-6">
            <div className="flex items-center gap-3 xl:gap-5">
              <ActionButtons />
            </div>
            <UserMenu />
            <GemLogo />
          </div>

          {/* MOBILE/TABLET ACTIONS */}
          <div className="flex items-center gap-2.5 md:gap-3.5 lg:hidden">
            <ActionButtons isMobile={true} />
            <UserMenu isMobile={true} />

            {/* MENU BUTTON */}
            <motion.button
              className={`${
                shouldUseWhiteText ? "text-white" : "text-black"
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
                <Menu className="h-5 w-5 md:h-6 md:w-6" />
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

      <ComingSoonModal
        isOpen={showComingSoonModal}
        onClose={() => setShowComingSoonModal(false)}
        message={comingSoonMessage}
      />

      {/* LOGOUT MODAL */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={async () => {
          await supabaseClient.auth.signOut();
          logout();
          // Also clear dealer session if exists
          if (dealerSession) {
            setDealerSession(null);
            localStorage.removeItem(DEALER_CONFIG.localStorageKey);
          }
          router.push("/");
        }}
      />
    </header>
  );
}
