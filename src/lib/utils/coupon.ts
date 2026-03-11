export function calculateCouponDiscount(
  discount_type: "percentage" | "fixed",
  discount_value: number,
  subtotal: number,
): number {
  if (discount_type === "percentage") {
    return Math.min(subtotal, Math.round((subtotal * discount_value) / 100));
  }
  return Math.min(subtotal, discount_value);
}
