import { motion, AnimatePresence, Variants } from "motion/react";
import { X, ArrowRight } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  navLinks: { name: string; link: string }[];
}

export function MobileMenu({ isOpen, setIsOpen, navLinks }: MobileMenuProps) {
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
          className="fixed inset-0 bg-[#2F2582] z-50 flex flex-col justify-center items-center lg:hidden overflow-hidden"
        >
          {/* Close Button */}
          <motion.button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-8 h-8 md:w-10 md:h-10" />
          </motion.button>

          {/* Menu Links */}
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="initial"
            className="flex flex-col items-center space-y-6 md:space-y-8"
          >
            {navLinks.map((item, i) => (
              <motion.div key={i} variants={linkVariants} className="overflow-hidden">
                <a
                  href={item.link}
                  onClick={() => setIsOpen(false)}
                  className="group relative flex items-center gap-4 text-white text-4xl md:text-5xl font-light tracking-tight hover:text-white/90 transition-colors"
                >
                  <span className="relative z-10">{item.name}</span>
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="hidden md:block"
                  >
                    <ArrowRight className="w-8 h-8 md:w-10 md:h-10" />
                  </motion.span>
                  
                  {/* Hover Underline Effect */}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full" />
                </a>
              </motion.div>
            ))}

            {/* CTA Button */}
            <motion.div variants={linkVariants} className="pt-8"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}>
              <button
                className="bg-white text-[#2F2582] px-8 py-3 md:px-10 md:py-4 rounded-full text-lg md:text-xl font-medium shadow-lg hover:shadow-xl hover:bg-gray-100 transition-all transform hover:-translate-y-1 active:translate-y-0 cursor-pointer"
              >
                Trader Log In
              </button>
            </motion.div>
          </motion.div>
          
          {/* Background Decorative Elements */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
