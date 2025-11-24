import Image from "next/image";
import { motion } from "motion/react";

export function FeaturesGrid() {
  const features = [
    {
      icon: "/images/fi_1.png",
      title: "Expertly Curated Designs",
      description: "Handpicked collections to elevate every space.",
    },
    {
      icon: "/images/fi_2.png",
      title: "Luxury Craftsmanship",
      description: "From rich embroidery to modern minimal patterns.",
    },
    {
      icon: "/images/fi_3.png",
      title: "Dedicated Styling Experts",
      description:
        "Personalized guidance for a home that feels uniquely yours.",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="py-16 lg:py-24 bg-[#f8f8f8]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          className="grid md:grid-cols-3 gap-12 lg:gap-16"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="flex flex-col items-center text-center group"
            >
              {/* Icon */}
              <div className="w-24 h-24 mb-6 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Image
                  width={200}
                  height={200}
                  src={feature.icon}
                  alt=""
                  className="md:w-20 md:h-20 w-16 h-16 text-black object-contain"
                />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-3 text-black">
                {feature.title}
              </h3>
              <p className="text-[#575757] max-w-xs leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
