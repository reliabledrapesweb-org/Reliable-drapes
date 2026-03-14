"use client";

import { motion } from "framer-motion";
import { StoreCard } from "./StoreCard";
import type { Store } from "@/lib/actions/stores";

type StoreGridProps = {
  stores: Store[];
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function StoreGrid({ stores }: StoreGridProps) {
  if (stores.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex min-h-[400px] w-full flex-col items-center justify-center gap-4 rounded-lg bg-gray-50 p-8 md:p-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-5xl md:text-6xl"
        >
          🏪
        </motion.div>
        <h3 className="text-xl font-medium text-[#3a3a3a] md:text-2xl">
          No stores found
        </h3>
        <p className="text-center text-sm text-[#898989] md:text-base">
          Try adjusting your search query
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </motion.div>
  );
}
