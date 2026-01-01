/**
 * Wishlist state management using Zustand
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string | null;
}

interface WishlistState {
  items: WishlistItem[];

  // Actions
  addItem: (item: Omit<WishlistItem, "id">) => void;
  removeItem: (productId: string) => void;
  toggleItem: (item: Omit<WishlistItem, "id">) => void;
  clearWishlist: () => void;

  // Computed values
  isInWishlist: (productId: string) => boolean;
  getTotalItems: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items;

        // Check if item already exists
        const exists = items.some((i) => i.productId === item.productId);

        if (!exists) {
          const newItem: WishlistItem = {
            ...item,
            id: `wishlist-${item.productId}-${Date.now()}`,
          };
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });
      },

      toggleItem: (item) => {
        const items = get().items;
        const exists = items.some((i) => i.productId === item.productId);

        if (exists) {
          get().removeItem(item.productId);
        } else {
          get().addItem(item);
        }
      },

      clearWishlist: () => {
        set({ items: [] });
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.productId === productId);
      },

      getTotalItems: () => {
        return get().items.length;
      },
    }),
    {
      name: "wishlist-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
