import { ImageWithLoading as Image } from "@/components/ui/ImageWithLoading";
import { motion } from "motion/react";

export function VisionMissionSection() {
  return (
    <section className="overflow-hidden bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="mb-16 flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Image
            src="/images/target.png"
            alt=""
            width={200}
            height={200}
            className="h-12 w-12 text-black md:h-14 md:w-14"
          />
          <h2 className="text-2xl font-semibold tracking-tight text-black lg:text-[32px]">
            Our Vision & Mission
          </h2>
        </motion.div>

        {/* Content */}
        <div className="space-y-20 lg:space-y-32">
          {/* Vision */}
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
            {/* Image */}
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="group relative">
                <div className="h-72 w-72 rotate-[-6deg] transform rounded-3xl bg-gray-100 shadow-xl transition-transform duration-500 group-hover:rotate-[-3deg] md:h-80 md:w-80 lg:h-96 lg:w-96" />
                <div className="absolute inset-0 h-72 w-72 md:h-80 md:w-80 lg:h-96 lg:w-96">
                  <Image
                    width={400}
                    height={400}
                    src="/images/visPic_1.png"
                    alt="Vision"
                    className="h-full w-full translate-x-4 translate-y-4 transform rounded-3xl border-4 border-white object-cover shadow-lg transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2"
                  />
                </div>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              className="max-w-2xl flex-1"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* <h3 className="text-2xl font-medium mb-6 text-black">
                Our Vision
              </h3> */}
              <div className="space-y-6 text-lg leading-relaxed text-[#575757]">
                <p>
                  Our mission is to redefine home styling by creating
                  furnishings that combine timeless elegance with modern
                  innovation.
                </p>

                <p>
                  We aspire to make every home a reflection of
                  individuality—warm, inviting, and beautifully designed—through
                  fabrics and collections that go beyond imagination.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Mission */}
          <div className="flex flex-col items-center gap-12 lg:flex-row-reverse lg:gap-20">
            {/* Image */}
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="group relative">
                <div className="h-72 w-72 rotate-[6deg] transform rounded-3xl bg-gray-100 shadow-xl transition-transform duration-500 group-hover:rotate-[3deg] md:h-80 md:w-80 lg:h-96 lg:w-96" />
                <div className="absolute inset-0 h-72 w-72 md:h-80 md:w-80 lg:h-96 lg:w-96">
                  <Image
                    width={400}
                    height={400}
                    src="/images/visPic_1.png"
                    alt="Mission"
                    className="h-full w-full -translate-x-4 translate-y-4 transform rounded-3xl border-4 border-white object-cover shadow-lg transition-transform duration-500 group-hover:-translate-x-2 group-hover:translate-y-2"
                  />
                </div>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              className="max-w-2xl flex-1"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* <h3 className="text-2xl font-medium mb-6 text-black">
                Our Mission
              </h3> */}
              <div className="space-y-6 text-lg leading-relaxed text-[#575757]">
                <p>
                  At Reliable Drapes, our mission is to craft high-quality,
                  stylish, and functional home furnishings that enhance everyday
                  living. Guided by passion and craftsmanship, we:
                </p>

                <ul className="space-y-4 leading-tight">
                  {[
                    "Design collections that balance tradition and innovation.",
                    "Offer a wide range of fabrics and furnishings curated by our expert designer team.",
                    "Ensure durability, comfort, and beauty in every product.",
                    "Help customers transform houses into homes that tell their unique story.",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#2F2582]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
