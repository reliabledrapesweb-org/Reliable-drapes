"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function Breadcrumb() {
  return (
    <div className="w-full bg-gray-100 py-3">
      <div className="mx-auto max-w-[1440px] px-6">
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center gap-2 text-sm"
        >
          <Link
            href="/"
            className="text-gray-600 transition-all duration-300 hover:text-[#2f2582] hover:underline"
          >
            Home
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <Link
            href="/e-catalogue"
            className="text-gray-600 transition-all duration-300 hover:text-[#2f2582] hover:underline"
          >
            E-catalogue
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-[#2f2582]">
            All About Catalogue
          </span>
        </motion.nav>
      </div>
    </div>
  );
}
