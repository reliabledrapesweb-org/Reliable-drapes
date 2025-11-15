"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface CategoryCardProps {
  image: string;
  title: string;
  className?: string;
}

export function CategoryCard({
  image,
  title,
  className = "",
}: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover="hover"
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`relative rounded-2xl overflow-hidden cursor-pointer group ${className}`}
    >
      {/* Image Wrapper */}
      <motion.div
        variants={{
          hover: { scale: 1.06 },
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="aspect-square w-full"
      >
        <Image
          src={image}
          alt={title}
          width={600}
          height={600}
          className="w-full h-full object-cover transition-all duration-500 group-hover:brightness-110"
          sizes="(max-width: 768px) 180px,
                 (max-width: 1024px) 220px,
                 280px"
        />
      </motion.div>

      {/* Gradient Overlay */}
      <motion.div
        variants={{
          hover: { opacity: 0.9 },
          initial: { opacity: 1 },
        }}
        transition={{ duration: 0.35 }}
        className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 pointer-events-none"
      />

      {/* Title + Arrow */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
        <span className="tracking-tight text-sm sm:text-base md:text-lg font-medium">
          {title}
        </span>

        <motion.div
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="opacity-80"
        >
          <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
        </motion.div>
      </div>
    </motion.div>
  );
}
