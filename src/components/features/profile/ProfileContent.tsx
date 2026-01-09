"use client";

import { motion } from "motion/react";
import { ProfileForm } from "./ProfileForm";
import { UserProfile } from "@/lib/actions/users";
import { User } from "lucide-react";

interface ProfileContentProps {
  user: UserProfile;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 },
  },
};

export function ProfileContent({ user }: ProfileContentProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 md:px-6 lg:px-8"
    >
      <div className="mb-8">
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-3 mb-2"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2F2582]/10"
          >
            <User className="h-5 w-5 text-[#2F2582]" />
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="text-3xl font-bold text-[#161616]"
          >
            Your Profile
          </motion.h1>
        </motion.div>
        <motion.p
          variants={itemVariants}
          className="mt-2 text-gray-600 ml-13"
        >
          Manage your account settings and preferences.
        </motion.p>
      </div>

      <ProfileForm user={user} />
    </motion.div>
  );
}
