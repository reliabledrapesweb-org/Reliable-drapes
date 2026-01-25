import { describe, expect, test, beforeEach } from "vitest";
import { useCartStore } from "./cartStore";

describe("Cart Store", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    useCartStore.getState().closeCart();
  });

  test("starts with empty cart", () => {
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.isOpen).toBe(false);
  });

  test("adds new item to cart", () => {
    const item = {
      productId: "p1",
      name: "Test Product",
      price: 100,
      quantity: 1,
      image: "test.jpg",
    };

    useCartStore.getState().addItem(item);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject(item);
    expect(state.isOpen).toBe(true);
  });

  test("increments quantity for existing item", () => {
    const item = {
      productId: "p1",
      name: "Test Product",
      price: 100,
      quantity: 1,
      image: "test.jpg",
    };

    useCartStore.getState().addItem(item);
    useCartStore.getState().addItem(item);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  test("treats same product with different variants as different items", () => {
    const item1 = {
      productId: "p1",
      name: "Test Product",
      price: 100,
      quantity: 1,
      image: "test.jpg",
      variantId: "v1",
    };

    const item2 = {
      productId: "p1",
      name: "Test Product",
      price: 100,
      quantity: 1,
      image: "test.jpg",
      variantId: "v2",
    };

    useCartStore.getState().addItem(item1);
    useCartStore.getState().addItem(item2);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(2);
  });

  test("removes item from cart", () => {
    const item = {
      productId: "p1",
      name: "Test Product",
      price: 100,
      quantity: 1,
      image: "test.jpg",
    };

    useCartStore.getState().addItem(item);
    const itemId = useCartStore.getState().items[0].id;

    useCartStore.getState().removeItem(itemId);

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  test("updates quantity", () => {
    const item = {
      productId: "p1",
      name: "Test Product",
      price: 100,
      quantity: 1,
      image: "test.jpg",
    };

    useCartStore.getState().addItem(item);
    const itemId = useCartStore.getState().items[0].id;

    useCartStore.getState().updateQuantity(itemId, 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  test("removes item when quantity updated to 0", () => {
    const item = {
      productId: "p1",
      name: "Test Product",
      price: 100,
      quantity: 1,
      image: "test.jpg",
    };

    useCartStore.getState().addItem(item);
    const itemId = useCartStore.getState().items[0].id;

    useCartStore.getState().updateQuantity(itemId, 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  test("calculates totals correctly", () => {
    useCartStore.getState().addItem({
      productId: "p1",
      name: "P1",
      price: 100,
      quantity: 2,
      image: "p1.jpg",
    });

    useCartStore.getState().addItem({
      productId: "p2",
      name: "P2",
      price: 50,
      quantity: 1,
      image: "p2.jpg",
    });

    expect(useCartStore.getState().getTotalItems()).toBe(3);
    expect(useCartStore.getState().getTotalPrice()).toBe(250);
  });

  test("manages cart visibility", () => {
    expect(useCartStore.getState().isOpen).toBe(false);

    useCartStore.getState().openCart();
    expect(useCartStore.getState().isOpen).toBe(true);

    useCartStore.getState().closeCart();
    expect(useCartStore.getState().isOpen).toBe(false);

    useCartStore.getState().toggleCart();
    expect(useCartStore.getState().isOpen).toBe(true);
  });
});
