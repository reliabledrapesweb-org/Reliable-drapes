"use client";

import { ShopProductCard } from "./ShopProductCard";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { useCartStore } from "@/lib/store";
import type { Product } from "@/lib/actions/products";

interface ShopProductGridProps {
  products: Product[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export function ShopProductGrid({ products }: ShopProductGridProps) {
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const { toasts, addToast, removeToast } = useToast();
  const { addItem } = useCartStore();

  const handleAddToCart = (productId: string, productName: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image_url,
    });

    addToast(`${productName} added to cart!`, "success", 3000);
  };

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-product-id");
          if (id && entry.isIntersecting) {
            setVisibleCards((prev) => new Set([...prev, id]));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    cardRefs.current.forEach((ref) => {
      if (ref && observerRef.current) {
        observerRef.current.observe(ref);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [products]);

  if (products.length === 0) {
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
          🛍️
        </motion.div>
        <h3 className="text-xl font-medium text-[#3a3a3a] md:text-2xl">
          No products found
        </h3>
        <p className="text-center text-sm text-[#898989] md:text-base">
          Try adjusting your filters or search query
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-10 xl:gap-12"
      >
        {products.map((product, index) => (
          <div
            key={product.id}
            ref={(el) => {
              if (el) cardRefs.current.set(product.id, el);
            }}
            data-product-id={product.id}
          >
            <ShopProductCard
              product={product}
              isVisible={visibleCards.has(product.id)}
              animationDelay={(index % 3) * 100}
              onAddToCart={handleAddToCart}
            />
          </div>
        ))}
      </motion.div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}
