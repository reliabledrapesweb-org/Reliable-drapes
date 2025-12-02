import { CategoryCard } from "./CategoryCard";
import { useEffect, useRef, useState } from "react";

const categories = [
  {
    image:
      "https://images.unsplash.com/photo-1651936020103-65154077c003?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiZWRkaW5nJTIwY29tZm9ydGVyfGVufDF8fHx8MTc2MjIwNTUxNHww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Bedding & Comforters",
  },
  {
    image:
      "https://images.unsplash.com/photo-1718587608491-f40ae3b13273?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb29yJTIwbWF0JTIwdGV4dGlsZXN8ZW58MXx8fHwxNzYyMjA1NTE0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Door Mats",
  },
  {
    image:
      "https://images.unsplash.com/photo-1759517857499-7f27b61aad5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2ZhJTIwY3VzaGlvbnMlMjBkZWNvcmF0aXZlfGVufDF8fHx8MTc2MjIwNTUxNHww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Cushions & Panels",
  },
  {
    image:
      "https://images.unsplash.com/photo-1669989657165-d9f8e6cb6366?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwdGV4dGlsZSUyMHBhdHRlcm5zfGVufDF8fHx8MTc2MjIwNTUxNXww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Textile Patterns",
  },
  {
    image:
      "https://images.unsplash.com/photo-1651936020103-65154077c003?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiZWRkaW5nJTIwY29tZm9ydGVyfGVufDF8fHx8MTc2MjIwNTUxNHww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Bedding & Comforters",
  },
  {
    image:
      "https://images.unsplash.com/photo-1718587608491-f40ae3b13273?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb29yJTIwbWF0JTIwdGV4dGlsZXN8ZW58MXx8fHwxNzYyMjA1NTE0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Door Mats",
  },
  {
    image:
      "https://images.unsplash.com/photo-1759517857499-7f27b61aad5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2ZhJTIwY3VzaGlvbnMlMjBkZWNvcmF0aXZlfGVufDF8fHx8MTc2MjIwNTUxNHww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Cushions & Panels",
  },
  {
    image:
      "https://images.unsplash.com/photo-1669989657165-d9f8e6cb6366?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwdGV4dGlsZSUyMHBhdHRlcm5zfGVufDF8fHx8MTc2MjIwNTUxNXww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Textile Patterns",
  },
];

export function CategoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isHovering) return;

    let animationId: number;
    const speed = 0.6;

    const autoScroll = () => {
      if (!scrollContainer || isHovering) return;

      scrollContainer.scrollLeft += speed;

      // infinite loop effect
      const halfWidth = scrollContainer.scrollWidth / 2;
      if (scrollContainer.scrollLeft >= halfWidth) {
        scrollContainer.scrollLeft = 0;
      }

      animationId = requestAnimationFrame(autoScroll);
    };

    animationId = requestAnimationFrame(autoScroll);

    return () => cancelAnimationFrame(animationId);
  }, [isHovering]);

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div>
        <h2 className="px-6 md:px-16 max-w-6xl mx-auto text-[28px] font-medium lg:text-[36px] tracking-[-2px] mb-12 text-black">
          Our Categories
        </h2>

        <div
          ref={scrollRef}
          className="overflow-x-auto w-full hide-scrollbar"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onTouchStart={() => setIsHovering(true)}
          onTouchEnd={() => setIsHovering(false)}
        >
          <div className="flex gap-4 w-max pb-4">
            {[...categories, ...categories].map((category, index) => (
              <CategoryCard
                key={index}
                image={category.image}
                title={category.title}
                className="w-[236px] md:w-[280px]"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
