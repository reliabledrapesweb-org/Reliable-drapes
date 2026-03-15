"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import type { ExhibitionItem } from "@/lib/actions/exhibitions";

type NewsArticleCardProps = {
  item: ExhibitionItem;
  index: number;
};

export function NewsArticleCard({ item, index }: NewsArticleCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-lg"
    >
      {item.image_url && (
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {item.source_name && (
            <div className="absolute top-3 left-3">
              <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold tracking-wider text-[#2F2582] uppercase backdrop-blur-sm">
                {item.source_name}
              </span>
            </div>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-gray-900">
            {item.title}
          </h3>
          {item.description && (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-500">
              {item.description}
            </p>
          )}
        </div>
        {item.article_url && (
          <a
            href={item.article_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#2F2582] transition-colors hover:text-[#1e1860]"
          >
            Read Article
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        )}
      </div>
    </motion.article>
  );
}
