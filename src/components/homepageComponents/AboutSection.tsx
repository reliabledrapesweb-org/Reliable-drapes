import Image from "next/image";
import { motion } from "motion/react";

export function AboutSection() {
  return (
    <section className="bg-white py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 lg:flex-row">
          {/* Content */}
          <motion.div
            className="order-2 max-w-lg flex-1 lg:order-1"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-4 text-3xl font-semibold text-black lg:text-4xl lg:font-medium">
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
            className="order-1 w-full flex-1 lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative mx-auto mt-8 aspect-square w-full max-w-[320px] md:max-w-[400px] lg:mt-0 lg:max-w-[500px]">
              {/* Image 1 - Left */}
              <motion.div
                className="absolute top-1/4 left-0 z-10 aspect-square w-[55%]"
                style={{ rotate: -10 }}
                whileHover={{ scale: 1.05, rotate: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="h-full w-full overflow-hidden rounded-2xl border-4 border-white shadow-lg">
                  <Image
                    src="/images/about/aboutImg1.png"
                    width={300}
                    height={300}
                    alt="Interior design"
                    className="h-full w-full object-cover"
                  />
                </div>
              </motion.div>

              {/* Image 2 - Top Right */}
              <motion.div
                className="absolute top-0 right-0 z-0 aspect-square w-[55%]"
                style={{ rotate: 6 }}
                whileHover={{ scale: 1.05, rotate: 8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="h-full w-full overflow-hidden rounded-2xl border-4 border-white shadow-lg">
                  <Image
                    src="/images/about/aboutImg2.png"
                    width={300}
                    height={300}
                    alt="Curtain details"
                    className="h-full w-full object-cover"
                  />
                </div>
              </motion.div>

              {/* Image 3 - Bottom Right */}
              <motion.div
                className="absolute right-4 bottom-0 z-20 aspect-square w-[55%]"
                style={{ rotate: -7 }}
                whileHover={{ scale: 1.05, rotate: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="h-full w-full overflow-hidden rounded-2xl border-4 border-white shadow-lg">
                  <Image
                    src="/images/about/aboutImg3.png"
                    width={300}
                    height={300}
                    alt="Fabric texture"
                    className="h-full w-full object-cover"
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
