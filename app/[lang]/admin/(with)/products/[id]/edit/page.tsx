"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  GripVertical,
  Box,
  PaintRollerIcon,
  Wrench,
  ChevronUp,
  Rocket,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { useLang } from "@/components/LanguageContext";
import PopUp from "@/components/PopUp";
import Variant from "@/components/Variant";
import { getTranslations } from "@/lib/getTranslations";
import ImageUploader from "@/components/ImageUploader";

type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
};

type ImagePreview = {
  file: File;
  preview: string;
  id: string;
};

interface Translation {
  language: string;
  name: string;
  description: string;
}

interface Addon {
  addonProductId: string;
  required: boolean;
}

const CreateProductPage = () => {
  const { id } = useParams();

  const router = useRouter();
  const { lang } = useLang();
  const [nameAr, setNameAr] = useState("");
  const [nameFr, setNameFr] = useState("");
  const [nameEn, setNameEn] = useState("");

  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionFr, setDescriptionFr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [minimumStock, setMinimumStock] = useState(3);

  const [buyingPrice, setBuyingPrice] = useState(0);
  const [regularPrice, setRegularPrice] = useState(0);
  const [promoPrice, setPromoPrice] = useState(0);
  const [stock, setStock] = useState("");
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [product, setProduct] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState<File | null>(null);
  const [newCategoryImagePreview, setNewCategoryImagePreview] =
    useState<string>("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [regularPriceText, setRegularPriceText] = useState("");
  const [promoPriceText, setPromoPriceText] = useState("");
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);

  const [translations, setTranslations] = useState<Translation[]>([
    { language: "ar", name: "", description: "" },
    { language: "fr", name: "", description: "" },
    { language: "en", name: "", description: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const [additions, setAdditions] = useState([]);
  const [productType, setProductType] = useState<"FIXED" | "VARIABLE">("FIXED");
  const [isVariableOpen, setIsVariableOpen] = useState(false);
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState("");
  const [hasHydrated, setHasHydrated] = useState(false);

  const normalizeLanguages = () => {
    const finalNameAr = nameAr || nameFr || nameEn || "";
    const finalNameFr = nameFr || nameAr || nameEn || "";
    const finalNameEn = nameEn || nameFr || nameAr || "";

    const finalDescAr = descriptionAr || descriptionFr || descriptionEn || "";
    const finalDescFr = descriptionFr || descriptionAr || descriptionEn || "";
    const finalDescEn = descriptionEn || descriptionFr || descriptionAr || "";

    return {
      nameAr: finalNameAr,
      nameFr: finalNameFr,
      nameEn: finalNameEn,

      descriptionAr: finalDescAr,
      descriptionFr: finalDescFr,
      descriptionEn: finalDescEn,
    };
  };

  useEffect(() => {
    const fetchAdditions = async () => {
      try {
        const res = await fetch("/api/products/additions/get-additions");

        if (!res.ok) {
          throw new Error("Error fetching additions");
        }

        const { additions } = await res.json();
        setAdditions(additions);
      } catch (error) {
        toast.error("Error fetching additions");
        console.error(error);
      }
    };

    fetchAdditions();
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      toast.loading("Loading ...", { id: "fetch-product" });
      try {
        const res = await fetch(`/api/products/get-product?productId=${id}`);

        if (!res.ok) {
          throw new Error("Error fetching product");
        }

        const { product } = await res.json();
        console.log(product);
        setProduct(product);
        toast.success("Product loaded", { id: "fetch-product" });
      } catch (error) {
        toast.error("Error fetching product");
        console.error(error);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!product || !product.id || hasHydrated) return;
    toast.success("Run aggain");
    // 🔹 Prices & stock
    setBuyingPrice(product.buyingPrice ?? 0);

    setRegularPrice(product.regularPrice ?? 0);
    setPromoPrice(product.promoPrice ?? 0);

    setRegularPriceText(product.regularPriceText);
    setPromoPriceText(product.promoPriceText);

    setStock(String(product.stock ?? ""));
    setMinimumStock(product.minimumStock ?? 0);
    // setPriceText(product.priceText ?? "");

    // 🔹 Category
    setCategoryId(product.categoryId ?? "");

    // 🔹 Youtube
    setYoutubeVideoUrl(product.youtubeVideoUrl ?? "");

    // 🔹 Product type
    setProductType(product.variants?.length > 0 ? "VARIABLE" : "FIXED");

    // 🔹 Variants
    setVariants(product.variants ?? []);

    // 🔹 Images → previews (IMPORTANT)
    setImagePreviews(
      (product.images ?? []).map((url: string) => ({
        file: null, // existing image
        preview: url,
        isExisting: true,
      })),
    );

    setImages(product.images);

    // 🔹 Translations
    const getTranslation = ({ lang }: string) =>
      product.translations?.find((t: any) => t.language === { lang });

    setNameAr(getTranslation("ar")?.name ?? "");
    setDescriptionAr(getTranslation("ar")?.description ?? "");

    setNameFr(getTranslation("fr")?.name ?? "");
    setDescriptionFr(getTranslation("fr")?.description ?? "");

    setNameEn(getTranslation("en")?.name ?? "");
    setDescriptionEn(getTranslation("en")?.description ?? "");

    setTranslations(
      ["ar", "fr", "en"].map(({ lang }) => {
        const t = product.translations?.find(
          (tr: any) => tr.language === { lang },
        );
        return {
          language: { lang },
          name: t?.name ?? "",
          description: t?.description ?? "",
        };
      }),
    );

    // 🔹 Addons
    setAddons(product.addonsAsMain ?? []);
    setHasHydrated(true);
  }, [product, hasHydrated]);

  // HANDLE TRANSLATION CHANGE
  const handleTranslationChange = (
    index: number,
    field: keyof Translation,
    value: string,
  ) => {
    const updated = [...translations];
    updated[index][field] = value;
    setTranslations(updated);
  };

  // ADD NEW ADDON FIELD
  const addAddonField = () => {
    setAddons([...addons, { addonProductId: "", required: false }]);
  };

  // HANDLE ADDON CHANGE
  const handleAddonChange = (index: number, field: keyof Addon, value: any) => {
    const updated = [...addons];
    updated[index][field] = value;
    setAddons(updated);
  };

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories/get-categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  // Auto-generate slug from category name
  useEffect(() => {
    if (newCategoryName) {
      const slug = newCategoryName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setNewCategorySlug(slug);
    }
  }, [newCategoryName]);

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newImages: ImagePreview[] = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));

    setImagePreviews((prev) => [...prev, ...newImages]);
  };

  // Handle drag and drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, []);

  const removeImage = (id: string) => {
    setImagePreviews((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      // Revoke URL to prevent memory leaks
      const removed = prev.find((img) => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return updated;
    });
  };

  // Handle category image upload
  const handleCategoryImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewCategoryImage(file);
      setNewCategoryImagePreview(URL.createObjectURL(file));
    }
  };

  const removeCategoryImage = () => {
    if (newCategoryImagePreview) {
      URL.revokeObjectURL(newCategoryImagePreview);
    }
    setNewCategoryImage(null);
    setNewCategoryImagePreview("");
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName || !newCategorySlug) return;

    try {
      if (!newCategoryImage) return;
      const formData = new FormData();
      formData.append("image", newCategoryImage);
      formData.append("name", newCategoryName);
      formData.append("slug", newCategorySlug);

      // Create category
      const res = await fetch("/api/categories/create-category", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error occured!");
      toast.success("Category created successfully !");
      const data = await res.json();

      setCategories([...categories, data.category]);
      setCategoryId(data.category.id);

      // Reset form
      setNewCategoryName("");
      setNewCategorySlug("");
      removeCategoryImage();
      setShowCategoryModal(false);
    } catch (error) {
      console.error("Error creating category");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const {
      nameAr: finalNameAr,
      nameFr: finalNameFr,
      nameEn: finalNameEn,
      descriptionAr: finalDescAr,
      descriptionFr: finalDescFr,
      descriptionEn: finalDescEn,
    } = normalizeLanguages();

    if (!finalNameAr && !finalNameFr && !finalNameEn) {
      toast.error("Please enter at least one product name");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      for (const imgPreview of imagePreviews) {
        formData.append("images", imgPreview.file);
      }

      formData.append("buyingPrice", String(buyingPrice));
      formData.append("regularPrice", String(regularPrice));
      formData.append("regularPriceText", String(regularPriceText));
      formData.append("promoPrice", String(promoPrice));
      formData.append("promoPriceText", String(promoPriceText));
      formData.append("youtubeVideoUrl", youtubeVideoUrl);

      formData.append("stock", String(stock));
      formData.append("minimumStock", String(minimumStock));
      // formData.append("priceText", priceText || "");
      formData.append("categoryId", categoryId || "");
      formData.append("variants", JSON.stringify(variants));

      // 🔥 HERE IS THE IMPORTANT PART
      const translations = [
        {
          language: "ar",
          name: finalNameAr,
          description: finalDescAr,
        },
        {
          language: "fr",
          name: finalNameFr,
          description: finalDescFr,
        },
        {
          language: "en",
          name: finalNameEn,
          description: finalDescEn,
        },
      ];

      formData.append("translations", JSON.stringify(translations));

      // if you have addons
      formData.append("addons", JSON.stringify(addons || []));

      // Create product
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        body: formData,
      });

      if (res.ok) {
        // Clean up preview URLs
        imagePreviews.forEach((img) => URL.revokeObjectURL(img.preview));
        router.push(`/${{ lang }}/admin/products`);
      }
    } catch (error) {
      console.error("Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  //  headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         name,
  //         description,
  //         price: parseFloat(price),
  //         stock: parseInt(stock),
  //         images: imageUrls,
  //         categoryId: categoryId || null,
  //       })

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((img) => URL.revokeObjectURL(img.preview));
      if (newCategoryImagePreview) URL.revokeObjectURL(newCategoryImagePreview);
    };
  }, []);

  function onAddExisting(selected) {
    setAddons((prev) => [
      ...prev,
      {
        addonProductId: selected,
        required: false,
      },
    ]);
  }

  const handleAddVariant = () => {
    const newVariant = {
      id: variants.length > 0 ? Math.max(...variants.map((v) => v.id)) + 1 : 1,
      isActive: true,
      // manageStock: true,
      stock: 0,
      buyingPrice: buyingPrice,
      regularPrice: regularPrice,
      promoPrice: promoPrice,
      profit: profit,
      color: "",
      image: null,
      expanded: true,
    };
    setVariants([...variants, newVariant]);
  };

  const sellingPrice =
    promoPrice !== null && promoPrice > 0 ? promoPrice : regularPrice;

  const profit = (sellingPrice - buyingPrice).toFixed(2);

  return (
    <div className="p-4">
      {isOpen && (
        <PopUp
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          children={<></>}
        />
      )}

      {isVariableOpen && (
        <PopUp
          isOpen={isVariableOpen}
          onClose={() => setIsVariableOpen(false)}
          title="Variable"
          children={
            <>
              <Variant
                setVariants={setVariants}
                variants={variants}
                handleAddVariant={handleAddVariant}
              />
            </>
          }
        />
      )}

      {/* means any product will go to inventory */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Update Product</h1>
        <p className="text-slate-600 mt-2">
          updating product Id #{id.slice(0, 7)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Product Name Ar*
              </label>
              <input
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="e.g., Mountain Bike Pro 2024"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                required
              />

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Product Name Fr*
              </label>
              <input
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="e.g., Mountain Bike Pro 2024"
                value={nameFr}
                onChange={(e) => setNameFr(e.target.value)}
                required
              />

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Product Name En*
              </label>
              <input
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="e.g., Mountain Bike Pro 2024"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description Ar*
              </label>
              <textarea
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                placeholder="Describe your product in detail..."
                rows={4}
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
              />

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description Fr*
              </label>
              <textarea
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                placeholder="Describe your product in detail..."
                rows={4}
                value={descriptionFr}
                onChange={(e) => setDescriptionFr(e.target.value)}
              />

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description En*
              </label>
              <textarea
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                placeholder="Describe your product in detail..."
                rows={4}
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
              />
            </div>

            <div className="my-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Product Type*
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* FIXED BUTTON */}
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
      }
    `}
                >
                  <Box className="w-4 h-4" />
                  Fixed Product
                </button>

                {/* VARIABLE BUTTON */}
                <button
                  type="button"
                  onClick={() => {
                    setProductType("VARIABLE");
                    handleAddVariant();
                    setIsVariableOpen(!isVariableOpen);
                  }}
                  className={`flex items-center justify-between px-4 py-3 border rounded-lg text-sm font-medium transition-all
      ${
        productType === "VARIABLE"
          ? "bg-emerald-50 border-emerald-500 text-emerald-700"
          : "border-slate-300 text-slate-600 hover:bg-slate-50"
      }
    `}
                >
                  <div className="flex items-center gap-2">
                    <PaintRollerIcon className="w-4 h-4" />
                    Variable Product
                  </div>

                  <span
                    className={`transition-transform ${
                      isVariableOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Minimum Stock Quantity *
              </label>
              <input
                type="number"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="3"
                value={minimumStock}
                onChange={(e) => setMinimumStock(Number(e.target.value))}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {/* Pricing Section */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {/* Prix d'achat */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Prix d'achat
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={buyingPrice}
                      onChange={(e) =>
                        setBuyingPrice(parseFloat(e.target.value) || 0)
                      }
                      className="px-3 py-2 border rounded-md"
                    />
                  </div>

                  {/* Prix régulier */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Prix régulier
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={regularPrice}
                      onChange={(e) =>
                        setRegularPrice(parseFloat(e.target.value) || 0)
                      }
                      className="px-3 py-2 border rounded-md"
                    />

                    {/* Regular price text */}
                    {regularPrice > 0 && (
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Price in text
                        </label>
                        <input
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg
        focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="500 الف"
                          value={regularPriceText}
                          onChange={(e) => setRegularPriceText(e.target.value)}
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Prix promo */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Prix promo
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={promoPrice ?? ""}
                      placeholder="Optionnel"
                      onChange={(e) =>
                        setPromoPrice(
                          e.target.value === ""
                            ? null
                            : parseFloat(e.target.value),
                        )
                      }
                      className="px-3 py-2 border rounded-md"
                    />

                    {/* Promo price text */}
                    {promoPrice !== null && promoPrice > 0 && (
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Price in text
                        </label>
                        <input
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg
        focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="450 الف"
                          value={promoPriceText}
                          onChange={(e) => setPromoPriceText(e.target.value)}
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Profit */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Profit
                    </label>
                    <input
                      type="text"
                      value={`${profit} Da`}
                      disabled
                      className={`px-3 py-2 border rounded-md font-semibold ${
                        profit < 0
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Youtube video url
                </label>
                <input
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="https://youtube.com/?"
                  value={youtubeVideoUrl}
                  onChange={(e) => setYoutubeVideoUrl(e.target.value)}
                  required
                />

                <button
                  onClick={() => setOpen(!open)}
                  className="my-2 self-start xs:self-auto px-3 sm:px-4 py-2 mb-2 bg-black text-white rounded-lg hover:bg-teal-600 transition flex items-center gap-2 text-xs sm:text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Addition
                </button>

                {open && (
                  <div className="absolute z-10 bg-white border rounded-lg shadow-md p-3 w-64">
                    <p className="text-sm font-semibold mb-2">
                      Choose Existing:
                    </p>

                    <select
                      className="w-full border rounded p-2 text-sm mb-3"
                      value={selected}
                      onChange={(e) => setSelected(e.target.value)}
                    >
                      <option value="">Select addition...</option>

                      {additions.map((add) => (
                        <option key={add.id} value={add.id}>
                          {getTranslations(add.translations, { lang }, "name")}
                        </option>
                      ))}
                    </select>

                    <button
                      disabled={!selected}
                      onClick={() => {
                        onAddExisting(selected);
                        setOpen(false);
                        setSelected("");
                      }}
                      className="w-full bg-teal-600 text-white py-2 rounded mb-2 disabled:opacity-50"
                    >
                      Add Selected
                    </button>

                    <hr className="my-2" />

                    <button
                      onClick={() => {
                        setIsOpen(true);
                      }}
                      className="w-full bg-gray-100 hover:bg-gray-200 py-2 rounded text-sm"
                    >
                      + Create New Addition
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category Selection Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Category
          </h2>

          <div className="flex gap-3">
            <select
              className="flex-1 px-4 py-2.5 text-black border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {getTranslations(cat.translations, { lang }, "name")}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className="px-4 py-2.5 bg-teal-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Category</span>
            </button>
          </div>
        </div>

        {/* Images Upload Card */}
        <ImageUploader type="many" images={images} setImages={setImages} />

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || imagePreviews.length === 0}
            className="px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:bg-slate-300 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                Update Product
              </>
            )}
          </button>
        </div>
      </form>

      {/* Create Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Create New Category
              </h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category Name *
                </label>
                <input
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="e.g., Mountain Bikes"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Slug (Auto-generated) *
                </label>
                <input
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-slate-50"
                  placeholder="mountain-bikes"
                  value={newCategorySlug}
                  onChange={(e) => setNewCategorySlug(e.target.value)}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Used in URLs. Edit if needed.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category Image
                </label>

                {newCategoryImagePreview ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-slate-200 group">
                    <Image
                      src={newCategoryImagePreview}
                      alt="Category preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <button
                        type="button"
                        onClick={removeCategoryImage}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="block w-full h-48 border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCategoryImageSelect}
                      className="hidden"
                    />
                    <div className="h-full flex flex-col items-center justify-center gap-2">
                      <ImageIcon className="w-12 h-12 text-slate-400" />
                      <p className="text-sm font-medium text-slate-600">
                        Click to upload image
                      </p>
                      <p className="text-xs text-slate-500">
                        PNG, JPG (Max 5MB)
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateCategory}
                disabled={!newCategoryName || !newCategorySlug}
                className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProductPage;
