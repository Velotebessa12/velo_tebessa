"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTranslations } from "@/lib/getTranslations";
import {
  Package,
  Tag,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  Minus,
  Plus,
  MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLang } from "@/components/LanguageContext";
import Loader from "@/components/Loader";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddOn {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
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
  addOns?: AddOn[];
}

interface Order {
  id: string;
  items: OrderItem[];
}

interface ReturnEntry {
  itemId: number;
  quantity: number; // how many of this item to return (1 … item.quantity)
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReturnPage() {
  const { id } = useParams();
  const router = useRouter();
  const { lang , dict} = useLang();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map of itemId → quantity to return
  const [returnEntries, setReturnEntries] = useState<
    Record<number, ReturnEntry>
  >({});
  const [reason, setReason] = useState("");

  // ── Fetch order ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/get-order?orderId=${id}`);
        if (!res.ok) throw new Error("Error fetching order");
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

  // ── Helpers ────────────────────────────────────────────────────────────────
  const isSelected = (itemId: number) => !!returnEntries[itemId];

  const toggleItem = (item: OrderItem) => {
    setReturnEntries((prev) => {
      if (prev[item.id]) {
        const next = { ...prev };
        delete next[item.id];
        return next;
      }
      return {
        ...prev,
        [item.id]: { itemId: item.id, quantity: item.quantity },
      };
    });
  };

  const setReturnQty = (item: OrderItem, qty: number) => {
    if (qty < 1 || qty > item.quantity) return;
    setReturnEntries((prev) => ({
      ...prev,
      [item.id]: { itemId: item.id, quantity: qty },
    }));
  };

  const selectedItems = Object.values(returnEntries);

  const returnedValue = selectedItems.reduce((sum, entry) => {
    const item = order?.items.find((i) => i.id === entry.itemId);
    if (!item) return sum;
    return sum + item.unitPrice * entry.quantity;
  }, 0);

  const canSubmit = selectedItems.length > 0 && reason.trim().length > 0;

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/returns/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: id,
          items: selectedItems,
          reason,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit return");

      toast.success("Demande de retour soumise !");
      router.push(`/${{ lang }}/orders`);
    } catch (error) {
      toast.error("Erreur lors de la soumission");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
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
          {dict.return.backToOrder}
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <RotateCcw className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h1 className="text-xl font-bold text-blue-900">
              {dict.return.title}
            </h1>
            <p className="text-xs text-blue-700 mt-0.5">
              {dict.return.subtitle}
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

        <div className="space-y-4">
          {/* ── Products ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold">
                1
              </span>
              {dict.return.itemsToReturn}
            </h2>

            {!order?.items?.length ? (
              <p className="text-sm text-gray-400 text-center py-6">
                {dict.return.noItems}
              </p>
            ) : (
              <div className="space-y-3">
                {order.items.map((item : any) => {
                  const selected = isSelected(item.id);
                  const entry = returnEntries[item.id];

                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl border transition-all overflow-hidden ${
                        selected
                          ? "border-blue-300 bg-blue-50"
                          : "border-gray-100 bg-white hover:border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-3 p-3">
                        {/* Checkbox-style toggle */}
                        <button
                          onClick={() => toggleItem(item)}
                          className={`mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${
                            selected
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300 bg-white hover:border-blue-400"
                          }`}
                          aria-label="Toggle return"
                        >
                          {selected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          )}
                        </button>

                        {/* Image */}
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

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                            {getTranslations(item.product?.translations,  lang , "name") ||
                              item.product?.name ||
                              "Produit"}
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

                        {/* Price */}
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

                      {/* Quantity selector */}
                      {selected && item.quantity > 1 && (
                        <div className="border-t border-blue-100 px-4 py-2.5 flex items-center justify-between bg-blue-50/60">
                          <p className="text-xs text-blue-700 font-medium">
                            {dict.return.returnQty}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setReturnQty(item, (entry?.quantity ?? 1) - 1)}
                              disabled={(entry?.quantity ?? 1) <= 1}
                              className="w-6 h-6 rounded border border-blue-200 bg-white flex items-center justify-center text-blue-600 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="min-w-[2rem] text-center text-sm font-bold text-blue-700">
                              {entry?.quantity ?? 1}
                              <span className="text-xs font-normal text-blue-400">
                                /{item.quantity}
                              </span>
                            </span>
                            <button
                              onClick={() => setReturnQty(item, (entry?.quantity ?? 1) + 1)}
                              disabled={(entry?.quantity ?? 1) >= item.quantity}
                              className="w-6 h-6 rounded border border-blue-200 bg-white flex items-center justify-center text-blue-600 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <p className="text-xs text-blue-700 font-semibold">
                            ={" "}
                            {(item.unitPrice * (entry?.quantity ?? 1)).toLocaleString()} DA
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Reason ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold">
                2
              </span>
              {dict.return.reasonTitle}
              <span className="text-red-400 ml-0.5">*</span>
            </h2>

            {/* Quick reason chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                "Produit défectueux",
                "Ne correspond pas à la description",
                "Taille incorrecte",
                "Reçu en double",
                "Changement d'avis",
              ].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setReason(preset)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition font-medium ${
                    reason === preset
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 bg-white"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={dict.return.reasonPlaceholder}
              rows={3}
              className="w-full text-sm text-gray-700 placeholder-gray-400 bg-gray-50 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 border border-transparent focus:border-blue-300"
            />
          </div>

          {/* ── Summary & Submit ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold">
                3
              </span>
              {dict.return.summary}
            </h3>

            {selectedItems.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-2">
                {dict.return.noneSelected}
              </p>
            ) : (
              <div className="space-y-2 mb-4">
                {selectedItems.map((entry) => {
                  const item = order?.items.find((i) => i.id === entry.itemId);
                  if (!item) return null;
                  return (
                    <div
                      key={entry.itemId}
                      className="flex justify-between text-sm text-gray-600"
                    >
                      <span className="truncate mr-2 flex-1">
                        {getTranslations(item.product?.translations as any,  lang , "name") ||
                          item.product?.name}
                        {entry.quantity > 1 && (
                          <span className="text-gray-400 ml-1">× {entry.quantity}</span>
                        )}
                      </span>
                      <span className="font-semibold text-gray-800 flex-shrink-0">
                        {(item.unitPrice * entry.quantity).toLocaleString()} DA
                      </span>
                    </div>
                  );
                })}

                <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-3">
                  <span className="text-gray-800">{dict.return.estimatedRefund}</span>
                  <span className="text-blue-600 text-base">
                    {returnedValue.toLocaleString()} DA
                  </span>
                </div>
              </div>
            )}

            {/* Validation hints */}
            {!canSubmit && (
              <div className="mb-4 space-y-1.5">
                {selectedItems.length === 0 && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {dict.return.selectItem}
                  </div>
                )}
                {reason.trim().length === 0 && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {dict.return.enterReason}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 ${
                canSubmit && !isSubmitting
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
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
                  {dict.return.submitting}
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  {dict.return.submit}
                </>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              {dict.return.refundNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
