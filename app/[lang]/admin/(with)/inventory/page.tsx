"use client";

import { useEffect, useState } from "react";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  TrendingDown,
  Download,
  Plus,
  Minus,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import PopUp from "@/components/PopUp";
import { useLang } from "@/components/LanguageContext";
import toast from "react-hot-toast";
import { getTranslations } from "@/lib/getTranslations";
import Loader from "@/components/Loader";
import AveragePricePopUp from "@/components/AveragePricePopUp";

export default function InventoryManagementPage() {
  const stats = {
    stockValue: "258 100 DA",
    stockItems: "139 items",
    totalOperations: "18",
    operationsRatio: "11 in / 7 out",
    lowStock: "1",
    outOfStock: "2",
  };
  const { lang } = useLang();
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [isStockOutOpen, setIsStockOutOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [isEditingOpen, setIsEditingOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [overridePrice, setOverridePrice] = useState("");
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [operations, setOperations] = useState<any[]>([]);

  const [data, setData] = useState({
    stats: {
      stockPrice: 0,
      totalOperations: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      totalProducts: 0,
    },

    data: {
      lowStockProducts: 0,
      outOfStockProducts: 0,
    },
  });

  // const [isLoading , setIsLoading] = useState(true)
  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        const [statsRes, productsRes, operationsRes] = await Promise.all([
          fetch("/api/inventory/get-stats"),
          fetch("/api/products/get-products"),
          fetch("/api/inventory/get-operations"),
        ]);

        if (!statsRes.ok) throw new Error("Failed to fetch inventory stats");
        if (!productsRes.ok) throw new Error("Failed to fetch products");
        if (!operationsRes.ok) throw new Error("Failed to fetch operations");

        const statsData = await statsRes.json();
        const { products } = await productsRes.json();
        const { operations } = await operationsRes.json();

        if (!isMounted) return;

        setData(statsData);
        setProducts(products);
        setOperations(operations);
      } catch (error) {
        console.error(error);
        toast.error("Error loading dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  // derive selectedProduct when id changes
  useEffect(() => {
    const found = products.find((p : any) => p.id === selectedProductId) ?? null;
    setSelectedProduct(found);
    setPurchasePrice(0);
    setQuantity(0);
  }, [selectedProductId]);

  const handleStockIn = async () => {
    try {
      const res = await fetch("/api/inventory/create-operation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity: Number(quantity),
          price: Number(purchasePrice), // unit price
          type: "IN",
          reason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create operation");
      }

      console.log("Stock In operation created:", data);
      toast.success("Stock successfully added");
      setData((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          stockPrice: purchasePrice * quantity,
        },
      }));
      setIsStockInOpen(false);
      setSelectedProduct(null);
      setPurchasePrice(0);
      setQuantity(0);
      setReason("");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const handleStockOut = async () => {
    try {
      const res = await fetch("/api/inventory/create-operation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity: Number(quantity),
          price: Number(purchasePrice), // unit price
          type: "OUT",
          reason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create operation");
      }

      console.log("Stock Out operation created:", data);
      toast.success("Stock successfully removed");
      setOperations((prev) => [data.operation, ...prev]);

      setData((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          stockPrice: (prev.stats.stockPrice || 0) - purchasePrice * quantity,
        },
      }));
      setIsStockOutOpen(false);
      setSelectedProduct(null);
      setPurchasePrice(0);
      setQuantity(0);
      setReason("");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const handleExportList = () => {
    console.log("Export low stock list");
  };

  const handleView = (id: string) => {
    console.log("View operation:", id);
  };

  function openEditPopup(operation : any) {
    setSelectedOperation(operation);
    setIsEditingOpen(true);
  }

  function openDeletePopup(operation : any) {
    setSelectedOperation(operation);
    setIsDeleteOpen(true);
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4">
      {/* ── Delete Popup ─────────────────────────────────────────────────────── */}
      {isDeleteOpen && (
        <PopUp
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          children={
            <div className="w-full flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Delete Operation
              </h2>
              <p className="mt-3 text-sm text-gray-600">
                Are you sure you want to delete this operation?
                <br />
                <span className="text-red-500 font-medium">
                  This action cannot be undone.
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

      {/* ── Edit Popup ───────────────────────────────────────────────────────── */}
      {isEditingOpen && (
        <PopUp
          isOpen={isEditingOpen}
          onClose={() => setIsEditingOpen(false)}
          children={<>Operation info</>}
        />
      )}

      {/* ── Stock In Popup ───────────────────────────────────────────────────── */}
      {isStockInOpen && (
        <PopUp
          isOpen={isStockInOpen}
          onClose={() => setIsStockInOpen(false)}
          title="Stock In"
          children={
            <div className="flex flex-col gap-4 sm:gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Sélectionner un produit
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition"
                >
                  <option value="" disabled>
                    -- Choisir un produit --
                  </option>
                  {products.map((p : any) => (
                    <option key={p.id} value={p.id}>
                      {getTranslations(p.translations,  lang , "name")} -
                      Stock: {p.stock} - UnitPrice: {p.buyingPrice} Da
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Prix d'achat (unitaire)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value as any as any)}
                    placeholder="0"
                    className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition"
                  />
                  <AveragePricePopUp
                    currentPrice={Number(purchasePrice) || 0}
                    newPrice={overridePrice}
                    setNewPrice={setOverridePrice}
                    isOpen={isOverrideOpen}
                    onToggle={() => setIsOverrideOpen((v) => !v)}
                    onConfirm={(price : any) => {
                      setPurchasePrice(price);
                      setIsOverrideOpen(false);
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Quantité
                </label>
                <input
                  type="number"
                  min={0}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value as any as any)}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Raison (optionnel)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex. Nouvel achat, retour client"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => {}}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleStockIn}
                  disabled={!selectedProductId || !quantity || loading}
                  className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          }
        />
      )}

      {/* ── Stock Out Popup ──────────────────────────────────────────────────── */}
      {isStockOutOpen && (
        <PopUp
          isOpen={isStockOutOpen}
          onClose={() => setIsStockOutOpen(false)}
          children={
            <div className="flex flex-col gap-4 sm:gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Sélectionner un produit
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition"
                >
                  <option value="">-- Choisir un produit --</option>
                  {products.map((p : any) => (
                    <option key={p.id} value={p.id}>
                      {getTranslations(p.translations,  lang , "name")} -
                      Stock: {p.stock} - UnitPrice: {p.buyingPrice} Da
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="bg-gray-50 rounded-xl px-4 py-3 flex flex-col gap-0.5">
                  <span className="text-xs text-gray-400">Produit</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {getTranslations(
                      selectedProduct.translations,
                       lang ,
                      "name",
                    )}
                  </span>
                  {selectedProduct.sku && (
                    <span className="text-xs text-gray-400">
                      SKU: {selectedProduct.sku}
                    </span>
                  )}
                  <span className="text-xs text-orange-500 font-medium mt-0.5">
                    Stock actuel: {selectedProduct.stock}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Prix d'achat (unitaire)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value as any)}
                    placeholder="0"
                    className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition"
                  />
                  <AveragePricePopUp
                    currentPrice={Number(purchasePrice) || 0}
                    newPrice={overridePrice}
                    setNewPrice={setOverridePrice}
                    isOpen={isOverrideOpen}
                    onToggle={() => setIsOverrideOpen((v) => !v)}
                    onConfirm={(price : any) => {
                      setPurchasePrice(price);
                      setIsOverrideOpen(false);
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Quantité
                </label>
                <input
                  type="number"
                  min={0}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value as any)}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Raison (optionnel)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex. Nouvel achat, retour client"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => {}}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleStockOut}
                  disabled={!selectedProductId || !quantity || loading}
                  className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          }
        />
      )}

      {/* ── Page Content ─────────────────────────────────────────────────────── */}
      <div>
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
            Inventory Management
          </h1>
        </div>

        {/* ── Stats Cards ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          {/* Stock Value */}
          <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 mr-2">
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mb-1">
                  Stock Value
                </p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                  {data.stats.stockPrice}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  {data.stats.totalProducts || 0}
                </p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Operations */}
          <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 mr-2">
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mb-1">
                  <span className="hidden sm:inline">Total Operations</span>
                  <span className="sm:hidden">Operations</span>
                </p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  {data.stats.totalOperations}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  {stats.operationsRatio}
                </p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Low Stock */}
          <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
              <div className="min-w-0 flex-1 mr-2">
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mb-1">
                  Low Stock
                </p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">
                  {data.stats.lowStockCount}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  products
                </p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-orange-600" />
              </div>
            </div>
            <button
              onClick={handleExportList}
              className="w-full px-2 sm:px-4 py-1.5 sm:py-2 bg-orange-600 text-white text-xs sm:text-sm rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <Download size={13} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Export List</span>
              <span className="xs:hidden">Export</span>
            </button>
          </div>

          {/* Out of Stock */}
          <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 mr-2">
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mb-1">
                  <span className="hidden sm:inline">Out of Stock</span>
                  <span className="sm:hidden">Out Stock</span>
                </p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">
                  {data.stats.outOfStockCount}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  products
                </p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Add New Operation ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Add New Operation
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => {
                setSelectedProduct(null);
                setPurchasePrice(0);
                setQuantity(0);
                setReason("");
                setSelectedProductId("");
                setIsStockInOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm sm:text-base md:text-lg"
            >
              <Plus size={20} className="sm:w-6 sm:h-6 flex-shrink-0" />
              <span>
                Stock In
                <span className="hidden sm:inline"> (Entrée)</span>
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedProduct(null);
                setPurchasePrice(0);
                setQuantity(0);
                setReason("");
                setSelectedProductId("");
                setIsStockOutOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold text-sm sm:text-base md:text-lg"
            >
              <Minus size={20} className="sm:w-6 sm:h-6 flex-shrink-0" />
              <span>
                Stock Out
                <span className="hidden sm:inline"> (Sortie)</span>
              </span>
            </button>
          </div>

          <p className="text-center text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
            Click a button to add a stock in or stock out operation
          </p>
        </div>

        {/* ── Operations Ledger ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-xl font-semibold text-gray-900">
              Operations & Stock Ledger
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
              All operations with running stock balance
            </p>
          </div>

          {/* Desktop table (md+) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    "Date",
                    "Product",
                    "Type",
                    "Quantity",
                    "Stock After",
                    "Reason",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {operations.map((operation) => (
                  <tr
                    key={operation.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {operation.createdAt}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">
                        {operation.product}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {operation.variant}
                      </div>
                      <div className="text-gray-400 text-xs">
                        Cost: {operation.price || operation.cost}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                          operation.type === "IN"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {operation.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {operation.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                      {operation.stock}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {operation.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleView(operation.id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEditPopup(operation)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => openDeletePopup(operation)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/tablet card list (below md) */}
          <div className="md:hidden divide-y divide-gray-100">
            {operations.map((operation) => (
              <div
                key={operation.id}
                className="p-3 sm:p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Row 1: product name + type badge */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {operation.product}
                    </p>
                    {operation.variant && (
                      <p className="text-[11px] text-gray-400 truncate">
                        {operation.variant}
                      </p>
                    )}
                  </div>
                  <span
                    className={`flex-shrink-0 inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                      operation.type === "IN"
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {operation.type}
                  </span>
                </div>

                {/* Row 2: qty · stock after · cost */}
                <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                  <span className="text-xs font-semibold text-gray-700">
                    Qty: {operation.quantity}
                  </span>
                  <span className="text-gray-300 text-xs">·</span>
                  <span className="text-xs font-semibold text-blue-600">
                    After: {operation.stock}
                  </span>
                  <span className="text-gray-300 text-xs">·</span>
                  <span className="text-xs text-gray-500">
                    Cost: {operation.price || operation.cost || "—"}
                  </span>
                </div>

                {/* Row 3: date + reason + actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-gray-400">
                      {operation.createdAt}
                    </p>
                    {operation.reason && (
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {operation.reason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => handleView(operation.id)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => openEditPopup(operation)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={() => openDeletePopup(operation)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {operations.length === 0 && (
            <div className="text-center py-10 sm:py-12">
              <Package
                size={40}
                className="mx-auto text-gray-400 mb-3 sm:w-12 sm:h-12"
              />
              <p className="text-gray-500 text-sm">No operations found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
