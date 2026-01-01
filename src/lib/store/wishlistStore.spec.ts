import { describe, expect, it, beforeEach } from "vitest";
import { useWishlistStore } from "./wishlistStore";

describe("wishlistStore", () => {
  beforeEach(() => {
    // Clear the store before each test
    useWishlistStore.getState().clearWishlist();
  });

  it("should start with an empty wishlist", () => {
    const state = useWishlistStore.getState();
    expect(state.items).toEqual([]);
    expect(state.getTotalItems()).toBe(0);
  });

  it("should add an item to the wishlist", () => {
    const product = {
      productId: "prod-1",
      name: "Test Product",
      price: 1000,
      image: "test.jpg",
    };

    useWishlistStore.getState().addItem(product);

    const state = useWishlistStore.getState();
    expect(state.items.length).toBe(1);
    expect(state.items[0]).toMatchObject(product);
    expect(state.isInWishlist("prod-1")).toBe(true);
    expect(state.getTotalItems()).toBe(1);
  });

  it("should not add the same product twice", () => {
    const product = {
      productId: "prod-1",
      name: "Test Product",
      price: 1000,
      image: "test.jpg",
    };

    useWishlistStore.getState().addItem(product);
    useWishlistStore.getState().addItem(product);

    const state = useWishlistStore.getState();
    expect(state.items.length).toBe(1);
  });

  it("should remove an item from the wishlist", () => {
    const product = {
      productId: "prod-1",
      name: "Test Product",
      price: 1000,
      image: "test.jpg",
    };

    useWishlistStore.getState().addItem(product);
    useWishlistStore.getState().removeItem("prod-1");

    const state = useWishlistStore.getState();
    expect(state.items.length).toBe(0);
    expect(state.isInWishlist("prod-1")).toBe(false);
  });

  it("should toggle an item in the wishlist", () => {
    const product = {
      productId: "prod-1",
      name: "Test Product",
      price: 1000,
      image: "test.jpg",
    };

    // Toggle on
    useWishlistStore.getState().toggleItem(product);
    expect(useWishlistStore.getState().isInWishlist("prod-1")).toBe(true);

    // Toggle off
    useWishlistStore.getState().toggleItem(product);
    expect(useWishlistStore.getState().isInWishlist("prod-1")).toBe(false);
  });

  it("should clear the wishlist", () => {
    useWishlistStore.getState().addItem({
      productId: "prod-1",
      name: "P1",
      price: 100,
      image: "i1",
    });
    useWishlistStore.getState().addItem({
      productId: "prod-2",
      name: "P2",
      price: 200,
      image: "i2",
    });

    useWishlistStore.getState().clearWishlist();

    expect(useWishlistStore.getState().items.length).toBe(0);
    expect(useWishlistStore.getState().getTotalItems()).toBe(0);
  });
});
