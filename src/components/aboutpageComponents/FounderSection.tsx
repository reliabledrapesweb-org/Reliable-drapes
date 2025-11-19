import Image from "next/image";
import { motion } from "motion/react";

export function FounderSection() {
  return (
    <section className="py-16 lg:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Image */}
          <motion.div 
            className="flex-shrink-0"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative group">
              <div className="w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gray-100 rounded-3xl shadow-xl transform rotate-[-6deg] transition-transform duration-500 group-hover:rotate-[-3deg]" />
              <div className="absolute inset-0 w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96">
                <Image
                  width={400}
                  height={400}
                  src="/images/founderPic.png"
                  alt="Founder portrait"
                  className="w-full h-full object-cover rounded-3xl border-4 border-white shadow-lg transform translate-x-2 translate-y-2 transition-transform duration-500 group-hover:translate-x-0 group-hover:translate-y-0"
                />
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div 
            className="flex-1 max-w-2xl"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl lg:text-4xl font-light mb-8 text-black">
              Our Founder
            </h2>

            {/* Founder Info */}
            <div className="flex items-center gap-5 mb-8 p-4 bg-gray-50 rounded-2xl w-fit">
              <Image
                width={60}
                height={60}
                src="/images/founderPic.png"
                alt="Mr. Sumit Narang"
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
              />
              <div>
                <h3 className="text-xl font-medium text-black">Mr. Sumit Narang</h3>
                <p className="text-[#575757] text-sm uppercase tracking-wider">Founder & CEO</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-6 text-[#575757] text-lg leading-relaxed">
              <div>
                <h4 className="text-black font-medium mb-2">His Vision Behind Reliable Drapes</h4>
                <p>
                  Our founder envisioned a home furnishings brand that combines
                  elegance, quality, and innovation. With a deep passion for
                  design and decades of experience in textiles, they built
                  Reliable Drapes on the principles of craftsmanship, creativity,
                  and timeless style.
                </p>
              </div>

              <p className="italic border-l-4 border-[#2F2582] pl-4 text-gray-600">
                "To inspire every home with beautiful, functional, and
                personalized furnishings that bring comfort, elegance, and a
                sense of individuality to living spaces."
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
