"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  X,
  Trash2,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useLang } from "@/components/LanguageContext";
import ImageUploader from "@/components/ImageUploader";

const CreateAdditionPage = () => {
  const router = useRouter();
  const { lang } = useLang();

  // Names per language
  const [names, setNames] = useState({ ar: "", fr: "", en: "" });
  const [activeLang, setActiveLang] = useState("ar");

  // Pricing
  const [buyingPrice, setBuyingPrice] = useState(0);
  const [regularPrice, setRegularPrice] = useState(0);
  const [promoPrice, setPromoPrice] = useState<number | null>(null);
  const [regularPriceText, setRegularPriceText] = useState("");
  const [promoPriceText, setPromoPriceText] = useState("");

  // Stock
  const [stock, setStock] = useState("");
  const [minimumStock, setMinimumStock] = useState(3);

  // Media
  const [images, setImages] = useState<string[]>([]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived
  const sellingPrice = promoPrice != null && promoPrice > 0 ? promoPrice : regularPrice;
  const profit = (sellingPrice - buyingPrice).toFixed(2);
  const profitNum = parseFloat(profit);

  const normalizeLanguages = () => ({
    nameAr: names.ar || names.fr || names.en || "",
    nameFr: names.fr || names.ar || names.en || "",
    nameEn: names.en || names.fr || names.ar || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { nameAr, nameFr, nameEn } = normalizeLanguages();

    if (!nameAr && !nameFr && !nameEn) {
      toast.error("Please enter at least one addition name");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        prices: {
          buyingPrice,
          regularPrice,
          promoPrice: promoPrice ?? null,
          regularPriceText,
          promoPriceText,
        },
        stock: {
          stock,
          minimumStock,
        },
        images,
        translations: [
          { language: "ar", name: nameAr },
          { language: "fr", name: nameFr },
          { language: "en", name: nameEn },
        ],
      };

      const res = await fetch("/api/products/additions/create-addition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Request failed");

      toast.success("Addition created!");
      router.push(`/${lang}/admin/products`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create addition");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 mx-auto">
      {/* Page header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create New Addition</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Add a new addition linked to a product
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Basic Info */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h2>

          {/* Language tabs */}
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit mb-5">
            {[
              { id: "ar", label: "العربية" },
              { id: "fr", label: "Français" },
              { id: "en", label: "English" },
            ].map((tab) => (
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Addition Name <span className="text-red-400">*</span>
            </label>
            <input
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
              placeholder="e.g., Bolt size 12"
              value={names[activeLang as keyof typeof names]}
              onChange={(e) => setNames((p) => ({ ...p, [activeLang]: e.target.value }))}
              dir={activeLang === "ar" ? "rtl" : "ltr"}
            />
            {/* Status pills for other languages */}
            <div className="mt-2 flex gap-2">
              {Object.entries(names)
                .filter(([k]) => k !== activeLang)
                .map(([k, v]) => (
                  <span
                    key={k}
                    className={`text-[11px] px-2 py-0.5 rounded ${
                      v
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {k.toUpperCase()}: {v || "empty"}
                  </span>
                ))}
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Inventory</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Stock Quantity <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                placeholder="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <span className="text-red-500 underline">Minimum</span> Stock{" "}
                <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                placeholder="3"
                value={minimumStock}
                onChange={(e) => setMinimumStock(Number(e.target.value))}
                required
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Pricing</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Buying Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={buyingPrice}
                onChange={(e) => setBuyingPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Regular Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={regularPrice}
                onChange={(e) => setRegularPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Promo Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Optional"
                value={promoPrice ?? ""}
                onChange={(e) =>
                  setPromoPrice(
                    e.target.value === "" ? null : parseFloat(e.target.value)
                  )
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Profit
              </label>
              <div
                className={`w-full px-3 py-2 rounded-lg text-sm font-semibold text-center border ${
                  profitNum < 0
                    ? "bg-red-50 border-red-200 text-red-600"
                    : profitNum === 0
                    ? "bg-slate-50 border-slate-200 text-slate-400"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
                }`}
              >
                {profitNum >= 0 ? "+" : ""}{profit} DA
              </div>
            </div>
          </div>

          {/* Price text labels — mirrors product page pattern */}
          {(regularPrice > 0 || (promoPrice != null && promoPrice > 0)) && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid sm:grid-cols-2 gap-3">
              {regularPrice > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Regular Price (text)
                  </label>
                  <input
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    placeholder="500 الف"
                    value={regularPriceText}
                    onChange={(e) => setRegularPriceText(e.target.value)}
                  />
                </div>
              )}
              {promoPrice != null && promoPrice > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Promo Price (text)
                  </label>
                  <input
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    placeholder="450 الف"
                    value={promoPriceText}
                    onChange={(e) => setPromoPriceText(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Image */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Image</h2>
          <ImageUploader type="one" images={images} setImages={setImages} />
          {images.length === 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
              <AlertCircle className="w-3.5 h-3.5" />
              An image is required
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
            disabled={isSubmitting || images.length === 0}
            className="px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:bg-slate-300 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2 text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Addition
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAdditionPage;