"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset loading state on path change (template remounts automatically, but good to be explicit)
    setIsLoading(true);

    // Wait for 1.5 seconds to allow content to load behind the screen
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[9999]"
          >
            <LoadingScreen />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
