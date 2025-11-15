"use client";

import { ArrowRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

const carouselImages = [
  "/images/hero/heroImg2.png",
  "https://images.unsplash.com/photo-1712686422222-b2bdb134000f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXh0aWxlJTIwcGF0dGVybnMlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NjIxNDQ4MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1753362624798-d84f2722c89e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB1cGhvbHN0ZXJ5JTIwZmFicmljfGVufDF8fHx8MTc2MjE0NDgwMnww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1648475237029-7f853809ca14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnRlcmlvciUyMGRlc2lnbiUyMGhvbWV8ZW58MXx8fHwxNzYyMTA5MjY0fDA&ixlib=rb-4.1.0&q=80&w=1080",
];

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? carouselImages.length - 1 : prev - 1
    );
  }, []);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextSlide, prevSlide]);

  return (
    <section className="relative h-[576px] md:h-screen lg:h-screen w-full overflow-hidden">
      {/* Background Image Carousel */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${carouselImages[currentIndex]})` }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 h-full flex flex-col items-center justify-end">
        <motion.div
          className="text-center max-w-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.button
            className="mb-32 backdrop-blur-[6px] bg-[rgba(0,0,0,0.1)] border border-[rgba(255,255,255,0.15)] rounded-lg px-5 md:px-7 lg:px-9 py-2.5 md:py-3.5 lg:py-4 text-white inline-flex items-center gap-2 cursor-pointer text-sm md:text-base"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.2)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <span className="tracking-widest uppercase">
              Explore Collections
            </span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Carousel Dots */}
        <div className="absolute bottom-12 md:bottom-20 lg:bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-3">
          {carouselImages.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`rounded-full cursor-pointer transition-all ${
                index === currentIndex
                  ? "w-5 h-2 bg-white"
                  : "w-1 h-1 bg-white/60 hover:bg-white/80"
              }`}
              whileHover={{ scale: 1.2 }}
              transition={{ duration: 0.2 }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
