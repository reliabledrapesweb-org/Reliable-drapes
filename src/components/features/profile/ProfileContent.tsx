"use client";

import { motion } from "motion/react";
import { ProfileForm } from "./ProfileForm";
import { UserProfile } from "@/lib/actions/users";

interface ProfileContentProps {
  user: UserProfile;
}

export function ProfileContent({ user }: ProfileContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 md:px-6 lg:px-8"
    >
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-[#161616]"
        >
          Your Profile
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-gray-600"
        >
          Manage your account settings and preferences.
        </motion.p>
      </div>

      <ProfileForm user={user} />
    </motion.div>
  );
}
