"use client";

import { motion } from "motion/react";
import Image from "next/image";

const features = [
  {
    icon: "/images/features/fe1.png",
    title: "Kids Friendly",
  },
  {
    icon: "/images/features/fe2.png",
    title: "Breathable fabric",
  },
  {
    icon: "/images/features/fe3.png",
    title: "Eco Friendly",
  },
  {
    icon: "/images/features/fe4.png",
    title: "Soft on Skin",
  },
  {
    icon: "/images/features/fe5.png",
    title: "Water repellent",
  },
  {
    icon: "/images/features/fe5.png",
    title: "Colour Fastness",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-10 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2
          style={{ fontWeight: 600, fontSize: 24 }}
          className="text-center text-semibold md:hidden mb-10 text-black"
        >
          Our Fabric Features
        </h2>

        {/* Features Grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6 md:gap-10 lg:gap-12 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            return (
              <motion.div
                key={index}
                className="flex flex-col items-center text-center gap-3 lg:gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center">
                  <Image src={feature.icon} alt="" width={100} height={100} />
                </div>
                <p className="text-black text-xs md:text-sm lg:text-md tracking-widest uppercase leading-tight">
                  {feature.title}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
