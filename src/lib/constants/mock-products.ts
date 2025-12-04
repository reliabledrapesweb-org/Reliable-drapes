/**
 * Mock product data for catalogue and bestseller sections
 */

export interface CatalogProduct {
  id: number;
  title: string;
  subtitle: string;
  imageSrc: string;
  badge?: "new" | "discount" | null;
  category: string;
  pdfUrl?: string;
}

export interface BestsellerProduct {
  image: string;
  title: string;
  description: string;
}

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: 1,
    title: "Sofa",
    subtitle: "Modern luxury sofa",
    category: "Furniture",
    pdfUrl: "/pdfs/sofa-collection.pdf",
    imageSrc:
      "https://images.unsplash.com/photo-1763565909003-46e9dfb68a00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzb2ZhJTIwZnVybml0dXJlfGVufDF8fHx8MTc2NDA1MDE4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: "new" as const,
  },
  {
    id: 2,
    title: "Main Curtains",
    subtitle: "Elegant main curtains",
    category: "Curtains",
    pdfUrl: "/pdfs/main-curtains-collection.pdf",
    imageSrc:
      "https://images.unsplash.com/photo-1684261556324-a09b2cdf68b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjdXJ0YWlucyUyMGludGVyaW9yfGVufDF8fHx8MTc2Mzk2MzU5Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: null,
  },
  {
    id: 3,
    title: "Sheer Curtains",
    subtitle: "Light sheer curtains",
    category: "Sheers",
    pdfUrl: "/pdfs/sheer-curtains-collection.pdf",
    imageSrc:
      "https://images.unsplash.com/photo-1755722521990-7dbf21a2bc42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kb3clMjBzaGVlcnMlMjBjdXJ0YWluc3xlbnwxfHx8fDE3NjQwNzI3Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: "new" as const,
  },
  {
    id: 4,
    title: "Comforters",
    subtitle: "Cozy bed comforters",
    category: "Bedding",
    pdfUrl: "/pdfs/comforters-collection.pdf",
    imageSrc:
      "https://images.unsplash.com/photo-1517912191359-67659f8690a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWRyb29tJTIwY29tZm9ydGVyfGVufDF8fHx8MTc2NDA3MjczOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: null,
  },
  {
    id: 5,
    title: "Accent Chair",
    subtitle: "Stylish accent chair",
    category: "Furniture",
    pdfUrl: "/pdfs/accent-chair-collection.pdf",
    imageSrc:
      "https://images.unsplash.com/photo-1759722666941-a90d5a15b1d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwdXBob2xzdGVyeSUyMGNoYWlyfGVufDF8fHx8MTc2NDA3MjczOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: null,
  },
  {
    id: 6,
    title: "Upholstery",
    subtitle: "Premium upholstery fabric",
    category: "Upholstery",
    pdfUrl: "/pdfs/upholstery-collection.pdf",
    imageSrc:
      "https://images.unsplash.com/photo-1759722666941-a90d5a15b1d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwdXBob2xzdGVyeSUyMGNoYWlyfGVufDF8fHx8MTc2NDA3MjczOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: "new" as const,
  },
  {
    id: 7,
    title: "Blackout Curtains",
    subtitle: "Room darkening curtains",
    category: "Curtains",
    pdfUrl: "/pdfs/blackout-curtains-collection.pdf",
    imageSrc:
      "https://images.unsplash.com/photo-1755722521990-7dbf21a2bc42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kb3clMjBzaGVlcnMlMjBjdXJ0YWluc3xlbnwxfHx8fDE3NjQwNzI3Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: null,
  },
  {
    id: 8,
    title: "Window Sheers",
    subtitle: "Delicate window sheers",
    category: "Sheers",
    pdfUrl: "/pdfs/window-sheers-collection.pdf",
    imageSrc:
      "https://images.unsplash.com/photo-1755722521990-7dbf21a2bc42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kb3clMjBzaGVlcnMlMjBjdXJ0YWluc3xlbnwxfHx8fDE3NjQwNzI3Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: null,
  },
  {
    id: 9,
    title: "Bed Sheets",
    subtitle: "Luxury bed sheets",
    category: "Bedding",
    pdfUrl: "/pdfs/bed-sheets-collection.pdf",
    imageSrc:
      "https://images.unsplash.com/photo-1610508072973-dd4e656a677f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWQlMjBzaGVldHMlMjBiZWRkaW5nfGVufDF8fHx8MTc2Mzk3NzA0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: null,
  },
  {
    id: 10,
    title: "Throw Pillows",
    subtitle: "Decorative throw pillows",
    category: "Bedding",
    pdfUrl: "/pdfs/throw-pillows-collection.pdf",
    imageSrc:
      "https://images.unsplash.com/photo-1610508072973-dd4e656a677f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWQlMjBzaGVldHMlMjBiZWRkaW5nfGVufDF8fHx8MTc2Mzk3NzA0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: null,
  },
];

export const BESTSELLER_PRODUCTS: BestsellerProduct[] = [
  {
    image: "/images/bestseller/bes1.png",
    title: "Upholstery",
    description:
      "From elegant drapes to plush upholstery, our fabrics adapt to your vision.",
  },
  {
    image: "/images/bestseller/bes2.png",
    title: "Sheers",
    description:
      "From elegant drapes to plush upholstery, our fabrics adapt to your vision.",
  },
  {
    image: "/images/bestseller/bes3.png",
    title: "Sofa",
    description:
      "From elegant drapes to plush upholstery, our fabrics adapt to your vision.",
  },
  {
    image: "/images/bestseller/bes4.png",
    title: "Comforters",
    description:
      "From elegant drapes to plush upholstery, our fabrics adapt to your vision.",
  },
  {
    image: "/images/bestseller/bes5.png",
    title: "Comforters",
    description:
      "From elegant drapes to plush upholstery, our fabrics adapt to your vision.",
  },
];
