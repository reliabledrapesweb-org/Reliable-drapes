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
import { ImageWithLoading as Image } from "@/components/ui/ImageWithLoading";

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
          <div className="space-y-4 lg:col-span-2">
            <h3 className="text-sm tracking-widest uppercase md:text-base">
              Customer Care
            </h3>
            <ul className="space-y-3 text-sm text-[#7e7e7e] md:text-base">
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
          <div className="space-y-4 lg:col-span-2">
            <h3 className="text-sm tracking-widest uppercase md:text-base">
              Company
            </h3>
            <ul className="space-y-3 text-sm text-[#7e7e7e] md:text-base">
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
          <div className="space-y-4 lg:col-span-2">
            <h3 className="text-sm text-[#7e7e7e] md:text-base">Follow us</h3>
            <div className="flex items-center gap-4">
              <motion.a
                href="#"
                className="cursor-pointer text-[#7e7e7e]"
                aria-label="Instagram"
                whileHover={{ color: "#ffffff", scale: 1.15 }}
                transition={{ duration: 0.2 }}
              >
                <Instagram className="h-5 w-5 md:h-6 md:w-6" />
              </motion.a>
              <motion.a
                href="#"
                className="cursor-pointer text-[#7e7e7e]"
                aria-label="Facebook"
                whileHover={{ color: "#ffffff", scale: 1.15 }}
                transition={{ duration: 0.2 }}
              >
                <Facebook className="h-5 w-5 md:h-6 md:w-6" />
              </motion.a>
              <motion.a
                href="#"
                className="cursor-pointer text-[#7e7e7e]"
                aria-label="Twitter"
                whileHover={{ color: "#ffffff", scale: 1.15 }}
                transition={{ duration: 0.2 }}
              >
                <Twitter className="h-5 w-5 md:h-6 md:w-6" />
              </motion.a>
              <motion.a
                href="#"
                className="cursor-pointer text-[#7e7e7e]"
                aria-label="YouTube"
                whileHover={{ color: "#ffffff", scale: 1.15 }}
                transition={{ duration: 0.2 }}
              >
                <Youtube className="h-5 w-5 md:h-6 md:w-6" />
              </motion.a>
              <motion.a
                href="#"
                className="cursor-pointer text-[#7e7e7e]"
                aria-label="LinkedIn"
                whileHover={{ color: "#ffffff", scale: 1.15 }}
                transition={{ duration: 0.2 }}
              >
                <Linkedin className="h-5 w-5 md:h-6 md:w-6" />
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
            <p className="text-start text-sm md:text-right md:text-base">
              Made with ❤️ By Gagan Ahuja
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
