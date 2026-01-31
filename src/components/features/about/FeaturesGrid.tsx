import Image from "next/image";
import { motion } from "motion/react";
import type { AboutSection } from "@/lib/actions/about-sections";

interface FeaturesGridProps {
  section?: AboutSection;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

export function FeaturesGrid({ section }: FeaturesGridProps) {
  // Default features as fallback
  const defaultFeatures: Feature[] = [
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

  // Use CMS data if available, otherwise use defaults
  const features =
    (section?.content_json as unknown as Feature[]) || defaultFeatures;

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
    <section className="bg-[#f8f8f8] py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="grid gap-12 md:grid-cols-3 lg:gap-16"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group flex flex-col items-center text-center"
            >
              {/* Icon */}
              <div className="mb-6 flex h-24 w-24 items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Image
                  width={200}
                  height={200}
                  src={feature.icon}
                  alt=""
                  className="h-16 w-16 object-contain text-black md:h-20 md:w-20"
                />
              </div>

              {/* Content */}
              <h3 className="mb-3 text-xl font-semibold text-black">
                {feature.title}
              </h3>
              <p className="max-w-xs leading-relaxed text-[#575757]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
