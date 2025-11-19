import Image from "next/image";
import { motion } from "motion/react";

export function VisionMissionSection() {
  return (
    <section className="py-16 lg:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="flex items-center justify-center gap-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Image
            src="/images/target.png"
            alt=""
            width={100}
            height={100}
            className="w-12 h-12 md:w-14 md:h-14 text-black"
          />
          <h2 className="text-3xl lg:text-4xl font-light text-black">
            Our Vision & Mission
          </h2>
        </motion.div>

        {/* Content */}
        <div className="space-y-20 lg:space-y-32">
          {/* Vision */}
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
                    src="/images/visPic_1.png"
                    alt="Vision"
                    className="w-full h-full object-cover rounded-3xl border-4 border-white shadow-lg transform translate-x-4 translate-y-4 transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2"
                  />
                </div>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div 
              className="flex-1 max-w-2xl"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h3 className="text-2xl font-medium mb-6 text-black">Our Vision</h3>
              <div className="space-y-6 text-[#575757] text-lg leading-relaxed">
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
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
            {/* Image */}
            <motion.div 
              className="flex-shrink-0"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative group">
                <div className="w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gray-100 rounded-3xl shadow-xl transform rotate-[6deg] transition-transform duration-500 group-hover:rotate-[3deg]" />
                <div className="absolute inset-0 w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96">
                  <Image
                    width={400}
                    height={400}
                    src="/images/visPic_1.png"
                    alt="Mission"
                    className="w-full h-full object-cover rounded-3xl border-4 border-white shadow-lg transform -translate-x-4 translate-y-4 transition-transform duration-500 group-hover:-translate-x-2 group-hover:translate-y-2"
                  />
                </div>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div 
              className="flex-1 max-w-2xl"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h3 className="text-2xl font-medium mb-6 text-black">Our Mission</h3>
              <div className="space-y-6 text-[#575757] text-lg leading-relaxed">
                <p>
                  At Reliable Drapes, our mission is to craft high-quality,
                  stylish, and functional home furnishings that enhance everyday
                  living. Guided by passion and craftsmanship, we:
                </p>

                <ul className="space-y-4">
                  {[
                    "Design collections that balance tradition and innovation.",
                    "Offer a wide range of fabrics and furnishings curated by our expert designer team.",
                    "Ensure durability, comfort, and beauty in every product.",
                    "Help customers transform houses into homes that tell their unique story."
                  ].map((item, index) => (
                    <li key={index} className="flex gap-3 items-start">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#2F2582] flex-shrink-0" />
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
