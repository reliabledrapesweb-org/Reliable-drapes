"use client";

import { Send } from "lucide-react";
import { motion } from "motion/react";

export function NewsletterSection() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-black mb-6 md:mb-8 text-[28px] font-medium md:text-[36px]">
            Be the first know about <br /> our latest collection
          </h2>

          <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
            <div className="w-full md:w-auto relative">
              <input
                type="email"
                placeholder="Your email address..."
                className="w-full md:w-[450px] lg:w-[550px] h-12 md:h-14 px-5 md:px-6 rounded-full border border-[#E4E4E4] shadow-[0px_4px_50px_0px_rgba(47,37,130,0.06)] focus:outline-none focus:border-[#2f2582] transition-colors cursor-text text-sm md:text-base"
              />
            </div>
            <motion.button
              className="w-full md:w-auto bg-[#2f2582] text-white px-6 md:px-8 py-3 md:py-4 rounded-full shadow-[0px_4px_18px_0px_rgba(47,37,130,0.4)] inline-flex items-center justify-center gap-2 cursor-pointer text-sm md:text-base"
              whileHover={{ scale: 1.05, backgroundColor: "#25205f" }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <span className="tracking-wide">Subscribe</span>
              <Send className="w-4 h-4 md:w-5 md:h-5 rotate-45" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
