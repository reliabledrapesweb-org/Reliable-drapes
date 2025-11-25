import { ProductCard } from "@/components/eCatalogueComponents/ProductCard";

const products = [
  {
    id: 1,
    title: "Sofa",
    subtitle: "Stylish Curtains chair",
    imageSrc:
      "https://images.unsplash.com/photo-1763565909003-46e9dfb68a00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzb2ZhJTIwZnVybml0dXJlfGVufDF8fHx8MTc2NDA1MDE4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: "new" as const,
  },
  {
    id: 2,
    title: "Curtains",
    subtitle: "Stylish Curtains chair",
    imageSrc:
      "https://images.unsplash.com/photo-1684261556324-a09b2cdf68b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjdXJ0YWlucyUyMGludGVyaW9yfGVufDF8fHx8MTc2Mzk2MzU5Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: null,
  },
  {
    id: 3,
    title: "Sheers",
    subtitle: "Stylish Curtains chair",
    imageSrc:
      "https://images.unsplash.com/photo-1755722521990-7dbf21a2bc42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kb3clMjBzaGVlcnMlMjBjdXJ0YWluc3xlbnwxfHx8fDE3NjQwNzI3Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: "new" as const,
  },
  {
    id: 4,
    title: "Comfortors",
    subtitle: "Stylish Curtains chair",
    imageSrc:
      "https://images.unsplash.com/photo-1517912191359-67659f8690a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWRyb29tJTIwY29tZm9ydGVyfGVufDF8fHx8MTc2NDA3MjczOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: null,
  },
  {
    id: 5,
    title: "Chair",
    subtitle: "Stylish Curtains chair",
    imageSrc:
      "https://images.unsplash.com/photo-1759722666941-a90d5a15b1d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwdXBob2xzdGVyeSUyMGNoYWlyfGVufDF8fHx8MTc2NDA3MjczOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: null,
  },
  {
    id: 6,
    title: "Upholstery",
    subtitle: "Stylish Curtains chair",
    imageSrc:
      "https://images.unsplash.com/photo-1759722666941-a90d5a15b1d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwdXBob2xzdGVyeSUyMGNoYWlyfGVufDF8fHx8MTc2NDA3MjczOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: "new" as const,
  },
  {
    id: 7,
    title: "Sheers",
    subtitle: "Stylish Curtains chair",
    imageSrc:
      "https://images.unsplash.com/photo-1755722521990-7dbf21a2bc42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kb3clMjBzaGVlcnMlMjBjdXJ0YWluc3xlbnwxfHx8fDE3NjQwNzI3Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: null,
  },
  {
    id: 8,
    title: "Sheers",
    subtitle: "Stylish Curtains chair",
    imageSrc:
      "https://images.unsplash.com/photo-1755722521990-7dbf21a2bc42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kb3clMjBzaGVlcnMlMjBjdXJ0YWluc3xlbnwxfHx8fDE3NjQwNzI3Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: null,
  },
  {
    id: 9,
    title: "Sheers",
    subtitle: "Stylish Curtains chair",
    imageSrc:
      "https://images.unsplash.com/photo-1755722521990-7dbf21a2bc42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kb3clMjBzaGVlcnMlMjBjdXJ0YWluc3xlbnwxfHx8fDE3NjQwNzI3Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: null,
  },
  {
    id: 10,
    title: "Sheers",
    subtitle: "Stylish Curtains chair",
    imageSrc:
      "https://images.unsplash.com/photo-1610508072973-dd4e656a677f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWQlMjBzaGVldHMlMjBiZWRkaW5nfGVufDF8fHx8MTc2Mzk3NzA0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    badge: null,
  },
];

export function ProductGrid() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          title={product.title}
          subtitle={product.subtitle}
          imageSrc={product.imageSrc}
          badge={product.badge}
        />
      ))}
    </div>
  );
}
