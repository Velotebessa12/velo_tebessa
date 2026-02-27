"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getTranslations } from "@/lib/getTranslations";
import {
  Package,
  ShoppingCart,
  Tag,
  Minus,
  Plus,
  X,
  Palette,
  Wrench,
  ArrowRight,
  RefreshCcw,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLang } from "@/components/LanguageContext";
import Loader from "@/components/Loader";
import useShopStore from "@/store/useShopStore";

// ─── Types (mirrored from cart page) ─────────────────────────────────────────

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

interface OrderItem {
  id: number;
  unitPrice: number;
  quantity: number;
  total: number;
  variantName?: string;
  product?: {
    name: string;
    images?: string[];
    translations?: Record<string, unknown>;
  };
  addOns?: { id: string; name: string; quantity: number; unitPrice: number }[];
}

interface Order {
  id: string;
  items: OrderItem[];
}

// ─── Helpers (mirrored from cart page) ───────────────────────────────────────

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

// ─── Cart Item Row (compact version for exchange page) ───────────────────────

function CartItemRow({
  item,
  lang,
  removeFromCart,
  updateQuantity,
}: {
  item: CartItem;
  lang: string;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
}) {
  const itemPrice = getItemPrice(item);
  const itemStock = getItemStock(item);

  const currentImages =
    item.variantId && (item.variant?.images?.length ?? 0) > 0
      ? item.variant!.images!
      : (item.images ?? []);

  const handleQuantityUpdate = (newQty: number) => {
    if (newQty > itemStock) {
      toast.error(`Only ${itemStock} item(s) available`);
      return;
    }
    if (newQty < 1) return;
    updateQuantity(item.id, newQty);
  };

  return (
   <div className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-teal-200 transition group">
      {/* Image */}
      <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={currentImages[0] || "/placeholder.png"}
          alt={
            (getTranslations(item.translations as any, lang, "name") as string) ||
            "Product"
          }
          fill
          className="object-cover"
          sizes="56px"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 line-clamp-1">
          {getTranslations(item.translations as any, lang, "name") as string}
        </p>

        {item.variantId && item.variant && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {item.variant.color && (
              <span className="inline-flex items-center gap-0.5 text-[11px] bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">
                <Palette className="w-2.5 h-2.5" />
                {item.variant.color}
              </span>
            )}
            {item.variant.attribute && (
              <span className="inline-flex items-center gap-0.5 text-[11px] bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">
                <Wrench className="w-2.5 h-2.5" />
                {item.variant.attribute}
              </span>
            )}
          </div>
        )}

        <p className="text-sm font-bold text-teal-600 mt-1">
          {(itemPrice * item.quantity).toLocaleString()} DA
          <span className="text-xs text-gray-400 font-normal ml-1">
            ({itemPrice.toLocaleString()} × {item.quantity})
          </span>
        </p>

        {item.addons && item.addons.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {item.addons.map((addon) => (
              <p key={addon.id} className="text-[11px] text-gray-400">
                +{" "}
                {getTranslations(addon.translations as any, lang, "name") || "Option"}{" "}
                × {addon.quantity} ({addon.price.toLocaleString()} DA)
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-end justify-between flex-shrink-0 gap-2">
        <button
          onClick={() => removeFromCart(item.id)}
          className="w-6 h-6 rounded-full bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 flex items-center justify-center text-gray-300 hover:text-red-400 transition"
          aria-label="Remove item"
        >
          <X className="w-3 h-3" />
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleQuantityUpdate(item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded bg-white hover:bg-teal-50 hover:border-teal-300 transition disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Decrease"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="min-w-[1.25rem] text-center text-xs font-bold text-gray-700">
            {item.quantity}
          </span>
          <button
            onClick={() => handleQuantityUpdate(item.quantity + 1)}
            disabled={item.quantity >= itemStock}
            className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded bg-white hover:bg-teal-50 hover:border-teal-300 transition disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Increase"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExchangePage() {
  const [returning, setReturning] = useState<any[]>([]);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { id } = useParams();
  const router = useRouter();
  const { lang ,dict } = useLang();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal: getSubtotal,
  } = useShopStore();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/get-order?orderId=${id}`);
        if (!res.ok) throw new Error("Error fetching Order");
        const { order } = await res.json();
        setOrder(order);
      } catch (error) {
        toast.error("Erreur lors du chargement de la commande");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const toggleReturn = (item: any) => {
    setReturning((prev) => {
      const exists = prev.some((x) => x.orderItemId === item.id);
      if (exists) return prev.filter((x) => x.orderItemId !== item.id);
      return [
        ...prev,
        {
          orderItemId: item.id,
          productId: item.product?.id,
          name: item.product?.name ?? "",
          variant: item.variantName ?? null,
          price: item.unitPrice,
          quantity: item.quantity,
        },
      ];
    });
  };

  const returnedValue = returning.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const cartTotal: number =
    typeof getSubtotal === "function"
      ? getSubtotal()
      : cart.reduce((sum, item) => sum + getItemPrice(item as any) * item.quantity, 0);

  const diff = cartTotal - returnedValue;

  const canSubmit =
    returning.length > 0 && cart.length > 0 && reason.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/exchanges/create-exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: id,
          returningItems: returning,
          newCartItems: cart,
          reason,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit exchange");
      toast.success("Demande d'échange soumise !");
      router.push(`/${lang}/orders`);
    } catch (error) {
      toast.error("Erreur lors de la soumission");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          {dict.exchange.backToOrder}
        </button>

     

        {/* Title */}
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-6">
          <RefreshCcw className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div>
            <h1 className="text-xl font-bold text-yellow-900">
              {dict.exchange.title}
            </h1>
            <p className="text-xs text-yellow-700 mt-0.5">
              {dict.exchange.subtitle}
            </p>
          </div>
        </div>

     <a
                  href="https://wa.me/213XXXXXXXXX" // ← replace with your number (no +, no spaces)
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
    my-3 w-full
    flex items-center justify-center gap-2
    px-4 py-3
    rounded-xl
    bg-green-500 hover:bg-green-600
    text-white text-sm font-semibold
    transition
  "
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact us on WhatsApp
                </a>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── LEFT: Items to return ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-red-500 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs font-bold">
                  1
                </span>
                {dict.exchange.itemsToReturn}
              </h2>

              {!order?.items?.length ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  {dict.exchange.noItems}
                </p>
              ) : (
                <div className="space-y-3">
                  {order.items.map((item : any) => {
                    const isSelected = returning.some(
                      (obj) => obj.orderItemId === item.id,
                    );

                    return (
                      <div
                        key={item.id}
                        className={`rounded-xl border transition overflow-hidden ${
                          isSelected
                            ? "border-red-300 bg-red-50"
                            : "border-gray-100 bg-white hover:border-gray-200"
                        }`}
                      >
                        <div className="flex items-start gap-3 p-3">
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {item.product?.images?.[0] ? (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                              {getTranslations(item.product?.translations, lang, "name") ||
                                item.product?.name ||
                                "Product"}
                            </p>

                            {item.variantName && (
                              <span className="inline-flex items-center gap-1 text-[11px] bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full mt-1">
                                <Tag className="w-2.5 h-2.5" />
                                {item.variantName}
                              </span>
                            )}

                            {item.addOns?.length > 0 && (
                              <div className="mt-1 space-y-0.5">
                                {item.addOns.map((addOn : any) => (
                                  <p key={addOn.id} className="text-[11px] text-gray-400">
                                    + {addOn.name} × {addOn.quantity} (
                                    {addOn.unitPrice.toLocaleString()} DA)
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-teal-600">
                              {item.unitPrice.toLocaleString()} DA
                            </p>
                            <p className="text-xs text-gray-400">× {item.quantity}</p>
                            <p className="text-sm font-bold text-gray-800 mt-0.5">
                              {item.total.toLocaleString()} DA
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 px-3 py-2 flex justify-end">
                          <button
                            onClick={() => toggleReturn(item)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                              isSelected
                                ? "bg-gray-200 text-gray-500 hover:bg-gray-300"
                                : "bg-red-500 hover:bg-red-600 text-white"
                            }`}
                          >
                            {isSelected ? dict.exchange.cancel : dict.exchange.return}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Cart as new products ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-green-600 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                {dict.exchange.newProducts}
                {cart.length > 0 && (
                  <span className="ml-auto text-xs text-gray-400 font-normal">
                    {cart.length} {dict.exchange.itemsInCart}
                  </span>
                )}
              </h2>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium mb-4">
                    {dict.exchange.cartEmpty}
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    {dict.exchange.cartHint}
                  </p>
                  <Link
                    href={`/${lang}/products`}
                    className="inline-flex items-center gap-1.5 bg-teal-500 text-white px-5 py-2 rounded-lg hover:bg-teal-600 transition text-sm font-medium"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {dict.exchange.browseProducts}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {cart.map((item : any) => (
                    <CartItemRow
                      key={`${item.id}-${item.variantId ?? "no-variant"}`}
                      item={item}
                      lang={lang}
                      removeFromCart={removeFromCart}
                      updateQuantity={updateQuantity}
                    />
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500">{dict.exchange.cartTotal}</span>
                  <span className="text-sm font-bold text-teal-600">
                    {cartTotal.toLocaleString()} DA
                  </span>
                </div>
              )}
            </div>

            {/* Reason */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {dict.exchange.reasonLabel}
                <span className="text-red-400 ml-1">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={dict.exchange.reasonPlaceholder}
                rows={4}
                className="w-full text-sm text-gray-700 placeholder-gray-400 bg-gray-50 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 border border-transparent focus:border-teal-300"
              />
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">
                {dict.exchange.summary}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {dict.exchange.returnedValue}
                    {returning.length > 0 && (
                      <span className="ml-1 text-xs text-gray-400">
                        ({returning.length})
                      </span>
                    )}
                  </span>
                  <span className="font-semibold text-red-500">
                    − {returnedValue.toLocaleString()} DA
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {dict.exchange.newValue}
                    {cart.length > 0 && (
                      <span className="ml-1 text-xs text-gray-400">
                        ({cart.length})
                      </span>
                    )}
                  </span>
                  <span className="font-semibold text-green-500">
                    + {cartTotal.toLocaleString()} DA
                  </span>
                </div>

                <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-3">
                  <span className="text-gray-800">{dict.exchange.difference}</span>
                  <span className={diff >= 0 ? "text-green-600" : "text-red-500"}>
                    {diff >= 0 ? "+" : ""}
                    {diff.toLocaleString()} DA
                  </span>
                </div>
              </div>

              {/* Validation hints */}
              {!canSubmit && (
                <div className="mb-4 space-y-1.5">
                  {returning.length === 0 && (
                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {dict.exchange.selectReturnItem}
                    </div>
                  )}
                  {cart.length === 0 && (
                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {dict.exchange.addProducts}
                    </div>
                  )}
                  {reason.trim().length === 0 && (
                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {dict.exchange.enterReason}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 ${
                  canSubmit && !isSubmitting
                    ? "bg-teal-500 hover:bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    {dict.exchange.submitting}
                  </>
                ) : (
                  <>
                    <RefreshCcw className="w-4 h-4" />
                    {dict.exchange.submit}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
