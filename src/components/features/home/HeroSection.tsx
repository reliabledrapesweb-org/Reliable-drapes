"use client";

import { ArrowRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

import Image from "next/image";

const carouselImages = [
  "/images/hero/heroImg2.png",
  "/images/hero/2.jpg",
  "/images/hero/3.jpg",
  "/images/hero/5.jpg",
  "/images/hero/6.jpg",
];

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? carouselImages.length - 1 : prev - 1,
    );
  }, []);

  // Preload images and track when they're loaded
  useEffect(() => {
    const loaded = new Set<string>();
    
    carouselImages.forEach((src) => {
      const img = new window.Image();
      img.onload = () => {
        loaded.add(src);
        setLoadedImages(new Set(loaded));
      };
      img.onerror = () => {
        // Still mark as loaded on error to not block
        loaded.add(src);
        setLoadedImages(new Set(loaded));
      };
      img.src = src;
    });
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
    <section className="relative h-[576px] w-full overflow-hidden md:h-screen lg:h-screen">
      {/* Background Image Carousel */}
      <div className="absolute inset-0 bg-black">
        <AnimatePresence>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05, filter: "blur(2px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, zIndex: -1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={carouselImages[currentIndex]}
              alt="Hero Background"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto flex h-full flex-col items-center justify-end px-6">
        <motion.div
          className="max-w-xl text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.button
            className="mb-32 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.15)] bg-[rgba(0,0,0,0.1)] px-5 py-2.5 text-sm text-white backdrop-blur-[6px] md:px-7 md:py-3.5 md:text-base lg:px-9 lg:py-4"
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
              <ArrowRight className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Carousel Dots */}
        <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 items-center gap-3 md:bottom-20 lg:bottom-24">
          {carouselImages.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`cursor-pointer rounded-full transition-all ${index === currentIndex
                ? "h-2 w-5 bg-white"
                : "h-1 w-1 bg-white/60 hover:bg-white/80"
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
