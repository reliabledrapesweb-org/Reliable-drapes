import { describe, test, expect, vi, beforeEach } from "vitest";
import {
  createOrderAction,
  createPendingOrderAction,
  getOrdersAction,
  getAdminOrdersAction,
  updateOrderStatusAction,
} from "./orders";
import { validateCouponAction } from "@/lib/actions/coupons";

// Helper function to create chainable mock
function createChainableMock(finalValue: any) {
  const chainable: any = {};
  const methods = [
    "select",
    "insert",
    "update",
    "delete",
    "eq",
    "neq",
    "gt",
    "lt",
    "range",
    "order",
    "limit",
    "single",
    "in",
  ];

  methods.forEach((method) => {
    chainable[method] = vi.fn().mockImplementation(() => {
      if (method === "single") {
        return Promise.resolve(finalValue);
      }
      return chainable;
    });
  });

  chainable.then = (resolve: any) => Promise.resolve(finalValue).then(resolve);

  return chainable;
}

// Mock dependencies
const mockAdminClient = {
  from: vi.fn(),
};

const mockServerClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

vi.mock("@/lib/supabase/admin", () => ({
  getAdminSupabase: () => mockAdminClient,
}));

vi.mock("@/lib/supabase/server", () => ({
  supabaseServer: async () => mockServerClient,
}));

vi.mock("@/lib/actions/notifications", () => ({
  createNotification: vi.fn().mockResolvedValue(true),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/actions/coupons", () => ({
  validateCouponAction: vi.fn(),
}));

