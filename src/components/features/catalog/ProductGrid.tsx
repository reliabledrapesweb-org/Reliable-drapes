"use client";

import { ProductCard } from "./ProductCard";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export interface Product {
  id: number;
  title: string;
  subtitle: string;
  imageSrc: string;
  badge?: "new" | "discount" | null;
  category: string;
}

export const products: Product[] = [
  {
    id: 1,
    title: "Sofa",
    subtitle: "Modern luxury sofa",
    category: "Furniture",
    imageSrc:
      "https://images.unsplash.com/photo-1763565909003-46e9dfb68a00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzb2ZhJTIwZnVybml0dXJlfGVufDF8fHx8MTc2NDA1MDE4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: "new" as const,
  },
  {
    id: 2,
    title: "Main Curtains",
    subtitle: "Elegant main curtains",
    category: "Curtains",
    imageSrc:
      "https://images.unsplash.com/photo-1684261556324-a09b2cdf68b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjdXJ0YWlucyUyMGludGVyaW9yfGVufDF8fHx8MTc2Mzk2MzU5Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: null,
  },
  {
    id: 3,
    title: "Sheer Curtains",
    subtitle: "Light sheer curtains",
    category: "Sheers",
    imageSrc:
      "https://images.unsplash.com/photo-1755722521990-7dbf21a2bc42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kb3clMjBzaGVlcnMlMjBjdXJ0YWluc3xlbnwxfHx8fDE3NjQwNzI3Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: "new" as const,
  },
  {
    id: 4,
    title: "Comforters",
    subtitle: "Cozy bed comforters",
    category: "Bedding",
    imageSrc:
      "https://images.unsplash.com/photo-1517912191359-67659f8690a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWRyb29tJTIwY29tZm9ydGVyfGVufDF8fHx8MTc2NDA3MjczOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: null,
  },
  {
    id: 5,
    title: "Accent Chair",
    subtitle: "Stylish accent chair",
    category: "Furniture",
    imageSrc:
      "https://images.unsplash.com/photo-1759722666941-a90d5a15b1d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwdXBob2xzdGVyeSUyMGNoYWlyfGVufDF8fHx8MTc2NDA3MjczOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: null,
  },
  {
    id: 6,
    title: "Upholstery",
    subtitle: "Premium upholstery fabric",
    category: "Upholstery",
    imageSrc:
      "https://images.unsplash.com/photo-1759722666941-a90d5a15b1d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwdXBob2xzdGVyeSUyMGNoYWlyfGVufDF8fHx8MTc2NDA3MjczOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: "new" as const,
  },
  {
    id: 7,
    title: "Blackout Curtains",
    subtitle: "Room darkening curtains",
    category: "Curtains",
    imageSrc:
      "https://images.unsplash.com/photo-1755722521990-7dbf21a2bc42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kb3clMjBzaGVlcnMlMjBjdXJ0YWluc3xlbnwxfHx8fDE3NjQwNzI3Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: null,
  },
  {
    id: 8,
    title: "Window Sheers",
    subtitle: "Delicate window sheers",
    category: "Sheers",
    imageSrc:
      "https://images.unsplash.com/photo-1755722521990-7dbf21a2bc42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kb3clMjBzaGVlcnMlMjBjdXJ0YWluc3xlbnwxfHx8fDE3NjQwNzI3Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: null,
  },
  {
    id: 9,
    title: "Bed Sheets",
    subtitle: "Luxury bed sheets",
    category: "Bedding",
    imageSrc:
      "https://images.unsplash.com/photo-1610508072973-dd4e656a677f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWQlMjBzaGVldHMlMjBiZWRkaW5nfGVufDF8fHx8MTc2Mzk3NzA0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: null,
  },
  {
    id: 10,
    title: "Throw Pillows",
    subtitle: "Decorative throw pillows",
    category: "Bedding",
    imageSrc:
      "https://images.unsplash.com/photo-1610508072973-dd4e656a677f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWQlMjBzaGVldHMlMjBiZWRkaW5nfGVufDF8fHx8MTc2Mzk3NzA0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: null,
  },
];

interface ProductGridProps {
  filteredProducts: Product[];
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

export function ProductGrid({ filteredProducts }: ProductGridProps) {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = Number(entry.target.getAttribute("data-product-id"));
          if (entry.isIntersecting) {
            setVisibleCards((prev) => new Set([...prev, id]));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      },
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
  }, [filteredProducts]);

  if (filteredProducts.length === 0) {
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
          🔍
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-2 xl:grid-cols-3 2xl:gap-8"
    >
      {filteredProducts.map((product, index) => (
        <div
          key={product.id}
          ref={(el) => {
            if (el) cardRefs.current.set(product.id, el);
          }}
          data-product-id={product.id}
        >
          <ProductCard
            title={product.title}
            subtitle={product.subtitle}
            imageSrc={product.imageSrc}
            badge={product.badge}
            isVisible={visibleCards.has(product.id)}
            animationDelay={(index % 3) * 100}
          />
        </div>
      ))}
    </motion.div>
  );
}
