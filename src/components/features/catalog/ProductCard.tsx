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
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);

  // Luxury furniture fallback image
  const fallbackImage =
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center";

  const handleClick = () => {
    setShowPreview(true);
    setPdfLoading(true);
    setPdfError(false);
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
                console.log(
                  "Image loaded successfully:",
                  imageError ? fallbackImage : imageSrc,
                );
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
          <h3 className="text-xl leading-tight font-semibold text-[#2a2a2a] transition-colors duration-200 group-hover:text-[#2f2582] lg:text-2xl">
            {title}
          </h3>
          <p className="line-clamp-1 text-sm leading-relaxed font-normal text-[#898989] lg:text-base">
            {subtitle}
          </p>
        </div>
      </motion.article>

      {/* Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-[#2f2582] to-[#1e1a5c] px-6 py-5 md:px-8 md:py-6">
              <div className="min-w-0 flex-1 pr-4">
                <h2 className="truncate text-xl font-bold text-white md:text-2xl">
                  {title}
                </h2>
                <p className="mt-1 truncate text-sm text-white/90 md:text-base">
                  {subtitle}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="flex-shrink-0 rounded-full bg-white/10 p-2.5 backdrop-blur-sm transition-all duration-200 hover:rotate-90 hover:bg-white/20"
                aria-label="Close preview"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white md:h-6 md:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* PDF Preview */}
            <div className="relative flex-1 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:p-6">
              {pdfUrl ? (
                <>
                  {/* Loading Indicator */}
                  {pdfLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="h-16 w-16 rounded-full border-4 border-[#2f2582]/20 md:h-20 md:w-20"></div>
                          <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-[#2f2582] md:h-20 md:w-20"></div>
                        </div>
                        <div className="text-center">
                          <p className="text-base font-semibold text-gray-900 md:text-lg">
                            Loading PDF...
                          </p>
                          <p className="mt-1 text-xs text-gray-500 md:text-sm">
                            Please wait while we prepare your preview
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PDF Error State */}
                  {pdfError && (
                    <div className="flex h-full flex-col items-center justify-center gap-4">
                      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow-lg md:p-12">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 md:h-20 md:w-20">
                          <svg
                            className="h-8 w-8 text-red-600 md:h-10 md:w-10"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-gray-900 md:text-xl">
                          PDF Preview Unavailable
                        </h3>
                        <p className="mb-6 text-sm text-gray-600 md:text-base">
                          We couldn't load the PDF preview. You can still
                          download the catalogue below.
                        </p>
                        <div className="rounded-xl border-2 border-gray-200 bg-white p-4 shadow-sm md:p-6">
                          <Image
                            width={300}
                            height={225}
                            src={imageError ? fallbackImage : imageSrc}
                            alt={title}
                            className="h-auto w-full rounded-lg object-cover"
                            onError={() => setImageError(true)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PDF Iframe */}
                  {!pdfError && (
                    <iframe
                      src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                      className="h-full w-full rounded-xl border-2 border-gray-300 bg-white shadow-lg"
                      title={`${title} PDF Preview`}
                      onLoad={() => setPdfLoading(false)}
                      onError={() => {
                        setPdfLoading(false);
                        setPdfError(true);
                      }}
                    />
                  )}
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-6">
                  <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 shadow-lg md:p-12">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 md:h-20 md:w-20">
                      <svg
                        className="h-8 w-8 text-amber-600 md:h-10 md:w-10"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-4 text-center text-lg font-bold text-gray-900 md:text-xl">
                      Preview Not Available
                    </h3>
                    <div className="rounded-xl border-2 border-gray-200 bg-white p-4 shadow-sm md:p-6">
                      <Image
                        width={400}
                        height={300}
                        src={imageError ? fallbackImage : imageSrc}
                        alt={title}
                        className="h-auto w-full rounded-lg object-cover"
                        onError={() => setImageError(true)}
                      />
                    </div>
                    <p className="mt-4 text-center text-sm text-gray-600 md:text-base">
                      Download the catalogue to view full details
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse items-stretch justify-end gap-3 border-t border-gray-200 bg-white px-4 py-4 sm:flex-row sm:items-center md:px-8 md:py-5">
              <button
                onClick={handleClose}
                className="w-full rounded-xl border-2 border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 sm:w-auto md:px-8 md:py-3 md:text-base"
              >
                Close
              </button>
              <button
                onClick={handleDownload}
                disabled={!pdfUrl}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2f2582] to-[#1e1a5c] px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:w-auto md:px-8 md:py-3 md:text-base"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
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
