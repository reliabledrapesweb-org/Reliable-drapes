/**
 * Pricing utilities for product display
 */

import type { DealerSession } from "@/lib/constants/dealer";

/**
 * Format a price in Indian Rupees
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(price);
}

/**
 * Get the display price for a product based on dealer status
 * Returns dealer price if authenticated dealer and dealer_price exists, otherwise regular price
 */
export function getDisplayPrice(
  price: number,
  dealerPrice: number | null | undefined,
  dealerSession: DealerSession | null,
): number {
  if (
    dealerSession?.isAuthenticated &&
    dealerPrice != null &&
    dealerPrice > 0
  ) {
    return dealerPrice;
  }
  return price;
}

/**
 * Check if dealer pricing should be shown
 */
export function shouldShowDealerPricing(
  dealerPrice: number | null | undefined,
  dealerSession: DealerSession | null,
): boolean {
  return (
    dealerSession?.isAuthenticated === true &&
    dealerPrice != null &&
    dealerPrice > 0
  );
}

/**
 * Calculate savings percentage for dealer pricing
 */
export function calculateSavings(
  regularPrice: number,
  dealerPrice: number,
): number {
  if (regularPrice <= 0 || dealerPrice <= 0) return 0;
  return Math.round(((regularPrice - dealerPrice) / regularPrice) * 100);
}
