"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  GripVertical,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { useLang } from "@/components/LanguageContext";
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
  const router = useRouter();

  const [nameAr, setNameAr] = useState("");
  const [nameFr, setNameFr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const { lang } = useLang();
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [buyingPrice, setBuyingPrice] = useState(0);
  const [regularPrice, setRegularPrice] = useState(0);
  const [promoPrice, setPromoPrice] = useState<any>(0);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [products, setProducts] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState<File | null>(null);
  const [newCategoryImagePreview, setNewCategoryImagePreview] =
    useState<string>("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isListed, setIsListed] = useState<"yes" | "no">("yes");
  const [attachToProduct, setAttachToProduct] = useState("");
  const [images, setImages] = useState([]);
  const [priceText, setPriceText] = useState("");
  const [type, setType] = useState<"PRODUCT" | "ADDITION">("PRODUCT");
  const [translations, setTranslations] = useState<Translation[]>([
    { language: "ar", name: "", description: "" },
    { language: "fr", name: "", description: "" },
    { language: "en", name: "", description: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addons, setAddons] = useState<Addon[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products/get-products");

        if (!res.ok) {
          throw new Error("Error fetching products");
        }

        const { products } = await res.json();
        setProducts(products);
      } catch (error) {
        toast.error("Error fetching products");
        console.error(error);
      }
    };

    fetchProducts();
  }, []);

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

 

  const normalizeLanguages = () => {
    const finalNameAr = nameAr || nameFr || nameEn || "";
    const finalNameFr = nameFr || nameAr || nameEn || "";
    const finalNameEn = nameEn || nameFr || nameAr || "";

    return {
      nameAr: finalNameAr,
      nameFr: finalNameFr,
      nameEn: finalNameEn,
    };
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
      formData.append("promoPrice", String(promoPrice));
      formData.append("priceText", priceText);
      formData.append("stock", stock);

      const translations = [
        {
          language: "ar",
          name: finalNameAr,
        },
        {
          language: "fr",
          name: finalNameFr,
        },
        {
          language: "en",
          name: finalNameEn,
        },
      ];

      formData.append("translations", JSON.stringify(translations));

      // Create product
      const res = await fetch("/api/products/additions/create-addition", {
        method: "POST",
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

  const sellingPrice =
    promoPrice !== null && promoPrice > 0 ? promoPrice : regularPrice;

  const profit : any = (sellingPrice - buyingPrice).toFixed(2);

  return (
    <div className="p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Create New Addition <small>(Linked to a product)</small>{" "}
        </h1>
        <p className="text-slate-600 mt-2">
          add a new addition to your product
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
                placeholder="e.g., Bolt size 12"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                required
              />

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Product Name Fr*
              </label>
              <input
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="e.g.,  Bolt size 12"
                value={nameFr}
                onChange={(e) => setNameFr(e.target.value)}
                required
              />

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Product Name En*
              </label>
              <input
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="e.g.,  Bolt size 12"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
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
                    </div>
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

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Price in Text
                </label>
                <input
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="5 الاف"
                  value={priceText}
                  onChange={(e) => setPriceText(e.target.value)}
                  required
                />
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
            </div>
          </div>
        </div>

        {/* Images Upload Card */}
        <ImageUploader type="one" images={images} setImages={setImages} />

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
                Creating...
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

export default CreateProductPage;
