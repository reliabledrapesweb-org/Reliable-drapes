import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";

export function CTASection() {
  return (
    <section className="relative py-12 md:py-20 lg:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/ctasbg.png"
          alt=""
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 container mx-auto px-6 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2
          style={{ fontWeight: 500, fontSize: "28px" }}
          className="text-white md:text-[36px] lg:text-[44px] tracking-tight mb-6 md:mb-7 lg:mb-8"
        >
          Trends Beyond
          <br />
          Imagination
        </h2>

        <motion.button
          className="backdrop-blur-[6px] bg-[rgba(0,0,0,0.1)] border border-[rgba(255,255,255,0.15)] rounded-full px-5 md:px-7 lg:px-9 py-2.5 md:py-3.5 text-white inline-flex items-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.2)" }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <span className="tracking-widest uppercase text-sm md:text-base">
            Explore Now
          </span>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
          </motion.div>
        </motion.button>
      </motion.div>
    </section>
  );
}
