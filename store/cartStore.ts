"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  productId: number;
  variantId?: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type CartState = {
  storeSlug: string | null;
  items: CartItem[];
  coupon: string | null;
  selectedShippingId: number | null;
  drawerOpen: boolean;
  /** يُعرّض مرة عند الانتقال لمتجر مختلف مع إفراغ السلة (لا يُخزَّن في localStorage) */
  storeSwitchNotice: boolean;
  ensureStoreSlug: (slug: string) => void;
  dismissStoreSwitchNotice: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, variantId?: number) => void;
  updateQty: (productId: number, variantId: number | undefined, qty: number) => void;
  clearCart: () => void;
  setCoupon: (code: string | null) => void;
  setShipping: (id: number | null) => void;
  total: () => number;
  count: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      storeSlug: null,
      items: [],
      coupon: null,
      selectedShippingId: null,
      drawerOpen: false,
      storeSwitchNotice: false,

      dismissStoreSwitchNotice: () => set({ storeSwitchNotice: false }),

      ensureStoreSlug: (slug: string) => {
        const prev = get().storeSlug;
        if (prev && prev !== slug) {
          set({
            items: [],
            coupon: null,
            selectedShippingId: null,
            storeSlug: slug,
            storeSwitchNotice: true,
          });
          return;
        }
        if (!prev) set({ storeSlug: slug });
      },

      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),

      addItem: (item: CartItem) => {
        const slug = get().storeSlug;
        if (!slug) return;
        const items = [...get().items];
        const idx = items.findIndex(
          (i) => i.productId === item.productId && i.variantId === item.variantId,
        );
        if (idx >= 0) {
          items[idx] = {
            ...items[idx],
            quantity: items[idx].quantity + item.quantity,
          };
        } else {
          items.push({ ...item });
        }
        set({ items });
      },

      removeItem: (productId, variantId) => {
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId),
          ),
        });
      },

      updateQty: (productId, variantId, qty) => {
        if (qty <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId && i.variantId === variantId ? { ...i, quantity: qty } : i,
          ),
        });
      },

      clearCart: () => set({ items: [], coupon: null, selectedShippingId: null }),

      setCoupon: (code) => set({ coupon: code }),
      setShipping: (id) => set({ selectedShippingId: id }),

      total: () =>
        get().items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0),

      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "dasm-store-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        storeSlug: s.storeSlug,
        items: s.items,
        coupon: s.coupon,
        selectedShippingId: s.selectedShippingId,
      }),
    },
  ),
);
