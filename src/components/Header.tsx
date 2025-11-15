"use client";

import { Menu, Search, User, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { motion } from "motion/react";

export function Header() {
  return (
    <header className="top-0 left-0 w-full z-50 fixed">
      <nav className="backdrop-blur-[5.1px] bg-[rgba(0,0,0,0.1)] h-14 md:h-16 lg:h-[72px]">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={120}
              height={38}
              className="object-contain md:w-[130px] lg:w-[140px]"
              priority
            />
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <motion.a
              href="#brand"
              className="text-white tracking-tight cursor-pointer text-sm xl:text-base"
              whileHover={{ scale: 1.05, opacity: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              The Brand
            </motion.a>
            <motion.a
              href="#careers"
              className="text-white tracking-tight cursor-pointer text-sm xl:text-base"
              whileHover={{ scale: 1.05, opacity: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              Careers
            </motion.a>
            <motion.a
              href="#catalogue"
              className="text-white tracking-tight cursor-pointer text-sm xl:text-base"
              whileHover={{ scale: 1.05, opacity: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              E-catalogue
            </motion.a>
            <motion.a
              href="#locator"
              className="text-white tracking-tight cursor-pointer text-sm xl:text-base"
              whileHover={{ scale: 1.05, opacity: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              Store Locator
            </motion.a>
            <motion.a
              href="#expert"
              className="text-white tracking-tight cursor-pointer text-sm xl:text-base"
              whileHover={{ scale: 1.05, opacity: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              StyleExpert
            </motion.a>
            <motion.a
              href="#shop"
              className="text-white tracking-tight cursor-pointer text-sm xl:text-base"
              whileHover={{ scale: 1.05, opacity: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              Shop
            </motion.a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <div className="flex items-center gap-4 xl:gap-6">
              <motion.button
                className="text-white cursor-pointer"
                aria-label="Search"
                whileHover={{ scale: 1.1, opacity: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Search className="w-4 h-4 xl:w-5 xl:h-5" />
              </motion.button>
              <motion.button
                className="text-white cursor-pointer"
                aria-label="Account"
                whileHover={{ scale: 1.1, opacity: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <User className="w-4 h-4 xl:w-5 xl:h-5" />
              </motion.button>
              <motion.button
                className="relative text-white cursor-pointer"
                aria-label="Cart"
                whileHover={{ scale: 1.1, opacity: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <ShoppingCart className="w-4 h-4 xl:w-5 xl:h-5" />
                <span className="absolute -top-2 -right-2 bg-[#2f2581] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  2
                </span>
              </motion.button>
            </div>
            <motion.a
              href="#login"
              className="text-white tracking-tight cursor-pointer text-sm xl:text-base"
              whileHover={{ scale: 1.05, opacity: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              Trader Log in
            </motion.a>
          </div>

          {/* Tablet & Mobile Actions */}
          <div className="flex lg:hidden items-center gap-3 md:gap-4">
            <motion.button
              className="text-white cursor-pointer"
              aria-label="Search"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Search className="w-4 h-4 md:w-5 md:h-5" />
            </motion.button>
            <motion.button
              className="relative text-white cursor-pointer"
              aria-label="Cart"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
              <span className="absolute -top-1.5 -right-1.5 bg-[#2f2581] text-white text-[10px] md:text-xs rounded-full w-3.5 h-3.5 md:w-4 md:h-4 flex items-center justify-center">
                2
              </span>
            </motion.button>
            <motion.button
              className="text-white cursor-pointer"
              aria-label="Menu"
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
          </div>
        </div>
      </nav>
    </header>
  );
}
