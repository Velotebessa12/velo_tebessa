"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Plus,
  X,
  Trash2,
  Box,
  PaintRollerIcon,
  Puzzle,
  Boxes,
  Search,
  ArrowLeft,
  ImageIcon,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { useLang } from "@/components/LanguageContext";
import PopUp from "@/components/PopUp";
import Variant from "@/components/Variant";
import { getTranslations } from "@/lib/getTranslations";
import ImageUploader from "@/components/ImageUploader";
import CreateCategory from "@/components/CreateCategory";

type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  translations?: any[];
};

interface Addon {
  addonProductId: string;
  required: boolean;
}

const CreateProductPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateId = searchParams.get("update");
  const isUpdateMode = !!updateId;

  const { lang } = useLang();

  // Names & descriptions per language
  const [names, setNames] = useState({ ar: "", fr: "", en: "" });
  const [descs, setDescs] = useState({ ar: "", fr: "", en: "" });
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
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([""]);

  // Product type & variants
  const [productType, setProductType] = useState<"FIXED" | "VARIABLE">("FIXED");
  const [variants, setVariants] = useState<any[]>([]);
  const [isVariableOpen, setIsVariableOpen] = useState(false);

  // Category
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Relations
  const [products, setProducts] = useState<any[]>([]);
  const [additions, setAdditions] = useState<any[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [similarProductIds, setSimilarProductIds] = useState<string[]>([]);

  // Popups
  const [isSimilarOpen, setIsSimilarOpen] = useState(false);
  const [isAddonsOpen, setIsAddonsOpen] = useState(false);

  // UI state
  const [activeSection, setActiveSection] = useState<"main" | "options">("main");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Derived
  const sellingPrice = promoPrice != null && promoPrice > 0 ? promoPrice : regularPrice;
  const profit = (sellingPrice - buyingPrice).toFixed(2);
  const profitNum = parseFloat(profit);

  const normalizeLanguages = () => ({
    nameAr: names.ar || names.fr || names.en || "",
    nameFr: names.fr || names.ar || names.en || "",
    nameEn: names.en || names.fr || names.ar || "",
    descriptionAr: descs.ar || descs.fr || descs.en || "",
    descriptionFr: descs.fr || descs.ar || descs.en || "",
    descriptionEn: descs.en || descs.fr || descs.ar || "",
  });

  // Fetch product for update mode
  useEffect(() => {
    if (!isUpdateMode) return;
    const fetchProduct = async () => {
      setIsFetching(true);
      try {
        const res = await fetch(`/api/products/get-product?productId=${updateId}`);
        if (!res.ok) throw new Error();
        const { product } = await res.json();

        const n: any = { ar: "", fr: "", en: "" };
        const d: any = { ar: "", fr: "", en: "" };
        product.translations?.forEach((t: any) => {
          n[t.language] = t.name;
          d[t.language] = t.description;
        });
        setNames(n);
        setDescs(d);

        setBuyingPrice(product.buyingPrice ?? 0);
        setRegularPrice(product.regularPrice ?? 0);
        setPromoPrice(product.promoPrice ?? null);
        setRegularPriceText(product.regularPriceText ?? "");
        setPromoPriceText(product.promoPriceText ?? "");
        setStock(String(product.stock ?? ""));
        setMinimumStock(product.minimumStock ?? 3);
        setCategoryId(product.categoryId ?? "");
        setProductType(product.type ?? "FIXED");
        setVariants(product.variants ?? []);
        setImages(product.images ?? []);
        setAddons(product.addons ?? []);
        setSimilarProductIds(product.similarProductIds ?? []);

        const urls =
          product.youtubeVideoUrls ??
          (product.youtubeVideoUrl ? [product.youtubeVideoUrl] : [""]);
        setYoutubeUrls(urls.length ? urls : [""]);
      } catch {
        toast.error("Failed to load product data");
      } finally {
        setIsFetching(false);
      }
    };
    fetchProduct();
  }, [updateId, isUpdateMode]);

  // Data fetches
  useEffect(() => {
    fetch("/api/products/additions/get-additions")
      .then((r) => r.json())
      .then(({ additions }) => setAdditions(additions || []))
      .catch(() => {});

    fetch("/api/products/get-products")
      .then((r) => r.json())
      .then(({ products }) => setProducts(products || []))
      .catch(() => {});

    fetch("/api/categories/get-categories")
      .then((r) => r.json())
      .then(({ categories }) => setCategories(categories || []))
      .catch(() => {});
  }, []);

  // YouTube URL helpers
  const addYoutubeUrl = () => setYoutubeUrls((p) => [...p, ""]);
  const removeYoutubeUrl = (idx: number) =>
    setYoutubeUrls((p) => p.filter((_, i) => i !== idx));
  const updateYoutubeUrl = (idx: number, val: string) =>
    setYoutubeUrls((p) => p.map((u, i) => (i === idx ? val : u)));

  // Addon toggle
  const toggleAddon = (id: string) => {
    setAddons((prev) =>
      prev.some((a) => a.addonProductId === id)
        ? prev.filter((a) => a.addonProductId !== id)
        : [...prev, { addonProductId: id, required: false }]
    );
  };

  // Variant helpers
  const handleAddVariant = useCallback(() => {
    setVariants((prev) => [
      ...prev,
      {
        id: prev.length > 0 ? Math.max(...prev.map((v) => v.id)) + 1 : 1,
        isActive: true,
        stock: 0,
        buyingPrice,
        regularPrice,
        promoPrice,
        profit,
        color: "",
        image: null,
        expanded: true,
      },
    ]);
  }, [buyingPrice, regularPrice, promoPrice, profit]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  const {
    nameAr,
    nameFr,
    nameEn,
    descriptionAr,
    descriptionFr,
    descriptionEn,
  } = normalizeLanguages();

  if (!nameAr && !nameFr && !nameEn) {
    toast.error("Please enter at least one product name");
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

      categoryId: categoryId || null,
      type: "PRODUCT",

      images, // string[] (URLs)
      similarProductIds,

      youtubeVideoUrls: youtubeUrls.filter((u) => u.trim()),

      variants,
      addons: addons || [],

      translations: [
        { language: "ar", name: nameAr, description: descriptionAr },
        { language: "fr", name: nameFr, description: descriptionFr },
        { language: "en", name: nameEn, description: descriptionEn },
      ],
    };

    const url = isUpdateMode
      ? `/api/products/${updateId}`
      : `/api/products/create-product`;

    const method = isUpdateMode ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Request failed");
    }

    toast.success(isUpdateMode ? "Product updated!" : "Product created!");
    router.push(`/${lang}/admin/products`);
  } catch (error) {
    console.error(error);
    toast.error("Failed to save product");
  } finally {
    setIsSubmitting(false);
  }
};

  if (isFetching) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-7 h-7 animate-spin" />
          <p className="text-sm">Loading product…</p>
        </div>
      </div>
    );
  }

  // Shared product grid used inside both popups
  const ProductPickerGrid = ({
    items,
    selectedIds,
    onToggle,
  }: {
    items: any[];
    selectedIds: string[];
    onToggle: (id: string) => void;
  }) => {
    const filtered = items.filter((p) => {
      const name = p.translations?.[0]?.name ?? "";
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
      <>
        <div className="w-full mt-1 flex items-center bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm focus-within:border-slate-400 transition-all">
          <div className="relative flex flex-1 items-center">
            <Search className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full py-3 pl-11 pr-3 text-sm text-gray-800 bg-transparent outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="pr-3 text-gray-300 hover:text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 p-1 mt-3 max-h-72 overflow-y-auto">
          {filtered.map((product) => {
            const isSelected = selectedIds.includes(product.id);
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => onToggle(product.id)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                  ${isSelected ? "border-slate-700 scale-[1.03]" : "border-transparent hover:border-slate-300"}`}
              >
                {product.images?.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.translations?.[0]?.name ?? ""}
                    fill
                    className={`object-cover transition-opacity ${isSelected ? "opacity-70" : ""}`}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-gray-300" />
                  </div>
                )}
                {isSelected && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="bg-white rounded-full p-0.5">
                      <Check className="w-3 h-3 text-slate-800" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-sm text-gray-400 py-6">
              No products found
            </p>
          )}
        </div>

        <div className="pt-2 text-xs text-slate-400">{selectedIds.length} selected</div>
      </>
    );
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
          <h1 className="text-2xl font-bold text-slate-900">
            {isUpdateMode ? "Update Product" : "Create New Product"}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isUpdateMode
              ? `Editing product ID: ${updateId}`
              : "Add a new product to your inventory"}
          </p>
        </div>
      </div>

      {/* Section tabs */}
      <div className="w-full flex gap-3 mb-4">
        <button
          type="button"
          onClick={() => setActiveSection("main")}
          className={`flex-1 rounded-lg border-2 p-4 text-left transition
            ${activeSection === "main"
              ? "border-slate-900 bg-slate-50"
              : "border-gray-200 bg-white hover:border-gray-300"}`}
        >
          <strong className="block text-gray-900 text-sm">Main</strong>
          <p className="text-xs text-gray-500 mt-0.5">Name, pricing, stock, images</p>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("options")}
          className={`flex-1 rounded-lg border-2 p-4 text-left transition
            ${activeSection === "options"
              ? "border-slate-900 bg-slate-50"
              : "border-gray-200 bg-white hover:border-gray-300"}`}
        >
          <strong className="block text-gray-900 text-sm">Options</strong>
          <p className="text-xs text-gray-500 mt-0.5">
            Variants / add-ons
            {(addons.length > 0 || similarProductIds.length > 0) && (
              <span className="ml-2 inline-flex items-center justify-center bg-slate-800 text-white text-[10px] font-bold rounded-full w-4 h-4">
                {addons.length + similarProductIds.length}
              </span>
            )}
          </p>
        </button>
      </div>

      {/* ── MAIN section ──────────────────────────────────────────────────── */}
      {activeSection === "main" && (
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

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Product Name <span className="text-red-400">*</span>
                </label>
                <input
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                  placeholder="e.g., Mountain Bike Pro 2024"
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none text-sm"
                  placeholder="Describe your product in detail…"
                  rows={4}
                  value={descs[activeLang as keyof typeof descs]}
                  onChange={(e) => setDescs((p) => ({ ...p, [activeLang]: e.target.value }))}
                  dir={activeLang === "ar" ? "rtl" : "ltr"}
                />
              </div>
            </div>
          </div>

          {/* Product Type */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Product Type</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setProductType("FIXED"); setIsVariableOpen(false); }}
                className={`flex items-center gap-2 px-4 py-3 border rounded-lg text-sm font-medium transition-all
                  ${productType === "FIXED"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}
              >
                <Box className="w-4 h-4" />
                Fixed Product
              </button>

              <button
                type="button"
                onClick={() => {
                  setProductType("VARIABLE");
                  if (variants.length === 0) handleAddVariant();
                  setIsVariableOpen(true);
                }}
                className={`flex items-center justify-between px-4 py-3 border rounded-lg text-sm font-medium transition-all
                  ${productType === "VARIABLE"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}
              >
                <div className="flex items-center gap-2">
                  <PaintRollerIcon className="w-4 h-4" />
                  Variable Product
                </div>
                {productType === "VARIABLE" && variants.length > 0 && (
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full px-2 py-0.5">
                    {variants.length}
                  </span>
                )}
              </button>
            </div>
            {productType === "VARIABLE" && variants.length > 0 && (
              <button
                type="button"
                onClick={() => setIsVariableOpen(true)}
                className="mt-3 w-full text-sm text-slate-600 py-2 border border-dashed border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Manage {variants.length} variant{variants.length !== 1 ? "s" : ""} →
              </button>
            )}
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

          {/* Category */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Category</h2>
            <div className="flex gap-3">
              <select
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {getTranslations(cat.translations as any,  lang , "name")}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="px-4 py-2.5 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Category</span>
              </button>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Images</h2>
            <ImageUploader type="many" images={images} setImages={setImages} />
            {images.length === 0 && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
                <AlertCircle className="w-3.5 h-3.5" />
                At least one image is required
              </p>
            )}
          </div>

          {/* YouTube URLs */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">YouTube Videos</h2>
            <div className="space-y-2.5">
              {youtubeUrls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=…"
                    value={url}
                    onChange={(e) => updateYoutubeUrl(idx, e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                  />
                  {youtubeUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeYoutubeUrl(idx)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addYoutubeUrl}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 py-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add another video
              </button>
            </div>
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
                  {isUpdateMode ? "Saving…" : "Creating…"}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {isUpdateMode ? "Save Changes" : "Create Product"}
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ── OPTIONS section ───────────────────────────────────────────────── */}
      {activeSection === "options" && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Product Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setSearchQuery(""); setIsSimilarOpen(true); }}
                className="group flex items-center justify-between w-full px-5 py-4 rounded-xl border border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <Boxes className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  <div>
                    <span className="font-semibold text-gray-800 text-sm block">
                      Similar products
                    </span>
                    <span className="text-xs text-gray-400">
                      {similarProductIds.length > 0
                        ? `${similarProductIds.length} selected`
                        : "None selected"}
                    </span>
                  </div>
                </div>
                {similarProductIds.length > 0 && (
                  <span className="bg-slate-100 text-slate-700 text-xs font-bold rounded-full px-2 py-0.5">
                    {similarProductIds.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setSearchQuery(""); setIsAddonsOpen(true); }}
                className="group flex items-center justify-between w-full px-5 py-4 rounded-xl border border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <Puzzle className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  <div>
                    <span className="font-semibold text-gray-800 text-sm block">Add-ons</span>
                    <span className="text-xs text-gray-400">
                      {addons.length > 0 ? `${addons.length} selected` : "None selected"}
                    </span>
                  </div>
                </div>
                {addons.length > 0 && (
                  <span className="bg-slate-100 text-slate-700 text-xs font-bold rounded-full px-2 py-0.5">
                    {addons.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Popups ─────────────────────────────────────────────────────────── */}

      {isSimilarOpen && (
        <PopUp
          title="Similar Products"
          isOpen={isSimilarOpen}
          onClose={() => setIsSimilarOpen(false)}
        >
          <div className="p-4">
            <ProductPickerGrid
              items={products}
              selectedIds={similarProductIds}
              onToggle={(id) =>
                setSimilarProductIds((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                )
              }
            />
          </div>
        </PopUp>
      )}

      {isAddonsOpen && (
        <PopUp
          title="Add-ons"
          isOpen={isAddonsOpen}
          onClose={() => setIsAddonsOpen(false)}
        >
          <div className="p-4">
            <ProductPickerGrid
              items={additions}
              selectedIds={addons.map((a) => a.addonProductId)}
              onToggle={toggleAddon}
            />
          </div>
        </PopUp>
      )}

      {isVariableOpen && (
        <PopUp
          isOpen={isVariableOpen}
          onClose={() => setIsVariableOpen(false)}
          title="Product Variants"
        >
          <Variant
            setVariants={setVariants}
            variants={variants}
            handleAddVariant={handleAddVariant}
          />
        </PopUp>
      )}

      {showCategoryModal && (
        <PopUp
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
        >
          <CreateCategory categories={categories} setCategories={setCategories} />
        </PopUp>
      )}
    </div>
  );
};

export default CreateProductPage;