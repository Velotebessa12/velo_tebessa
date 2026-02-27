"use client"
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { Ticket, Plus, Copy, Edit, Trash2, Package, Users, Calendar, AlertCircle, Check, Tag } from 'lucide-react';
import PopUp from '@/components/PopUp';
import Loader from '@/components/Loader';
const page = () => {


  
const [isLoading , setIsLoading] = useState(true)
const [ coupons , setCoupons ] = useState<any[]>([])
  const [isOpen , setIsOpen ] = useState(false)
  const [type , setType ] = useState<"PERCENTAGE" | "FIXED" >("PERCENTAGE")
  const [code , setCode ] = useState("")
const [value, setValue] = useState<number | "">("");
const [usageLimit, setUsageLimit] = useState<number | "">("");
const [minAmount, setMinAmount] = useState<number | "">("");
const [expirationDate, setExpirationDate] = useState<string>("");
const [isActive, setIsActive] = useState<boolean>(true);
const [loading, setLoading] = useState<boolean>(false);
const [error, setError] = useState<string>("");
const [selectedCoupon , setSelectedCoupon ] = useState<any | null>(null)
 const [isCopied , setIsCopied] = useState(null)
  const [isEditingOpen , setIsEditingOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);


 useEffect(() => {
  const fetchCoupons = async () => {
    try {

      const res = await fetch("/api/coupons/get-coupons");

      if (!res.ok) {
        throw new Error("Error fetching Coupons");
      }

      const { coupons } = await res.json();
      setCoupons(coupons);



    } catch (error) {
      toast.error("Error fetching Coupons");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchCoupons();
}, []);

 

  const generateCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";

    for (let i = 0; i < 8; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    setCode(result);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setIsCopied(code as any)

    setTimeout(() => {
      setIsCopied(null)
    }, 2500);
    toast.success("Coupon copied successfully !")
    // You can add a toast notification here
  };

  const handleEdit = (id: string) => {
    console.log('Edit coupon:', id);
    // Add your edit logic here
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      setCoupons(coupons.filter(coupon => coupon.id !== id));
    }
  };

 const handleNewCoupon = async () => {
  setError("");

  // 🔍 Basic validation
  if (!code.trim()) {
    setError("Le code est requis");
    return;
  }

  if (!value || value <= 0) {
    setError("Valeur invalide");
    return;
  }

  if (type === "PERCENTAGE" && value > 100) {
    setError("Le pourcentage ne peut pas dépasser 100%");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch("/api/coupons/create-coupon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: code.toUpperCase(),
        type,
        value: Number(value),
        minAmount: minAmount ? Number(minAmount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        expiresAt: expirationDate || null,
        isActive,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Erreur lors de la création");
      return;
    }

    setCoupons((prev) => [ data.coupon , ...prev ])

    // Reset form
    setCode("");
    setValue("");
    setMinAmount("");
    setUsageLimit("");
    setExpirationDate("");
    setIsActive(true);
    setType("PERCENTAGE");
    setIsOpen(false)

  } catch (err) {
    console.error(err);
    setError("Erreur serveur");
  } finally {
    setLoading(false);
  }
};

    function openEditPopup(coupon : any) {
  setSelectedCoupon(coupon);
  setIsEditingOpen(true);
}

function openDeletePopup(coupon : any) {
  setSelectedCoupon(coupon);
  setIsDeleteOpen(true);
}

  if(isLoading){
    return <Loader/>
  }
  

  return (
    <div className="w-full min-h-screen bg-gray-50">

  {/* ── Delete Popup ─────────────────────────────────────────────────────── */}
  {isDeleteOpen && (
    <PopUp
      isOpen={isDeleteOpen}
      onClose={() => setIsDeleteOpen(false)}
      children={
        <div className="w-full flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-900">Delete Coupon</h2>
          <p className="mt-3 text-sm text-gray-600">
            Are you sure you want to delete this coupon?
            <br />
            <span className="text-red-500 font-medium">This action cannot be undone.</span>
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={() => { console.log("Order deleted"); setIsDeleteOpen(false); }}
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
    <PopUp isOpen={isEditingOpen} onClose={() => setIsEditingOpen(false)} children={
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-teal-100 rounded-lg flex-shrink-0">
            <Tag className="w-5 h-5 text-teal-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Edit coupon</h2>
        </div>

        {/* Code */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Code du coupon *
          </label>
          <div className="flex gap-2">
            <input
              value={selectedCoupon.code}
              onChange={(e) => updateCoupon("code", e.target.value.toUpperCase())}
              type="text"
              placeholder="SAVE20"
              className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-sm"
            />
            <button
              onClick={() => updateCoupon("code", Math.random().toString(36).substring(2, 8).toUpperCase())}
              type="button"
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
            >
              <span className="hidden xs:inline">Generate new</span>
              <span className="xs:hidden">Gen.</span>
            </button>
          </div>
        </div>

        {/* Type & Value */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={selectedCoupon.type}
              onChange={(e) => updateCoupon("type", e.target.value as "PERCENTAGE" | "FIXED")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition text-sm"
            >
              <option value="PERCENTAGE">Pourcentage (%)</option>
              <option value="FIXED">Montant fixe (DA)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Valeur</label>
            <div className="relative">
              <input
                type="number"
                value={selectedCoupon.value}
                onChange={(e) => updateCoupon("value", e.target.value === "" ? "" : Number(e.target.value))}
                placeholder={selectedCoupon.type === "PERCENTAGE" ? "10" : "500"}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                {selectedCoupon.type === "PERCENTAGE" ? "%" : "DA"}
              </span>
            </div>
          </div>
        </div>

        {/* Usage Limit & Min Amount */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limite d'utilisateurs
            </label>
            <input
              type="number"
              value={selectedCoupon.usageLimit}
              onChange={(e) => updateCoupon("usageLimit", e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">0 = illimité</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant minimum
            </label>
            <input
              type="number"
              value={selectedCoupon.minAmount}
              onChange={(e) => updateCoupon("minAmount", e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition text-sm"
            />
          </div>
        </div>

        {/* Expiry */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date d'expiration
          </label>
          <div className="relative">
            <input
              type="date"
              value={selectedCoupon.expirationDate}
              onChange={(e) => updateCoupon("expirationDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition text-sm"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <p className="text-xs text-gray-500 mt-1">Laisser vide pour pas d'expiration</p>
        </div>

        {/* Active */}
        <div className="mb-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedCoupon.isActive}
              onChange={(e) => updateCoupon("isActive", e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700">Actif</span>
          </label>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            className="px-4 sm:px-5 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
          >
            Annuler
          </button>
          <button
            onClick={handleNewCoupon}
            disabled={loading}
            className="px-4 sm:px-5 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition flex items-center gap-2 disabled:opacity-50 text-sm"
          >
            <Check className="w-4 h-4" />
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    } />
  )}

  {/* ── New Coupon Popup ─────────────────────────────────────────────────── */}
  {isOpen && (
    <PopUp isOpen={isOpen} onClose={() => setIsOpen(false)} children={
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-teal-100 rounded-lg flex-shrink-0">
            <Tag className="w-5 h-5 text-teal-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Nouveau coupon</h2>
        </div>

        {/* Code */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Code du coupon *
          </label>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              type="text"
              placeholder="SAVE20"
              className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition text-sm"
            />
            <button
              onClick={generateCode}
              type="button"
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
            >
              Generate
            </button>
          </div>
        </div>

        {/* Type & Value */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "PERCENTAGE" | "FIXED")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition text-sm"
            >
              <option value="PERCENTAGE">Pourcentage (%)</option>
              <option value="FIXED">Montant fixe (DA)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Valeur</label>
            <div className="relative">
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder={type === "PERCENTAGE" ? "10" : "500"}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                {type === "PERCENTAGE" ? "%" : "DA"}
              </span>
            </div>
          </div>
        </div>

        {/* Usage Limit & Min Amount */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limite d'utilisateurs
            </label>
            <input
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">0 = illimité</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant minimum
            </label>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition text-sm"
            />
          </div>
        </div>

        {/* Expiry */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date d'expiration
          </label>
          <div className="relative">
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition text-sm"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <p className="text-xs text-gray-500 mt-1">Laisser vide pour pas d'expiration</p>
        </div>

        {/* Active */}
        <div className="mb-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700">Actif</span>
          </label>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            className="px-4 sm:px-5 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
          >
            Annuler
          </button>
          <button
            onClick={handleNewCoupon}
            disabled={loading}
            className="px-4 sm:px-5 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition flex items-center gap-2 disabled:opacity-50 text-sm"
          >
            <Check className="w-4 h-4" />
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    } />
  )}

  <div className="p-3 sm:p-4">

    {/* ── Header ──────────────────────────────────────────────────────────── */}
    <div className="flex items-center justify-between mb-4 sm:mb-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <Ticket size={24} className="text-teal-500 sm:w-8 sm:h-8" />
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
          Coupons
        </h1>
      </div>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium"
      >
        <Plus size={16} className="flex-shrink-0" />
        <span className="hidden xs:inline">New Coupon</span>
        <span className="xs:hidden">New</span>
      </button>
    </div>

    {/* ── Coupons Table ────────────────────────────────────────────────────── */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

      {/* Desktop table (md+) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Code", "Discount", "Applies To", "Usage", "Expiry", "Status", "Actions"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">

                {/* Code */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{coupon.code}</span>
                    <button
                      onClick={() => handleCopy(coupon.code)}
                      className="flex-shrink-0 p-1.5 rounded hover:bg-teal-50 transition-colors group"
                      title="Copy code"
                    >
                      {isCopied === coupon.code
                        ? <Check className="w-4 h-4 text-teal-600" />
                        : <Copy className="w-4 h-4 text-gray-400 group-hover:text-teal-600" />
                      }
                    </button>
                  </div>
                </td>

                {/* Discount */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-teal-600">
                    {coupon.value}{coupon.type === "PERCENTAGE" ? " %" : " DA"}
                  </span>
                </td>

                {/* Scope */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Package size={15} />
                    <span className="text-sm capitalize">{coupon.scope.toLowerCase()}</span>
                  </div>
                </td>

                {/* Usage */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users size={15} />
                    <span className="text-sm">{coupon.usedCount} / {coupon.usageLimit ?? "∞"}</span>
                  </div>
                </td>

                {/* Expiry */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {coupon.expiresAt ? (
                    <div className="flex items-center gap-1 text-red-600">
                      <Calendar size={15} />
                      <span className="text-sm">{new Date(coupon.expiresAt).toLocaleDateString()}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">No expiration</span>
                  )}
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${coupon.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {coupon.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditPopup(coupon)} className="p-1.5 hover:bg-gray-100 rounded transition">
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button onClick={() => openDeletePopup(coupon)} className="p-1.5 hover:bg-red-50 rounded transition">
                      <Trash2 className="w-4 h-4 text-red-600" />
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
        {coupons.map((coupon) => (
          <div key={coupon.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">

            {/* Row 1: code + copy + status */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm font-bold text-gray-900 font-mono tracking-wide truncate">
                  {coupon.code}
                </span>
                <button
                  onClick={() => handleCopy(coupon.code)}
                  className="p-1 rounded hover:bg-teal-50 transition-colors flex-shrink-0"
                  title="Copy code"
                >
                  {isCopied === coupon.code
                    ? <Check className="w-3.5 h-3.5 text-teal-600" />
                    : <Copy className="w-3.5 h-3.5 text-gray-400" />
                  }
                </button>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${coupon.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {coupon.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Row 2: discount · scope · usage */}
            <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
              <span className="text-xs font-semibold text-teal-600">
                {coupon.value}{coupon.type === "PERCENTAGE" ? "%" : " DA"}
              </span>
              <span className="text-gray-300 text-xs">·</span>
              <span className="text-xs text-gray-500 capitalize">{coupon.scope.toLowerCase()}</span>
              <span className="text-gray-300 text-xs">·</span>
              <span className="text-xs text-gray-500">
                {coupon.usedCount}/{coupon.usageLimit ?? "∞"} uses
              </span>
            </div>

            {/* Row 3: expiry + actions */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-gray-400">
                {coupon.expiresAt
                  ? `Expires ${new Date(coupon.expiresAt).toLocaleDateString()}`
                  : "No expiration"
                }
              </span>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button onClick={() => openEditPopup(coupon)} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
                <button onClick={() => openDeletePopup(coupon)} className="p-1.5 hover:bg-red-50 rounded-lg transition">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {coupons.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle size={40} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500 text-sm">No coupons found</p>
        </div>
      )}
    </div>

  </div>
</div>
  )
}

export default page
