"use client";

import { Send, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { createNewsletterSubscriber } from "@/lib/actions/communications";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    const result = await createNewsletterSubscriber({ email });

    if (result.success) {
      setIsSuccess(true);
      setEmail("");
      setTimeout(() => setIsSuccess(false), 5000);
    } else {
      setError(result.error || "Failed to subscribe. Please try again.");
    }

    setIsLoading(false);
  };

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
          <h2 className="text-black mb-6 md:mb-8 text-[28px] tracking-tight font-medium md:text-[36px]">
            Be the first to know about <br /> our latest collection
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center gap-4 justify-center">
            <div className="w-full md:w-auto relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="Your email address..."
                disabled={isLoading || isSuccess}
                className="w-full md:w-[450px] lg:w-[550px] h-12 md:h-14 px-5 md:px-6 rounded-full border border-[#E4E4E4] shadow-[0px_4px_50px_0px_rgba(47,37,130,0.06)] focus:outline-none focus:border-[#2f2582] transition-colors cursor-text text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <motion.button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full md:w-auto bg-[#2f2582] text-white px-6 md:px-8 py-3 md:py-4 rounded-full shadow-[0px_4px_18px_0px_rgba(47,37,130,0.4)] inline-flex items-center justify-center gap-2 cursor-pointer text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={!isLoading && !isSuccess ? { scale: 1.05, backgroundColor: "#25205f" } : {}}
              whileTap={!isLoading && !isSuccess ? { scale: 0.98 } : {}}
              transition={{ duration: 0.2 }}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span className="tracking-wide">Subscribing...</span>
                  </motion.div>
                ) : isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="tracking-wide">Subscribed!</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span className="tracking-wide">Subscribe</span>
                    <Send className="w-4 h-4 md:w-5 md:h-5 rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 text-sm text-red-600"
              >
                {error}
              </motion.p>
            )}
            {isSuccess && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 text-sm text-green-600"
              >
                Thank you for subscribing! Check your email for confirmation.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
