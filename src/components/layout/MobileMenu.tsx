"use client";

import { motion, AnimatePresence, Variants } from "motion/react";
import { X, ArrowRight, Building2 } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  navLinks: { name: string; link: string }[];
  user?: any;
}

export function MobileMenu({
  isOpen,
  setIsOpen,
  navLinks,
  user,
}: MobileMenuProps) {
  const menuVariants: Variants = {
    initial: {
      clipPath: "circle(0% at 100% 0%)",
    },
    animate: {
      clipPath: "circle(150% at 100% 0%)",
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      clipPath: "circle(0% at 100% 0%)",
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.2,
      },
    },
  };

  const containerVariants: Variants = {
    initial: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
    animate: {
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const linkVariants: Variants = {
    initial: {
      y: 50,
      opacity: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    exit: {
      y: 50,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          variants={menuVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-black lg:hidden"
        >
          {/* Top bar with close button */}
          <div className="flex h-14 shrink-0 items-center justify-end px-4 md:h-16 md:px-6">
            <motion.button
              onClick={() => setIsOpen(false)}
              className="cursor-pointer rounded-full p-2 text-white transition-colors hover:bg-white/10"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-6 w-6 md:h-8 md:w-8" />
            </motion.button>
          </div>

          {/* Scrollable menu content */}
          <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-4">
            <motion.div
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="initial"
              className="flex flex-col items-center space-y-4 sm:space-y-5 md:space-y-6"
            >
              {navLinks.map((item, i) => (
                <motion.div
                  key={i}
                  variants={linkVariants}
                  className="overflow-hidden"
                >
                  <a
                    href={item.link}
                    onClick={() => setIsOpen(false)}
                    className="group relative flex items-center gap-4 text-2xl font-light tracking-tight text-white transition-colors hover:text-white/90 sm:text-3xl md:text-4xl"
                  >
                    <span className="relative z-10">{item.name}</span>
                    <motion.span
                      initial={{ opacity: 0, x: -20 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="hidden md:block"
                    >
                      <ArrowRight className="h-8 w-8 md:h-10 md:w-10" />
                    </motion.span>

                    {/* Hover Underline Effect */}
                    <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-white transition-all duration-300 group-hover:w-full" />
                  </a>
                </motion.div>
              ))}

              {/* Login Buttons - Only show when user is NOT logged in */}
              {!user && (
                <motion.div
                  variants={linkVariants}
                  className="flex w-full max-w-xs flex-col items-center gap-3 pt-6 sm:max-w-sm sm:pt-8"
                >
                  <motion.a
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex w-full transform cursor-pointer items-center justify-center rounded-full border border-white/40 bg-white/10 px-6 py-2.5 text-base font-medium text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-white/20 hover:shadow-xl active:translate-y-0 sm:px-8 sm:py-3 sm:text-lg md:px-10 md:py-4 md:text-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Login
                  </motion.a>

                  <motion.a
                    href="http://103.67.92.110:4141/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex w-full transform cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-base font-medium text-black shadow-lg transition-all hover:-translate-y-1 hover:bg-gray-100 hover:shadow-xl active:translate-y-0 sm:px-8 sm:py-3 sm:text-lg md:px-10 md:py-4 md:text-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Building2 className="h-5 w-5" />
                    Trader Login
                  </motion.a>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Background Decorative Elements */}
          <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-black/20 to-transparent" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
