import Image from "next/image";
import { motion } from "motion/react";

export function WhyChooseSection() {
  return (
    <section className="py-16 lg:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Content */}
          <motion.div 
            className="flex-1 max-w-2xl order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-4xl font-light mb-8 text-black">
              Why Choose Reliable Drapes?
            </h2>

            <div className="space-y-6 text-[#575757] text-lg leading-relaxed">
              <p>
                We combine decades of experience, exceptional craftsmanship, and
                a passion for design with a dedicated designing team to help you
                style your home. Our experts carefully select the finest
                collections to ensure every space feels vibrant, personalized,
                and effortlessly elegant.
              </p>

              <p>
                From the richness of hand-worked embroidery to the finesse of
                contemporary patterns, our collections cater to every
                taste—whether you love classic luxury or modern minimalism.
              </p>
            </div>
          </motion.div>

          {/* Images */}
          <motion.div 
            className="flex-shrink-0 order-1 lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              {/* Background rotated image */}
              <div className="absolute inset-0 transform translate-x-4 translate-y-4 md:translate-x-8 md:translate-y-8">
                <Image
                  width={400}
                  height={400}
                  src="/images/whyReliablePic.png"
                  alt="Elegant curtains"
                  className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-3xl border-4 border-white shadow-lg transform rotate-[-12deg] opacity-80"
                />
              </div>
              {/* Foreground image */}
              <div className="absolute top-0 left-0">
                <Image
                  width={400}
                  height={400}
                  src="/images/whyReliablePic.png"
                  alt="Modern furnishings"
                  className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-3xl border-4 border-white shadow-xl hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
