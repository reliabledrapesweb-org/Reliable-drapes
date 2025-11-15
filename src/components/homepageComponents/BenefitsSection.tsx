"use client";

import { Package, Award, Truck } from "lucide-react";
import { motion } from "motion/react";

const benefits = [
  {
    icon: Package,
    title: "Premium Materials & Exclusive Styles",
    description: "Only the best - that's what you deserve",
  },
  {
    icon: Award,
    title: "365-Day Happiness Guarantee",
    description: "It'll be love at first sleep (or bath).",
  },
  {
    icon: Truck,
    title: "Fast, Free Shipping",
    description: "We're Delhiites, we move quick.",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                className="rounded-3xl p-6 md:p-8 lg:p-10 md:text-start flex flex-col items-center text-center md:items-start gap-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ y: -5 }}
              >
                <motion.div
                  className="w-14 h-14 md:w-16 md:h-16 lg:w-[68px] lg:h-[68px] rounded-xl bg-[#878787] flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon
                    className="w-7 h-7 md:w-9 md:h-9 lg:w-10 lg:h-10 text-white"
                    strokeWidth={2}
                  />
                </motion.div>
                <h3 className="text-black tracking-widest uppercase font-semibold text-base">
                  {benefit.title}
                </h3>
                <p className="text-[#575757] text-sm md:text-base">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
