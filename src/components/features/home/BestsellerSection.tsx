"use client";
import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getCollectionProducts, type Product } from "@/lib/actions/products";

export function BestsellerSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBestsellers() {
      try {
        const result = await getCollectionProducts("best-sellers");
        if (result.success && result.data) {
          setProducts(result.data.slice(0, 5)); // Take first 5 products
        }
      } catch (error) {
        console.error("Error fetching bestsellers:", error);
      }
      setIsLoading(false);
    }
    fetchBestsellers();
  }, []);

  if (isLoading) {
    return (
      <section className="bg-white py-12 lg:py-20">
        <div className="container mx-auto max-w-6xl px-6 md:px-16">
          <h2 className="mb-12 text-[28px] font-medium tracking-[-2px] text-black lg:text-[36px]">
            Season&apos;s Bestseller
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-2xl bg-gray-200" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }
  return (
    <section className="bg-white py-12 lg:py-20">
      <div className="container mx-auto max-w-6xl px-6 md:px-16">
        <h2 className="mb-12 text-[28px] font-medium tracking-[-2px] text-black lg:text-[36px]">
          Season&apos;s Bestseller
        </h2>

        {/* Desktop Grid */}
        <div className="mx-auto hidden max-w-7xl gap-4 lg:grid">
          {/* Top Row - 3 equal items */}
          <div className="grid grid-cols-3 gap-4">
            {products.slice(0, 3).map((product, index) => (
              <BestsellerCard
                key={index}
                product={product}
                index={index}
                className="aspect-square"
              />
            ))}
          </div>

          {/* Bottom Row - 2 wider items */}
          <div className="grid grid-cols-2 gap-4">
            {products.slice(3, 5).map((product, index) => (
              <BestsellerCard
                key={index}
                product={product}
                index={index}
                delay={0.3} // Offset for bottom row
                className="aspect-auto"
              />
            ))}
          </div>
        </div>

        {/* Mobile Scroll */}
        <div className="flex flex-col gap-3 lg:hidden">
          {products.map((product, index) => (
            <BestsellerCard
              key={index}
              product={product}
              index={index}
              isMobile
              className="aspect-square"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function BestsellerCard({
  product,
  index,
  className,
  delay = 0,
  isMobile = false,
}: {
  product: Product;
  index: number;
  className?: string;
  delay?: number;
  isMobile?: boolean;
}) {
  return (
    <motion.div
      className={`group relative cursor-pointer overflow-hidden rounded-2xl ${className}`}
      initial={isMobile ? { opacity: 0, x: -30 } : { opacity: 0, scale: 0.9 }}
      whileInView={isMobile ? { opacity: 1, x: 0 } : { opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        default: { duration: 0.5, delay: delay + index * 0.1 },
        scale: { duration: 0.3 },
      }}
      whileHover={!isMobile ? { scale: 1.03 } : undefined}
      whileTap={isMobile ? { scale: 0.98 } : undefined}
    >
      <Image
        width={800}
        height={800}
        src={product.image_url || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop"}
        alt={product.name}
        className="h-full w-full object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-linear-to-b from-transparent from-46% to-black/80" />
      <div className="absolute bottom-6 left-6 z-20">
        {isMobile ? (
          <h3 className="mb-2 tracking-widest text-white uppercase">
            {product.name}
          </h3>
        ) : (
          <>
            <div className="w-fit">
              <h3 className="text-xl font-medium tracking-widest text-white uppercase">
                {product.name}
              </h3>
              <div className="h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
            </div>
            <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 group-hover:grid-rows-[1fr]">
              <div className="overflow-hidden">
                {product.description && (
                  <p className="mt-2 max-w-xs text-sm text-white opacity-0 transition-opacity delay-100 duration-300 group-hover:opacity-100">
                    {product.description}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
