"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { motion } from "motion/react";
import type { ExhibitionItem } from "@/lib/actions/exhibitions";

type ExhibitionCardProps = {
  item: ExhibitionItem;
  index: number;
};

export function ExhibitionCard({ item, index }: ExhibitionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-2xl bg-gray-900"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden sm:aspect-[4/5]">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <ImageIcon className="h-12 w-12 text-gray-600" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Content overlay */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <h3 className="text-lg font-bold leading-tight text-white sm:text-xl">
            {item.title}
          </h3>
          {item.description && (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/75">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
