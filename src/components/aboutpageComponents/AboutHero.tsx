import Image from "next/image";
import { motion } from "motion/react";

export function AboutHero() {
  return (
    <section className="relative h-[350px] md:h-[450px] lg:h-[500px] flex items-center overflow-hidden">
      {/* Background Image with Overlays */}
      <div className="absolute inset-0">
        <Image
          width={1920}
          height={1080}
          src="/images/abouthero.png"
          alt="Luxury home furnishings"
          className="w-full h-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          {/* Logo */}
          <motion.div 
            className="mb-6 md:mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Image
              src="/images/logo.png"
              alt="Reliable Drapes Logo"
              width={140}
              height={45}
              className="object-contain w-[120px] md:w-[140px] lg:w-[160px]"
              priority
            />
          </motion.div>

          {/* Heading */}
          <motion.h1 
            className="text-white text-4xl md:text-5xl lg:text-6xl font-light mb-4 tracking-tight leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            About Reliable Drapes
          </motion.h1>
          
          <motion.p 
            className="text-white/90 text-lg md:text-xl lg:text-2xl font-light tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            A Unit of Shree Ambica Furnishings (India) Pvt. Ltd.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
