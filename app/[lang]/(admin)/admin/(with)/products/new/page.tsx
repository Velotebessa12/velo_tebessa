"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  Star,
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

interface YoutubeVideo {
  title: string;
  url: string;
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
  const [maxOrderQuantity, setMaxOrderQuantity] = useState<number | null>(null);

  // Media
  const [images, setImages] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  const [youtubeVideos, setYoutubeVideos] = useState<YoutubeVideo[]>([{ title: "", url: "" }]);

  // Product type & variants
  const [productType, setProductType] = useState<"FIXED" | "VARIABLE">("FIXED");
  const [variants, setVariants] = useState<any[]>([]);
  const [isVariableOpen, setIsVariableOpen] = useState(false);

  // Category
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
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

  // Separate search queries for each popup
  const [similarSearchQuery, setSimilarSearchQuery] = useState("");
  const [addonSearchQuery, setAddonSearchQuery] = useState("");

  // Derived
  const sellingPrice = promoPrice != null && promoPrice > 0 ? promoPrice : regularPrice;
  const profit = (sellingPrice - buyingPrice).toFixed(2);
  const profitNum = parseFloat(profit);

  // Whether a promo is active
  const hasActivePromo = promoPrice != null && promoPrice > 0;

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
        setMaxOrderQuantity(product.maxOrderQuantity ?? null);
        // Support array of category IDs
        const cats = product.categoryIds ?? (product.categoryId ? [product.categoryId] : []);
        setCategoryIds(cats);
        setProductType(product.type ?? "FIXED");
        setVariants(product.variants ?? []);
        setImages(product.images ?? []);
        setMainImageIndex(product.mainImageIndex ?? 0);
        setAddons(product.addons ?? []);
        setSimilarProductIds(product.similarProductIds ?? []);

        const videos: YoutubeVideo[] = product.youtubeVideos ?? [];
        setYoutubeVideos(videos.length ? videos : [{ title: "", url: "" }]);
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

  // YouTube helpers
  const addYoutubeUrl = () =>
    setYoutubeVideos((p) => [...p, { title: "", url: "" }]);

  const updateYoutubeUrl = (idx: number, field: "title" | "url", val: string) =>
    setYoutubeVideos((p) =>
      p.map((u, i) => (i === idx ? { ...u, [field]: val } : u))
    );

