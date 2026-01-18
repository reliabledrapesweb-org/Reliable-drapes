"use client";

import { Mail, Phone, MapPin, InstagramIcon } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#0e0e0e] text-white">
      <div className="container mx-auto px-6 py-10 md:py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="mb-10 grid grid-cols-1 gap-8 md:mb-12 md:grid-cols-2 md:gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Company Info */}
          <div className="space-y-4 md:col-span-2 lg:col-span-4">
            {/* Logo */}
            <motion.div
              className="flex cursor-pointer items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={100}
                height={100}
                className="object-contain md:w-[130px] lg:w-[140px]"
                priority
              />
            </motion.div>

            <p className="text-sm text-[#f1f1f1] md:text-base">
              A Unit of Shree Ambica Furnishings (India) Pvt. Ltd.
            </p>

            <p className="text-sm text-[#7e7e7e] md:text-base">
              Creating spaces of comfort and tranquility with our premium
              collection of home essentials. Experience luxury, sustainability,
              and timeless design.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-[#7e7e7e]" />
                <span className="text-sm text-[#7e7e7e] md:text-base">
                  hello@Reliable.com
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-[#7e7e7e]" />
                <span className="text-sm text-[#7e7e7e] md:text-base">
                  1-800-Reliable
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-[#7e7e7e]" />
                <span className="text-sm text-[#7e7e7e] md:text-base">
                  Delhi, India
                </span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div className="space-y-4 lg:col-span-2">
            <h3 className="text-sm tracking-widest uppercase md:text-base">
              Shop
            </h3>
            <ul className="space-y-3 text-sm text-[#7e7e7e] md:text-base">
              <li>
                <motion.a
                  href="/shop"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  All Products
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="/shop?category=curtains"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  Curtains
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="/shop?category=upholstery"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  Upholstery
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="/shop?category=sheers"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  Sheers
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="/shop?category=bed-sheets"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  Bed sheets
                </motion.a>
              </li>
            </ul>
          </div>

          {/* Customer Care Links */}
          <div className="space-y-4 lg:col-span-2">
            <h3 className="text-sm tracking-widest uppercase md:text-base">
              Customer Care
            </h3>
            <ul className="space-y-3 text-sm text-[#7e7e7e] md:text-base">
              <li>
                <motion.a
                  href="/contact"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  Contact Us
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="/terms-of-service"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  Returns & Exchanges
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="/terms-of-service"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  Shipping Info
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="/terms-of-service"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  FAQ
                </motion.a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4 lg:col-span-2">
            <h3 className="text-sm tracking-widest uppercase md:text-base">
              Company
            </h3>
            <ul className="space-y-3 text-sm text-[#7e7e7e] md:text-base">
              <li>
                <motion.a
                  href="/about"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  About Us
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="/careers"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  Careers
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="/e-catalogue"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  E-Catalogue
                </motion.a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4 lg:col-span-2">
            <h3 className="text-sm text-[#7e7e7e] md:text-base">Follow us</h3>
            <div className="flex items-center gap-4">
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-gray-400 transition-colors hover:text-white"
                aria-label="Instagram"
              >
                <svg
                  viewBox="0 0 256 256"
                  fill="currentColor"
                  className="h-8 w-8"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g strokeWidth="0"></g>
                  <g strokeLinecap="round" strokeLinejoin="round"></g>
                  <g>
                    <path d="M160,128a32,32,0,1,1-32-32A32.03667,32.03667,0,0,1,160,128Zm68-44v88a56.06353,56.06353,0,0,1-56,56H84a56.06353,56.06353,0,0,1-56-56V84A56.06353,56.06353,0,0,1,84,28h88A56.06353,56.06353,0,0,1,228,84Zm-52,44a48,48,0,1,0-48,48A48.05436,48.05436,0,0,0,176,128Zm16-52a12,12,0,1,0-12,12A12,12,0,0,0,192,76Z"></path>
                  </g>
                </svg>
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-gray-400 transition-colors hover:text-white"
                aria-label="Facebook"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-gray-400 transition-colors hover:text-white"
                aria-label="Twitter"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-gray-400 transition-colors hover:text-white"
                aria-label="YouTube"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-gray-400 transition-colors hover:text-white"
                aria-label="LinkedIn"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </motion.a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6">
          <div className="flex flex-col items-start justify-between gap-4 text-xs text-[#a5a5a5] md:flex-row md:items-center md:text-sm">
            <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:gap-4">
              <p className="text-center text-sm md:text-left md:text-base">
                © 2025 Reliable Drapes. All rights reserved.
              </p>
              <div className="flex items-center gap-3 text-sm md:gap-4 md:text-base">
                <motion.a
                  href="/privacy-policy"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff" }}
                  transition={{ duration: 0.2 }}
                >
                  Privacy Policy
                </motion.a>
                <motion.a
                  href="/terms-of-service"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff" }}
                  transition={{ duration: 0.2 }}
                >
                  Terms & Conditions
                </motion.a>
              </div>
            </div>
            <p className="text-start text-sm md:text-right md:text-base">
              Made with ❤️ By Gagan Ahuja
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
