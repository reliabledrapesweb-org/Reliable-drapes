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
    <section className="bg-white py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-3 lg:gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                className="flex flex-col items-center gap-4 rounded-3xl p-6 text-center md:items-start md:p-8 md:text-start lg:p-10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ y: -5 }}
              >
                <motion.div
                  className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#878787] md:h-16 md:w-16 lg:h-[68px] lg:w-[68px]"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon
                    className="h-7 w-7 text-white md:h-9 md:w-9 lg:h-10 lg:w-10"
                    strokeWidth={1.5}
                  />
                </motion.div>
                <h3 className="text-base font-semibold tracking-widest text-black uppercase">
                  {benefit.title}
                </h3>
                <p className="text-sm text-[#575757] md:text-base">
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
