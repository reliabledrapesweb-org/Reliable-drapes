"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { ComingSoonNotice } from "./ComingSoonNotice";

type ComingSoonModalProps = {
  isOpen: boolean;
  onClose: () => void;
  message?: string | null;
  title?: string;
};

export function ComingSoonModal({
  isOpen,
  onClose,
  message,
  title,
}: ComingSoonModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-16 left-1/2 z-[9999] w-full max-w-xl -translate-x-1/2 px-3 sm:top-20 sm:max-w-2xl sm:px-4"
          >
            <div className="relative overflow-hidden rounded-2xl bg-white px-4 py-6 shadow-2xl sm:px-6 sm:py-8">
              <button
                onClick={onClose}
                aria-label="Close coming soon message"
                className="absolute top-4 right-4 rounded-full p-1.5 text-[#575757] transition-colors hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
              <ComingSoonNotice message={message} title={title} compact />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
