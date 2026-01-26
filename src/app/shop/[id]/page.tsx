"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Minus,
  Plus,
  ZoomIn,
  X,
  Share2,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { Breadcrumb } from "@/components/shared";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { useCartStore } from "@/lib/store";
import { ShopProductCard } from "@/components/features/shop/ShopProductCard";
import type { Product } from "@/lib/actions/products";
import {
  getProductById,
  getRelatedProducts,
  type ProductWithDetails,
} from "@/lib/actions/products";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/constants/app";
import { WishlistButton } from "@/components/features/shop/WishlistButton";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const { addItem } = useCartStore();

  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specifications">(
    "description",
  );

  const productId = params.id as string;

  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      try {
        const result = await getProductById(productId);
        if (result.success && result.data) {
          setProduct(result.data);
          setIsLoadingRelated(true);
          const relatedResult = await getRelatedProducts(productId, 4);
          if (relatedResult.success && relatedResult.data) {
            setRelatedProducts(relatedResult.data);
          }
          setIsLoadingRelated(false);
        } else {
          addToast(result.error || "Product not found", "error");
          router.push("/shop");
        }
      } catch (error) {

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

  const handleRelatedAddToCart = (productId: string, productName: string) => {
    const relatedProduct = relatedProducts.find((p) => p.id === productId);
    if (!relatedProduct) return;

    addItem({
      productId: relatedProduct.id,
      name: relatedProduct.name,
      price: relatedProduct.price,
      quantity: 1,
      image: relatedProduct.image_url,
    });

    addToast(`${relatedProduct.name} added to cart!`, "success", 3000);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description || "",
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast("Link copied to clipboard!", "success");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const fallbackImage = DEFAULT_PRODUCT_IMAGE;

  // Get all images - prioritize product_images table, fallback to main image_url
  const allImages = product
    ? product.images && product.images.length > 0
      ? product.images
          .sort((a, b) => {
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

  const navigateImage = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setSelectedImage((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
    } else {
      setSelectedImage((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
    }
  };

  if (isLoading) {
    return (
      <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 h-6 w-32 animate-pulse rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
            <div className="flex gap-4">
              <div className="hidden w-20 flex-col gap-3 md:flex">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square w-full animate-pulse rounded-lg bg-gray-200"
                  />
                ))}
              </div>
              <div className="flex-1">
                <div className="aspect-square w-full animate-pulse rounded-2xl bg-gray-200" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-4 w-24 animate-pulse rounded-full bg-gray-200" />
              <div className="h-10 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-8 w-1/3 animate-pulse rounded bg-gray-200" />
              <div className="h-24 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-14 w-full animate-pulse rounded-xl bg-gray-200" />
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

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-10 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 transition-colors hover:text-[#2f2582]"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </motion.button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Image Gallery Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <div className="flex flex-col-reverse gap-4 md:flex-row">
              {/* Thumbnail Strip - Left Side */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto md:w-20 md:flex-col md:overflow-visible lg:w-24">
                  {allImages.map((image, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                        selectedImage === index
                          ? "border-[#2f2582] ring-2 ring-[#2f2582]/20"
                          : "border-gray-200 hover:border-gray-300"
                      } w-16 md:w-full`}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 64px, 96px"
                      />
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Main Image */}
              <div className="relative flex-1">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100"
                >
                  <Image
                    src={imageError ? fallbackImage : currentImage}
                    alt={allImages[selectedImage]?.alt || product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                    onError={() => setImageError(true)}
                  />

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                  {/* Top Actions */}
                  <div className="absolute top-4 right-4 left-4 flex items-center justify-between">
                    <WishlistButton
                      productId={product.id}
                      productName={product.name}
                      productPrice={product.price}
                      productImage={product.image_url}
                      size="lg"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleShare}
                        className="rounded-full bg-white/90 p-2.5 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
                        aria-label="Share product"
                      >
                        <Share2 className="h-5 w-5 text-gray-700" />
                      </button>
                      <button
                        onClick={() => setIsZoomed(true)}
                        className="rounded-full bg-white/90 p-2.5 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
                        aria-label="Zoom image"
                      >
                        <ZoomIn className="h-5 w-5 text-gray-700" />
                      </button>
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={() => navigateImage("prev")}
                        className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/90 p-2 opacity-0 shadow-lg transition-all group-hover:opacity-100 hover:bg-white"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-700" />
                      </button>
                      <button
                        onClick={() => navigateImage("next")}
                        className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/90 p-2 opacity-0 shadow-lg transition-all group-hover:opacity-100 hover:bg-white"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-700" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  {allImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                      {selectedImage + 1} / {allImages.length}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Product Info Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            {/* Categories */}
            {product.categories && product.categories.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {product.categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/shop?category=${category.slug}`}
                    className="rounded-full bg-[#2f2582]/10 px-3 py-1 text-xs font-medium text-[#2f2582] transition-colors hover:bg-[#2f2582]/20"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Product Name */}
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[#2f2582]">
                {formatPrice(product.price)}
              </span>
              {product.variants && product.variants.length > 0 && (
                <span className="text-sm text-gray-500">+ variant options</span>
              )}
            </div>

            {/* Short Description */}
            {product.description && (
              <p className="mt-4 line-clamp-3 leading-relaxed text-gray-600">
                {product.description}
              </p>
            )}

            {/* Divider */}
            <div className="my-6 border-t border-gray-200" />

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-900 uppercase">
                  Options
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      className={`rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                        selectedVariant === variant.id
                          ? "border-[#2f2582] bg-[#2f2582] text-white"
                          : "border-gray-200 text-gray-700 hover:border-[#2f2582]"
                      }`}
                    >
                      {variant.name}
                      {variant.price_adjustment !== 0 && (
                        <span className="ml-1 text-xs opacity-80">
                          ({variant.price_adjustment > 0 ? "+" : ""}
                          {formatPrice(variant.price_adjustment)})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Quantity Selector */}
              <div className="flex items-center rounded-lg border-2 border-gray-200">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="px-4 py-3 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-[3rem] text-center text-lg font-semibold text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="px-4 py-3 text-gray-600 transition-colors hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#2f2582] px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-[#241c66] hover:shadow-lg active:scale-[0.98]"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-3 gap-4 rounded-xl bg-gray-50 p-4">
              <div className="flex flex-col items-center text-center">
                <Truck className="mb-2 h-6 w-6 text-[#2f2582]" />
                <span className="text-xs font-medium text-gray-700">
                  Free Shipping
                </span>
                <span className="text-xs text-gray-500">Over ₹5,000</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Shield className="mb-2 h-6 w-6 text-[#2f2582]" />
                <span className="text-xs font-medium text-gray-700">
                  Quality Assured
                </span>
                <span className="text-xs text-gray-500">Premium Fabrics</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <RotateCcw className="mb-2 h-6 w-6 text-[#2f2582]" />
                <span className="text-xs font-medium text-gray-700">
                  Easy Returns
                </span>
                <span className="text-xs text-gray-500">30 Day Policy</span>
              </div>
            </div>

            {/* Tabs: Description & Specifications */}
            {(product.description ||
              (product.specifications &&
                product.specifications.length > 0)) && (
              <div className="mt-8">
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("description")}
                    className={`px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === "description"
                        ? "border-b-2 border-[#2f2582] text-[#2f2582]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Description
                  </button>
                  {product.specifications &&
                    product.specifications.length > 0 && (
                      <button
                        onClick={() => setActiveTab("specifications")}
                        className={`px-4 py-3 text-sm font-medium transition-colors ${
                          activeTab === "specifications"
                            ? "border-b-2 border-[#2f2582] text-[#2f2582]"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Specifications
                      </button>
                    )}
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === "description" && product.description && (
                    <motion.div
                      key="description"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="py-4"
                    >
                      <p className="leading-relaxed whitespace-pre-line text-gray-600">
                        {product.description}
                      </p>
                    </motion.div>
                  )}

                  {activeTab === "specifications" && product.specifications && (
                    <motion.div
                      key="specifications"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="py-4"
                    >
                      <div className="divide-y divide-gray-100">
                        {product.specifications.map((spec) => (
                          <div key={spec.id} className="flex py-3">
                            <span className="w-1/3 text-sm font-medium text-gray-500">
                              {spec.spec_name}
                            </span>
                            <span className="flex-1 text-sm text-gray-900">
                              {spec.spec_value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-gray-100 bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                    You May Also Like
                  </h2>
                  <p className="mt-1 text-gray-600">
                    Products that complement your selection
                  </p>
                </div>
                <Link
                  href="/shop"
                  className="hidden items-center gap-1 text-sm font-medium text-[#2f2582] transition-colors hover:text-[#241c66] sm:flex"
                >
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {isLoadingRelated ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <div className="aspect-square w-full animate-pulse rounded-xl bg-gray-200" />
                      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                  {relatedProducts.map((relatedProduct, index) => (
                    <motion.div
                      key={relatedProduct.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <ShopProductCard
                        product={relatedProduct}
                        isVisible={true}
                        animationDelay={0}
                        onAddToCart={handleRelatedAddToCart}
                      />
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="mt-8 text-center sm:hidden">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2f2582] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#241c66]"
                >
                  View All Products
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4"
          >
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-3 backdrop-blur-sm transition-all hover:bg-white/20"
              aria-label="Close zoom"
            >
              <X className="h-6 w-6 text-white" />
            </button>

            <div className="relative h-full w-full max-w-5xl">
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
                  onClick={() => navigateImage("prev")}
                  className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/20"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <button
                  onClick={() => navigateImage("next")}
                  className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/20"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>

                {/* Thumbnail Strip in Modal */}
                <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative h-14 w-14 overflow-hidden rounded-lg border-2 transition-all ${
                        selectedImage === index
                          ? "border-white"
                          : "border-white/30 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </main>
  );
}
