import toast from "react-hot-toast";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ───────────────── TYPES ───────────────── */


interface CartAddon {
  /** Addon product id (used later in DB) */
  id: string;

  /** Multilingual snapshot */
  translations: {
    language: string;
    name: string;
  }[];

  /** Image snapshot */
  imageUrl?: string;

  /** Pricing snapshot */
  price: number; // unit addon price
  quantity: number;
}

interface CartItem {
  /** Product identity (used later to save in DB) */
  id: string;

  /** Multilingual snapshot */
  translations: {
    language: string;
    name: string;
    description?: string;
  }[];

  /** Pricing snapshot (variant + addons already applied) */
  price: number; // FINAL UNIT price

  /** Product image snapshot */
  imageUrl: string;

  /** Quantity selected by user */
  quantity: number;

  /** Addons selected for this product */
  addons: CartAddon[];
}

export interface Coupon {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
}

interface CheckoutSnapshot {
  subtotal: number;
  discount?: number;
  total?: number;
  coupon?: Coupon | null; // 👈 add the ?
}

/* ───────────────── STORE STATE ───────────────── */

interface ShopState {
  /* cart */
  cart: CartItem[];
  favorites: string[];

  /* checkout snapshot (LOCKED) */
  checkoutSnapshot: CheckoutSnapshot | null;

  /* cart actions */
  addToCart: (product: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateAddonQuantity: (productId: string, addonId: string, quantity: number) => void; // 👈 added
  clearCart: () => void;

  /* coupon / checkout */
  setCheckoutSnapshot: (snapshot: CheckoutSnapshot | null) => void;
  clearCheckoutSnapshot: () => void;

  /* favorites */
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  /* selectors */
  subtotal: () => number;
  total: () => number;
  itemsCount: () => number;
}

/* ───────────────── STORE ───────────────── */

const sameAddons = (a: CartAddon[] = [], b: CartAddon[] = []) => {
  if (a.length !== b.length) return false;

  return a
    .slice()
    .sort((x, y) => x.id.localeCompare(y.id))
    .every((addon, i) =>
      addon.id === b[i].id &&
      addon.quantity === b[i].quantity
    );
};

const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      /* ───── STATE ───── */
      cart: [],
      favorites: [],
      checkoutSnapshot: null,

      /* ───── CART ACTIONS ───── */

     addToCart: (product) =>
  set((state) => {
    const existing = state.cart.find(
      (item) =>
        item.id === product.id &&
        sameAddons(item.addons, product.addons)
    );

    // invalidate checkout snapshot
    if (state.checkoutSnapshot) {
      state.checkoutSnapshot = null;
    }

    if (existing) {
      return {
        cart: state.cart.map((item) =>
          item === existing
            ? { ...item, quantity: item.quantity + (product.quantity || 1) } // 👈 ADD product.quantity here
            : item
        ),
      };
    }

    toast.success("Added to cart");

    return {
      cart: [...state.cart, { ...product, quantity: product.quantity || 1 }],
    };
  }),

      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
          checkoutSnapshot: null,
        })),


updateAddonQuantity: (
  productId: string,
  addonId: string,
  quantity: number
) =>
  set((state) => ({
    cart: state.cart.map((item) =>
      item.id !== productId
        ? item
        : {
            ...item,
            addons:
              quantity <= 0
                ? item.addons.filter((a) => a.id !== addonId)
                : item.addons.map((addon) =>
                    addon.id === addonId
                      ? { ...addon, quantity }
                      : addon
                  ),
          }
    ),
    checkoutSnapshot: null,
  })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id
              ? { ...item, quantity: Math.max(1, quantity) }
              : item
          ),
          checkoutSnapshot: null,
        })),

      clearCart: () =>
        set({
          cart: [],
          checkoutSnapshot: null,
        }),

      /* ───── CHECKOUT SNAPSHOT ───── */

      setCheckoutSnapshot: (snapshot) =>
        set({ checkoutSnapshot: snapshot }),

      clearCheckoutSnapshot: () =>
        set({ checkoutSnapshot: null }),

      /* ───── FAVORITES ───── */

      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((fav) => fav !== id)
            : [...state.favorites, id],
        })),

      isFavorite: (id) => get().favorites.includes(id),

      /* ───── SELECTORS ───── */

        

      subtotal: () =>
  get().cart.reduce((sum, item) => {
    const itemPrice = Number(item.price) || 0;
    const itemQty = Number(item.quantity) || 1;

    const addonsTotal = (item.addons || []).reduce(
      (addonSum, addon) =>
        addonSum +
        (Number(addon.price) || 0) *
        (Number(addon.quantity) || 1),
      0
    );

    const itemTotal =
      itemPrice * itemQty + addonsTotal;

    return sum + itemTotal;
  }, 0),

     total: () => {
  const snapshot = get().checkoutSnapshot;
  if (snapshot) return snapshot.total ?? snapshot.subtotal;
  return get().subtotal();
},

      itemsCount: () =>
        get().cart.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "shop-storage",
    }
  )
);

export default useShopStore;
