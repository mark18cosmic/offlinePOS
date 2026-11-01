import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = { productId: number; quantity: number };

type CartState = {
  items: CartItem[];
  add: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  reset: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (productId) =>
        set(({ items }) => ({
          items: items.some((item) => item.productId === productId)
            ? items.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item))
            : [...items, { productId, quantity: 1 }],
        })),
      setQuantity: (productId, quantity) =>
        set(({ items }) => ({
          items:
            quantity <= 0
              ? items.filter((item) => item.productId !== productId)
              : items.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
        })),
      reset: () => set({ items: [] }),
    }),
    // Rehydrated from the sell screen after mount, so server and client HTML match.
    { name: "pos-cart-v2", skipHydration: true },
  ),
);
