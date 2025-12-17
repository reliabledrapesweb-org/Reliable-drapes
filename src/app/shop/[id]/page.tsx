"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ShoppingCart, Minus, Plus, Check, ZoomIn, X } from "lucide-react";
import { Breadcrumb } from "@/components/shared";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { useCartStore } from "@/lib/store";
import { getProductById, type ProductWithDetails } from "@/lib/actions/products";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const { addItem } = useCartStore();
  
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const productId = params.id as string;

  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      try {
        const result = await getProductById(productId);
        if (result.success && result.data) {
          setProduct(result.data);
        } else {
          addToast(result.error || "Product not found", "error");
          router.push("/shop");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        addToast("Failed to load product", "error");
        router.push("/shop");
      }
      setIsLoading(false);
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId, router]);

  const handleAddToCart = () => {
    if (!product) return;

    const variant = selectedVariant
      ? product.variants?.find((v) => v.id === selectedVariant)
      : undefined;

    const finalPrice = variant
      ? product.price + variant.price_adjustment
      : product.price;

    addItem({
      productId: product.id,
      name: product.name,
      price: finalPrice,
      quantity,
      image: product.image_url,
      variantId: selectedVariant || undefined,
      variantName: variant?.name || undefined,
    });

    addToast(`${product.name} added to cart!`, "success", 3000);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const fallbackImage = "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center";

  // Get all images - prioritize product_images table, fallback to main image_url
  const allImages = product
    ? product.images && product.images.length > 0
      ? product.images
          .sort((a, b) => {
            // Sort by primary first, then by sort_order
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return a.sort_order - b.sort_order;
          })
          .map((img) => ({
            url: img.image_url,
            alt: img.alt_text || product.name,
            isPrimary: img.is_primary,
          }))
      : [
          {
            url: product.image_url || fallbackImage,
            alt: product.name,
            isPrimary: true,
          },
        ]
    : [];

  const currentImage = allImages[selectedImage]?.url || fallbackImage;

  if (isLoading) {
    return (
      <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-4">
              <div className="aspect-square w-full animate-pulse rounded-xl bg-gray-200" />
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square animate-pulse rounded-lg bg-gray-200" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-1/4 animate-pulse rounded bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
      <Breadcrumb />
      
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-[#575757] transition-colors hover:text-[#2f2582]"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back to Products</span>
        </button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {/* Main Image */}
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-linear-to-b from-gray-100 to-gray-200 shadow-xl"
            >
              <Image
                src={imageError ? fallbackImage : currentImage}
                alt={allImages[selectedImage]?.alt || product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority
                onError={() => setImageError(true)}
              />
              
              {/* Zoom Button */}
              <button
                onClick={() => setIsZoomed(true)}
                className="absolute right-4 top-4 rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                aria-label="Zoom image"
              >
                <ZoomIn className="h-5 w-5 text-[#2f2582]" />
              </button>

              {/* Image Counter */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                  {selectedImage + 1} / {allImages.length}
                </div>
              )}
            </motion.div>

            {/* Thumbnail Grid */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square overflow-hidden rounded-lg transition-all ${
                      selectedImage === index
                        ? "ring-3 ring-[#2f2582] ring-offset-2 opacity-100"
                        : "opacity-50 hover:opacity-100 hover:ring-2 hover:ring-gray-300"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 20vw, 10vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Title, Categories and Price */}
            <div className="space-y-4">
              {/* Categories */}
              {product.categories && product.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.categories.map((category) => (
                    <span
                      key={category.id}
                      className="rounded-full bg-[#2f2582]/10 px-3 py-1 text-xs font-semibold text-[#2f2582] uppercase tracking-wide"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-3xl font-bold leading-tight text-[#2a2a2a] lg:text-4xl xl:text-5xl">
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-3">
                <p className="text-4xl font-bold text-[#2f2582] lg:text-5xl">
                  {formatPrice(product.price)}
                </p>
                {product.variants && product.variants.length > 0 && (
                  <span className="text-sm text-[#575757]">+ options</span>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="rounded-xl bg-gray-50 p-6">
                <h2 className="mb-3 text-base font-bold uppercase tracking-wide text-[#161616]">
                  Description
                </h2>
                <p className="text-base leading-relaxed text-[#575757]">
                  {product.description}
                </p>
              </div>
            )}

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-base font-bold uppercase tracking-wide text-[#161616]">
                  Select Options
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      className={`flex items-center justify-between rounded-xl border-2 px-5 py-4 text-left transition-all ${
                        selectedVariant === variant.id
                          ? "border-[#2f2582] bg-[#2f2582]/5 shadow-md"
                          : "border-gray-200 hover:border-[#2f2582]/50 hover:bg-gray-50"
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-[#161616]">
                          {variant.name}
                        </p>
                        {variant.price_adjustment !== 0 && (
                          <p className="text-sm font-medium text-[#2f2582]">
                            {variant.price_adjustment > 0 ? "+" : ""}
                            {formatPrice(variant.price_adjustment)}
                          </p>
                        )}
                      </div>
                      {selectedVariant === variant.id && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2f2582]">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4 rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold uppercase tracking-wide text-[#161616]">
                  Quantity
                </h2>
                <div className="flex items-center rounded-xl border-2 border-gray-200 bg-gray-50">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="px-5 py-3 text-[#575757] transition-colors hover:bg-gray-100 disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="min-w-12 text-center text-xl font-bold text-[#161616]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="px-5 py-3 text-[#575757] transition-colors hover:bg-gray-100"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <motion.button
                onClick={handleAddToCart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#2f2582] px-8 py-5 text-lg font-bold tracking-wide text-white uppercase transition-all hover:bg-[#241c66] hover:shadow-xl"
              >
                <ShoppingCart className="h-6 w-6" />
                Add to Cart
              </motion.button>

              <p className="text-center text-sm text-[#575757]">
                Free shipping on orders over ₹5,000
              </p>
            </div>

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-base font-bold uppercase tracking-wide text-[#161616]">
                  Specifications
                </h2>
                <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
                  {product.specifications.map((spec) => (
                    <div
                      key={spec.id}
                      className="flex items-center justify-between px-5 py-4"
                    >
                      <span className="text-sm font-medium text-[#575757]">
                        {spec.spec_name}
                      </span>
                      <span className="text-sm font-semibold text-[#161616]">
                        {spec.spec_value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {isZoomed && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/95 p-4">
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-3 backdrop-blur-sm transition-all hover:bg-white/20"
            aria-label="Close zoom"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          <div className="relative h-full w-full max-w-6xl">
            <Image
              src={imageError ? fallbackImage : currentImage}
              alt={allImages[selectedImage]?.alt || product.name}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/20"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={() => setSelectedImage((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/20"
                aria-label="Next image"
              >
                <ChevronLeft className="h-6 w-6 rotate-180 text-white" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                {selectedImage + 1} / {allImages.length}
              </div>
            </>
          )}
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </main>
  );
}
