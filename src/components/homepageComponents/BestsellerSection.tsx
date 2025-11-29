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
              <motion.div
                key={index}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl"
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
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[46%] to-black/80" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="tracking-widest text-white uppercase">
                    {product.title}
                  </h3>
                  {product.description && (
                    <p className="mt-2 min-h-[48px] max-w-xs translate-y-2 border-t border-white text-sm text-white opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
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
                className="group relative aspect-auto cursor-pointer overflow-hidden rounded-2xl"
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
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[46%] to-black/80" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="tracking-widest text-white uppercase">
                    {product.title}
                  </h3>
                  {product.description && (
                    <p className="mt-2 min-h-[48px] max-w-xs translate-y-2 border-t border-white text-sm text-white opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                      {product.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile Scroll */}
        <div className="flex flex-col gap-3 lg:hidden">
          {products.map((product, index) => (
            <motion.div
              key={index}
              className="relative aspect-square cursor-pointer overflow-hidden rounded-2xl"
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
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[46%] to-black/80" />
              <div className="absolute bottom-6 left-6">
                <h3 className="mb-2 tracking-widest text-white uppercase">
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
