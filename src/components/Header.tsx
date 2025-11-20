"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Menu, X, Search, User, ShoppingCart } from "lucide-react";
import { MobileMenu } from "./MobileMenu";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "The Brand", link: "/about" },
    { name: "Careers", link: "#careers" },
    { name: "E-catalogue", link: "#e-catalogue" },
    { name: "Store Locator", link: "#store-locator" },
    { name: "Style Expert", link: "#style-expert" },
    { name: "Shop", link: "#shop" },
  ];

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
            <Link href={"/"}>
              <Image
                src={isHome ? "/images/logo.png" : "/images/defaultlogo.png"}
                alt="Logo"
                width={100}
                height={100}
                className="object-contain md:w-[130px] lg:w-[140px]"
                priority
              />
            </Link>
          </motion.div>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((item, i) => (
              <motion.a
                key={i}
                href={item.link}
                className={`${isHome ? "text-white" : "text-black"} ${
                  pathname === item.name && "font-semibold"
                } tracking-tight cursor-pointer text-sm xl:text-base`}
                whileHover={{ scale: 1.05, opacity: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                {item.name}
              </motion.a>
            ))}
          </div>

          {/* DESKTOP ACTIONS */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <div className="flex items-center gap-4 xl:gap-6">
              <motion.button
                className={`${
                  isHome ? "text-white" : "text-black"
                } cursor-pointer`}
                aria-label="Search"
                whileHover={{ scale: 1.1, opacity: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Search className="w-4 h-4 xl:w-5 xl:h-5" />
              </motion.button>

              <motion.button
                className={`${
                  isHome ? "text-white" : "text-black"
                } cursor-pointer`}
                aria-label="Account"
                whileHover={{ scale: 1.1, opacity: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <User className="w-4 h-4 xl:w-5 xl:h-5" />
              </motion.button>

              <motion.button
                className={`${
                  isHome ? "text-white" : "text-black"
                } relative cursor-pointer`}
                aria-label="Cart"
                whileHover={{ scale: 1.1, opacity: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <ShoppingCart className="w-4 h-4 xl:w-5 xl:h-5" />
                <span
                  className={`absolute -top-2 -right-2 bg-[#2f2581] ${
                    isHome ? "text-white" : "text-black"
                  } text-xs rounded-full w-4 h-4 flex items-center justify-center`}
                >
                  2
                </span>
              </motion.button>
            </div>

            <motion.a
              href="#trader-login"
              className={`${
                isHome ? "text-white" : "text-black"
              } tracking-tight cursor-pointer text-sm xl:text-base`}
              whileHover={{ scale: 1.05, opacity: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              Trader Log in
            </motion.a>
          </div>

          {/* MOBILE/TABLET ACTIONS */}
          <div className="flex lg:hidden items-center gap-3 md:gap-4">
            <motion.button
              className={`${
                isHome ? "text-white" : "text-black"
              } cursor-pointer`}
              aria-label="Search"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Search className="w-4 h-4 md:w-5 md:h-5" />
            </motion.button>

            <motion.button
              className={`${
                isHome ? "text-white" : "text-black"
              } relative cursor-pointer`}
              aria-label="Cart"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
              <span
                className={`absolute -top-1.5 -right-1.5 bg-[#2f2581] ${
                  isHome ? "text-white" : "text-black"
                } text-[10px] md:text-xs rounded-full w-3.5 h-3.5 md:w-4 md:h-4 flex items-center justify-center`}
              >
                2
              </span>
            </motion.button>

            {/* MENU BUTTON */}
            <motion.button
              className={`${
                isHome ? "text-white" : "text-black"
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
                <Menu className="w-6 h-6" />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </nav>

      <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} navLinks={navLinks} />
    </header>
  );
}
