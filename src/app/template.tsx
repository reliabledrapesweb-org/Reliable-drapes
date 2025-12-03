"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset loading state on path change
    setIsLoading(true);

    const waitForAssets = async () => {
      // Minimum wait time to ensure content renders
      const minWaitTime = 500;
      const startTime = Date.now();

      // Wait for all images and fonts to load
      const imageLoadPromises = Array.from(document.images).map((img) => {
        return new Promise<void>((resolve) => {
          if (img.complete) {
            // Image is already loaded from cache
            resolve();
          } else {
            // Wait for image to load
            const onLoad = () => {
              img.removeEventListener("load", onLoad);
              img.removeEventListener("error", onError);
              resolve();
            };
            const onError = () => {
              img.removeEventListener("load", onLoad);
              img.removeEventListener("error", onError);
              resolve(); // Resolve even on error to not block
            };
            img.addEventListener("load", onLoad);
            img.addEventListener("error", onError);
          }
        });
      });

      // Wait for document to be fully interactive
      const documentReadyPromise = new Promise<void>((resolve) => {
        if (document.readyState === "complete") {
          resolve();
        } else {
          window.addEventListener("load", () => resolve(), { once: true });
        }
      });

      // Wait for all images and document to load
      await Promise.all([...imageLoadPromises, documentReadyPromise]);

      // Ensure minimum wait time has passed
      const elapsedTime = Date.now() - startTime;
      const remainingWait = Math.max(minWaitTime - elapsedTime, 0);

      if (remainingWait > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingWait));
      }

      setIsLoading(false);
    };

    waitForAssets();
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
