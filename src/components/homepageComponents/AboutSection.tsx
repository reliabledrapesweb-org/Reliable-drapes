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
            className="flex-1 relative max-lg:-translate-x-18 max-xl:-translate-x-22 mb-10 lg:mb-0 order-1 lg:order-2"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative flex items-center justify-center">
              <motion.div
                className="absolute w-[171px] h-[171px] md:w-[182px] md:h-[182px] lg:w-[230px] lg:h-[230px] xl:w-[272px] xl:h-[272px] rotate-[350deg] translate-y-8"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full h-full rounded-2xl overflow-hidden">
                  <Image
                    src="/images/about/aboutImg1.png"
                    width={100}
                    height={100}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
              <motion.div
                className="absolute w-[168px] h-[168px] md:w-[182px] md:h-[182px] lg:w-[230px] lg:h-[230px] xl:w-[272px] xl:h-[272px] rotate-[6deg] translate-x-30 md:translate-x-34 lg:translate-x-52 -translate-y-8 lg:-translate-y-16"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full h-full rounded-2xl overflow-hidden">
                  <Image
                    src="/images/about/aboutImg2.png"
                    width={100}
                    height={100}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
              <motion.div
                className="absolute w-[168px] h-[168px] md:w-[182px] md:h-[182px] lg:w-[230px] lg:h-[230px] xl:w-[272px] xl:h-[272px] rotate-[353deg] translate-x-30 md:translate-x-34 lg:translate-x-50 translate-y-24"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full h-full rounded-2xl overflow-hidden">
                  <Image
                    src="/images/about/aboutImg3.png"
                    width={100}
                    height={100}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
              {/* Spacer for layout */}
              <div className="w-[280px] md:w-[320px] lg:w-[350px] h-[280px] md:h-[320px] lg:h-[350px]" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
