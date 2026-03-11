import { describe, test, expect, vi, beforeEach } from "vitest";
import { validateCouponAction } from "./coupons";
import { calculateCouponDiscount } from "@/lib/utils/coupon";

const mockAdminClient = {
  from: vi.fn(),
};

vi.mock("@/lib/supabase/admin", () => ({
  getAdminSupabase: () => mockAdminClient,
}));

vi.mock("@/lib/supabase/anon", () => ({
  getAnonSupabase: () => ({}),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

function createChainableMock(finalValue: any) {
  const chainable: any = {};
  const methods = ["select", "eq", "ilike", "single", "in"];

  methods.forEach((method) => {
    chainable[method] = vi.fn().mockImplementation(() => {
      if (method === "single") {
        return Promise.resolve(finalValue);
      }
      return chainable;
    });
  });

  return chainable;
}

describe(calculateCouponDiscount.name, () => {
  test("percentage discount is calculated correctly", () => {
    expect(calculateCouponDiscount("percentage", 10, 1000)).toBe(100);
  });

  test("percentage discount is capped at subtotal", () => {
    expect(calculateCouponDiscount("percentage", 100, 500)).toBe(500);
  });

  test("fixed discount returns the value", () => {
    expect(calculateCouponDiscount("fixed", 200, 1000)).toBe(200);
  });

  test("fixed discount is capped at subtotal", () => {
    expect(calculateCouponDiscount("fixed", 2000, 500)).toBe(500);
  });

  test("percentage discount is rounded to nearest integer", () => {
    expect(calculateCouponDiscount("percentage", 15, 999)).toBe(150);
  });
});

describe(validateCouponAction.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns error for empty code", async () => {
    const result = await validateCouponAction("", 1000);
    expect(result).toEqual({
      success: false,
      error: "Please enter a coupon code",
    });
  });

  test("returns error when coupon not found", async () => {
    const chainable = createChainableMock({
      data: null,
      error: { message: "not found" },
    });
    mockAdminClient.from.mockReturnValue(chainable);

    const result = await validateCouponAction("INVALID", 1000);
    expect(result).toEqual({ success: false, error: "Invalid coupon code" });
  });

  test("returns error for inactive coupon", async () => {
    const chainable = createChainableMock({
      data: {
        code: "EXPIRED",
        is_active: false,
        discount_type: "percentage",
        discount_value: 10,
        min_order_value: 0,
        max_uses: null,
        current_uses: 0,
        valid_from: null,
        valid_until: null,
      },
      error: null,
    });
    mockAdminClient.from.mockReturnValue(chainable);

    const result = await validateCouponAction("EXPIRED", 1000);
    expect(result).toEqual({
      success: false,
      error: "This coupon is no longer active",
    });
  });

  test("returns error when coupon has expired", async () => {
    const chainable = createChainableMock({
      data: {
        code: "OLD",
        is_active: true,
        discount_type: "percentage",
        discount_value: 10,
        min_order_value: 0,
        max_uses: null,
        current_uses: 0,
        valid_from: null,
        valid_until: "2020-01-01T00:00:00Z",
      },
      error: null,
    });
    mockAdminClient.from.mockReturnValue(chainable);

    const result = await validateCouponAction("OLD", 1000);
    expect(result).toEqual({
      success: false,
      error: "This coupon has expired",
    });
  });

  test("returns error when max uses reached", async () => {
    const chainable = createChainableMock({
      data: {
        code: "MAXED",
        is_active: true,
        discount_type: "percentage",
        discount_value: 10,
        min_order_value: 0,
        max_uses: 5,
        current_uses: 5,
        valid_from: null,
        valid_until: null,
      },
      error: null,
    });
    mockAdminClient.from.mockReturnValue(chainable);

    const result = await validateCouponAction("MAXED", 1000);
    expect(result).toEqual({
      success: false,
      error: "This coupon has reached its usage limit",
    });
  });

  test("returns error when subtotal is below min_order_value", async () => {
    const chainable = createChainableMock({
      data: {
        code: "MINVAL",
        is_active: true,
        discount_type: "fixed",
        discount_value: 100,
        min_order_value: 500,
        max_uses: null,
        current_uses: 0,
        valid_from: null,
        valid_until: null,
      },
      error: null,
    });
    mockAdminClient.from.mockReturnValue(chainable);

    const result = await validateCouponAction("MINVAL", 200);
    expect(result).toEqual({
      success: false,
      error: "Minimum order value of ₹500 required",
    });
  });

  test("returns valid percentage coupon", async () => {
    const chainable = createChainableMock({
      data: {
        code: "SAVE10",
        is_active: true,
        discount_type: "percentage",
        discount_value: 10,
        min_order_value: 0,
        max_uses: null,
        current_uses: 0,
        valid_from: null,
        valid_until: null,
      },
      error: null,
    });
    mockAdminClient.from.mockReturnValue(chainable);

    const result = await validateCouponAction("save10", 1000);
    expect(result).toEqual({
      success: true,
      data: {
        code: "SAVE10",
        discount_type: "percentage",
        discount_value: 10,
        calculated_discount: 100,
      },
    });
  });

  test("returns valid fixed coupon", async () => {
    const chainable = createChainableMock({
      data: {
        code: "FLAT200",
        is_active: true,
        discount_type: "fixed",
        discount_value: 200,
        min_order_value: 0,
        max_uses: 100,
        current_uses: 50,
        valid_from: "2020-01-01T00:00:00Z",
        valid_until: "2030-12-31T23:59:59Z",
      },
      error: null,
    });
    mockAdminClient.from.mockReturnValue(chainable);

    const result = await validateCouponAction("FLAT200", 1000);
    expect(result).toEqual({
      success: true,
      data: {
        code: "FLAT200",
        discount_type: "fixed",
        discount_value: 200,
        calculated_discount: 200,
      },
    });
  });
});
