"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Menu, Search, User, ShoppingCart, LogOut } from "lucide-react";
import { MobileMenu } from "./MobileMenu";
import { SearchModal } from "./SearchModal";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useScrollPosition } from "@/lib/hooks";
import { useAuthStore, useCartStore } from "@/lib/store";
import { NAV_LINKS } from "@/lib/constants";
import { supabaseClient } from "@/lib/supabase/client";

export function Header() {
    const pathname = usePathname();
    const isHome = pathname === "/";
    const [isOpen, setIsOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const isScrolled = useScrollPosition(50);

    const { user, logout } = useAuthStore();
    const { getTotalItems, toggleCart } = useCartStore();
    const totalItems = getTotalItems();
    const shouldUseWhiteText = isHome || isScrolled;

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
                            <motion.button
                                onClick={() => setShowSearchModal(true)}
                                className={`${
                                    shouldUseWhiteText ? "text-white" : "text-black"
                                } cursor-pointer`}
                                aria-label="Search"
                                whileHover={{ scale: 1.1, opacity: 0.8 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Search className="h-4 w-4 xl:h-5 xl:w-5" />
                            </motion.button>

                            <motion.button
                                onClick={toggleCart}
                                className={`${
                                    shouldUseWhiteText ? "text-white" : "text-black"
                                } relative cursor-pointer`}
                                aria-label="Cart"
                                whileHover={{ scale: 1.1, opacity: 0.8 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ShoppingCart className="h-4 w-4 xl:h-5 xl:w-5" />
                                {totalItems > 0 && (
                                    <span
                                        className="absolute -top-2 -right-2 bg-[#2f2581] text-white flex h-4 w-4 items-center justify-center rounded-full text-xs"
                                    >
                                        {totalItems}
                                    </span>
                                )}
                            </motion.button>
                        </div>

                        {/* USER MENU OR LOGIN */}
                        {user ? (
                            <div className="relative">
                                <motion.button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className={`${
                                        shouldUseWhiteText ? "text-white" : "text-black"
                                    } cursor-pointer`}
                                    aria-label="User account menu"
                                    whileHover={{ scale: 1.1, opacity: 0.8 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <User className="h-5 w-5 xl:h-6 xl:w-6" />
                                </motion.button>

                                {showUserMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-3 w-56 rounded-lg border border-gray-200 bg-white shadow-xl overflow-hidden"
                                    >
                                        {/* User Info Header */}
                                        <div className="border-b border-gray-100 px-4 py-3 bg-gray-50">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {user.full_name || user.email.split('@')[0]}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>

                                        <button
                                            onClick={async () => {
                                                await supabaseClient.auth.signOut();
                                                logout();
                                                setShowUserMenu(false);
                                            }}
                                            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
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
                                className={`${
                                    shouldUseWhiteText ? "text-white" : "text-black"
                                } cursor-pointer text-sm tracking-tight xl:text-base`}
                                whileHover={{ scale: 1.05, opacity: 0.8 }}
                                transition={{ duration: 0.2 }}
                            >
                                Trader Log In
                            </motion.a>
                        )}
                    </div>

                    {/* MOBILE/TABLET ACTIONS */}
                    <div className="flex items-center gap-3 md:gap-4 lg:hidden">
                        <motion.button
                            onClick={() => setShowSearchModal(true)}
                            className={`${shouldUseWhiteText ? "text-white" : "text-black"
                                } cursor-pointer`}
                            aria-label="Search"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Search className="h-4 w-4 md:h-5 md:w-5" />
                        </motion.button>

                        <motion.button
                            onClick={toggleCart}
                            className={`${shouldUseWhiteText ? "text-white" : "text-black"
                                } relative cursor-pointer`}
                            aria-label="Cart"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                            {totalItems > 0 && (
                                <span
                                    className="absolute -top-1.5 -right-1.5 bg-[#2f2581] text-white flex h-3.5 w-3.5 items-center justify-center rounded-full text-[10px] md:h-4 md:w-4 md:text-xs"
                                >
                                    {totalItems}
                                </span>
                            )}
                        </motion.button>

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

            <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} navLinks={NAV_LINKS} />

            {/* SEARCH MODAL */}
            <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
        </header>
    );
}
