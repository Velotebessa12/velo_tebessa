'use client';

import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Wallet,
  Calendar,
  FileText,
  Package,
  Plus
} from 'lucide-react';
import PopUp from '@/components/PopUp';
import toast from 'react-hot-toast';
import Loader from '@/components/Loader';

export default function FinancialManagementPage() {
  const [startDate, setStartDate] = useState('01/31/2026');
  const [endDate, setEndDate] = useState('02/07/2026');
  const [activeTab, setActiveTab] = useState('overview');
  const [isOpen , setIsOpen ] = useState(false)
  const [isLoading , setIsLoading ] = useState(true)
  const [stats , setStats ] = useState()

  // const stats = {
  //   revenue: '26 994 DA',
  //   expenses: '0 DA',
  //   profit: '26 994 DA',
  //   zakat: '33 185 DA',
  //   cashbox: '1 109 900 DA',
  // };

  useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/finances/get-stats");

      if (!res.ok) {
        throw new Error("Error fetching invoices");
      }



      const data = await res.json();
      console.log(data)
      setStats(data);



    } catch (error) {
      toast.error("Error fetching invoices");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchStats();
}, []);

  const periodSummary = {
    from: '31 janvier 2026 à 01:00 AM',
    to: '7 février 2026 à 01:00 AM',
    deliveredOrders: 1,
    pendingInvoices: 49,
  };

  const breakdown = {
    totalRevenue: '26 994 DA',
    costs: '-0 DA',
    netProfit: '26 994 DA',
    zakatDue: '33 185 DA',
  };

  const zakatCalculation = {
  cash: `${stats?.cashbox.toLocaleString("fr-FR")} DA`,
  inventory: `${stats?.inventoryValue.toLocaleString("fr-FR")} DA`,
  zakatable: `${stats?.zakatableAssets.toLocaleString("fr-FR")} DA`,
  nisab: `${1_105_000 .toLocaleString("fr-FR")} DA`,
  zakatDue: `${stats?.zakat.toLocaleString("fr-FR")} DA`,
};

  console.log(stats)

  if(isLoading){
    return <Loader/>
  }

  return (
  <div className="min-h-screen bg-gray-50 p-3 sm:p-4">

  {/* ── Popup ────────────────────────────────────────────────────────────── */}
  {isOpen && (
    <PopUp isOpen={isOpen} onClose={() => setIsOpen(false)} children={
      <div className="flex flex-col gap-4 sm:gap-5">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">Finance management</h2>
          <p className="text-xs text-gray-500 mt-0.5">Add In / Add Out</p>
        </div>

        {/* Direction */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Direction</label>
          <select className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition">
            <option value="">-- Choisir direction --</option>
            <option value="IN">In</option>
            <option value="OUT">OUT</option>
          </select>
        </div>

        {/* Amount + Quantity side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              min={0}
              placeholder="0"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Quantité</label>
            <input
              type="number"
              min={0}
              placeholder="0"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition"
            />
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Description (optionnel)</label>
          <textarea
            placeholder="Ex. Nouvel achat, retour client"
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition"
          />
        </div>

        {/* Arabic checkboxes */}
        <div dir="rtl" className="space-y-2">
          {[
            "اضافة مبالغ المبيعات والعملاء للصندوق",
            "خصم مبالغ المشتريات والموردين من الصندوق",
            "خصم مبالغ المصروفات من الصندوق",
          ].map((label) => (
            <label
              key={label}
              className="flex items-center justify-between bg-gray-100 px-3 py-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-200 transition"
            >
              <span className="text-xs sm:text-sm font-medium text-gray-800 leading-snug">
                {label}
              </span>
              <input type="checkbox" className="w-4 h-4 sm:w-5 sm:h-5 accent-teal-500 flex-shrink-0 ml-3" />
            </label>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={() => {}}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Annuler
          </button>
          <button className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition">
            Enregistrer
          </button>
        </div>
      </div>
    } />
  )}

  <div>

    {/* ── Header ──────────────────────────────────────────────────────────── */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
        Financial Management
      </h1>

      {/* Date range */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="flex-1 sm:w-36 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Start"
        />
        <span className="text-gray-400 text-sm flex-shrink-0">–</span>
        <input
          type="text"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="flex-1 sm:w-36 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="End"
        />
      </div>
    </div>

    {/* ── Stats Cards ──────────────────────────────────────────────────────── */}
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">

      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">Revenue</p>
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-600" />
          </div>
        </div>
        <p className="text-base sm:text-lg md:text-2xl font-bold text-green-600 truncate">{stats.revenue}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">Expenses</p>
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-600" />
          </div>
        </div>
        <p className="text-base sm:text-lg md:text-2xl font-bold text-red-600 truncate">{stats.expenses}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">Profit</p>
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600" />
          </div>
        </div>
        <p className="text-base sm:text-lg md:text-2xl font-bold text-blue-600 truncate">{stats.profit}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">
            <span className="hidden sm:inline">Zakat (2.5%)</span>
            <span className="sm:hidden">Zakat</span>
          </p>
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-purple-600" />
          </div>
        </div>
        <p className="text-base sm:text-lg md:text-2xl font-bold text-purple-600 truncate">{stats.zakat}</p>
      </div>

      {/* Cashbox — spans 2 cols on the 2-col mobile grid so it's centered */}
      <div className="col-span-2 sm:col-span-1 bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">Cashbox</p>
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-orange-600" />
          </div>
        </div>
        <p className="text-base sm:text-lg md:text-2xl font-bold text-gray-900 truncate">{stats.cashbox}</p>
      </div>
    </div>

    {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
    <div className="flex overflow-x-auto scrollbar-none border-b border-gray-200 mb-4 sm:mb-6">
      {[
        { key: "overview", label: "Overview" },
        { key: "expenses", label: "Expenses (0)" },
        { key: "cashbox", label: "Cashbox (0)" },
        { key: "invoices", label: "Invoices" },
      ].map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setActiveTab(key)}
          className={`flex-shrink-0 px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${
            activeTab === key
              ? "text-teal-600 border-b-2 border-teal-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {label}
        </button>
      ))}
    </div>

    {/* ── Overview Content ─────────────────────────────────────────────────── */}
    {activeTab === "overview" && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Period Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-center mb-4">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Period Summary</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">From:</span>
              <span className="text-sm text-gray-900">{periodSummary.from}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">To:</span>
              <span className="text-sm text-gray-900">{periodSummary.to}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-sm text-gray-600">Delivered Orders:</span>
              <span className="text-sm font-semibold text-blue-600">{periodSummary.deliveredOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending Invoices:</span>
              <span className="text-sm font-semibold text-orange-600">{periodSummary.pendingInvoices}</span>
            </div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Financial Breakdown</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Revenue:</span>
              <span className="text-sm font-semibold text-green-600">{breakdown.totalRevenue}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Costs:</span>
              <span className="text-sm font-semibold text-red-600">{breakdown.costs}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t-2 border-gray-200">
              <span className="text-sm sm:text-base font-semibold text-gray-900">Net Profit:</span>
              <span className="text-sm sm:text-base font-bold text-blue-600">{breakdown.netProfit}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-sm text-gray-600">Zakat Due:</span>
              <span className="text-sm font-semibold text-purple-600">{breakdown.zakatDue}</span>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* ── Zakat Box ────────────────────────────────────────────────────────── */}
    <div className="mt-4 sm:mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4 sm:p-5 md:p-6 hover:shadow-lg transition-all">

      {/* Top: label + icon */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-purple-700 mb-1">Zakat ( 2.5% )</p>
          <p className="text-xs text-purple-600">Calculé sur le total</p>
        </div>
        <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>

      {/* Revenue + Zakat summary */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-purple-600">Total des revenus</span>
          <span className="text-xs sm:text-sm font-semibold text-purple-900">
            {stats.revenue.toLocaleString("fr-FR")} DA
          </span>
        </div>
        <div className="border-t border-purple-200 pt-2 flex justify-between items-baseline">
          <span className="text-sm font-medium text-purple-700">Zakat à payer</span>
          <span className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-900">
            {stats.zakat.toLocaleString("fr-FR")} DA
          </span>
        </div>
      </div>

      {/* Zakat breakdown cards */}
      <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4">
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-purple-200">
          <div className="flex items-center mb-2">
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-600 mr-1.5" />
            <span className="text-xs sm:text-sm text-gray-600">Cash</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-gray-900">{zakatCalculation.cash}</p>
        </div>

        <div className="bg-white rounded-lg p-3 sm:p-4 border border-purple-200">
          <div className="flex items-center mb-2">
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 mr-1.5" />
            <span className="text-xs sm:text-sm text-gray-600">Inventory</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-gray-900">{zakatCalculation.inventory}</p>
        </div>

        <div className="bg-white rounded-lg p-3 sm:p-4 border border-purple-200">
          <div className="flex items-center mb-2">
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 mr-1.5" />
            <span className="text-[10px] sm:text-xs text-gray-600">Zakatable Assets</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-purple-600">{zakatCalculation.zakatable}</p>
        </div>
      </div>

      {/* Zakat due banner */}
      <div className="bg-green-50 border border-green-300 rounded-lg p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs">
              ✓
            </div>
            <span className="text-xs sm:text-sm font-semibold text-green-900">
              Zakat Due (2.5%)
            </span>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-700 flex-shrink-0">
            {zakatCalculation.zakatDue}
          </p>
        </div>
      </div>

      <div className="mt-3 bg-purple-100/50 rounded-md p-2 text-center">
        <p className="text-xs text-purple-700">2.5% du total</p>
      </div>
    </div>

  </div>
</div>
  );
}