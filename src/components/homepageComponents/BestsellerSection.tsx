"use client";
import { motion } from "motion/react";
import Image from "next/image";

const products = [
  {
    image: "/images/bestseller/bes1.png",
    title: "Upholstery",
    description:
      "From elegant drapes to plush upholstery, our fabrics adapt to your vision.",
  },
  {
    image: "/images/bestseller/bes2.png",
    title: "Sheers",
    description:
      "From elegant drapes to plush upholstery, our fabrics adapt to your vision.",
  },
  {
    image: "/images/bestseller/bes3.png",
    title: "Sofa",
    description:
      "From elegant drapes to plush upholstery, our fabrics adapt to your vision.",
  },
  {
    image: "/images/bestseller/bes4.png",
    title: "Comforters",
    description:
      "From elegant drapes to plush upholstery, our fabrics adapt to your vision.",
  },
  {
    image: "/images/bestseller/bes5.png",
    title: "Comforters",
    description:
      "From elegant drapes to plush upholstery, our fabrics adapt to your vision.",
  },
];

export function BestsellerSection() {
  return (
    <section className="py-12 lg:py-20 bg-white">
      <div className="container mx-auto px-6 md:px-16 max-w-6xl">
        <h2 className="font-medium text-[28px] lg:text-[36px] tracking-[-2px] mb-12 text-black">
          Season&apos;s Bestseller
        </h2>

        {/* Desktop Grid */}
        <div className="hidden lg:grid gap-4 max-w-7xl mx-auto">
          {/* Top Row - 3 equal items */}
          <div className="grid grid-cols-3 gap-4">
            {products.slice(0, 3).map((product, index) => (
              <motion.div
                key={index}
                className="relative rounded-2xl overflow-hidden group cursor-pointer aspect-square"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
              >
                <Image
                  width={800}
                  height={800}
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[46%] to-black/80" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-white tracking-widest uppercase">
                    {product.title}
                  </h3>
                  {product.description && (
                    <p
                      className="
                        text-sm text-white max-w-xs 
                        opacity-0 translate-y-2
                        group-hover:opacity-100 group-hover:translate-y-0
                        transition-all duration-300 ease-out
                        mt-2 min-h-[48px]
                        border-t border-white
                      "
                    >
                      {product.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom Row - 2 wider items */}
          <div className="grid grid-cols-2 gap-4">
            {products.slice(3, 5).map((product, index) => (
              <motion.div
                key={index}
                className="relative rounded-2xl overflow-hidden group cursor-pointer aspect-auto"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (index + 3) * 0.1 }}
                whileHover={{ scale: 1.03 }}
              >
                <Image
                  width={800}
                  height={800}
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[46%] to-black/80" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-white tracking-widest uppercase">
                    {product.title}
                  </h3>
                  {product.description && (
                    <p
                      className="
                        text-sm text-white max-w-xs 
                        opacity-0 translate-y-2
                        group-hover:opacity-100 group-hover:translate-y-0
                        transition-all duration-300 ease-out
                        mt-2 min-h-[48px]
                        border-t border-white
                      "
                    >
                      {product.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile Scroll */}
        <div className="lg:hidden flex flex-col gap-3">
          {products.map((product, index) => (
            <motion.div
              key={index}
              className="relative rounded-2xl overflow-hidden cursor-pointer aspect-square"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileTap={{ scale: 0.98 }}
            >
              <Image
                width={100}
                height={100}
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[46%] to-black/80" />
              <div className="absolute bottom-6 left-6">
                <h3 className="text-white tracking-widest uppercase mb-2">
                  {product.title}
                </h3>
                {/* {product.description && (
                  <p className="text-white text-sm">{product.description}</p>
                )} */}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
