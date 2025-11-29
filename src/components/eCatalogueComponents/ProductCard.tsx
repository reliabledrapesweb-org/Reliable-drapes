import { motion } from "framer-motion";
import Image from "next/image";

interface ProductCardProps {
  title: string;
  subtitle: string;
  imageSrc: string;
  badge?: "new" | "discount" | null;
  discountValue?: string;
  isVisible?: boolean;
  animationDelay?: number;
}

export function ProductCard({
  title,
  subtitle,
  imageSrc,
  badge = null,
  discountValue = "-30%",
  isVisible = true,
  animationDelay = 0,
}: ProductCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{
        duration: 0.6,
        delay: animationDelay / 1000,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -8 }}
      className="group flex w-full flex-col gap-4"
    >
      <motion.div
        className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-b from-gray-300 to-gray-700 shadow-md"
        whileHover={{
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full w-full"
        >
          <Image
            width={500}
            height={500}
            src={imageSrc}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </motion.div>

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 transition-opacity duration-300 group-hover:opacity-90" />

        {/* Badge */}
        {badge && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.3,
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            whileHover={{ scale: 1.1 }}
            className="absolute top-3 right-3"
          >
            {badge === "discount" && (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e97171] shadow-lg">
                <span className="text-[16px] font-medium text-white">
                  {discountValue}
                </span>
              </div>
            )}
            {badge === "new" && (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2f2582] shadow-lg">
                <span className="text-[16px] font-medium text-white">New</span>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      <div className="flex flex-col gap-2">
        <motion.h3
          whileHover={{ color: "#2f2582" }}
          transition={{ duration: 0.2 }}
          className="text-[24px] font-medium text-[#3a3a3a]"
        >
          {title}
        </motion.h3>
        <p className="text-[16px] text-[#898989]">{subtitle}</p>
      </div>
    </motion.article>
  );
}
