"use client";

import { motion } from "motion/react";
import { ImageWithLoading as Image } from "@/components/ui/ImageWithLoading";

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
    icon: "/images/features/fe6.png",
    title: "Colour Fastness",
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-white py-10 md:py-16 lg:py-20">
      <div className="container mx-auto px-6">
        <h2
          style={{ fontWeight: 600, fontSize: 24 }}
          className="text-semibold mb-10 text-center text-black md:hidden"
        >
          Our Fabric Features
        </h2>

        {/* Features Grid */}
        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-6 md:grid-cols-6 md:gap-10 lg:gap-12">
          {features.map((feature, index) => {
            return (
              <motion.div
                key={index}
                className="flex flex-col items-center gap-3 text-center lg:gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex h-10 w-10 items-center justify-center md:h-14 md:w-14 lg:h-16 lg:w-16">
                  <Image src={feature.icon} alt="" width={200} height={200} />
                </div>
                <p className="lg:text-md text-xs leading-tight tracking-widest text-black uppercase md:text-sm">
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