describe("Order Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default auth mock
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });
  });

  describe("createOrderAction", () => {
    test("creates order successfully", async () => {
      const orderData = {
        total: 1000,
        items: [
          {
            product_id: "123e4567-e89b-12d3-a456-426614174000",
            quantity: 2,
            price: 500,
          },
        ],
      };

      const createdOrder = { id: "order-1", user_id: "user-123", total: 1000 };

      const chainable = createChainableMock({
        data: createdOrder,
        error: null,
      });
      mockAdminClient.from.mockReturnValue(chainable);

      const result = await createOrderAction(orderData);

      expect(result.success).toBe(true);
      expect((result as any).orderId).toBe("order-1");
      expect(mockAdminClient.from).toHaveBeenCalledWith("orders");
      expect(mockAdminClient.from).toHaveBeenCalledWith("order_items");
    });

    test("returns error for invalid input", async () => {
      // Missing required total
      const result = await createOrderAction({ items: [] } as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid order payload");
    });

    test("handles database error", async () => {
      const orderData = {
        total: 1000,
        items: [],
      };

      const chainable = createChainableMock({
        data: null,
        error: { message: "DB Error" },
      });
      mockAdminClient.from.mockReturnValue(chainable);

      const result = await createOrderAction(orderData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to create order");
    });

    test("checks authentication", async () => {
      mockServerClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "No user" },
      });

      const result = await createOrderAction({ total: 100 });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Authorization required");
    });
  });

  describe("createPendingOrderAction with coupon", () => {
    test("applies coupon discount to order total", async () => {
      const productId = "123e4567-e89b-12d3-a456-426614174000";
      const orderData = {
        items: [{ product_id: productId, quantity: 1 }],
        coupon_code: "SAVE10",
      };

      vi.mocked(validateCouponAction).mockResolvedValue({
        success: true,
        data: {
          code: "SAVE10",
          discount_type: "percentage",
          discount_value: 10,
          calculated_discount: 100,
        },
      });

      const createdOrder = {
        id: "order-coupon",
        user_id: "user-123",
        total: 950,
        coupon_code: "SAVE10",
        discount_amount: 100,
      };

      const productsChainable = createChainableMock({
        data: [{ id: productId, price: 1000 }],
        error: null,
      });
      const insertChainable = createChainableMock({
        data: createdOrder,
        error: null,
      });
      const itemsChainable = createChainableMock({
        data: null,
        error: null,
      });

      let callCount = 0;
      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === "products") return productsChainable;
        if (table === "orders") {
          callCount++;
          return insertChainable;
        }
        if (table === "order_items") return itemsChainable;
        return createChainableMock({ data: null, error: null });
      });

      const result = await createPendingOrderAction(orderData);

      expect(result.success).toBe(true);
      expect(validateCouponAction).toHaveBeenCalledWith("SAVE10", 1000);
    });

    test("returns error when coupon validation fails", async () => {
      const productId = "123e4567-e89b-12d3-a456-426614174000";

      vi.mocked(validateCouponAction).mockResolvedValue({
        success: false,
        error: "This coupon has expired",
      });

      const productsChainable = createChainableMock({
        data: [{ id: productId, price: 1000 }],
        error: null,
      });
      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === "products") return productsChainable;
        return createChainableMock({ data: null, error: null });
      });

      const result = await createPendingOrderAction({
        items: [{ product_id: productId, quantity: 1 }],
        coupon_code: "EXPIRED",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("This coupon has expired");
    });
  });

  describe("getOrdersAction", () => {
    test("fetches user orders successfully", async () => {
      const mockOrders = [{ id: "order-1", total: 100, order_items: [] }];

      const chainable = createChainableMock({ data: mockOrders, error: null });
      mockServerClient.from.mockReturnValue(chainable);

      const result = await getOrdersAction();

      expect(result.success).toBe(true);
      expect(result.orders).toEqual(mockOrders);
      expect(chainable.eq).toHaveBeenCalledWith("user_id", "user-123");
    });

    test("handles fetch error", async () => {
      const chainable = createChainableMock({
        data: null,
        error: { message: "Fetch failed" },
      });
      mockServerClient.from.mockReturnValue(chainable);

      const result = await getOrdersAction();

      expect(result.success).toBe(false);
      expect((result as any).error).toBe("Failed to fetch orders");
    });
  });

  describe("getAdminOrdersAction", () => {
    test("fetches all orders with pagination", async () => {
      const mockOrders = [{ id: "order-1", user_id: "user-123", total: 100 }];

      // Mock orders query
      const ordersChainable = createChainableMock({
        data: mockOrders,
        error: null,
        count: 1,
      });

      // Mock subsequent queries
      mockAdminClient.from.mockImplementation((table) => {
        if (table === "orders") return ordersChainable;
        if (table === "order_items")
          return createChainableMock({ data: [], error: null });
        if (table === "profiles")
          return createChainableMock({ data: [], error: null });
        return createChainableMock({ data: null, error: null });
      });

      const result = await getAdminOrdersAction(1, 10);

      expect(result.success).toBe(true);
      expect(result.orders).toHaveLength(1);
      expect(ordersChainable.range).toHaveBeenCalledWith(0, 9);
    });

    test("filters by status", async () => {
      const ordersChainable = createChainableMock({ data: [], error: null });
      mockAdminClient.from.mockReturnValue(ordersChainable);

      await getAdminOrdersAction(1, 10, "pending");

      expect(ordersChainable.eq).toHaveBeenCalledWith("status", "pending");
    });
  });

  describe("updateOrderStatusAction", () => {
    test("updates status successfully", async () => {
      const updatedOrder = {
        id: "order-1",
        status: "shipped",
        user_id: "user-123",
      };
      const chainable = createChainableMock({
        data: updatedOrder,
        error: null,
      });
      mockAdminClient.from.mockReturnValue(chainable);

      const result = await updateOrderStatusAction("order-1", "shipped");

      expect(result.success).toBe(true);
      expect(result.order).toEqual(updatedOrder);
      expect(chainable.update).toHaveBeenCalledWith({ status: "shipped" });
    });

    test("handles update error", async () => {
      const chainable = createChainableMock({
        data: null,
        error: { message: "Update failed" },
      });
      mockAdminClient.from.mockReturnValue(chainable);

      const result = await updateOrderStatusAction("order-1", "shipped");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Update failed");
    });
  });
});
