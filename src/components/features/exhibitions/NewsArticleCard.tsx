"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import type { ExhibitionItem } from "@/lib/actions/exhibitions";

type NewsArticleCardProps = {
  item: ExhibitionItem;
};

export function NewsArticleCard({ item }: NewsArticleCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {item.image_url && (
        <div className="relative aspect-video w-full bg-gray-100">
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-4">
        {item.source_name && (
          <p className="mb-1 text-xs font-semibold tracking-wide text-[#2F2582] uppercase">
            {item.source_name}
          </p>
        )}
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{item.title}</h3>
        {item.description && (
          <p className="mt-1 text-xs text-gray-500 line-clamp-2">{item.description}</p>
        )}
        {item.article_url && (
          <a
            href={item.article_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#2F2582] hover:underline"
          >
            Read Article <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}
