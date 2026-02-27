"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useLang } from "@/components/LanguageContext";
import Loader from "@/components/Loader";
import { getTranslations } from "@/lib/getTranslations";
import Image from "next/image";
import PopUp from "@/components/PopUp";

type Product = {
  id: string;
  nom: string;
  ventes: number;
  revenus: number;
  stock: number;
};

const Page = () => {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { lang } = useLang();
  const [isEditingOpen, setIsEditingOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [type, setType] = useState<"PRODUCT" | "ADDITION">("PRODUCT");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Run both requests in parallel
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/products/get-products"),
          fetch("/api/categories/get-categories"),
        ]);

        if (!productsRes.ok || !categoriesRes.ok) {
          throw new Error("Error occurred while fetching data");
        }

        const { products } = await productsRes.json();
        const { categories } = await categoriesRes.json();

        setProducts(products);
        setCategories(categories);
      } catch (error) {
        toast.error("Error occurred: try again later");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeactivateProduct = async () => {
    try {
      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      toast.success(data.message || "Product deactivated successfully");
      setProducts((prev) =>
        prev.filter((product) => product.id !== selectedProduct.id),
      );
    } catch (error : any) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };



  function openDeletePopup(product : any) {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  }

  const exportProducts = async () => {
    const res = await fetch("/api/products/export");
    const blob = await res.blob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="bg-white min-h-screen border-gray-200 p-3 sm:p-4">
      {isDeleteOpen && (
        <PopUp
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          children={
            <div className="w-full flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Deactivate Product
              </h2>
              <p className="text-sm text-gray-500">
                Note: You can only deactive this product if it has no associated
                orders.
              </p>
              <p className="mt-3 text-sm text-gray-600">
                Are you sure you want to deactive this product?
                <br />
                <span className="text-red-500 font-medium">
                  you can update it later.
                </span>
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeactivateProduct();
                    setIsDeleteOpen(false);
                  }}
                  className="px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
                >
                  Yes, Sure
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
          children={<>Product info</>}
        />
      )}

      {/* ── Action buttons ───────────────────────────────────────────────── */}
      <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2 mb-4">
        {/* Left group */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <button
            onClick={() => router.push(`/${ lang }/admin/products/new`)}
            className="flex-1 xs:flex-none px-2.5 sm:px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition flex items-center justify-center gap-1.5 text-xs sm:text-sm whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>New Product</span>
          </button>

          <button
            onClick={() => router.push(`/${ lang }/admin/additions/new`)}
            className="flex-1 xs:flex-none px-2.5 sm:px-4 py-2 bg-black text-white rounded-lg hover:bg-teal-600 transition flex items-center justify-center gap-1.5 text-xs sm:text-sm whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>New Addition</span>
          </button>

          <button
            onClick={() => router.push(`/${ lang }/admin/packs/new`)}
            className="flex-1 xs:flex-none px-2.5 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-teal-600 transition flex items-center justify-center gap-1.5 text-xs sm:text-sm whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="hidden sm:inline">New Pack +2 Items</span>
            <span className="sm:hidden">New Pack</span>
          </button>
        </div>

        {/* Right group */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <button
            onClick={() => router.push(`/${ lang }/admin/products/import`)}
            className="flex-1 xs:flex-none px-2.5 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-teal-600 transition flex items-center justify-center gap-1.5 text-xs sm:text-sm whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Import en masse</span>
            <span className="sm:hidden">Import</span>
          </button>

          <button
            onClick={exportProducts}
            className="flex-1 xs:flex-none px-2.5 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-teal-600 transition flex items-center justify-center gap-1.5 text-xs sm:text-sm whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Export Excel</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* ── Statistics Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 md:p-5 hover:shadow-md transition-shadow">
          <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 mb-1">
            Total Products
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {products.length || 0}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 md:p-5 hover:shadow-md transition-shadow">
          <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 mb-1">
            En attente
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            0
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 md:p-5 hover:shadow-md transition-shadow">
          <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 mb-1">
            Approuvés
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            3
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 md:p-5 hover:shadow-md transition-shadow">
          <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 mb-1">
            Rejetés
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            1
          </p>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 my-2 w-full">
        {/* Search */}
        <div className="relative flex-1 group">
          <Search
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2
                       w-4 h-4 text-slate-400 group-focus-within:text-teal-600
                       transition-colors pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 sm:pl-12 pr-4 py-2.5
                       bg-white border border-slate-200 rounded-xl
                       text-sm focus:outline-none focus:border-teal-500
                       focus:ring-2 focus:ring-teal-100 transition-all shadow-sm"
          />
        </div>

        <div className="flex gap-2">
          {/* Type Filter */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="flex-1 sm:w-40 md:w-48 px-3 py-2.5 bg-white border border-slate-200
                       rounded-xl text-sm focus:outline-none focus:border-teal-500
                       focus:ring-2 focus:ring-teal-100 transition"
          >
            <option value="PRODUCT">Products</option>
            <option value="ADDITION">Additions</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 sm:w-40 md:w-48 px-3 py-2.5 bg-white border border-slate-200
                       rounded-xl text-sm focus:outline-none focus:border-teal-500
                       focus:ring-2 focus:ring-teal-100 transition"
          >
            <option value="">All Categories</option>
            {categories.map((cat : any) => (
              <option key={cat.id} value={cat.slug}>
                {getTranslations(cat.translations,  lang , "name")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Product List ─────────────────────────────────────────────────── */}
      <div className="space-y-0 rounded-2xl border overflow-hidden">
        {products.length === 0 && (
          <div className="text-center text-sm text-gray-500 py-6">
            Aucun produit populaire pour le moment
          </div>
        )}

        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4
                       bg-white border-b border-gray-200
                       hover:bg-gray-50 transition-colors duration-150"
          >
            {/* Image */}
            <div className="relative flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
              <Image
                src={product.images?.[0]}
                alt=""
                fill
                className="rounded-xl sm:rounded-2xl border object-cover"
              />
            </div>

            {/* Name — always visible, truncates */}
            <div
              onClick={() => router.push(`/${ lang }/products/${product.id}`)}
              className="flex-1 min-w-0 cursor-pointer hover:underline
                         text-xs sm:text-sm font-medium text-gray-900 truncate"
            >
              {getTranslations(product.translations,  lang , "name")}
            </div>

            {/* Price — hidden on very small screens */}
            <div className="hidden xs:block flex-shrink-0 text-xs sm:text-sm font-semibold text-gray-900 tabular-nums">
              {product.regularPrice.toLocaleString()} DA
            </div>

            {/* Stock badge — hidden below sm */}
            <div
              className={`hidden sm:flex flex-shrink-0 items-center px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-semibold ${
                product.stock < product.minimumStock
                  ? "bg-red-100 text-red-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {product.stock}
              <span className="hidden md:inline ml-1">en stock</span>
            </div>

            {/* Status badge — hidden below md */}
            <div className="hidden md:block flex-shrink-0 w-20">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                Actif
              </span>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex items-center gap-0.5 sm:gap-1">
              {/* View — always show */}
              <button
                onClick={() =>
                  router.push(`/${ lang }/products/${product.id}`)
                }
                className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Voir les détails"
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Edit — always show */}
              <button
                onClick={() =>
                  router.push(`/${ lang }/admin/products/new?update=${product.id}`)
                }
                className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Modifier"
              >
                <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Delete — always show */}
              <button
                onClick={() => openDeletePopup(product)}
                className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