  const removeYoutubeVideo = (idx: number) =>
    setYoutubeVideos((p) => p.filter((_, i) => i !== idx));

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
      ...prev,
    ]);
  }, [buyingPrice, regularPrice, promoPrice, profit]);

  // When images change and mainImageIndex is out of bounds, reset it
  useEffect(() => {
    if (images.length > 0 && mainImageIndex >= images.length) {
      setMainImageIndex(0);
    }
  }, [images, mainImageIndex]);

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

        maxOrderQuantity: maxOrderQuantity ?? null,

        // Send array of category IDs
        categoryIds: categoryIds.length > 0 ? categoryIds : [],

        type: "PRODUCT",
        productType,

        images,
        mainImageIndex,
        similarProductIds,

        youtubeVideos: youtubeVideos.filter((v) => v.url.trim()),

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Request failed");

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

  // ─── Product Picker Grid ───────────────────────────────────────────────────
  const ProductPickerGrid = ({
    items,
    selectedIds,
    onToggle,
    searchQuery,
    setSearchQuery,
  }: {
    items: any[];
    selectedIds: string[];
    onToggle: (id: string) => void;
    searchQuery: string;
    setSearchQuery: (v: string) => void;
  }) => {
    // Filter by ALL language translations, not just index 0
    const filtered = useMemo(
      () =>
        items.filter((p) => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase();
          return p.translations?.some((t: any) =>
            (t.name ?? "").toLowerCase().includes(q)
          );
        }),
      [items, searchQuery]
    );

    return (
      <>
        {/* Search bar */}
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

        {/* Product list — card style with name visible */}
        <div className="flex flex-col gap-2 mt-3 max-h-80 overflow-y-auto pr-1">
          {filtered.map((product) => {
            const isSelected = selectedIds.includes(product.id);
            const name = getTranslations(product.translations, lang, "name");
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => onToggle(product.id)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border-2 transition-all text-left
                  ${
                    isSelected
                      ? "border-slate-700 bg-slate-50"
                      : "border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
              >
                {/* Thumbnail */}
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  {product.images?.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Name */}
                <span className="flex-1 text-sm font-medium text-gray-800 line-clamp-2">
                  {name}
                </span>

                {/* Check indicator */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                    ${isSelected ? "bg-slate-800 border-slate-800" : "border-gray-300"}`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-6">
              No products found
            </p>
          )}
        </div>

        <div className="pt-2 text-xs text-slate-400">
          {selectedIds.length} selected
        </div>
      </>
    );
  };

  // ─── Images section with main image pinning ────────────────────────────────
  const ImagesSection = () => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Images</h2>
      <p className="text-xs text-slate-500 mb-4">
        Click the ★ star on any image to set it as the main product image.
      </p>

      <ImageUploader type="many" images={images} setImages={setImages} />

      {images.length === 0 && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
          <AlertCircle className="w-3.5 h-3.5" />
          At least one image is required
        </p>
      )}

      {images.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-slate-600 mb-2">
            Select main image:
          </p>
          <div className="flex flex-wrap gap-2">
            {images.map((src, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setMainImageIndex(idx)}
                className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                  ${
                    mainImageIndex === idx
                      ? "border-yellow-400 scale-105 shadow-md"
                      : "border-transparent hover:border-slate-300"
                  }`}
                title={idx === mainImageIndex ? "Main image" : "Set as main"}
              >
                <Image src={src} alt={`img-${idx}`} fill className="object-cover" />
                <div
                  className={`absolute top-0.5 right-0.5 rounded-full p-0.5 transition-all
                    ${
                      mainImageIndex === idx
                        ? "bg-yellow-400 text-white"
                        : "bg-black/40 text-white/60"
                    }`}
                >
                  <Star className="w-2.5 h-2.5" fill={mainImageIndex === idx ? "currentColor" : "none"} />
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            Main image:{" "}
            <span className="text-slate-600 font-medium">Image {mainImageIndex + 1}</span>
          </p>
        </div>
      )}
    </div>
  );

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
            ${
              activeSection === "main"
                ? "border-slate-900 bg-slate-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
        >
          <strong className="block text-gray-900 text-sm">Main</strong>
          <p className="text-xs text-gray-500 mt-0.5">
            Name, pricing, stock, images
          </p>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("options")}
          className={`flex-1 rounded-lg border-2 p-4 text-left transition
            ${
              activeSection === "options"
                ? "border-slate-900 bg-slate-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
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
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Basic Information
            </h2>

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
                    ${
                      activeLang === tab.id
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
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
                  onChange={(e) =>
                    setNames((p) => ({ ...p, [activeLang]: e.target.value }))
                  }
                  dir={activeLang === "ar" ? "rtl" : "ltr"}
                />
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
                  onChange={(e) =>
                    setDescs((p) => ({ ...p, [activeLang]: e.target.value }))
                  }
                  dir={activeLang === "ar" ? "rtl" : "ltr"}
                />
              </div>
            </div>
          </div>

          {/* Product Type */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Product Type
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setProductType("FIXED");
                  setIsVariableOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-3 border rounded-lg text-sm font-medium transition-all
                  ${
                    productType === "FIXED"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
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
                  ${
                    productType === "VARIABLE"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
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
                Manage {variants.length} variant
                {variants.length !== 1 ? "s" : ""} →
              </button>
            )}
          </div>

          {/* Inventory */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Inventory
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
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
              {/* ✅ Max Order Quantity — now inside Inventory card */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Max Order Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  placeholder="No limit"
                  value={maxOrderQuantity ?? ""}
                  onChange={(e) =>
                    setMaxOrderQuantity(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                />
                <p className="text-xs text-slate-400 mt-1">Leave empty for no limit</p>
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
                  onChange={(e) =>
                    setBuyingPrice(parseFloat(e.target.value) || 0)
                  }
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
                  onChange={(e) =>
                    setRegularPrice(parseFloat(e.target.value) || 0)
                  }
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
                  {profitNum >= 0 ? "+" : ""}
                  {profit} DA
                </div>
              </div>
            </div>

            {/* ✅ Price text fields:
                - If promo is active: show strikethrough regular text + promo text
                - If no promo: only show regular text
            */}
            {regularPrice > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Regular Price{" "}
                    {hasActivePromo && (
                      <span className="text-xs text-slate-400 font-normal">
                        (will appear struck-through)
                      </span>
                    )}
                  </label>
                  <input
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    placeholder="500 الف"
                    value={regularPriceText}
                    onChange={(e) => setRegularPriceText(e.target.value)}
                  />
                </div>

                {/* Only show promo text field when promo is active */}
                {hasActivePromo && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Promo Price{" "}
                      <span className="text-xs text-emerald-600 font-normal">
                        (active discount)
                      </span>
                    </label>
                    <input
                      className="w-full px-4 py-2.5 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      placeholder="450 الف"
                      value={promoPriceText}
                      onChange={(e) => setPromoPriceText(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Live preview of how prices will appear */}
            {regularPrice > 0 && (regularPriceText || promoPriceText) && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-400 mb-1.5">Preview on product page:</p>
                <div className="flex items-center gap-2">
                  {hasActivePromo && promoPriceText && (
                    <span className="text-base font-bold text-emerald-600">
                      {promoPriceText}
                    </span>
                  )}
                  {regularPriceText && (
                    <span
                      className={`text-sm ${
                        hasActivePromo
                          ? "line-through text-slate-400"
                          : "font-bold text-slate-800"
                      }`}
                    >
                      {regularPriceText}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Category — multi-select */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Category
            </h2>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                {/* Selected tags */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {categoryIds.map((id) => {
                    const cat = categories.find((c) => c.id === id);
                    if (!cat) return null;
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-sm font-medium"
                      >
                        {getTranslations(cat.translations as any, lang, "name")}
                        <button
                          type="button"
                          onClick={() =>
                            setCategoryIds((prev) =>
                              prev.filter((cid) => cid !== id)
                            )
                          }
                          className="hover:text-emerald-900 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    );
                  })}
                </div>

                <select
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all text-slate-500"
                  value=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && !categoryIds.includes(val)) {
                      setCategoryIds((prev) => [...prev, val]);
                    }
                  }}
                >
                  <option value="">
                    {categoryIds.length === 0
                      ? "Select categories..."
                      : "Add another category..."}
                  </option>
                  {categories
                    .filter((cat) => !categoryIds.includes(cat.id))
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {getTranslations(cat.translations as any, lang, "name")}
                      </option>
                    ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="px-4 py-2.5 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors flex items-center gap-2 text-sm self-end"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Category</span>
              </button>
            </div>
          </div>

          {/* Images with main image selection */}
          <ImagesSection />

          {/* YouTube Videos */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              YouTube Videos
            </h2>
            <div className="space-y-4">
              {youtubeVideos.map((video, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="flex-1 border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition-all">
                    {/* Title field — bold label */}
                    <div className="px-4 pt-2.5 pb-1">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                        Video Title
                      </p>
                      <input
                        dir="auto"
                        type="text"
                        placeholder="e.g., Product Overview"
                        value={video.title}
                        onChange={(e) =>
                          updateYoutubeUrl(idx, "title", e.target.value)
                        }
                        className="w-full text-sm font-semibold text-slate-800 bg-transparent outline-none placeholder:font-normal placeholder:text-slate-400"
                      />
                    </div>
                    <div className="border-t border-slate-100 px-4 py-2.5">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                        URL
                      </p>
                      <input
                        type="url"
                        placeholder="https://youtube.com/watch?v=…"
                        value={video.url}
                        onChange={(e) =>
                          updateYoutubeUrl(idx, "url", e.target.value)
                        }
                        className="w-full text-sm text-slate-700 bg-transparent outline-none"
                      />
                    </div>
                    {/* Preview of title appearance */}
                    {video.title && (
                      <div className="border-t border-slate-100 px-4 py-2 bg-slate-50">
                        <p className="text-[11px] text-slate-400">
                          Appears as:{" "}
                          <strong className="text-slate-700">{video.title}</strong>
                        </p>
                      </div>
                    )}
                  </div>
                  {youtubeVideos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeYoutubeVideo(idx)}
                      className="p-2 mt-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Product Options
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSimilarSearchQuery("");
                  setIsSimilarOpen(true);
                }}
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
                onClick={() => {
                  setAddonSearchQuery("");
                  setIsAddonsOpen(true);
                }}
                className="group flex items-center justify-between w-full px-5 py-4 rounded-xl border border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <Puzzle className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  <div>
                    <span className="font-semibold text-gray-800 text-sm block">
                      Add-ons
                    </span>
                    <span className="text-xs text-gray-400">
                      {addons.length > 0
                        ? `${addons.length} selected`
                        : "None selected"}
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
                  prev.includes(id)
                    ? prev.filter((x) => x !== id)
                    : [...prev, id]
                )
              }
              searchQuery={similarSearchQuery}
              setSearchQuery={setSimilarSearchQuery}
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
              searchQuery={addonSearchQuery}
              setSearchQuery={setAddonSearchQuery}
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
          <CreateCategory
            categories={categories}
            setCategories={setCategories}
            setShowCategoryModal={setShowCategoryModal}
            // ✅ Auto-select newly created category
            onCategoryCreated={(newCat: Category) => {
              setCategories((prev) => [...prev, newCat]);
              setCategoryIds((prev) =>
                prev.includes(newCat.id) ? prev : [...prev, newCat.id]
              );
              setShowCategoryModal(false);
            }}
          />
        </PopUp>
      )}
    </div>
  );
};

export default CreateProductPage;