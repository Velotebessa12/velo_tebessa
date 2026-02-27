"use client";

import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/components/LanguageContext";
import toast from "react-hot-toast";
import { ImageIcon, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PopUp from "@/components/PopUp";
import { getTranslations } from "@/lib/getTranslations";
import ImageUploader from "@/components/ImageUploader";

const Page = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const { lang } = useLang();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState<File | null>(null);
  const [newCategoryImagePreview, setNewCategoryImagePreview] =
    useState<string>("");
  const [images, setImages] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [nameFr, setNameFr] = useState("");
  const [nameEn, setNameEn] = useState("");

  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionFr, setDescriptionFr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");

  const [isEditingOpen, setIsEditingOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(null);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);

        const res = await fetch("/api/categories/get-categories");

        if (!res.ok) {
          throw new Error("Error fetching products");
        }

        const { categories } = await res.json();
        setCategories(categories);
      } catch (error) {
        toast.error("Error fetching products");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

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

  const removeCategoryImage = () => {
    if (newCategoryImagePreview) {
      URL.revokeObjectURL(newCategoryImagePreview);
    }
    setNewCategoryImage(null);
    setNewCategoryImagePreview("");
  };

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

  const handleCreateCategory = async () => {
    if (!newCategorySlug.trim()) {
      return "Category slug is required";
    }

    if (!images) {
      return "Category image is required";
    }

    const {
      nameAr: finalNameAr,
      nameFr: finalNameFr,
      nameEn: finalNameEn,
      descriptionAr: finalDescAr,
      descriptionFr: finalDescFr,
      descriptionEn: finalDescEn,
    } = normalizeLanguages();

    try {
      if (images.length !== 0) return;
      const formData = new FormData();
      formData.append("image", images[0]);
      formData.append("slug", newCategorySlug);

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

      setNameAr("");
      setNameFr("");
      setNameEn("");

      setDescriptionAr("");
      setDescriptionFr("");
      setDescriptionEn("");
      // Reset form
      setNewCategoryName("");
      setNewCategorySlug("");
      removeCategoryImage();
      setShowCategoryModal(false);
    } catch (error) {
      console.error("Error creating category");
    }
  };

  function openEditPopup(category: any) {
    // Names
    setNameAr(getTranslations(category?.translations, "ar", "name") || "");
    setNameFr(getTranslations(category?.translations, "fr", "name") || "");
    setNameEn(getTranslations(category?.translations, "en", "name") || "");

    // Descriptions
    setDescriptionAr(
      getTranslations(category?.translations, "ar", "description") || "",
    );
    setDescriptionFr(
      getTranslations(category?.translations, "fr", "description") || "",
    );
    setDescriptionEn(
      getTranslations(category?.translations, "en", "description") || "",
    );

    setNewCategorySlug(category?.slug || "");

    setImages([category?.imageUrl]);
    setSelectedCategory(category);
    setIsEditingOpen(true);
  }

  function openDeletePopup(category: any) {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  }

  return (
    <div className="p-4">
      {showCategoryModal && (
        <PopUp
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          children={
            <>
              <div className=" w-full max-w-4xl max-h-[90vh] flex flex-col ">
                {/* Header */}
                <div className="flex items-center justify-between px-6 ">
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">
                      Create New Category
                    </h1>
                    <p className="text-slate-600 mt-2">
                      Add a new category to your categories
                    </p>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="px-6 space-y-6">
                  {/* Category Names */}
                  <div className="space-y-6">
                    {/* Category Names */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Category Name (Arabic) *
                      </label>
                      <input
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg
        focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="e.g., إلكترونيات"
                        value={nameAr}
                        onChange={(e) => setNameAr(e.target.value)}
                      />

                      <label className="block text-sm font-medium text-slate-700 mt-4 mb-2">
                        Category Name (French) *
                      </label>
                      <input
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg
        focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="e.g., Électronique"
                        value={nameFr}
                        onChange={(e) => setNameFr(e.target.value)}
                      />

                      <label className="block text-sm font-medium text-slate-700 mt-4 mb-2">
                        Category Name (English) *
                      </label>
                      <input
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg
        focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="e.g., Electronics"
                        value={nameEn}
                        onChange={(e) => setNameEn(e.target.value)}
                      />
                    </div>

                    {/* Category Descriptions */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Description (Arabic)
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg resize-none
        focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Optional category description..."
                        value={descriptionAr}
                        onChange={(e) => setDescriptionAr(e.target.value)}
                      />

                      <label className="block text-sm font-medium text-slate-700 mt-4 mb-2">
                        Description (French)
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg resize-none
        focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Description optionnelle..."
                        value={descriptionFr}
                        onChange={(e) => setDescriptionFr(e.target.value)}
                      />

                      <label className="block text-sm font-medium text-slate-700 mt-4 mb-2">
                        Description (English)
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg resize-none
        focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Optional category description..."
                        value={descriptionEn}
                        onChange={(e) => setDescriptionEn(e.target.value)}
                      />
                    </div>
                  </div>
                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Slug (Important) *
                    </label>
                    <input
                      className="w-full px-4 py-2.5 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-emerald-500"
                      placeholder="mountain-bikes"
                      value={newCategorySlug}
                      onChange={(e) => setNewCategorySlug(e.target.value)}
                    />
                    <p className="text-xs text-slate-500 mt-1">Used in URLs</p>
                  </div>

                  {/* Image Upload */}
                  <ImageUploader
                    type="one"
                    images={images}
                    setImages={setImages}
                  />
                </div>

                {/* Footer */}
                <div className=" px-6 py-4 flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    onClick={() => setShowCategoryModal(false)}
                    className="w-full sm:w-auto px-4 py-2.5 border rounded-lg text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCategory}
                    disabled={!newCategorySlug}
                    className="w-full sm:w-auto px-4 py-2.5 cursor-pointer bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white rounded-lg"
                  >
                    Create Category
                  </button>
                </div>
              </div>
            </>
          }
        />
      )}

      {isDeleteOpen && (
        <PopUp
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          children={
            <div className="w-full flex flex-col items-center justify-center p-6 text-center">
              {/* Title */}
              <h2 className="text-lg font-semibold text-gray-900">
                Delete Category
              </h2>

              {/* Message */}
              <p className="mt-3 text-sm text-gray-600">
                Are you sure you want to delete this category?
                <br />
                <span className="text-red-500 font-medium">
                  This action cannot be undone.
                </span>
              </p>

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    console.log("Order deleted");
                    setIsDeleteOpen(false);
                  }}
                  className="px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          }
        />
      )}

      {isEditingOpen && (
        <PopUp
          isOpen={isEditingOpen}
          onClose={() => setIsEditingOpen(false)}
          children={
            <>
              <div className=" w-full max-w-4xl max-h-[90vh] flex flex-col ">
                {/* Header */}
                <div className="flex items-center justify-between px-6 ">
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">
                      Update category
                    </h1>
                    <p className="text-slate-600 mt-2">
                      update your categories easily
                    </p>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="px-6 space-y-6">
                  {/* Category Names */}
                  <div className="space-y-6">
                    {/* Category Names */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Category Name (Arabic) *
                      </label>
                      <input
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg
        focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="e.g., إلكترونيات"
                        value={nameAr}
                        onChange={(e) => setNameAr(e.target.value)}
                      />

                      <label className="block text-sm font-medium text-slate-700 mt-4 mb-2">
                        Category Name (French) *
                      </label>
                      <input
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg
        focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="e.g., Électronique"
                        value={nameFr}
                        onChange={(e) => setNameFr(e.target.value)}
                      />

                      <label className="block text-sm font-medium text-slate-700 mt-4 mb-2">
                        Category Name (English) *
                      </label>
                      <input
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg
        focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="e.g., Electronics"
                        value={nameEn}
                        onChange={(e) => setNameEn(e.target.value)}
                      />
                    </div>

                    {/* Category Descriptions */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Description (Arabic)
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg resize-none
        focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Optional category description..."
                        value={descriptionAr}
                        onChange={(e) => setDescriptionAr(e.target.value)}
                      />

                      <label className="block text-sm font-medium text-slate-700 mt-4 mb-2">
                        Description (French)
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg resize-none
        focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Description optionnelle..."
                        value={descriptionFr}
                        onChange={(e) => setDescriptionFr(e.target.value)}
                      />

                      <label className="block text-sm font-medium text-slate-700 mt-4 mb-2">
                        Description (English)
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg resize-none
        focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Optional category description..."
                        value={descriptionEn}
                        onChange={(e) => setDescriptionEn(e.target.value)}
                      />
                    </div>
                  </div>
                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Slug (Important) *
                    </label>
                    <input
                      className="w-full px-4 py-2.5 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-emerald-500"
                      placeholder="mountain-bikes"
                      value={newCategorySlug}
                      onChange={(e) => setNewCategorySlug(e.target.value)}
                    />
                    <p className="text-xs text-slate-500 mt-1">Used in URLs</p>
                  </div>

                  {/* Image Upload */}
                  <ImageUploader
                    type="one"
                    images={images}
                    setImages={setImages}
                  />
                </div>

                {/* Footer */}
                <div className=" px-6 py-4 flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    onClick={() => setShowCategoryModal(false)}
                    className="w-full sm:w-auto px-4 py-2.5 border rounded-lg text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCategory}
                    disabled={!newCategorySlug}
                    className="w-full sm:w-auto px-4 py-2.5 cursor-pointer bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white rounded-lg"
                  >
                    Update Category
                  </button>
                </div>
              </div>
            </>
          }
        />
      )}

      <button
        type="button"
        onClick={() => {
          setShowCategoryModal(true);
          setNameAr("");
          setNameFr("");
          setNameEn("");

          setDescriptionAr("");
          setDescriptionFr("");
          setDescriptionEn("");
          // Reset form
          setNewCategoryName("");
          setNewCategorySlug("");
          removeCategoryImage();
          setImages([]);
        }}
        className="px-4 py-2.5 mb-2 bg-teal-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">New Category</span>
      </button>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
        {isLoading
          ? [...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm"
              >
                <Skeleton className="w-full h-28 rounded-xl bg-gray-200 mb-3" />
                <Skeleton className="h-4 w-3/4 mx-auto rounded bg-gray-200 mb-3" />
                <Skeleton className="h-8 w-full rounded-lg bg-gray-200 mb-2" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-8 rounded-lg bg-gray-200" />
                  <Skeleton className="h-8 rounded-lg bg-gray-200" />
                </div>
              </div>
            ))
          : categories.map((category) => (
              <div
                key={category.id}
                className="group bg-white border border-gray-100 rounded-2xl p-3 shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-200"
              >
                {/* Image */}
                <div className="relative w-full h-28 mb-3 rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-gray-800 text-center truncate">
                  {getTranslations(category.translations,  lang , "name")}
                </h3>

                <p className="mb-2 text-xs text-gray-400 text-center line-clamp-2 leading-relaxed">
                  {getTranslations(
                    category.translations,
                     lang ,
                    "description",
                  )}
                </p>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      router.push(`/${{ lang }}/categories/${category.slug}`)
                    }
                    className="col-span-2 text-xs font-semibold px-3 py-2 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    View
                  </button>

                  <button
                    onClick={() => openEditPopup(category)}
                    className="text-xs font-semibold px-3 py-2 rounded-md border border-teal-400 text-teal-600 hover:bg-teal-50 transition-colors"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => openDeletePopup(category)}
                    className="text-xs font-semibold px-3 py-2 rounded-md bg-red-500 hover:bg-red-600 active:bg-red-700 text-white transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default Page;
