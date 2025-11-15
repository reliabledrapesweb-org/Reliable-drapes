"use client";

import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#0e0e0e] text-white">
      <div className="container mx-auto px-6 py-10 md:py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-10 lg:gap-8 mb-10 md:mb-12">
          {/* Company Info */}
          <div className="md:col-span-2 lg:col-span-4 space-y-4">
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

            <p className="text-[#f1f1f1] text-sm md:text-base">
              A Unit of Shree Ambica Furnishings (India) Pvt. Ltd.
            </p>

            <p className="text-[#7e7e7e] text-sm md:text-base">
              Creating spaces of comfort and tranquility with our premium
              collection of home essentials. Experience luxury, sustainability,
              and timeless design.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#7e7e7e]" />
                <span className="text-[#7e7e7e] text-sm md:text-base">
                  hello@Reliable.com
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#7e7e7e]" />
                <span className="text-[#7e7e7e] text-sm md:text-base">
                  1-800-Reliable
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#7e7e7e]" />
                <span className="text-[#7e7e7e] text-sm md:text-base">
                  Delhi, India
                </span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="tracking-widest uppercase text-sm md:text-base">
              Shop
            </h3>
            <ul className="space-y-3 text-[#7e7e7e] text-sm md:text-base">
              <li>
                <motion.a
                  href="#"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  All Products
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  Curtains
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  Upholstery
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  Sheers
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
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
          <div className="lg:col-span-2 space-y-4">
            <h3 className="tracking-widest uppercase text-sm md:text-base">
              Customer Care
            </h3>
            <ul className="space-y-3 text-[#7e7e7e] text-sm md:text-base">
              <li>
                <motion.a
                  href="#"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  Contact Us
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  Returns & Exchanges
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  Shipping Info
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
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
          <div className="lg:col-span-2 space-y-4">
            <h3 className="tracking-widest uppercase text-sm md:text-base">
              Company
            </h3>
            <ul className="space-y-3 text-[#7e7e7e] text-sm md:text-base">
              <li>
                <motion.a
                  href="#"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  About Us
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  Careers
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  Wholesale
                </motion.a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-[#7e7e7e] text-sm md:text-base">Follow us</h3>
            <div className="flex items-center gap-4">
              <motion.a
                href="#"
                className="text-[#7e7e7e] cursor-pointer"
                aria-label="Instagram"
                whileHover={{ color: "#ffffff", scale: 1.15 }}
                transition={{ duration: 0.2 }}
              >
                <Instagram className="w-5 h-5 md:w-6 md:h-6" />
              </motion.a>
              <motion.a
                href="#"
                className="text-[#7e7e7e] cursor-pointer"
                aria-label="Facebook"
                whileHover={{ color: "#ffffff", scale: 1.15 }}
                transition={{ duration: 0.2 }}
              >
                <Facebook className="w-5 h-5 md:w-6 md:h-6" />
              </motion.a>
              <motion.a
                href="#"
                className="text-[#7e7e7e] cursor-pointer"
                aria-label="Twitter"
                whileHover={{ color: "#ffffff", scale: 1.15 }}
                transition={{ duration: 0.2 }}
              >
                <Twitter className="w-5 h-5 md:w-6 md:h-6" />
              </motion.a>
              <motion.a
                href="#"
                className="text-[#7e7e7e] cursor-pointer"
                aria-label="YouTube"
                whileHover={{ color: "#ffffff", scale: 1.15 }}
                transition={{ duration: 0.2 }}
              >
                <Youtube className="w-5 h-5 md:w-6 md:h-6" />
              </motion.a>
              <motion.a
                href="#"
                className="text-[#7e7e7e] cursor-pointer"
                aria-label="LinkedIn"
                whileHover={{ color: "#ffffff", scale: 1.15 }}
                transition={{ duration: 0.2 }}
              >
                <Linkedin className="w-5 h-5 md:w-6 md:h-6" />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs md:text-sm text-[#a5a5a5]">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
              <p className="text-center text-sm md:text-base md:text-left">
                © 2025 Reliable Drapes. All rights reserved.
              </p>
              <div className="flex items-center text-sm md:text-base gap-3 md:gap-4">
                <motion.a
                  href="#"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff" }}
                  transition={{ duration: 0.2 }}
                >
                  Privacy Policy
                </motion.a>
                <motion.a
                  href="#"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff" }}
                  transition={{ duration: 0.2 }}
                >
                  Terms & Conditions
                </motion.a>
              </div>
            </div>
            <p className="text-start text-sm md:text-base md:text-right">
              Made with ❤️ By Gagan Ahuja
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
