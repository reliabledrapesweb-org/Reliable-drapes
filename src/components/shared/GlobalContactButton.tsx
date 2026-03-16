"use client";

import { MessageCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { motion } from "motion/react";

export function GlobalContactButton() {
  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2 sm:right-6 sm:bottom-6 sm:gap-3 md:right-8 md:bottom-8">
      <motion.a
        href="https://wa.me/919625731948"
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2F2582] text-white shadow-lg transition-transform hover:scale-110"
        aria-label="Chat on WhatsApp"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <FaWhatsapp className="h-6 w-6" />
      </motion.a>

      <motion.a
        href="/contact"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-lg transition-transform hover:scale-110"
        aria-label="Open contact page"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <MessageCircle className="h-5 w-5" />
      </motion.a>
    </div>
  );
}
