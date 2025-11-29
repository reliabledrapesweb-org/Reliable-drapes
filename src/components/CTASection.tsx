import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-12 md:py-20 lg:py-24">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/ctasbg.png"
          alt=""
          width={1920}
          height={1080}
          className="h-full w-full object-cover"
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
          className="mb-6 tracking-tight text-white md:mb-7 md:text-[36px] lg:mb-8 lg:text-[44px]"
        >
          Trends Beyond
          <br />
          Imagination
        </h2>

        <motion.button
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[rgba(255,255,255,0.15)] bg-[rgba(0,0,0,0.1)] px-5 py-2.5 text-white backdrop-blur-[6px] md:px-7 md:py-3.5 lg:px-9"
          whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.2)" }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-sm tracking-widest uppercase md:text-base">
            Explore Now
          </span>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowRight className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
          </motion.div>
        </motion.button>
      </motion.div>
    </section>
  );
}
