"use client";
import React, { useState } from "react";
import ImageUploader from "./ImageUploader";
import toast from "react-hot-toast";

const CreateCategory = ({
    categories ,
    setCategories,
    setShowCategoryModal
}: {
    categories : any[],
    setCategories : React.Dispatch<React.SetStateAction<any[]>>,
    setShowCategoryModal : React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const [images, setImages] = useState([]);

  const [nameAr, setNameAr] = useState("");
  const [nameFr, setNameFr] = useState("");
  const [nameEn, setNameEn] = useState("");

  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionFr, setDescriptionFr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");

  const [newCategorySlug, setNewCategorySlug] = useState("");

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
    descriptionEn: finalDescEn
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
      if (images.length === 0) return;
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

      setShowCategoryModal(false)
      setCategories([ data.category , ...categories]);
    //   setCategoryId(data.category.id);

      setNameAr("");
      setNameFr("");
      setNameEn("");

      setDescriptionAr("");
      setDescriptionFr("");
      setDescriptionEn("");
      // Reset form
    //   setNewCategoryName("");
      setNewCategorySlug("");
    //   removeCategoryImage();
    //   setShowCategoryModal(false);
    } catch (error) {
      console.error("Error creating category");
    }
  };

  return (
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
        <ImageUploader type="one" images={images} setImages={setImages} />
      </div>

      {/* Footer */}
      <div className=" px-6 py-4 flex flex-col sm:flex-row gap-3 justify-end">
        <button
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
  );
};

export default CreateCategory;
