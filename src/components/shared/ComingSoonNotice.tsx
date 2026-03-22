"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Tag } from "lucide-react";

type ComingSoonNoticeProps = {
  message?: string | null;
  title?: string;
  ctaHref?: string;
  ctaLabel?: string;
  compact?: boolean;
};

const DEFAULT_MESSAGE = "Our new collection will be available shortly.";

export function ComingSoonNotice({
  message,
  title = "Coming Soon",
  ctaHref = "/contact",
  ctaLabel = "Contact Us for Inquiries",
  compact = false,
}: ComingSoonNoticeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center text-center ${compact ? "py-4" : "py-20"}`}
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#2F2582]/10">
        <Tag className="h-10 w-10 text-[#2F2582]" />
      </div>
      <h2 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
        {title}
      </h2>
      <p className="mx-auto max-w-md text-gray-600">
        {message || DEFAULT_MESSAGE}
      </p>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Link
          href={ctaHref}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#2F2582] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#241c66]"
        >
          {ctaLabel}
        </Link>
      </motion.div>
    </motion.div>
  );
}
