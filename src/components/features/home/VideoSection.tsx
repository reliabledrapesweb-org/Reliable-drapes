"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { getHeroVideoSettings } from "@/lib/actions/site-settings";

export function VideoSection() {
  const [videoSettings, setVideoSettings] = useState<{
    enabled: boolean;
    url: string | null;
    type: "youtube" | "upload" | null;
  }>({
    enabled: false,
    url: null,
    type: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchVideoSettings() {
      try {
        const settings = await getHeroVideoSettings();
        setVideoSettings(settings);
      } catch {
        // Keep default disabled state
      }
      setIsLoading(false);
    }

    fetchVideoSettings();
  }, []);

  // Don't render if disabled or loading
  if (isLoading || !videoSettings.enabled || !videoSettings.url) {
    return null;
  }

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#f8f8f8] py-10 md:py-12 lg:py-14">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-6"
      >
        <div className="mx-auto w-full max-w-4xl">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-black/10 bg-black shadow-[0_20px_60px_-32px_rgba(0,0,0,0.6)]">
            {videoSettings.type === "youtube" ? (
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeVideoId(videoSettings.url)}?rel=0&modestbranding=1`}
                title="Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <video
                src={videoSettings.url}
                controls
                className="h-full w-full object-contain"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
