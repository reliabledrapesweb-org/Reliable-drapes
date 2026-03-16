"use client";

import Image from "next/image";
import { motion } from "motion/react";

interface PageHeroProps {
  heading: string;
  backgroundImage?: string;
}

export function PageHero({
  heading,
  backgroundImage = "/images/abouthero.png",
}: PageHeroProps) {
  return (
    <section className="relative flex h-[350px] items-center overflow-hidden md:h-[450px] lg:h-[500px]">
      {/* Background Image with Overlays */}
      <div className="absolute inset-0">
        <Image
          width={1920}
          height={1080}
          src={backgroundImage}
          alt="Reliable Drapes page banner"
          className="h-full w-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          {/* Logo */}
          <motion.div
            className="mb-4 md:mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Image
              src="/images/logo.png"
              alt="Reliable Drapes Logo"
              width={140}
              height={45}
              className="w-[120px] object-contain md:w-[140px] lg:w-[160px]"
              priority
            />
          </motion.div>

          <motion.p
            className="mb-4 text-sm font-light tracking-wide text-white/90 md:mb-6 md:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            (A Unit of Shree Ambica Furnishings (India) Pvt. Ltd.)
          </motion.p>

          {/* Heading */}
          <motion.h1
            className="mb-4 text-xl leading-tight font-bold tracking-tight text-white sm:text-2xl md:text-3xl lg:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {heading}
          </motion.h1>
        </motion.div>
      </div>
    </section>
  );
}
