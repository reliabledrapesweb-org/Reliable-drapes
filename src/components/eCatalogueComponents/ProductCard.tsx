import Image from "next/image";

interface ProductCardProps {
  title: string;
  subtitle: string;
  imageSrc: string;
  badge?: "new" | "discount" | null;
  discountValue?: string;
}

export function ProductCard({
  title,
  subtitle,
  imageSrc,
  badge = null,
  discountValue = "-30%",
}: ProductCardProps) {
  return (
    <article className="group flex w-full flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-b from-gray-300 to-gray-700">
        <Image
          width={500}
          height={500}
          src={imageSrc}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

        {/* Badge */}
        {badge && (
          <div className="absolute top-3 right-3">
            {badge === "discount" && (
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e97171]">
                  <span className="text-[16px] text-white">
                    {discountValue}
                  </span>
                </div>
              </div>
            )}
            {badge === "new" && (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2f2582]">
                <span className="text-[16px] text-white">New</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-[24px] text-[#3a3a3a]">{title}</h3>
        <p className="text-[16px] text-[#898989]">{subtitle}</p>
      </div>
    </article>
  );
}
