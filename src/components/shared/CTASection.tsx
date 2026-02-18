"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { getHeroVideoSettings } from "@/lib/actions/site-settings";

type CTASectionProps = {
  enableVideoBackground?: boolean;
};

export function CTASection({ enableVideoBackground = false }: CTASectionProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoSettings, setVideoSettings] = useState<{
    enabled: boolean;
    url: string | null;
    type: "youtube" | "upload" | null;
  }>({
    enabled: false,
    url: null,
    type: null,
  });
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!enableVideoBackground) return;

    async function fetchVideoSettings() {
      try {
        const settings = await getHeroVideoSettings();
        setVideoSettings(settings);
      } catch {
        // Keep image background as fallback
      }
    }

    fetchVideoSettings();
  }, [enableVideoBackground]);

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

  const youtubeVideoId =
    videoSettings.type === "youtube" && videoSettings.url
      ? getYouTubeVideoId(videoSettings.url)
      : null;
  const showVideoBackground =
    enableVideoBackground &&
    videoSettings.enabled &&
    !!videoSettings.url &&
    (videoSettings.type === "upload" || !!youtubeVideoId);
  const youtubeEmbedSrc = useMemo(() => {
    if (!youtubeVideoId) return null;
    return `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${youtubeVideoId}&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
  }, [youtubeVideoId, isMuted, isPlaying]);

  useEffect(() => {
    if (!showVideoBackground || videoSettings.type !== "upload" || !videoRef.current)
      return;

    videoRef.current.muted = isMuted;

    if (isPlaying) {
      videoRef.current.play().catch(() => {
        // Ignore autoplay interruption
      });
    } else {
      videoRef.current.pause();
    }
  }, [showVideoBackground, videoSettings.type, isMuted, isPlaying]);

  return (
    <section className="group relative overflow-hidden py-12 md:py-20 lg:py-24">
      {/* Background */}
      <div className="absolute inset-0">
        {showVideoBackground ? (
          <>
            {videoSettings.type === "youtube" && youtubeVideoId ? (
              <iframe
                src={youtubeEmbedSrc || undefined}
                title="CTA background video"
                allow="autoplay; encrypted-media; picture-in-picture"
                className="pointer-events-none h-full w-full border-0"
              />
            ) : (
              <video
                ref={videoRef}
                src={videoSettings.url || undefined}
                autoPlay={isPlaying}
                muted={isMuted}
                loop
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
            )}

            <div className="absolute right-4 bottom-4 z-20 flex items-center gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
              <button
                type="button"
                onClick={() => setIsPlaying((prev) => !prev)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/55"
                aria-label={isPlaying ? "Pause background video" : "Play background video"}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsMuted((prev) => !prev)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/55"
                aria-label={isMuted ? "Unmute background video" : "Mute background video"}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </>
        ) : (
          <Image
            src="/images/ctasbg.png"
            alt=""
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
            priority
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-black/25" />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 container mx-auto px-6 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="mb-6 font-semibold text-[32px] tracking-tight text-white md:mb-8 md:text-[36px] lg:mb-12 lg:text-[44px]">
          Trends Beyond
          <br />
          Imagination
        </h2>

        <motion.a
          href="/e-catalogue"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[rgba(255,255,255,0.15)] bg-[rgba(0,0,0,0.1)] px-5 py-2.5 text-white backdrop-blur-[6px] md:px-7 md:py-3.5 lg:px-9"
          whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.2)" }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-sm tracking-widest uppercase md:text-base">
            Explore Now
          </span>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowRight className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
          </motion.div>
        </motion.a>
      </motion.div>
    </section>
  );
}
