"use client";

import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlistStore";

interface WishlistButtonProps {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function WishlistButton({
  productId,
  productName,
  productPrice,
  productImage,
  className = "",
  size = "md",
}: WishlistButtonProps) {
  const { isInWishlist, toggleItem } = useWishlistStore();
  const inWishlist = isInWishlist(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleItem({
      productId,
      name: productName,
      price: productPrice,
      image: productImage,
    });
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`flex items-center justify-center rounded-full bg-white shadow-xl transition-all hover:scale-110 active:scale-90 ${sizeClasses[size]} ${className}`}
      whileTap={{ scale: 0.85 }}
      title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
      aria-label={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    >
      <motion.div
        initial={false}
        animate={{
          scale: inWishlist ? [1, 1.3, 1] : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={`${iconSizes[size]} transition-colors duration-200 ${
            inWishlist
              ? "fill-red-500 text-red-500"
              : "fill-transparent text-gray-600 hover:text-red-400"
          }`}
        />
      </motion.div>
    </motion.button>
  );
}
