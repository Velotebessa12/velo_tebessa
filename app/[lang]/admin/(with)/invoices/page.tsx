"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  FileText,
  Clock,
  CheckCircle,
  Download,
  Eye,
  Package,
  Calculator,
} from "lucide-react";
import PopUp from "@/components/PopUp";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LanguageContext";
import { getTranslations } from "@/lib/getTranslations";
import AveragePricePopUp from "@/components/AveragePricePopUp";

export default function PurchaseInvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { lang } = useLang();
  const stats = {
    totalInvoices: "1",
    pendingAmount: "0 DA",
    totalAmount: "2 400 DA",
  };
  const [rows, setRows] = useState<any[]>([
    { id: Date.now(), productId: "", qty: 1, unitPrice: 0 },
  ]);

  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openRowId, setOpenRowId] = useState<number | null>(null);
  const [newPrice, setNewPrice] = useState<number | "">("");
  const [newPrices, setNewPrices] = useState([]);
  const [invoice, setInvoice] = useState({
    supplierName: "",
    contact: "",
    invoiceNumber: "",
    status: "PENDING" as "PENDING" | "RECEIVED" | "CANCELLED",
    notes: "",
  });

  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);

        const res = await fetch("/api/products/get-products");

        if (!res.ok) {
          throw new Error("Error occurred while fetching products");
        }

        const { products } = await res.json();
        setProducts(products);
      } catch (error) {
        toast.error("Error occurred: try again later");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch("/api/invoices/get-invoices");

        if (!res.ok) {
          throw new Error("Error fetching invoices");
        }

        const { invoices } = await res.json();
        setInvoices(invoices);
      } catch (error) {
        toast.error("Error fetching invoices");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts([]);
      return;
    }

    const q = searchQuery.toLowerCase();

    setFilteredProducts(
      products.filter((p : any) =>
        getTranslations(p.translations,  lang , "name")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [searchQuery, products, lang ]);

  const filteredInvoices = invoices.filter((invoice) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      invoice.id.toLowerCase().includes(search) ||
      invoice.orderId.toLowerCase().includes(search) ||
      (invoice.description?.toLowerCase().includes(search) ?? false);

    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Pending" && invoice.status === "PENDING") ||
      (activeFilter === "Received" && invoice.status === "RECEIVED") ||
      (activeFilter === "Cancelled" && invoice.status === "CANCELLED");

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Received":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleNewInvoice = () => {
    console.log("Create new invoice");
  };

  const handleView = (id: string) => {
    router.push(`/${{ lang }}/admin/orders/${id}`);
  };

  const handleDownload = (id: string) => {
    console.log("Download invoice:", id);
  };

  async function downloadInvoice() {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // YYYY-MM-DD

    const fileName = `Invoice-${formattedDate}.txt`;

    // Fake invoice content (you can replace later with real data)
    const content = `
  INVOICE
  Date: ${formattedDate}

  Thank you for your purchase!
  `;

    const blob = new Blob([content], { type: "text/plain" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const addRow = (product?: { id: string; unitPrice?: number }) => {
    setRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        productId: product?.id ?? "",
        qty: 1,
        unitPrice: product?.unitPrice ?? 0,
      },
    ]);
  };

  const removeRow = (id: number) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  const updateRow = (
    id: number,
    field: keyof any,
    value: string | number,
  ) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (field === "productId") {
          let productOptions
          const found = (productOptions as any).find((p : any) => String(p.id) === value);
          return {
            ...r,
            productId: String(value),
            unitPrice: found?.price ?? 0,
          };
        }
        return { ...r, [field]: value };
      }),
    );
  };

  const total = rows.reduce((sum, r) => sum + r.qty * r.unitPrice, 0);

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/invoices/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supplierName: invoice.supplierName,
          contact: invoice.contact,
          invoiceNumber: invoice.invoiceNumber,
          status: invoice.status,
          notes: invoice.notes,
          items: rows,
          total,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create invoice");
      }

      const data = await res.json();
      setInvoices(prev => [data.invoice , ...prev])
      toast.success("Invoice created successfully");
      setIsOpen(false);
      // // optional callback (keep this if you already use it)
      // onCreate?.(data);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  // if(isLoading){
  //   return <Loader/>
  // }
  function handleCalculateAverageForRow(rowId: number, average: number) {
    if (!Number.isFinite(average) || average <= 0) {
      toast.error("Invalid average price");
      return;
    }

    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, unitPrice: Math.round(average) } : row,
      ),
    );

    toast.success(`Average price applied: ${Math.round(average)} DA`);

    setOpenRowId(null);
  }

  const setRowNewPrice = (rowId : any, value : any) => {
    setNewPrices((prev : any) => ({
      ...prev,
      [rowId]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4">
      {/* ── New Invoice Popup ────────────────────────────────────────────────── */}
      {isOpen && (
        <PopUp
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          children={
            <div className="w-full font-sans p-2">
              {/* Header */}
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-5">
                Nouvelle facture
              </h2>

              {/* Row 1: Fournisseur + Contact */}
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nom du fournisseur <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={invoice.supplierName}
                    onChange={(e) =>
                      setInvoice((prev) => ({
                        ...prev,
                        supplierName: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Contact
                  </label>
                  <input
                    type="text"
                    value={invoice.contact}
                    onChange={(e) =>
                      setInvoice((prev) => ({
                        ...prev,
                        contact: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Row 2: N° Facture + Statut */}
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    N° Facture (Optional)
                  </label>
                  <input
                    type="text"
                    value={invoice.invoiceNumber}
                    onChange={(e) =>
                      setInvoice((prev) => ({
                        ...prev,
                        invoiceNumber: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Statut <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={invoice.status}
                    onChange={(e) =>
                      setInvoice((prev) => ({
                        ...prev,
                        status: e.target.value as any,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  >
                    <option value="PENDING">pending</option>
                    <option value="RECEIVED">received</option>
                    <option value="CANCELLED">cancelled</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-4 sm:mb-5">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={invoice.notes}
                  onChange={(e) =>
                    setInvoice((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 sm:py-2.5 text-sm resize-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                />
              </div>

              {/* Product search */}
              <div className="mb-2">
                <span className="text-sm font-semibold text-gray-800">
                  Search produits
                </span>
                <div className="relative flex-1 pt-1.5 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-600 transition-colors pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all shadow-sm"
                  />
                  {filteredProducts.length > 0 && (
                    <div className="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-auto">
                      {filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() =>
                            addRow({
                              id: product.id,
                              unitPrice: product.regularPrice,
                            })
                          }
                          className="w-full text-left px-4 py-2 text-sm hover:bg-teal-50 transition"
                        >
                          {getTranslations(
                            product.translations,
                             lang ,
                            "name",
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between my-2">
                  <span className="text-sm font-semibold text-gray-800">
                    Produits
                  </span>
                  <button
                    onClick={() => addRow()}
                    className="flex items-center gap-1 px-3 py-1.5 border border-teal-500 text-teal-500 hover:bg-teal-50 rounded-lg text-xs font-semibold transition"
                  >
                    + Ajouter
                  </button>
                </div>

                {/* Product rows */}
                <div className="flex flex-col gap-2">
                  {rows.map((row) => (
                    <div
                      key={row.id}
                      className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      {/* Product select — full width on mobile, flex-1 on xs+ */}
                      <select
                        value={row.productId}
                        onChange={(e) =>
                          updateRow(row.id, "productId", e.target.value)
                        }
                        className="w-full xs:flex-1 rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                      >
                        <option value="">Choisir produit</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {getTranslations(
                              product.translations,
                               lang ,
                              "name",
                            )}
                          </option>
                        ))}
                      </select>

                      {/* Qty + Price + Total + Remove in a row */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Qty */}
                        <input
                          type="number"
                          min={1}
                          value={row.qty}
                          onChange={(e) =>
                            updateRow(row.id, "qty", Number(e.target.value))
                          }
                          className="w-14 rounded-lg border border-gray-300 px-2 py-2 text-sm text-center focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                          placeholder="Qty"
                        />

                        {/* Unit price */}
                        <input
                          type="number"
                          min={0}
                          value={row.unitPrice}
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              "unitPrice",
                              Number(e.target.value),
                            )
                          }
                          className="w-16 sm:w-20 rounded-lg border border-gray-300 px-2 py-2 text-sm text-center focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                          placeholder="Prix"
                        />

                        {/* Row total */}
                        <span className="w-20 sm:w-24 text-xs sm:text-sm text-gray-700 text-right shrink-0 font-medium">
                          {(row.qty * row.unitPrice).toLocaleString()} DA
                        </span>

                        {/* AveragePricePopUp */}
                        <AveragePricePopUp
                          currentPrice={row.unitPrice}
                          newPrice={newPrices[row.id] ?? ""}
                          setNewPrice={(value : any) => setRowNewPrice(row.id, value)}
                          isOpen={openRowId === row.id}
                          onToggle={() =>
                            setOpenRowId(openRowId === row.id ? null : row.id)
                          }
                          onConfirm={(price : any) => {
                            handleCalculateAverageForRow(row.id, price);
                            setOpenRowId(null);
                          }}
                        />

                        {/* Remove */}
                        <button
                          onClick={() => removeRow(row.id)}
                          className="text-red-400 hover:text-red-600 transition shrink-0 p-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between bg-gray-50 border rounded-lg px-4 py-3 mt-4 mb-4">
                <span className="text-sm font-bold text-gray-800">Total</span>
                <span className="text-base font-bold text-teal-600">
                  {total.toLocaleString()} DA
                </span>
              </div>

              <div className="border-t border-gray-100 pt-4" />

              <button
                onClick={() =>
                  router.push(
                    `/${{ lang }}/admin/products/new?redirect=invoices`,
                  )
                }
                className="border rounded-lg px-3 py-2 text-xs sm:text-sm hover:bg-gray-50 transition"
              >
                Create product
              </button>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 sm:px-5 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 sm:px-5 py-2 rounded-lg text-sm font-semibold bg-teal-500 hover:bg-teal-600 text-white transition"
                >
                  Créer
                </button>
              </div>
            </div>
          }
        />
      )}

      <div>
        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="flex items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
              Purchase Invoices
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
              Manage purchase invoices and suppliers
            </p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-xs sm:text-sm font-medium"
          >
            <Plus size={16} className="sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">New Invoice</span>
            <span className="xs:hidden">New</span>
          </button>
        </div>

        {/* ── Stats Cards ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 mr-2">
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mb-1">
                  <span className="hidden sm:inline">Total Invoices</span>
                  <span className="sm:hidden">Invoices</span>
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  {invoices.length || 0}
                </p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 mr-2">
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mb-1">
                  <span className="hidden sm:inline">Pending Amount</span>
                  <span className="sm:hidden">Pending</span>
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
                  {stats.pendingAmount || 0}
                </p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 mr-2">
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mb-1">
                  <span className="hidden sm:inline">Total Amount</span>
                  <span className="sm:hidden">Total</span>
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
                  {stats.totalAmount || 0}
                </p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Search and Filters ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <div className="p-3 sm:p-4 flex flex-col gap-3">
            {/* Search */}
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Filter buttons — scrollable row on tiny screens */}
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 scrollbar-none">
              {["All", "Pending", "Received", "Cancelled"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    activeFilter === filter
                      ? "bg-teal-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Invoices Table ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Desktop table (md+) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    "Invoice #",
                    "Supplier",
                    "Order",
                    "Amount",
                    "Status",
                    "Date",
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
                {filteredInvoices.map((invoice : any) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber ? (
                        `#${invoice.invoiceNumber}`
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {invoice.supplierName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {invoice.orderId ? (
                        invoice.orderId.slice(0, 8)
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {invoice.totalAmount.toLocaleString()} DA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {invoice.orderId && (
                          <button
                            onClick={() => handleView(invoice.orderId)}
                            className="text-teal-600 hover:underline font-medium text-sm"
                          >
                            View
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(invoice.id)}
                          className="text-teal-600 hover:text-teal-800 transition-colors"
                          title="Download invoice"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablet card list (below md) */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredInvoices.map((invoice : any) => (
              <div
                key={invoice.id}
                className="p-3 sm:p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Row 1: invoice # + status */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-sm font-bold text-gray-900">
                    {invoice.invoiceNumber ? (
                      `#${invoice.invoiceNumber}`
                    ) : (
                      <span className="text-gray-400 font-normal text-xs">
                        No number
                      </span>
                    )}
                  </span>
                  <span
                    className={`flex-shrink-0 inline-block px-2 py-0.5 text-[10px] font-medium rounded-full ${getStatusColor(invoice.status)}`}
                  >
                    {invoice.status}
                  </span>
                </div>

                {/* Row 2: supplier · amount */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm text-gray-700 font-medium truncate flex-1">
                    {invoice.supplierName}
                  </span>
                  <span className="text-sm font-bold text-gray-900 flex-shrink-0">
                    {invoice.totalAmount.toLocaleString()} DA
                  </span>
                </div>

                {/* Row 3: date · order + actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 min-w-0">
                    <span>
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </span>
                    {invoice.orderId && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span className="truncate">
                          Order {invoice.orderId.slice(0, 8)}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {invoice.orderId && (
                      <button
                        onClick={() => handleView(invoice.orderId)}
                        className="text-xs text-teal-600 hover:underline font-medium"
                      >
                        View
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(invoice.id)}
                      className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-10 sm:py-12">
              <FileText
                size={40}
                className="mx-auto text-gray-400 mb-3 sm:w-12 sm:h-12"
              />
              <p className="text-gray-500 text-sm">No invoices found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
