"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ImageWithLoadingProps extends ImageProps {
  containerClassName?: string;
}

export function ImageWithLoading({
  src,
  alt,
  className,
  containerClassName,
  onLoad,
  ...props
}: ImageWithLoadingProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}
      <Image
        src={src}
        alt={alt}
        className={cn(
          "duration-700 ease-in-out",
          isLoading
            ? "scale-110 blur-2xl grayscale"
            : "blur-0 scale-100 grayscale-0",
          className,
        )}
        onLoad={(e) => {
          setIsLoading(false);
          if (onLoad) {
            onLoad(e);
          }
        }}
        {...props}
      />
    </div>
  );
}
