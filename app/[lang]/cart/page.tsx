"use client";

import { useEffect, useState } from "react";
import {
  Minus,
  Plus,
  X,
  ShoppingCart,
  Palette,
  Wrench,
  Tag,
  CheckCircle,
  RefreshCcw,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import useShopStore from "@/store/useShopStore";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LanguageContext";
import toast from "react-hot-toast";
import { getTranslations } from "@/lib/getTranslations";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AddonProduct {
  id: string;
  promoPrice?: number;
  regularPrice?: number;
  translations?: Record<string, unknown>;
  imageUrl?: string;
}

interface AddonAsMain {
  addonProduct: AddonProduct;
}

interface CartAddon {
  id: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  translations?: Record<string, unknown>;
}

interface Variant {
  promoPrice?: number;
  regularPrice?: number;
  images?: string[];
  stock?: number;
  color?: string;
  attribute?: string;
}

interface CartItem {
  id: string;
  variantId?: string;
  variant?: Variant;
  promoPrice?: number;
  regularPrice?: number;
  images?: string[];
  stock?: number;
  quantity: number;
  translations?: Record<string, unknown>;
  category?: { name: string };
  selectedAddons?: string[];
  addonsAsMain?: AddonAsMain[];
  addons?: CartAddon[];
}

interface CheckoutSnapshot {
  subtotal: number;
  discount: number;
  total: number;
  coupon?: {
    code: string;
    type: "PERCENTAGE" | "FIXED";
    value: number;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getItemBasePrice(item: CartItem): number {
  if (item.variantId && item.variant) {
    const { promoPrice, regularPrice } = item.variant;
    return promoPrice && promoPrice > 0 ? promoPrice : (regularPrice ?? 0);
  }
  return item.promoPrice && item.promoPrice > 0
    ? item.promoPrice
    : (item.regularPrice ?? 0);
}

function getAddonsPrice(item: CartItem): number {
  if (!item.selectedAddons?.length || !item.addonsAsMain?.length) return 0;

  return item.selectedAddons.reduce((sum, addonId) => {
    const addon = item.addonsAsMain!.find((a) => a.addonProduct.id === addonId);
    if (!addon) return sum;
    const { promoPrice, regularPrice } = addon.addonProduct;
    return (
      sum + (promoPrice && promoPrice > 0 ? promoPrice : (regularPrice ?? 0))
    );
  }, 0);
}

function getItemPrice(item: CartItem): number {
  return getItemBasePrice(item) + getAddonsPrice(item);
}

function getItemStock(item: CartItem): number {
  if (item.variantId && item.variant) return item.variant.stock ?? 0;
  return item.stock ?? 0;
}

function computeSubtotal(cart: CartItem[]): number {
  return cart.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0,
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function AddonRow({
  addon,
  itemId,
  updateAddonQuantity,
  lang,
}: {
  addon: CartAddon;
  itemId: string;
  updateAddonQuantity: (itemId: string, addonId: string, qty: number) => void;
  lang: string;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <img
        src={addon.imageUrl || "/placeholder.png"}
        alt=""
        className="w-10 h-10 rounded-md object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-800 truncate">
          {getTranslations(addon.translations, lang, "name") || "Option"}
        </p>
        <p className="text-xs text-teal-600 font-semibold">
          +{addon.price.toLocaleString()} DA
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() =>
            updateAddonQuantity(itemId, addon.id, addon.quantity - 1)
          }
          disabled={addon.quantity <= 1}
          className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded hover:bg-teal-50 text-xs disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label="Decrease addon quantity"
        >
          −
        </button>
        <span className="min-w-[1.5rem] text-center text-xs font-medium">
          {addon.quantity}
        </span>
        <button
          onClick={() =>
            updateAddonQuantity(itemId, addon.id, addon.quantity + 1)
          }
          className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded hover:bg-teal-50 text-xs transition"
          aria-label="Increase addon quantity"
        >
          +
        </button>
      </div>
    </div>
  );
}

function CartItemCard({
  item,
  lang,
  removeFromCart,
  updateQuantity,
  updateAddonQuantity,
}: {
  item: CartItem;
  lang: string;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  updateAddonQuantity: (itemId: string, addonId: string, qty: number) => void;
}) {
  const itemPrice = getItemPrice(item);
  const itemStock = getItemStock(item);

  const currentImages =
    item.variantId && (item.variant?.images?.length ?? 0) > 0
      ? item.variant!.images!
      : (item.images ?? []);

  const handleQuantityUpdate = (newQuantity: number) => {
    if (newQuantity > itemStock) {
      toast.error(`Only ${itemStock} item(s) available`);
      return;
    }
    if (newQuantity < 1) return;
    updateQuantity(item.id, newQuantity);
  };

  // show the cart instead of new items / or tell them to add product to cart before exchange
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="flex min-h-[110px]">
        {/* Image */}
        <div className="relative w-28 sm:w-36 flex-shrink-0">
          <Image
            src={currentImages[0] || "/placeholder.png"}
            alt={
              (getTranslations(item.translations, lang, "name") as string) ||
              "Product"
            }
            fill
            className="object-cover"
            sizes="(max-width: 640px) 112px, 144px"
          />
        </div>

        {/* Content */}
        <div className="flex flex-1 justify-between p-3 sm:p-4 gap-3">
          {/* Info */}
          <div className="flex flex-col justify-between flex-1 min-w-0">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2">
                {getTranslations(item.translations, lang, "name") as string}
              </h3>

              {item.category?.name && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.category.name}
                </p>
              )}

              {/* Variant badges */}
              {item.variantId && item.variant && (
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  {item.variant.color && (
                    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      <Palette className="w-3 h-3" />
                      {item.variant.color}
                    </span>
                  )}
                  {item.variant.attribute && (
                    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      <Wrench className="w-3 h-3" />
                      {item.variant.attribute}
                    </span>
                  )}
                </div>
              )}

              {/* Price */}
              <p className="text-base sm:text-lg font-bold text-teal-600 mt-2">
                {itemPrice.toLocaleString()} DA
                {item.quantity > 1 && (
                  <span className="text-xs text-gray-400 font-normal ml-1">
                    × {item.quantity}
                  </span>
                )}
              </p>

              {/* Item total */}
              <p className="text-sm font-bold text-gray-800">
                {(itemPrice * item.quantity).toLocaleString()} DA
              </p>

              {/* Stock warnings */}
              {itemStock === 0 && (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  Out of stock
                </p>
              )}
              {itemStock > 0 && itemStock < 5 && (
                <p className="text-xs text-orange-500 mt-1 font-medium">
                  Only {itemStock} left
                </p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-end justify-between flex-shrink-0">
            {/* Remove */}
            <button
              onClick={() => removeFromCart(item.id)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition"
              aria-label="Remove item"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Quantity */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleQuantityUpdate(item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-teal-50 hover:border-teal-300 transition disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="min-w-[2rem] text-center text-sm font-semibold">
                {item.quantity}
              </span>
              <button
                onClick={() => handleQuantityUpdate(item.quantity + 1)}
                disabled={item.quantity >= itemStock}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-teal-50 hover:border-teal-300 transition disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Addons */}
      {item.addons && item.addons.length > 0 && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {item.addons.map((addon) => (
            <AddonRow
              key={addon.id}
              addon={addon}
              itemId={item.id}
              updateAddonQuantity={updateAddonQuantity}
              lang={lang}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CartPage() {
  const [promoCode, setPromoCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const {
    cart,
    removeFromCart,
    updateQuantity,
    checkoutSnapshot,
    setCheckoutSnapshot,
    updateAddonQuantity,
    subtotal: getSubtotal,
  } = useShopStore();

  const router = useRouter();
  const {lang , dict} = useLang();
  const [hasExchange, setHasExchange] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    const checkHasExchange = async () => {
      try {
        const res = await fetch(
          `/api/exchanges/check-has-exchange?userId=${user?.id}`,
        );

        if (!res.ok) {
          throw new Error("Error occured : Checking exchanges");
        }

        const { hasExchange } = await res.json();
        setHasExchange(hasExchange);
      } catch (error) {
        toast.error("Error checking exchanges");
        console.error(error);
      }
    };

    checkHasExchange();
  }, [user?.id]);

  // Always compute live subtotal from cart
  const liveSubtotal: number =
    typeof getSubtotal === "function" ? getSubtotal() : computeSubtotal(cart);

  const effectiveSubtotal = checkoutSnapshot?.subtotal ?? liveSubtotal;
  const effectiveDiscount = checkoutSnapshot?.discount ?? 0;
  const effectiveTotal = checkoutSnapshot?.total ?? liveSubtotal;

  // Re-validate snapshot when cart changes (e.g., items removed)
  useEffect(() => {
    if (checkoutSnapshot && cart.length === 0) {
      setCheckoutSnapshot(null);
    }
  }, [cart.length, checkoutSnapshot, setCheckoutSnapshot]);

  const redeemCoupon = async (code?: string) => {
    const couponCode = (code || promoCode).trim();
    if (!couponCode) return;

    setIsApplying(true);
    try {
      const res = await fetch("/api/coupons/redeem-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, cartTotal: liveSubtotal }),
      });

      const data = await res.json();
      // here do couponUsage and return it to use it later
      if (!res.ok) {
        toast.error(data.error || "Invalid coupon code");
        return;
      }

      toast.success("Coupon applied!");

      try {
        localStorage.setItem(
          "redeemed_coupon",
          JSON.stringify({ code: data.coupon.code, redeemedAt: Date.now() }),
        );
      } catch {
        // localStorage not available (SSR safety)
      }

      setCheckoutSnapshot({
        subtotal: liveSubtotal,
        discount: liveSubtotal - data.finalTotal,
        total: data.finalTotal,
        coupon: {
          code: data.coupon.code,
          type: data.coupon.type,
          value: data.coupon.value,
        },
      });

      setPromoCode("");
    } catch {
      toast.error("Failed to apply coupon. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  // ...existing code...
  const handleCheckout = () => {
    const outOfStock = cart.filter((item) => getItemStock(item) === 0);
    if (outOfStock.length > 0) {
      toast.error("Please remove out-of-stock items before checkout");
      return;
    }

    const exceededStock = cart.filter(
      (item) => item.quantity > getItemStock(item),
    );
    if (exceededStock.length > 0) {
      toast.error("Some item quantities exceed available stock");
      return;
    }

    // Ensure a checkout snapshot exists even when no coupon is applied
    if (!checkoutSnapshot) {
      setCheckoutSnapshot({
        subtotal: liveSubtotal,
        discount: 0,
        total: liveSubtotal,
      });
    }

    router.push(`/${lang}/checkout`);
  };
  // ...existing code...

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* ── Cart Items ── */}
          <div className="lg:col-span-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              {dict.cart.title}
              {cart.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({cart.length} {cart.length === 1 ? dict.cart.item : dict.cart.items})
                </span>
              )}
            </h1>

            {cart.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                <ShoppingCart className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-base mb-5 font-medium">
                  {dict.cart.emptyTitle}
                </p>
                <Link
                  href={`/${lang}/products`}
                  className="inline-block bg-teal-500 text-white px-6 py-2.5 rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
                >
                  {dict.cart.continueShopping}
                </Link>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {cart.map((item) => (
                  <CartItemCard
                    key={`${item.id}-${item.variantId ?? "no-variant"}`}
                    item={item}
                    lang={lang}
                    removeFromCart={removeFromCart}
                    updateQuantity={updateQuantity}
                    updateAddonQuantity={updateAddonQuantity}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-5">
                {dict.cart.orderSummary}
              </h2>

              {/* Promo Code */}
              {!effectiveDiscount && (
                <div className="mb-5">
                  <label
                    htmlFor="promo-code"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    {dict.cart.promoCode}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="promo-code"
                        type="text"
                        value={promoCode}
                        onChange={(e) =>
                          setPromoCode(e.target.value.toUpperCase())
                        }
                        onKeyDown={(e) => e.key === "Enter" && redeemCoupon()}
                        placeholder={dict.cart.promoPlaceholder}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                    <button
                      onClick={() => redeemCoupon()}
                      disabled={!promoCode || isApplying}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white whitespace-nowrap transition
                        bg-teal-500 hover:bg-teal-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {isApplying ? dict.cart.applying : dict.cart.apply}
                    </button>
                  </div>
                </div>
              )}

              {/* Applied coupon banner */}
              {effectiveDiscount > 0 && checkoutSnapshot?.coupon && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-5 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-green-700 font-medium">
                    {checkoutSnapshot.coupon.code}
                  </span>
                  <span className="text-green-600 text-xs ml-auto">
                    {checkoutSnapshot.coupon.type === "PERCENTAGE"
                      ? `${checkoutSnapshot.coupon.value}% off`
                      : `-${checkoutSnapshot.coupon.value} DA`}
                  </span>
                  <button
                    onClick={() => setCheckoutSnapshot(null)}
                    className="text-gray-400 hover:text-gray-600 transition ml-1"
                    aria-label="Remove coupon"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Breakdown */}
              <div className="space-y-3 mb-5 pb-5 border-b border-gray-100 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{dict.cart.subtotal}</span>
                  <span className="font-semibold text-gray-900">
                    {effectiveSubtotal.toLocaleString()} DA
                  </span>
                </div>

                {effectiveDiscount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>{dict.cart.discount}</span>
                    <span className="font-semibold text-green-600">
                      − {effectiveDiscount.toLocaleString()} DA
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-gray-500">
                  <span>{dict.cart.shipping}</span>
                  <span className="text-xs italic">{dict.cart.shippingNote}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-5">
                <span className="text-base font-bold text-gray-900">{dict.cart.total}</span>
                <span className="text-xl font-bold text-teal-600">
                  {effectiveTotal.toLocaleString()} DA
                </span>
              </div>

              {/* Checkout button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="
      flex-1
      bg-teal-500 hover:bg-teal-600
      disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
      text-white py-3 rounded-lg transition text-sm font-semibold
    "
                >
                  {dict.cart.checkout}
                </button>

                {/* only if the exchange was accepted  */}
                {hasExchange && (
                  <button
                    onClick={() => router.push(`/${lang}/orders?exchange=true`)}
                    disabled={cart.length === 0}
                    className="
      flex items-center justify-center
      bg-yellow-50 hover:bg-yellow-100
      border border-yellow-200
      text-yellow-700
      disabled:cursor-not-allowed
      p-3 rounded-lg transition
    "
                  >
                    <RefreshCcw className="w-5 h-5" />
                  </button>
                )}
              </div>

              <Link
                href={`/${lang}/products`}
                className="block mt-2 text-center text-sm text-teal-600 hover:text-teal-700 hover:underline transition"
              >
                ← {dict.cart.continueShopping}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
