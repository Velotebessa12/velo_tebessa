"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Minus,
  Euro,
} from "lucide-react";
import PopUp from "@/components/PopUp";
import { useLang } from "@/components/LanguageContext";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";

export default function CashRegisterPage() {
  const [filterType, setFilterType] = useState("All");
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState("");
  const [direction, setDirection] = useState<"IN" | "OUT">("IN");
  const [amount, setAmout] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [isEditingOpen, setIsEditingOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [stats, setStats] = useState({
    currentBalance: 0,
    totalIn: 0,
    totalOut: 0,
    profitLoss: 0,
  });

 

  useEffect(() => {
    const fetchCashRegisterData = async () => {
      try {
        setIsLoading(true);

        const [txRes, statsRes] = await Promise.all([
          fetch("/api/cash-register/get-transactions"),
          fetch("/api/cash-register/get-stats"),
        ]);

        if (!txRes.ok) {
          throw new Error("Error fetching transactions");
        }

        if (!statsRes.ok) {
          throw new Error("Error fetching stats");
        }

        const { transactions } = await txRes.json();
        const stats = await statsRes.json();

        setTransactions(transactions);
        setStats(stats);
      } catch (error) {
        console.error(error);
        toast.error("Error fetching cash register data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCashRegisterData();
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Sales":
        return "bg-green-100 text-green-800";
      case "Delivery Payments":
        return "bg-blue-100 text-blue-800";
      case "other":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const editTransaction = async (
  id: string,
  data: {
    description?: string;
    amount?: number;
    type?: string;
    direction?: string;
  }
) => {
  try {
    const res = await fetch(`/api/cash-register/transactions/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error updating transaction");
    }

    const updatedTransaction = await res.json();

    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? updatedTransaction : t))
    );
    setIsEditingOpen(false)
    toast.success("Transaction updated successfully");
  } catch (error) {
    toast.error("Error updating transaction");
    console.error(error);
  }
};

const deleteTransaction = async (id: string) => {
  try {
    const res = await fetch(`/api/cash-register/transactions/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error deleting transaction");
    }

    setTransactions((prev) =>
      prev.filter((t) => t.id !== id)
    );
    setIsDeleteOpen(false)
    toast.success("Transaction deleted successfully");
  } catch (error: any) {
    toast.error(error.message || "Error deleting transaction");
    console.error(error);
  }
};

  const handleAddTransaction = async () => {
    try {
      const response = await fetch("/api/cash-register/create-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          amount,
          description,
          direction,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create transaction");
      }

      toast.success("Transaction added successfully");
      setTransactions((prev) => [data.transaction, ...prev]);
      setIsOpen(false);
      console.log("Transaction created:", data);
    } catch (error) {
      console.error(error);
      toast.error("Error creating transaction");
    }
  };

  const handleView = (id: string) => {
    console.log("View transaction:", id);
  };

  function openEditPopup(transaction : any) {
    setAmout(transaction.amount)
    setType(transaction.type)
    setDescription(transaction.description)
    setDirection(transaction.direction)
    setSelectedTransaction(transaction);
    setIsEditingOpen(true);
  }

  function openDeletePopup(transaction : any) {
    setSelectedTransaction(transaction);
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
                Delete transaction
              </h2>
              <p className="mt-3 text-sm text-gray-600">
                Are you sure you want to delete this transaction?
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
                  onClick={() => deleteTransaction(selectedTransaction.id)}
                  className="px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          }
        />
      )}

      {/* ── Shared transaction form fields ───────────────────────────────────── */}
      {/* Edit Popup */}
      {isEditingOpen && (
        <PopUp
          isOpen={isEditingOpen}
          onClose={() => setIsEditingOpen(false)}
          children={
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
                Edit Transaction
              </h2>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Direction <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={direction || selectedTransaction.direction}
                    onChange={(e) => setDirection(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-sm"
                  >
                    <option value="" disabled>
                      Select direction
                    </option>
                    <option value="IN">In (Revenue)</option>
                    <option value="OUT">Out (Expense)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    onChange={(e) => setType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-sm"
                  >
                    <option value="" disabled>
                      Select Type
                    </option>
                    <option value="SALE">Sale</option>
                    <option value="RETURN">Return</option>
                    <option value="EXPENSE">Expense</option>
                    <option value="DELIVERY_PAYMENT">Delivery payment</option>
                    <option value="RETURN_LOSS">Return loss</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  value={amount || selectedTransaction.amount}
                  onChange={(e) => setAmout(Number(e.target.value))}
                  type="number"
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description || selectedTransaction.description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="eg. new transaction"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition text-sm">
                  Annuler
                </button>
                <button
                  onClick={() => editTransaction(selectedTransaction.id , {
                    amount,
                    description,
                    direction, 
                    type
                  })}
                  className="flex-1 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition text-sm"
                >
                  Update
                </button>
              </div>
            </div>
          }
        />
      )}

      {/* New Transaction Popup */}
      {isOpen && (
        <PopUp
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          children={
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
                Add Transaction
              </h2>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Direction <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-sm"
                  >
                    <option value="" disabled>
                      Select direction
                    </option>
                    <option value="IN">In (Revenue)</option>
                    <option value="OUT">Out (Expense)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    onChange={(e) => setType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-sm"
                  >
                    <option value="" disabled>
                      Select Type
                    </option>
                    <option value="SALE">Sale</option>
                    <option value="RETURN">Return</option>
                    <option value="EXPENSE">Expense</option>
                    <option value="DELIVERY_PAYMENT">Delivery payment</option>
                    <option value="RETURN_LOSS">Return loss</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  value={amount}
                  onChange={(e) => setAmout(Number(e.target.value))}
                  type="number"
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="eg. new transaction"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition text-sm">
                  Annuler
                </button>
                <button
                  onClick={handleAddTransaction}
                  className="flex-1 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition text-sm"
                >
                  Ajouter
                </button>
              </div>
            </div>
          }
        />
      )}

      <div>
        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-1">
            Cash Register
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Manage financial transactions and balance
          </p>
        </div>

        {/* ── Stats Cards ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          {/* Current Balance */}
          <div className="bg-white border rounded-lg p-3 sm:p-4 md:p-6 text-black">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                <Euro className="w-4 h-4 sm:w-5 sm:h-5 md:w-8 md:h-8" />
              </div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-400" />
            </div>
            <p className="text-[10px] sm:text-xs md:text-sm opacity-70 mb-1">
              <span className="hidden sm:inline">Current Balance</span>
              <span className="sm:hidden">Balance</span>
            </p>
            <p className="text-lg sm:text-xl md:text-3xl font-bold truncate">
              {stats.currentBalance || 0}
            </p>
          </div>

          {/* Total In */}
          <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600" />
              </div>
            </div>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mb-1">
              Total In
            </p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
              {stats.totalIn || 0}
            </p>
          </div>

          {/* Total Out */}
          <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Minus className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-red-600" />
              </div>
            </div>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mb-1">
              Total Out
            </p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
              {stats.totalOut || 0}
            </p>
          </div>

          {/* Profit/Loss */}
          <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600" />
              </div>
            </div>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mb-1">
              Profit/Loss
            </p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 truncate">
              {stats.profitLoss || 0}
            </p>
          </div>
        </div>

        {/* ── Actions bar ──────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-xs sm:text-sm font-medium"
          >
            <Plus size={16} className="sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="hidden xs:inline">Add Transaction</span>
            <span className="xs:hidden">Add</span>
          </button>

          <div className="flex items-center gap-1.5 flex-1 min-w-0 sm:flex-none">
            <Filter
              size={15}
              className="text-gray-500 flex-shrink-0 sm:w-5 sm:h-5"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option>All</option>
              <option value="SALE">Sale</option>
              <option value="RETURN">Return</option>
              <option value="EXPENSE">Expense</option>
              <option value="DELIVERY_PAYMENT">Delivery payment</option>
              <option value="RETURN_LOSS">Return loss</option>
            </select>
          </div>
        </div>

        {/* ── Transactions ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-xl font-semibold text-gray-900">
              Transactions
            </h2>
          </div>

          {/* Desktop table (md+) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Date", "Type", "Description", "Amount", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(transaction.type)}`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-1.5">
                        <span>{transaction.description}</span>
                        {transaction.id && (
                          <a
                            href="#"
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            {transaction.id}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm font-semibold ${transaction?.direction === "IN" ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaction?.direction === "IN" ? "+" : "−"}{" "}
                        {transaction.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditPopup(transaction)}
                          className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => openDeletePopup(transaction)}
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

          {/* Mobile / tablet card list (below md) */}
          <div className="md:hidden divide-y divide-gray-100">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-3 sm:p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Row 1: type badge + amount */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded-full flex-shrink-0 ${getTypeColor(transaction.type)}`}
                  >
                    {transaction.type}
                  </span>
                  <span
                    className={`text-sm font-bold flex-shrink-0 ${transaction?.direction === "IN" ? "text-green-600" : "text-red-600"}`}
                  >
                    {transaction?.direction === "IN" ? "+" : "−"}{" "}
                    {transaction.amount}
                  </span>
                </div>

                {/* Row 2: description */}
                {transaction.description && (
                  <p className="text-xs sm:text-sm text-gray-700 mb-2 line-clamp-2">
                    {transaction.description}
                  </p>
                )}

                {/* Row 3: date + actions */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-400">
                    {transaction.createdAt}
                  </span>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => openEditPopup(transaction)}
                      className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={() => openDeletePopup(transaction)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {transactions.length === 0 && (
            <div className="text-center py-10 sm:py-12">
              <p className="text-gray-500 text-sm">No transactions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
