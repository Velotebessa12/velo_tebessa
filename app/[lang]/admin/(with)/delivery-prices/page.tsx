"use client"
import PopUp from '@/components/PopUp'
import { Edit } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const page = () => {


    const [isLoading , setIsLoading ] = useState(false)
    const [wilayas , setwilayas ] = useState([])
    const [shippingCompany , setShippingCompany ] = useState("noest-express")
     const [isEditingOpen, setIsEditingOpen] = useState(false);
      const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedWilaya , setSelectedWilaya ] = useState(null)

    useEffect(() => {
  const fetchDeliveryPrices = async () => {
    try {
      setIsLoading(true);

      const res = await fetch(`/api/delivery/agencies/noest-express/get-delivery-prices?shippingCompany=${shippingCompany}`);

      if (!res.ok) {
        throw new Error("Error occurred while fetching products");
      }

      const { wilayas } = await res.json();
      setwilayas(wilayas);
      

    } catch (error) {
      toast.error("Error occurred: try again later");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchDeliveryPrices();
}, [shippingCompany]);

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
      children={<>Edit info</>}
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
      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">0 DA</p>
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
