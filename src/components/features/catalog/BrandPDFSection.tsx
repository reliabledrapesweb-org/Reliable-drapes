"use client";

import { motion } from "framer-motion";
import { Download, FileText } from "lucide-react";

const mockBrands = [
  {
    id: 1,
    name: "Luxe Drapes Co.",
    description: "Premium collection of elegant curtains and drapery solutions",
    pdfUrl: "/pdfs/luxe-drapes-catalog.pdf",
  },
  {
    id: 2,
    name: "Sheer Elegance",
    description: "Lightweight sheer fabrics for natural light and privacy",
    pdfUrl: "/pdfs/sheer-elegance-catalog.pdf",
  },
  {
    id: 3,
    name: "Blackout Innovations",
    description: "Advanced blackout solutions for complete light control",
    pdfUrl: "/pdfs/blackout-innovations-catalog.pdf",
  },
  {
    id: 4,
    name: "Artisan Textiles",
    description: "Hand-crafted premium fabric collections and designs",
    pdfUrl: "/pdfs/artisan-textiles-catalog.pdf",
  },
];

export function BrandPDFSection() {
  const handleDownload = (brandName: string, pdfUrl: string) => {
    // Create a temporary link and trigger download
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${brandName}-catalog.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="mt-16 border-t border-[#e0e0e0] pt-12 md:mt-20 md:pt-16 lg:mt-24 lg:pt-20">
      <div className="mb-8 md:mb-10">
        <h2 className="text-[28px] font-medium tracking-[-2px] text-black md:text-[32px] lg:text-[36px]">
          Brand Catalogues
        </h2>
        <p className="mt-2 text-sm text-[#898989] md:text-base">
          Download detailed catalogues from our premium brand partners
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockBrands.map((brand, index) => (
          <motion.div
            key={brand.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group rounded-lg border-2 border-[#e0e0e0] bg-white p-5 transition-all hover:border-[#2f2582] hover:shadow-lg md:p-6"
          >
            {/* Icon */}
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#f5f5f5] transition-colors group-hover:bg-[#f0ecff]">
              <FileText className="h-6 w-6 text-[#2f2582]" />
            </div>

            {/* Content */}
            <h3 className="mb-2 text-base font-medium text-[#161616] md:text-lg">
              {brand.name}
            </h3>
            <p className="mb-5 text-sm text-[#575757] line-clamp-2">
              {brand.description}
            </p>

            {/* Download Button */}
            <motion.button
              onClick={() => handleDownload(brand.name, brand.pdfUrl)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2f2582] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#241c66] md:py-3 md:text-base"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </motion.button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
