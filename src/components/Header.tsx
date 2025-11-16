"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Search, User, ShoppingCart } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="top-0 left-0 w-full z-50 fixed">
      {/* NAV */}
      <nav className="backdrop-blur-[5.1px] bg-[rgba(0,0,0,0.1)] h-14 md:h-16 lg:h-[72px]">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* LOGO */}
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

          {/* DESKTOP NAVIGATION */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {[
              "The Brand",
              "Careers",
              "E-catalogue",
              "Store Locator",
              "StyleExpert",
              "Shop",
            ].map((item, i) => (
              <motion.a
                key={i}
                href="#"
                className="text-white tracking-tight cursor-pointer text-sm xl:text-base"
                whileHover={{ scale: 1.05, opacity: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                {item}
              </motion.a>
            ))}
          </div>

          {/* DESKTOP ACTIONS */}
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

          {/* MOBILE/TABLET ACTIONS */}
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

            {/* MENU BUTTON */}
            <motion.button
              className="text-white cursor-pointer"
              aria-label="Menu"
              onClick={() => setIsOpen((prev) => !prev)}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {isOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* FULL SCREEN DROPDOWN MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xl z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute top-24 left-0 right-0 mx-auto w-full px-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center space-y-8 text-white text-xl font-light tracking-wide">
                {[
                  "The Brand",
                  "Careers",
                  "E-catalogue",
                  "Store Locator",
                  "StyleExpert",
                  "Shop",
                ].map((item, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    onClick={() => setIsOpen(false)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="hover:opacity-70 transition"
                  >
                    {item}
                  </motion.a>
                ))}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="mt-6 border border-white/30 text-white px-6 py-2 rounded-lg backdrop-blur-sm"
                >
                  Trader Log In
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
