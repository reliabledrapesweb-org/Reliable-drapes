"use client";

import Image from "next/image";
import { User } from "lucide-react";
import { motion } from "motion/react";

type LeadershipMember = {
  name: string;
  designation: string;
  imageUrl: string | null;
};

type LeadershipRowProps = {
  members: LeadershipMember[];
};

export function LeadershipRow({ members }: LeadershipRowProps) {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#2F2582]" />
            <span className="text-xs font-semibold tracking-[0.15em] text-[#2F2582] uppercase">
              Our Leadership
            </span>
            <span className="h-px w-8 bg-[#2F2582]" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
            The People Behind Reliable Drapes
          </h2>
        </motion.div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member, index) => (
            <motion.div
              key={member.designation}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-gray-100 to-gray-200">
                {member.imageUrl ? (
                  <Image
                    src={member.imageUrl}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <User className="h-16 w-16 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="p-5 text-center">
                <p className="text-lg font-bold text-gray-900">{member.name}</p>
                <p className="mt-1 text-sm font-semibold tracking-wide text-[#2F2582] uppercase">
                  {member.designation}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
