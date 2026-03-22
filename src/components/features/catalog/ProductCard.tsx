import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import {
  X,
  Download,
  FileText,
  Eye,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { DEFAULT_CATALOG_IMAGE } from "@/lib/constants/app";

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
  initialOpen?: boolean;
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
  initialOpen = false,
  onDownload,
}: ProductCardProps) {
  const [showPreview, setShowPreview] = useState(initialOpen);
  const [imageError, setImageError] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fallback image for catalogs without images
  const fallbackImage = DEFAULT_CATALOG_IMAGE;

  const handleClick = () => {
    setShowPreview(true);
    setPdfLoading(true);
    setPdfError(false);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
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

    // Small delay for UX feedback
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsDownloading(false);
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

                setImageError(true);
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

      {/* Preview Modal - Improved Design */}
      <AnimatePresence>
        {showPreview && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4"
            onClick={handleClose}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#161616]/70 backdrop-blur-md"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Compact on mobile */}
              <div className="relative flex items-center gap-4 border-b border-gray-100 bg-white px-4 py-4 sm:px-6 sm:py-5">
                {/* Thumbnail */}
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100 shadow-sm sm:h-16 sm:w-16">
                  <Image
                    src={imageError ? fallbackImage : imageSrc}
                    alt={title}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>

                {/* Title & Subtitle */}
                <div className="min-w-0 flex-1 pr-10">
                  <h2 className="truncate text-base font-bold text-[#161616] sm:text-xl">
                    {title}
                  </h2>
                  <p className="mt-0.5 truncate text-xs text-gray-500 sm:text-sm">
                    {subtitle}
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all hover:bg-gray-200 hover:text-gray-700 sm:top-4 sm:right-4 sm:h-10 sm:w-10"
                  aria-label="Close preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* PDF Preview Area */}
              <div className="relative flex-1 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100/50">
                {pdfUrl ? (
                  <>
                    {/* Loading State */}
                    <AnimatePresence>
                      {pdfLoading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-10 flex items-center justify-center bg-white/95"
                        >
                          <div className="flex flex-col items-center gap-4 text-center">
                            <div className="relative flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20">
                              <div className="absolute inset-0 animate-spin rounded-full border-4 border-[#2f2582]/20 border-t-[#2f2582]" />
                              <FileText className="h-6 w-6 text-[#2f2582] sm:h-8 sm:w-8" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 sm:text-base">
                                Loading PDF Preview
                              </p>
                              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                Please wait...
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Error State */}
                    {pdfError && (
                      <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-4 p-6 sm:min-h-[400px]">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 sm:h-20 sm:w-20">
                          <Eye className="h-7 w-7 text-amber-600 sm:h-8 sm:w-8" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                            Preview Unavailable
                          </h3>
                          <p className="mt-1 max-w-sm text-xs text-gray-500 sm:text-sm">
                            We couldn't load the preview in browser. You can
                            still download the PDF directly.
                          </p>
                        </div>
                        {/* Thumbnail fallback */}
                        <div className="mt-2 w-full max-w-xs overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                          <Image
                            width={300}
                            height={200}
                            src={imageError ? fallbackImage : imageSrc}
                            alt={title}
                            className="h-auto w-full object-cover"
                            onError={() => setImageError(true)}
                          />
                        </div>
                      </div>
                    )}

                    {/* PDF Iframe */}
                    {!pdfError && (
                      <iframe
                        src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                        className="h-full min-h-[350px] w-full border-0 sm:min-h-[450px]"
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
                  /* No PDF Available State */
                  <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-4 p-6 sm:min-h-[400px]">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 sm:h-20 sm:w-20">
                      <FileText className="h-7 w-7 text-gray-400 sm:h-8 sm:w-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                        PDF Not Available
                      </h3>
                      <p className="mt-1 max-w-sm text-xs text-gray-500 sm:text-sm">
                        This catalogue doesn't have a downloadable PDF yet.
                      </p>
                    </div>
                    {/* Show thumbnail */}
                    <div className="mt-2 w-full max-w-xs overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                      <Image
                        width={300}
                        height={200}
                        src={imageError ? fallbackImage : imageSrc}
                        alt={title}
                        className="h-auto w-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer - Action Buttons */}
              <div className="flex flex-col gap-2 border-t border-gray-100 bg-gray-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4">
                {/* Left side - Info */}
                <div className="hidden text-xs text-gray-500 sm:block">
                  {pdfUrl ? (
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      PDF Document
                    </span>
                  ) : (
                    <span>No PDF attached</span>
                  )}
                </div>

                {/* Right side - Buttons */}
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 sm:px-5"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="sm:hidden">Open in New Tab</span>
                      <span className="hidden sm:inline">View Full Screen</span>
                    </a>
                  )}
                  <button
                    onClick={handleDownload}
                    disabled={!pdfUrl || isDownloading}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#2f2582] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#2f2582]/20 transition-all hover:bg-[#241c66] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:px-6"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
