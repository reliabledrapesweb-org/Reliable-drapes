"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/actions/products";

interface ShopProductCardProps {
  product: Product;
  isVisible?: boolean;
  animationDelay?: number;
  onAddToCart: (productId: string, productName: string) => void;
}

export function ShopProductCard({
  product,
  isVisible = true,
  animationDelay = 0,
  onAddToCart,
}: ShopProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const fallbackImage =
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center";
  const imageSrc =
    imageError || !product.image_url ? fallbackImage : product.image_url;

  // Format price in Indian Rupees
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(product.price);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product.id, product.name);
  };

  return (
    <Link href={`/shop/${product.id}`}>
      <motion.article
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{
          duration: 0.6,
          delay: animationDelay / 1000,
          ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        }}
        className="group flex w-full cursor-pointer flex-col gap-5 transition-transform duration-300 hover:scale-[1.02]"
      >
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-b from-gray-200 to-gray-400 shadow-lg transition-shadow duration-300 group-hover:shadow-xl">
          <div className="h-full w-full">
            <Image
              width={500}
              height={500}
              src={imageSrc}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          </div>

          {/* Overlay gradient for better text readability */}
          <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Add to Cart Button - Circular Top Right */}
          <div className="absolute top-4 right-4 z-20 -translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={handleAddToCart}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#2f2582] shadow-xl transition-all hover:bg-[#2f2582] hover:text-white active:scale-90"
              title="Add to Cart"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 px-1">
          <h3 className="text-xl leading-tight font-semibold text-[#2a2a2a] transition-colors duration-200 group-hover:text-[#2f2582] lg:text-2xl">
            {product.name}
          </h3>

          {/* Price */}
          <p className="text-lg font-bold text-[#2f2582] lg:text-xl">
            {formattedPrice}
          </p>

          {product.description && (
            <p className="line-clamp-1 text-sm leading-relaxed font-normal text-[#898989] lg:text-base">
              {product.description}
            </p>
          )}
        </div>
      </motion.article>
    </Link>
  );
}
