"use client"
import PopUp from '@/components/PopUp'
import { Check, Edit, MapPin, RotateCcw, Truck } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const page = () => {


    const [isLoading , setIsLoading ] = useState(false)
    const [wilayas , setWilayas ] = useState<any[]>([])
    const [shippingCompany , setShippingCompany ] = useState("noest-express")
     const [isEditingOpen, setIsEditingOpen] = useState(false);
      const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedWilaya , setSelectedWilaya ] = useState<any | null>(null)
    const [loading , setLoading ] = useState(false)
    const [stats , setStats] = useState<any | null>({})

    useEffect(() => {
  const fetchDeliveryPrices = async () => {
    try {
      setIsLoading(true);

      const res = await fetch(`/api/delivery/agencies/noest-express/get-delivery-prices?shippingCompany=${shippingCompany}`);

      if (!res.ok) {
        throw new Error("Error occurred while fetching products");
      }

      const { wilayas , totalProfit} = await res.json();
      setWilayas(wilayas);
      setStats({
        totalProfit
      })

    } catch (error) {
      toast.error("Error occurred: try again later");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchDeliveryPrices();
}, [shippingCompany]);


  const editWilaya = async (id: number, data: Record<string, any>) => {
  try {
    const res = await fetch(`/api/delivery/agencies/noest-express/delivery-prices/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error updating Wilaya");
    }

    const updatedWilaya = await res.json();

    // update UI state
    setWilayas((prev) =>
      prev.map((w) =>
        w.wilaya_id === id ? updatedWilaya : w
      )
    );

    setIsEditingOpen(false);

    toast.success("Delivery price updated successfully");
  } catch (error) {
    toast.error("Error updating delivery price");
    console.error(error);
  }
};


 function openEditPopup(wilaya : any) {
    setSelectedWilaya(wilaya);
    setIsEditingOpen(true);
  }

  function openDeletePopup(wilaya : any) {
    setSelectedWilaya(wilaya);
    setIsDeleteOpen(true);
  }


  function viewWilaya (id : string) {
    
  }

  return (
    <div className="p-3 sm:p-4">

  {/* ── Edit Popup ───────────────────────────────────────────────────────── */}
  {isEditingOpen && (
    <PopUp isOpen={isEditingOpen} onClose={() => setIsEditingOpen(false)}
      children={<>
      <div className="p-4 sm:p-6">
  {/* Header */}
  <div className="flex items-center gap-3 mb-5">
    <div className="p-2 bg-teal-100 rounded-lg flex-shrink-0">
      <MapPin className="w-5 h-5 text-teal-600" />
    </div>
    <div>
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Edit Wilaya Tariffs</h2>
      <p className="text-xs text-gray-500">{selectedWilaya.name} · {selectedWilaya.shippingCompany}</p>
    </div>
  </div>

  {/* Delivery */}
  <div className="mb-5">
    <div className="flex items-center gap-2 mb-3">
      <Truck className="w-4 h-4 text-gray-400" />
      <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Delivery</span>
    </div>
    <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
      {/* delivery_tarif */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <label className="block text-xs font-medium text-gray-500 mb-1">Carrier rate (DA)</label>
        <p className="text-sm font-semibold text-gray-700 mb-2">{selectedWilaya.delivery_tarif} DA</p>
        <label className="block text-xs font-medium text-teal-600 mb-1">Your rate</label>
        <div className="relative">
          <input
            type="number"
            value={selectedWilaya.seller_delivery_tarif}
            onChange={(e) => setSelectedWilaya((prev : any) => ({ ...prev, seller_delivery_tarif: Number(e.target.value) }))}
            className="w-full px-3 py-1.5 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-sm bg-white"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">DA</span>
        </div>
      </div>

      {/* delivery_stopdesk */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <label className="block text-xs font-medium text-gray-500 mb-1">Carrier stop-desk (DA)</label>
        <p className="text-sm font-semibold text-gray-700 mb-2">{selectedWilaya.delivery_stopdesk} DA</p>
        <label className="block text-xs font-medium text-teal-600 mb-1">Your stop-desk rate</label>
        <div className="relative">
          <input
            type="number"
            value={selectedWilaya.seller_delivery_stopdesk}
            onChange={(e) => setSelectedWilaya((prev : any) => ({ ...prev, seller_delivery_stopdesk: Number(e.target.value) }))}
            className="w-full px-3 py-1.5 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-sm bg-white"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">DA</span>
        </div>
      </div>
    </div>
  </div>

  {/* Return */}
  <div className="mb-5">
    <div className="flex items-center gap-2 mb-3">
      <RotateCcw className="w-4 h-4 text-gray-400" />
      <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Return</span>
    </div>
    <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
      {/* return_tarif */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <label className="block text-xs font-medium text-gray-500 mb-1">Carrier return (DA)</label>
        <p className="text-sm font-semibold text-gray-700 mb-2">{selectedWilaya.return_tarif} DA</p>
        <label className="block text-xs font-medium text-teal-600 mb-1">Your return rate</label>
        <div className="relative">
          <input
            type="number"
            value={selectedWilaya.seller_return_tarif}
            onChange={(e) => setSelectedWilaya((prev : any) => ({ ...prev, seller_return_tarif: Number(e.target.value) }))}
            className="w-full px-3 py-1.5 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-sm bg-white"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">DA</span>
        </div>
      </div>

      {/* return_stopdesk */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <label className="block text-xs font-medium text-gray-500 mb-1">Carrier return stop-desk (DA)</label>
        <p className="text-sm font-semibold text-gray-700 mb-2">{selectedWilaya.return_stopdesk} DA</p>
        <label className="block text-xs font-medium text-teal-600 mb-1">Your return stop-desk</label>
        <div className="relative">
          <input
            type="number"
            value={selectedWilaya.seller_return_stopdesk}
            onChange={(e) => setSelectedWilaya((prev : any) => ({ ...prev, seller_return_stopdesk: Number(e.target.value) }))}
            className="w-full px-3 py-1.5 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-sm bg-white"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">DA</span>
        </div>
      </div>
    </div>
  </div>

  {/* Footer */}
  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
    <button
      type="button"
      onClick={() => setIsEditingOpen(false)}
      className="px-4 sm:px-5 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
    >
      Annuler
    </button>
    <button
      onClick={() => editWilaya(selectedWilaya.wilaya_id, selectedWilaya)}
      disabled={loading}
      className="px-4 sm:px-5 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition flex items-center gap-2 disabled:opacity-50 text-sm"
    >
      <Check className="w-4 h-4" />
      {loading ? "Enregistrement..." : "Enregistrer"}
    </button>
  </div>
</div></>}
    />
  )}

  {/* ── Stats ────────────────────────────────────────────────────────────── */}
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-5 hover:shadow-md transition-shadow">
      <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 mb-1">
        Total Wilayas
      </p>
      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">58</p>
    </div>

    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-5 hover:shadow-md transition-shadow">
      <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 mb-1">
        <span className="hidden sm:inline">Noest Express 0 / 58</span>
        <span className="sm:hidden">Noest 0/58</span>
      </p>
      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{wilayas?.filter((w : any) => w.shippingCompany === "noest-express").length || 0}</p>
    </div>

    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-5 hover:shadow-md transition-shadow">
      <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 mb-1">
        <span className="hidden sm:inline">Dhd Express 0 / 58</span>
        <span className="sm:hidden">DHD 0/58</span>
      </p>
      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">0</p>
    </div>

    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-5 hover:shadow-md transition-shadow">
      <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 mb-1">
        <span className="hidden sm:inline">Delivery Profit</span>
        <span className="sm:hidden">Profit</span>
      </p>
      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalProfit} DA</p>
    </div>
  </div>

  {/* ── Filter ───────────────────────────────────────────────────────────── */}
  <div className="mb-4 sm:mb-6">
    <select
      value={shippingCompany}
      onChange={(e) => setShippingCompany(e.target.value)}
      className="w-full sm:w-56 px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    >
      <option value="noest-express">Noest Express</option>
      <option value="dhd-express">Dhd Express</option>
    </select>
  </div>

  {/* ── Table / Cards ────────────────────────────────────────────────────── */}
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

    {/* Desktop table (md+) */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {["Wilaya ID", "Home Delivery", "StopDesk", "Return (Home)", "Return (StopDesk)", "Actions"].map((h) => (
              <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {wilayas.map((wilaya: any) => (
            <tr key={wilaya.wilaya_id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                #{wilaya.wilaya_id} / {wilaya.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {wilaya.delivery_tarif.toLocaleString()} DA
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {wilaya.delivery_stopdesk.toLocaleString()} DA
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {wilaya.return_tarif.toLocaleString()} DA
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {wilaya.return_stopdesk.toLocaleString()} DA
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditPopup(wilaya)}
                    className="p-1.5 hover:bg-gray-100 rounded transition"
                  >
                    <Edit className="w-4 h-4 text-teal-600" />
                  </button>
                  <button
                    onClick={() => viewWilaya(wilaya.wilaya_id)}
                    className="p-1.5 hover:bg-gray-100 rounded transition text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    View
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile card list (below md) */}
    <div className="md:hidden divide-y divide-gray-100">
      {wilayas.map((wilaya: any) => (
        <div key={wilaya.wilaya_id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">

          {/* Row 1: wilaya ID + name + actions */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-bold text-gray-400 tabular-nums flex-shrink-0">
                #{wilaya.wilaya_id}
              </span>
              <span className="text-sm font-semibold text-gray-900 truncate">
                {wilaya.name}
              </span>
            </div>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button
                onClick={() => openEditPopup(wilaya)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <Edit className="w-4 h-4 text-teal-600" />
              </button>
              <button
                onClick={() => viewWilaya(wilaya.wilaya_id)}
                className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                View
              </button>
            </div>
          </div>

          {/* Row 2: 4 price values in a 2×2 grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">Home</span>
              <span className="text-xs font-semibold text-gray-800 tabular-nums">
                {wilaya.delivery_tarif.toLocaleString()} DA
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">StopDesk</span>
              <span className="text-xs font-semibold text-gray-800 tabular-nums">
                {wilaya.delivery_stopdesk.toLocaleString()} DA
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">Ret. Home</span>
              <span className="text-xs font-semibold text-gray-800 tabular-nums">
                {wilaya.return_tarif.toLocaleString()} DA
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">Ret. Desk</span>
              <span className="text-xs font-semibold text-gray-800 tabular-nums">
                {wilaya.return_stopdesk.toLocaleString()} DA
              </span>
            </div>
          </div>

        </div>
      ))}
    </div>

    {wilayas.length === 0 && (
      <div className="text-center py-10 text-sm text-gray-500">
        No wilayas found
      </div>
    )}
  </div>

</div>
  )
}

export default page
