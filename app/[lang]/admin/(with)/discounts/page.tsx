"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Percent, Users, Calendar } from "lucide-react";
import PopUp from "@/components/PopUp";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";
import { getTranslations } from "@/lib/getTranslations";
import { useLang } from "@/components/LanguageContext";
import Image from "next/image";

export default function DiscountsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingOpen, setIsEditingOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const { lang } = useLang();

  useEffect(() => {
    const fetchData = async () => {
      try {
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

  const [discounts, setDiscounts] = useState([
    {
      id: "1",
      name: "",
      type: "Percentage",
      value: "15%",
      customers: "Old",
      startDate: "11/3/2025",
      endDate: "12/3/2025",
      usage: { used: 0, limit: 100 },
      status: "Active",
    },
  ]);

  function openEditPopup(discount : any) {
    setSelectedDiscount(discount);
    setIsEditingOpen(true);
  }

  function openDeletePopup(discount : any) {
    setSelectedDiscount(discount);
    setIsDeleteOpen(true);
  }

  const handleNewDiscount = () => {
    console.log("Create new discount");
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {isDeleteOpen && (
        <PopUp
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          children={
            <div className="w-full flex flex-col items-center justify-center p-6 text-center">
              {/* Title */}
              <h2 className="text-lg font-semibold text-gray-900">
                Delete current "Discount"
              </h2>

              {/* Message */}
              <p className="mt-3 text-sm text-gray-600">
                Are you sure you want to delete this discount?
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
          children={<>Edit discount</>}
        />
      )}

      {isOpen && (
        <PopUp
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          children={
            <>
              <div className="flex flex-col gap-6 p-6 overflow-y-auto max-h-[700px]">
                {/* Name Fields */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Nom en arabe
                    </label>
                    <input
                      type="text"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Nom en français
                    </label>
                    <input
                      type="text"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Nom en anglais
                    </label>
                    <input
                      type="text"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Type, Value, and Client Type */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Type
                    </label>
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                      <option>Pourcentage</option>
                      <option>Montant fixe</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Valeur
                    </label>
                    <input
                      type="number"
                      defaultValue="0"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Type de client
                    </label>
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                      <option>Tous</option>
                      <option>Particulier</option>
                      <option>Professionnel</option>
                    </select>
                  </div>
                </div>

                {/* Date Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Date de début (Aujourd'hui)
                    </label>
                    <input
                      type="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      defaultValue="2026-03-15"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Minimum and Maximum Reduction */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Montant minimum (DA)
                    </label>
                    <input
                      type="number"
                      defaultValue="0"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Réduction max (DA)
                    </label>
                    <input
                      type="text"
                      placeholder="Optionnel"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Usage Limit */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Limite d'utilisation max
                  </label>
                  <input
                    type="text"
                    placeholder="Illimité"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Excluded Products */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Produits exclus de la réduction
                  </label>

                  <div className="border border-gray-300 rounded-md p-4 max-h-48 overflow-y-auto">
                    <div className="flex flex-col gap-3">
                      {products.length === 0 ? (
                        <p className="text-sm text-gray-400">
                          Aucun produit disponible
                        </p>
                      ) : (
                        products.map((product : any) => (
                          <label
                            key={product.id}
                            className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md"
                          >
                            <Image
                              src={product.images?.[0]}
                              alt=""
                              height={40}
                              width={40}
                            />

                            <input
                              type="checkbox"
                              className="mt-1 accent-teal-500"
                            />

                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-800">
                                {getTranslations(
                                  product.translations,
                                   lang ,
                                  "name",
                                )}
                              </span>

                              {/* <span className="text-xs text-gray-500">
                                {product.sku || "—"} • {product.price} DA
                              </span> */}
                            </div>
                          </label>
                        ))
                      )}
                    </div>

                    {/* <p className="text-xs text-gray-500 mt-3">
                      {products.filter((p) => p.excluded).length} produit(s)
                      exclu(s)
                    </p> */}
                  </div>
                </div>

                {/* Excluded Categories */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Catégories exclues de la réduction
                  </label>

                  <div className="border border-gray-300 rounded-md p-4 max-h-48 overflow-y-auto">
                    <div className="flex flex-col gap-3">
                      {categories.length === 0 ? (
                        <p className="text-sm text-gray-400">
                          Aucune catégorie disponible
                        </p>
                      ) : (
                        categories.map((category : any) => (
                          <label
                            key={category.id}
                            className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md"
                          >
                            <Image
                              src={category.imageUrl}
                              alt=""
                              height={40}
                              width={40}
                            />

                            <input
                              type="checkbox"
                              className="mt-1 accent-teal-500"
                            />

                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-800">
                                {getTranslations(
                                  category.translations,
                                   lang ,
                                  "name",
                                )}
                              </span>
                              <span className="text-xs text-gray-500">
                                Catégorie
                              </span>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Actif
                    </span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    Annuler
                  </button>
                  <button className="px-6 py-2 text-white bg-teal-500 rounded-md hover:bg-teal-600 flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Enregistrer
                  </button>
                </div>
              </div>
            </>
          }
        />
      )}

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">Discounts</h1>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
          >
            <Plus size={20} className="mr-2" />
            New Discount
          </button>
        </div>

        {/* Discounts Table */}
        {discounts.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
            No discount applied
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[300px]">
            {discounts.map((discount) => (
              <div key={discount.id} className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {discount.name || "Discount"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Active discount configuration
                    </p>
                  </div>

                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                    {discount.status}
                  </span>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Type */}
                  <div className="rounded-lg border p-5">
                    <div className="flex items-center text-gray-500 mb-2">
                      <Percent size={18} className="mr-2 text-teal-600" />
                      <span className="text-sm">Type</span>
                    </div>
                    <p className="text-xl font-semibold text-gray-900">
                      {discount.type}
                    </p>
                  </div>

                  {/* Value */}
                  <div className="rounded-lg border p-5">
                    <div className="flex items-center text-gray-500 mb-2">
                      <span className="text-sm">Value</span>
                    </div>
                    <p className="text-3xl font-bold text-teal-600">
                      {discount.value}
                    </p>
                  </div>

                  {/* Customers */}
                  <div className="rounded-lg border p-5">
                    <div className="flex items-center text-gray-500 mb-2">
                      <Users size={18} className="mr-2" />
                      <span className="text-sm">Customers</span>
                    </div>
                    <p className="text-xl font-semibold text-gray-900">
                      {discount.customers}
                    </p>
                  </div>
                </div>

                {/* Dates & Usage */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-lg border p-5">
                    <div className="flex items-center text-gray-500 mb-2">
                      <Calendar size={18} className="mr-2" />
                      <span className="text-sm">Valid Dates</span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {discount.startDate} – {discount.endDate}
                    </p>
                  </div>

                  <div className="rounded-lg border p-5">
                    <div className="text-gray-500 text-sm mb-2">Usage</div>
                    <p className="text-gray-900 font-medium">
                      {discount.usage.used} / {discount.usage.limit}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      openEditPopup(discount);
                    }}
                    className="text-xs px-3 py-2 rounded-md border border-teal-500 text-teal-600 hover:bg-teal-50 transition"
                  >
                    Edit
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      openDeletePopup(discount);
                    }}
                    className="text-xs w-24 px-3 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
