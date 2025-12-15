"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ShoppingCart, Minus, Plus, Check } from "lucide-react";
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

  // Get all images including main product image
  const allImages = product
    ? [
        {
          url: product.image_url || fallbackImage,
          alt: product.name,
          isPrimary: true,
        },
        ...(product.images?.map((img) => ({
          url: img.image_url,
          alt: img.alt_text || product.name,
          isPrimary: img.is_primary,
        })) || []),
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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-b from-gray-200 to-gray-400 shadow-lg"
            >
              <Image
                src={imageError ? fallbackImage : currentImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
                onError={() => setImageError(true)}
              />
            </motion.div>

            {/* Thumbnail Grid */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square overflow-hidden rounded-lg transition-all ${
                      selectedImage === index
                        ? "ring-2 ring-[#2f2582] ring-offset-2"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 15vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <h1 className="text-3xl font-bold text-[#2a2a2a] lg:text-4xl">
                {product.name}
              </h1>
              <p className="mt-3 text-3xl font-bold text-[#2f2582] lg:text-4xl">
                {formatPrice(product.price)}
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div className="border-t border-[#d0d0d0] pt-6">
                <h2 className="mb-3 text-lg font-semibold text-[#161616]">
                  Description
                </h2>
                <p className="text-base leading-relaxed text-[#575757]">
                  {product.description}
                </p>
              </div>
            )}

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="border-t border-[#d0d0d0] pt-6">
                <h2 className="mb-3 text-lg font-semibold text-[#161616]">
                  Options
                </h2>
                <div className="space-y-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      className={`flex w-full items-center justify-between rounded-lg border-2 px-4 py-3 text-left transition-all ${
                        selectedVariant === variant.id
                          ? "border-[#2f2582] bg-[#f5f5f5]"
                          : "border-[#e0e0e0] hover:border-[#d0d0d0]"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-[#161616]">
                          {variant.name}
                        </p>
                        {variant.price_adjustment !== 0 && (
                          <p className="text-sm text-[#575757]">
                            {variant.price_adjustment > 0 ? "+" : ""}
                            {formatPrice(variant.price_adjustment)}
                          </p>
                        )}
                      </div>
                      {selectedVariant === variant.id && (
                        <Check className="h-5 w-5 text-[#2f2582]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="border-t border-[#d0d0d0] pt-6">
              <h2 className="mb-3 text-lg font-semibold text-[#161616]">
                Quantity
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-lg border-2 border-[#e0e0e0]">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="px-4 py-3 text-[#575757] transition-colors hover:bg-gray-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="min-w-[3rem] text-center text-lg font-semibold text-[#161616]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="px-4 py-3 text-[#575757] transition-colors hover:bg-gray-50"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="border-t border-[#d0d0d0] pt-6">
              <motion.button
                onClick={handleAddToCart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-[#2f2582] px-8 py-4 text-base font-semibold tracking-[2px] text-white uppercase transition-all hover:bg-[#241c66] hover:shadow-lg md:text-lg"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </motion.button>
            </div>

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="border-t border-[#d0d0d0] pt-6">
                <h2 className="mb-4 text-lg font-semibold text-[#161616]">
                  Specifications
                </h2>
                <div className="space-y-3">
                  {product.specifications.map((spec) => (
                    <div
                      key={spec.id}
                      className="flex items-start justify-between rounded-lg bg-gray-50 p-3"
                    >
                      <span className="text-sm font-medium text-[#575757]">
                        {spec.spec_name}
                      </span>
                      <span className="text-sm text-[#161616]">
                        {spec.spec_value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {product.categories && product.categories.length > 0 && (
              <div className="border-t border-[#d0d0d0] pt-6">
                <h2 className="mb-3 text-lg font-semibold text-[#161616]">
                  Categories
                </h2>
                <div className="flex flex-wrap gap-2">
                  {product.categories.map((category) => (
                    <span
                      key={category.id}
                      className="rounded-full bg-[#f5f5f5] px-4 py-2 text-sm font-medium text-[#575757]"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </main>
  );
}
