/**
 * useAppStore — Global Zustand store
 */

import { create } from "zustand";
import type { CartItem, Product, SearchFilters, UserRole } from "@/types";
import { initialCartItems } from "@/data";

interface AppState {
  // ── Auth ──────────────────────────────────────────────────────────────────
  isLoggedIn: boolean;
  userRole: UserRole;
  login: (email: string, password: string, role?: UserRole) => void;
  logout: () => void;

  // ── Search ────────────────────────────────────────────────────────────────
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // ── Filters ───────────────────────────────────────────────────────────────
  filters: SearchFilters;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;

  // ── Cart ──────────────────────────────────────────────────────────────────
  cart: CartItem[];
  cartCount: number;
  addToCart: (product: Product) => void;
  updateQty: (id: number, delta: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;

  // ── Wishlist ──────────────────────────────────────────────────────────────
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isWishlisted: (id: number) => boolean;
}

const computeCount = (cart: CartItem[]): number =>
  cart.reduce((sum, item) => sum + item.quantity, 0);

const DEFAULT_FILTERS: SearchFilters = {
  artTypes: [],
  priceRanges: [],
  ratings: [],
  sortBy: "Price: ascending",
};

export const useAppStore = create<AppState>((set, get) => ({
  isLoggedIn: false,
  userRole: "collector",
  login: (_email, _password, role) =>
    set({ isLoggedIn: true, userRole: role ?? "collector" }),
  logout: () => set({ isLoggedIn: false, userRole: "collector" }),

  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  filters: DEFAULT_FILTERS,
  setFilters: (partial) =>
    set((s) => ({ filters: { ...s.filters, ...partial } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  cart: initialCartItems,
  cartCount: computeCount(initialCartItems),

  addToCart: (product) => {
    const cart = get().cart;
    const existing = cart.find((i) => i.id === product.id);
    const updated: CartItem[] = existing
      ? cart.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      : [...cart, { ...product, quantity: 1, size: "5×7" }];
    set({ cart: updated, cartCount: computeCount(updated) });
  },

  updateQty: (id, delta) => {
    const updated = get().cart.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );
    set({ cart: updated, cartCount: computeCount(updated) });
  },

  removeItem: (id) => {
    const updated = get().cart.filter((item) => item.id !== id);
    set({ cart: updated, cartCount: computeCount(updated) });
  },

  clearCart: () => set({ cart: [], cartCount: 0 }),

  wishlist: [],

  toggleWishlist: (product) => {
    const { wishlist } = get();
    const exists = wishlist.some((p) => p.id === product.id);
    set({
      wishlist: exists
        ? wishlist.filter((p) => p.id !== product.id)
        : [...wishlist, product],
    });
  },

  isWishlisted: (id) => get().wishlist.some((p) => p.id === id),
}));
