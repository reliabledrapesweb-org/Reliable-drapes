"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Menu, X, Search, User, ShoppingCart } from "lucide-react";
import { MobileMenu } from "./MobileMenu";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "The Brand", link: "/about" },
    { name: "Careers", link: "#careers" },
    { name: "E-catalogue", link: "/e-catalogue" },
    { name: "Store Locator", link: "#store-locator" },
    { name: "Style Expert", link: "#style-expert" },
    { name: "Shop", link: "#shop" },
  ];

  const shouldUseWhiteText = isHome || isScrolled;

  return (
    <header className="fixed top-0 left-0 z-[100] w-full">
      {/* NAV */}
      <nav
        className={`backdrop-blur-[5.1px] ${
          isScrolled ? "bg-black/80" : "bg-[rgba(0,0,0,0.1)]"
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
            {navLinks.map((item, i) => (
              <motion.a
                key={i}
                href={item.link}
                className={`${
                  shouldUseWhiteText ? "text-white" : "text-black"
                } ${
                  pathname === item.name && "font-semibold"
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
                className={`${
                  shouldUseWhiteText ? "text-white" : "text-black"
                } cursor-pointer`}
                aria-label="Account"
                whileHover={{ scale: 1.1, opacity: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <User className="h-4 w-4 xl:h-5 xl:w-5" />
              </motion.button>

              <motion.button
                className={`${
                  shouldUseWhiteText ? "text-white" : "text-black"
                } relative cursor-pointer`}
                aria-label="Cart"
                whileHover={{ scale: 1.1, opacity: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <ShoppingCart className="h-4 w-4 xl:h-5 xl:w-5" />
                <span
                  className={`absolute -top-2 -right-2 bg-[#2f2581] ${
                    shouldUseWhiteText ? "text-white" : "text-black"
                  } flex h-4 w-4 items-center justify-center rounded-full text-xs`}
                >
                  2
                </span>
              </motion.button>
            </div>

            <motion.a
              href="#trader-login"
              className={`${
                shouldUseWhiteText ? "text-white" : "text-black"
              } cursor-pointer text-sm tracking-tight xl:text-base`}
              whileHover={{ scale: 1.05, opacity: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              Trader Log in
            </motion.a>
          </div>

          {/* MOBILE/TABLET ACTIONS */}
          <div className="flex items-center gap-3 md:gap-4 lg:hidden">
            <motion.button
              className={`${
                shouldUseWhiteText ? "text-white" : "text-black"
              } cursor-pointer`}
              aria-label="Search"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Search className="h-4 w-4 md:h-5 md:w-5" />
            </motion.button>

            <motion.button
              className={`${
                shouldUseWhiteText ? "text-white" : "text-black"
              } relative cursor-pointer`}
              aria-label="Cart"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
              <span
                className={`absolute -top-1.5 -right-1.5 bg-[#2f2581] ${
                  shouldUseWhiteText ? "text-white" : "text-black"
                } flex h-3.5 w-3.5 items-center justify-center rounded-full text-[10px] md:h-4 md:w-4 md:text-xs`}
              >
                2
              </span>
            </motion.button>

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
                <Menu className="h-6 w-6" />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </nav>

      <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} navLinks={navLinks} />
    </header>
  );
}
