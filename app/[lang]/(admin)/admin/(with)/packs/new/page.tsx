"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft, Plus, Minus, Trash2, Search, X, Package,
  AlertCircle, Loader2, Check, Save, ImageIcon,
} from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

const LANGS = [
  { id: "ar", label: "العربية" },
  { id: "fr", label: "Français" },
  { id: "en", label: "English" },
];

export default function CreatePackPage() {
  const router = useRouter();

  // ── Step tracking
 const [step, setStep] = useState<any>(1); // 1 = create, 2 = builder
const [packId, setPackId] = useState<any>(null);
const [pack, setPack] = useState<any>(null);

// ── Step 1 state
const [activeLang, setActiveLang] = useState<any>("ar");
const [names, setNames] = useState<any>({ ar: "", fr: "", en: "" });
const [descs, setDescs] = useState<any>({ ar: "", fr: "", en: "" });
const [regularPrice, setRegularPrice] = useState<any>("");
const [promoPrice, setPromoPrice] = useState<any>("");
const [regularPriceText, setRegularPriceText] = useState<any>("");
const [promoPriceText, setPromoPriceText] = useState<any>("");
const [images, setImages] = useState<any>([]);
const [isSubmitting, setIsSubmitting] = useState<any>(false);

// ── Step 2 state
const [products, setProducts] = useState<any>([]);
const [prodLoading, setProdLoading] = useState<any>(false);
const [items, setItems] = useState<any>([]);
const [searchQuery, setSearchQuery] = useState<any>("");
const [isSaving, setIsSaving] = useState<any>(false);
const [saveSuccess, setSaveSuccess] = useState<any>(false);

  // ── Load products when entering step 2
  // useEffect(() => {
  //   if (step !== 2) return;
  //   async function loadProducts() {
  //     setProdLoading(true);
  //     try {
  //       const res  = await fetch(`/api/products/get-products?query=${searchQuery}`);
  //       const data = await res.json();
  //       setProducts(Array.isArray(data) ? data : (data.products ?? []));
  //     } catch (err) {
  //       console.error("Failed to load products", err);
  //     } finally {
  //       setProdLoading(false);
  //     }
  //   }
  //   loadProducts();
  // }, [step , searchQuery]);


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProdLoading(true);

        const params = new URLSearchParams();

        if (searchQuery) {
          params.append("query", searchQuery);
        }

        const res = await fetch(
          `/api/products/get-products?${params.toString()}`,
        );

        if (!res.ok) throw new Error();

        const { products } = await res.json();

        setProducts(products);
      } catch (error) {
        console.error(error);
      } finally {
        setProdLoading(false);
      }
    };

    // 🔥 DEBOUNCE LOGIC
    const delay = setTimeout(() => {
      fetchProducts();
    }, 400); // wait 400ms after user stops typing

    return () => clearTimeout(delay);
  }, [ step , searchQuery]);


  // ── Step 1: submit — create pack, then advance
  const handleCreatePack = async (e : any) => {
    e.preventDefault();
    if (!regularPrice) return;

    setIsSubmitting(true);
    try {
      const translations = LANGS.filter((l) => names[l.id]).map((l) => ({
        language:    l.id,
        name:        names[l.id],
        description: descs[l.id] || null,
      }));

      const res = await fetch("/api/packs/create-pack", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          translations,
          imageUrl:         images[0] ?? null,
          regularPrice:     parseFloat(regularPrice),
          promoPrice:       promoPrice ? parseFloat(promoPrice) : null,
          regularPriceText: regularPriceText || null,
          promoPriceText:   promoPriceText || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to create pack");
      const data = await res.json();
      setPackId(data.id);
      setPack(data);
      setStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 2: derived totals
  const packPrice = pack?.promoPrice ?? pack?.regularPrice ?? parseFloat(regularPrice) ?? 0;

  const selectedTotal = useMemo(
    () => items.reduce((sum : any, item : any) => sum + item.price * item.quantity, 0),
    [items]
  );

  const remaining = packPrice - selectedTotal;

  // ── Filtered product list (exclude already-added)
  const addedIds = useMemo(() => items.map((i : any) => i.productId), [items]);


  // ── Add product
  const addProduct = (product : any) => {
    const defaultPrice = product.promoPrice ?? product.regularPrice ?? product.price ?? 0;
    setItems((prev : any) => [
      ...prev,
      { productId: product.id, quantity: 1, price: defaultPrice, priceText: "" },
    ]);
    setSearchQuery("");
  };

  // ── Update item field
  const updateItem = (productId : any, field : any, value : any) =>
    setItems((prev : any) =>
      prev.map((item : any) =>
        item.productId === productId ? { ...item, [field]: value } : item
      )
    );

  // ── Remove item
  const removeItem = (productId : any) =>
    setItems((prev : any) => prev.filter((i : any) => i.productId !== productId));

  // ── Helpers
  const getProduct = (id : any) => products.find((p : any) => p.id === id);
  const getName    = (product : any) =>
    product?.translations?.[0]?.name ?? product?.name ?? "Unknown Product";

  // ── Save pack items
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await fetch(`/api/packs/${packId}/items`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save pack items", err);
    } finally {
      setIsSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 mx-auto max-w-2xl">

      {/* ── Page Header ── */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => (step === 2 ? setStep(1) : router.back())}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900">
            {step === 1 ? "Create New Pack" : "Pack Builder"}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {step === 1
              ? "Define the bundle details — you'll add products next"
              : (pack?.translations?.[0]?.name ?? names.ar ?? names.fr ?? names.en ?? "Unnamed Pack")}
          </p>
        </div>
        {step === 2 && (
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || items.length === 0}
            className="px-5 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:bg-slate-300 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2 text-sm"
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
            ) : saveSuccess ? (
              <><Check className="w-4 h-4" />Saved!</>
            ) : (
              <><Save className="w-4 h-4" />Save Pack</>
            )}
          </button>
        )}
      </div>

      {/* ── Step Indicator ── */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${step === s
                  ? "bg-teal-500 text-white"
                  : step > s
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-slate-100 text-slate-400"}`}
            >
              {step > s ? <Check className="w-3.5 h-3.5" /> : s}
            </div>
            <span className={`text-xs font-medium ${step === s ? "text-slate-800" : "text-slate-400"}`}>
              {s === 1 ? "Pack Details" : "Add Products"}
            </span>
            {s < 2 && <div className={`w-10 h-px ${step > s ? "bg-emerald-300" : "bg-slate-200"}`} />}
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          STEP 1 — Create Pack
      ══════════════════════════════════════════════════════════════════════ */}
      {step === 1 && (
        <form onSubmit={handleCreatePack} className="space-y-5">

          {/* Basic Info */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h2>

            <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit mb-5">
              {LANGS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveLang(tab.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all
                    ${activeLang === tab.id
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Pack Name <span className="text-red-400">*</span>
                </label>
                <input
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                  placeholder="e.g., Starter Bike Kit"
                  value={names[activeLang]}
                  onChange={(e) => setNames((p : any) => ({ ...p, [activeLang]: e.target.value }))}
                  dir={activeLang === "ar" ? "rtl" : "ltr"}
                />
                {/* <div className="mt-2 flex gap-2">
                  {Object.entries(names)
                    .filter(([k]) => k !== activeLang)
                    .map(([k, v]) => (
                      <span
                        key={k}
                        className={`text-[11px] px-2 py-0.5 rounded ${
                          v ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {k.toUpperCase()}: {v || "empty"}
                      </span>
                    ))}
                </div> */}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none text-sm"
                  placeholder="Describe what's inside this pack…"
                  rows={3}
                  value={descs[activeLang]}
                  onChange={(e) => setDescs((p : any) => ({ ...p, [activeLang]: e.target.value }))}
                  dir={activeLang === "ar" ? "rtl" : "ltr"}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Pack Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Regular Price <span className="text-red-400">*</span>
                </label>
                <input
                  type="number" min="0" step="0.01" required placeholder="0.00"
                  value={regularPrice}
                  onChange={(e) => setRegularPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Promo Price</label>
                <input
                  type="number" min="0" step="0.01" placeholder="Optional"
                  value={promoPrice}
                  onChange={(e) => setPromoPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              {(regularPrice || promoPrice) && (
                <>
                  {regularPrice && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Regular Price (text)</label>
                      <input
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="3500 دج"
                        value={regularPriceText}
                        onChange={(e) => setRegularPriceText(e.target.value)}
                      />
                    </div>
                  )}
                  {promoPrice && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Promo Price (text)</label>
                      <input
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="3000 دج"
                        value={promoPriceText}
                        onChange={(e) => setPromoPriceText(e.target.value)}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Image */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Pack Image</h2>
            <ImageUploader type="one" images={images} setImages={setImages} />
            {images.length === 0 && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
                <AlertCircle className="w-3.5 h-3.5" />
                Adding an image is recommended
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pb-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !regularPrice}
              className="px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:bg-slate-300 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Creating…</>
              ) : (
                <><Plus className="w-4 h-4" />Create & Continue</>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STEP 2 — Pack Builder
      ══════════════════════════════════════════════════════════════════════ */}
      {step === 2 && (
        <div className="space-y-5">

          {/* Price Summary Banner */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-3 divide-x divide-slate-100">
              <div className="p-4 text-center">
                <p className="text-xs text-slate-400 mb-1">Pack Price</p>
                <p className="text-xl font-bold text-slate-900">
                  {packPrice.toLocaleString()}
                  <span className="text-sm font-medium text-slate-400 ml-1">DZD</span>
                </p>
                {promoPrice && (
                  <p className="text-xs text-slate-400 line-through">
                    {parseFloat(regularPrice).toLocaleString()} DZD
                  </p>
                )}
              </div>
              <div className="p-4 text-center">
                <p className="text-xs text-slate-400 mb-1">Products Total</p>
                <p className={`text-xl font-bold ${selectedTotal > packPrice ? "text-red-500" : "text-slate-900"}`}>
                  {selectedTotal.toLocaleString()}
                  <span className="text-sm font-medium text-slate-400 ml-1">DZD</span>
                </p>
                <p className="text-xs text-slate-400">
                  {items.length} product{items.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="p-4 text-center">
                <p className="text-xs text-slate-400 mb-1">Remaining</p>
                <p className={`text-xl font-bold ${remaining < 0 ? "text-red-500" : remaining === 0 ? "text-emerald-600" : "text-slate-900"}`}>
                  {remaining < 0 ? "-" : ""}{Math.abs(remaining).toLocaleString()}
                  <span className="text-sm font-medium text-slate-400 ml-1">DZD</span>
                </p>
                {remaining < 0 && <p className="text-xs text-red-400 font-medium">Over budget</p>}
                {remaining === 0 && items.length > 0 && <p className="text-xs text-emerald-500 font-medium">Perfect!</p>}
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-slate-100">
              <div
                className={`h-full transition-all duration-500 ${remaining < 0 ? "bg-red-400" : remaining === 0 ? "bg-emerald-400" : "bg-teal-400"}`}
                style={{ width: `${Math.min((selectedTotal / packPrice) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Product Search */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Add Products</h2>
            <div className="w-full flex items-center bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm focus-within:border-slate-400 transition-all">
              <div className="relative flex flex-1 items-center">
                <Search className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products to add…"
                  className="w-full py-3 pl-11 pr-3 text-sm text-gray-800 bg-transparent outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="pr-3 text-gray-300 hover:text-gray-500">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {prodLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            ) : searchQuery.length > 0 && (
              <div className="mt-3 border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-50">
                {products.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-5">No products found</p>
                ) : (
                  products.slice(0, 6).map((product : any) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addProduct(product)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 relative">
                        {product.images?.[0] ? (
                          <Image src={product.images[0]} alt={getName(product)} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-slate-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{getName(product)}</p>
                        <p className="text-xs text-slate-400">
                          {(product.promoPrice ?? product.regularPrice ?? product.price ?? 0).toLocaleString()} DZD
                        </p>
                      </div>
                      <Plus className="w-4 h-4 text-teal-500 flex-shrink-0" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Added Items */}
          {items.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-200 p-10 text-center">
              <Package className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">
                No products added yet — search above to start building your pack
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700">Products in Pack</h2>
                <span className="text-xs text-slate-400">{items.length} item{items.length !== 1 ? "s" : ""}</span>
              </div>

              <div className="divide-y divide-slate-50">
                {items.map((item : any) => {
                  const product = getProduct(item.productId);
                  const originalPrice = product?.promoPrice ?? product?.regularPrice ?? product?.price ?? 0;
                  const isDiscounted  = item.price < originalPrice;

                  return (
                    <div key={item.productId} className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 relative">
                          {product?.images?.[0] ? (
                            <Image src={product.images[0]} alt={getName(product)} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{getName(product)}</p>
                          <p className="text-xs text-slate-400">
                            Original: {originalPrice.toLocaleString()} DZD
                            {isDiscounted && (
                              <span className="ml-2 text-emerald-500 font-medium">↓ discounted</span>
                            )}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1.5">Quantity</label>
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => updateItem(item.productId, "quantity", Math.max(1, item.quantity - 1))}
                              className="px-2.5 py-2 hover:bg-slate-50 text-slate-500 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="flex-1 text-center text-sm font-semibold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateItem(item.productId, "quantity", item.quantity + 1)}
                              className="px-2.5 py-2 hover:bg-slate-50 text-slate-500 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 mb-1.5">Pack Price (DZD)</label>
                          <input
                            type="number" min="0" step="0.01"
                            value={item.price}
                            onChange={(e) => updateItem(item.productId, "price", parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 mb-1.5">Price (text)</label>
                          <input
                            type="text"
                            placeholder="e.g. 850 دج"
                            value={item.priceText}
                            onChange={(e) => updateItem(item.productId, "priceText", e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      <div className="mt-2.5 flex justify-end">
                        <span className="text-xs text-slate-400">
                          Subtotal:{" "}
                          <span className="font-semibold text-slate-700">
                            {(item.price * item.quantity).toLocaleString()} DZD
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Over-budget warning */}
          {remaining < 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Products total exceeds pack price by{" "}
              <strong>{Math.abs(remaining).toLocaleString()} DZD</strong>. Adjust prices or remove items.
            </div>
          )}

          <div className="pb-10" />
        </div>
      )}
    </div>
  );
}