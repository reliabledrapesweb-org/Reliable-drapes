"use client";

import { motion } from "motion/react";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="relative h-16 w-16">
        <motion.span
          className="bg-primary absolute top-0 left-0 h-7 w-7"
          animate={{
            x: [0, 36, 36, 0, 0],
            y: [0, 0, 36, 36, 0],
            rotate: [0, 0, 90, 90, 0],
            borderRadius: ["20%", "20%", "50%", "50%", "20%"],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.25, 0.5, 0.75, 1],
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
        />
        <motion.span
          className="bg-primary/80 absolute top-0 right-0 h-7 w-7"
          animate={{
            x: [0, 0, -36, -36, 0],
            y: [0, 36, 36, 0, 0],
            rotate: [0, 0, 90, 90, 0],
            borderRadius: ["20%", "20%", "50%", "50%", "20%"],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.25, 0.5, 0.75, 1],
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
        />
        <motion.span
          className="bg-primary/60 absolute right-0 bottom-0 h-7 w-7"
          animate={{
            x: [0, -36, -36, 0, 0],
            y: [0, 0, -36, -36, 0],
            rotate: [0, 0, 90, 90, 0],
            borderRadius: ["20%", "20%", "50%", "50%", "20%"],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.25, 0.5, 0.75, 1],
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
        />
        <motion.span
          className="bg-primary/40 absolute bottom-0 left-0 h-7 w-7"
          animate={{
            x: [0, 0, 36, 36, 0],
            y: [0, -36, -36, 0, 0],
            rotate: [0, 0, 90, 90, 0],
            borderRadius: ["20%", "20%", "50%", "50%", "20%"],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.25, 0.5, 0.75, 1],
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
        />
      </div>
    </div>
  );
}
