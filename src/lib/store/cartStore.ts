/**
 * Shopping cart state management using Zustand
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { trackAddToCart } from "@/lib/analytics/gtag";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  variantId?: string;
  variantName?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  
  // Computed values
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemCount: (productId: string, variantId?: string) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const items = get().items;
        
        // Check if item with same product and variant already exists
        const existingItemIndex = items.findIndex(
          (i) =>
            i.productId === item.productId &&
            i.variantId === item.variantId
        );

        if (existingItemIndex > -1) {
          // Update quantity of existing item
          const newItems = [...items];
          newItems[existingItemIndex].quantity += item.quantity;
          set({ items: newItems, isOpen: true });
        } else {
          // Add new item with unique ID
          const newItem: CartItem = {
            ...item,
            id: `${item.productId}-${item.variantId || "default"}-${Date.now()}`,
          };
          set({ items: [...items, newItem], isOpen: true });
        }

        trackAddToCart({
          item_id: item.productId,
          item_name: item.name,
          item_variant: item.variantName,
          price: item.price,
          quantity: item.quantity,
        });
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter((item) => item.id !== itemId) });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        const newItems = get().items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        );
        set({ items: newItems });
      },

      clearCart: () => {
        set({ items: [] });
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getItemCount: (productId, variantId) => {
        const item = get().items.find(
          (i) => i.productId === productId && i.variantId === variantId
        );
        return item?.quantity || 0;
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
