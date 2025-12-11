import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

interface ProductCardProps {
  id?: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  pdfUrl?: string;
  badge?: "new" | "discount" | null;
  discountValue?: string;
  isVisible?: boolean;
  animationDelay?: number;
  onDownload?: (productName: string, catalogueId?: string) => void;
}

export function ProductCard({
  id,
  title,
  subtitle,
  imageSrc,
  pdfUrl,
  badge = null,
  discountValue = "-30%",
  isVisible = true,
  animationDelay = 0,
  onDownload,
}: ProductCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Luxury furniture fallback image
  const fallbackImage = "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center";

  const handleClick = () => {
    setShowPreview(true);
  };

  const handleDownload = () => {
    onDownload?.(title, id);
    
    // Trigger actual download if PDF URL exists
    if (pdfUrl) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}-catalogue.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    setShowPreview(false);
  };

  const handleClose = () => {
    setShowPreview(false);
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{
          duration: 0.6,
          delay: animationDelay / 1000,
          ease: [0.22, 1, 0.36, 1],
        }}
        onClick={handleClick}
        className="group flex w-full cursor-pointer flex-col gap-5 transition-transform duration-300 hover:scale-[1.02]"
      >
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-b from-gray-200 to-gray-400 shadow-lg transition-shadow duration-300 group-hover:shadow-xl">
          <div className="h-full w-full">
            <Image
              width={500}
              height={500}
              src={imageError ? fallbackImage : imageSrc}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={() => {
                console.error("Image failed to load:", imageSrc);
                setImageError(true);
              }}
              onLoad={() => {
                console.log("Image loaded successfully:", imageError ? fallbackImage : imageSrc);
              }}
            />
          </div>

          {/* Overlay gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Badge */}
          {badge && (
            <div className="absolute top-4 right-4">
              {badge === "discount" && (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e97171] shadow-lg backdrop-blur-sm">
                  <span className="text-sm font-semibold text-white">
                    {discountValue}
                  </span>
                </div>
              )}
              {badge === "new" && (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2f2582] shadow-lg backdrop-blur-sm">
                  <span className="text-sm font-semibold text-white">New</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 px-1">
          <h3 className="text-xl font-semibold text-[#2a2a2a] leading-tight transition-colors duration-200 group-hover:text-[#2f2582] lg:text-2xl">
            {title}
          </h3>
          <p className="text-sm font-normal text-[#898989] leading-relaxed lg:text-base">
            {subtitle}
          </p>
        </div>
      </motion.article>

      {/* Preview Modal */}
      {showPreview && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
          onClick={handleClose}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative flex h-[90vh] w-full max-w-6xl flex-col rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-2xl font-medium text-gray-900">{title}</h2>
                <p className="text-sm text-gray-600">{subtitle}</p>
              </div>
              <button 
                onClick={handleClose}
                className="rounded-full bg-gray-100 p-2 transition-colors hover:bg-gray-200"
                aria-label="Close preview"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* PDF Preview */}
            <div className="flex-1 overflow-hidden bg-gray-50 p-4">
              {pdfUrl ? (
                <iframe
                  src={`${pdfUrl}#toolbar=0`}
                  className="h-full w-full rounded-lg border border-gray-300 bg-white"
                  title={`${title} PDF Preview`}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4">
                  <div className="rounded-lg bg-white p-8 shadow-md">
                    <Image
                      width={400}
                      height={300}
                      src={imageSrc}
                      alt={title}
                      className="h-auto w-full rounded-lg object-contain"
                    />
                  </div>
                  <p className="text-gray-500">PDF preview not available</p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button 
                onClick={handleClose}
                className="rounded-lg border border-gray-300 px-6 py-2.5 text-gray-700 transition-colors hover:bg-gray-50"
              >
                Close
              </button>
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 rounded-lg bg-[#2f2582] px-6 py-2.5 text-white transition-colors hover:bg-[#251e66]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Catalogue
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
