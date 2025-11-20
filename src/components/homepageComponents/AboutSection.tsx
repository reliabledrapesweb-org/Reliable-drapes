import Image from "next/image";
import { motion } from "motion/react";

export function AboutSection() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-8 max-w-6xl mx-auto">
          {/* Content */}
          <motion.div
            className="flex-1 max-w-lg order-2 lg:order-1"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-black text-3xl font-semibold lg:text-4xl lg:font-medium">
              About Reliable Drapes
            </h2>
            <div className="space-y-4 text-[#575757]">
              <p>
                At Reliable Drapes, we bring style, comfort, and craftsmanship
                to every corner of your home. From elegant curtains, sheers, and
                wider-width drapes to premium upholstery, bed sheets,
                comforters, quilts, sofa panels, and door mats, every product is
                crafted to blend beauty with durability.
              </p>
              <p>
                Trusted by architects, interior designers, and homeowners across
                India, Reliable Drapes offers a complete range of home
                furnishing solutions to elevate your living spaces effortlessly.
              </p>
            </div>
          </motion.div>

          {/* Images */}
          <motion.div
            className="flex-1 w-full order-1 lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative w-full max-w-[320px] md:max-w-[400px] lg:max-w-[500px] aspect-square mx-auto mt-8 lg:mt-0">
              {/* Image 1 - Left */}
              <motion.div
                className="absolute left-0 top-1/4 w-[55%] aspect-square z-10"
                style={{ rotate: -10 }}
                whileHover={{ scale: 1.05, rotate: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                  <Image
                    src="/images/about/aboutImg1.png"
                    width={300}
                    height={300}
                    alt="Interior design"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>

              {/* Image 2 - Top Right */}
              <motion.div
                className="absolute right-0 top-0 w-[55%] aspect-square z-0"
                style={{ rotate: 6 }}
                whileHover={{ scale: 1.05, rotate: 8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                  <Image
                    src="/images/about/aboutImg2.png"
                    width={300}
                    height={300}
                    alt="Curtain details"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>

              {/* Image 3 - Bottom Right */}
              <motion.div
                className="absolute right-4 bottom-0 w-[55%] aspect-square z-20"
                style={{ rotate: -7 }}
                whileHover={{ scale: 1.05, rotate: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                  <Image
                    src="/images/about/aboutImg3.png"
                    width={300}
                    height={300}
                    alt="Fabric texture"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
