"use client";

import { ProductCard } from "./ProductCard";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useToast, ToastContainer } from "@/components/ui/Toast";

export interface Product {
  id: string | number;
  title: string;
  subtitle: string;
  imageSrc: string;
  pdfUrl?: string;
  badge?: "new" | "discount" | null;
  category: string;
}

interface ProductGridProps {
  filteredProducts: Product[];
  openCatalogueId?: string | null;
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

export function ProductGrid({ filteredProducts, openCatalogueId }: ProductGridProps) {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const { toasts, addToast, removeToast } = useToast();

  const handleProductClick = async (productName: string, catalogueId?: string) => {
    // Show download toast
    addToast(`${productName} catalogue is being downloaded...`, "success", 3000);
    
    // Increment download count if catalogue ID exists
    if (catalogueId) {
      try {
        const { incrementDownloadCount } = await import("@/lib/actions/catalogues");
        await incrementDownloadCount(catalogueId);
      } catch (error) {

      }
    }
  };

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
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-10 xl:gap-12"
      >
        {filteredProducts.map((product, index) => {
          const numericId = typeof product.id === 'string' ? parseInt(product.id.slice(0, 8), 16) : product.id;
          return (
            <div
              key={product.id}
              ref={(el) => {
                if (el) cardRefs.current.set(numericId, el);
              }}
              data-product-id={numericId}
            >
              <ProductCard
                id={typeof product.id === 'string' ? product.id : undefined}
                title={product.title}
                subtitle={product.subtitle}
                imageSrc={product.imageSrc}
                pdfUrl={product.pdfUrl}
                badge={product.badge}
                isVisible={visibleCards.has(numericId)}
                animationDelay={(index % 3) * 100}
                initialOpen={openCatalogueId === String(product.id)}
                onDownload={handleProductClick}
              />
            </div>
          );
        })}
      </motion.div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}
