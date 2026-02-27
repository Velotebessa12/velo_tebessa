"use client";
import PopUp from "@/components/PopUp";
import {
  Edit,
  Eye,
  MoreVertical,
  Package,
  Trash2,
  Truck,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const page = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingOpen, setIsEditingOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [shippingCompany, setShippingCompany] = useState("noest-express");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);

        const res = await fetch(
          `/api/delivery/agencies/get-orders?shippingCompany=${shippingCompany}`,
        );

        if (!res.ok) {
          throw new Error("Error fetching orders");
        }

        const { orders } = await res.json();
        setOrders(orders);
      } catch (error) {
        toast.error("Error fetching orders");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [shippingCompany]);

  function openEditPopup(order) {
    setSelectedOrder(order);
    setIsEditingOpen(true);
  }

  function openDeletePopup(order) {
    setSelectedOrder(order);
    setIsDeleteOpen(true);
  }

  return (
    <div className="p-3 sm:p-4">
      {/* ── Delete Popup ─────────────────────────────────────────────────────── */}
      {isDeleteOpen && (
        <PopUp
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          children={
            <div className="w-full flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Delete Product
              </h2>
              <p className="mt-3 text-sm text-gray-600">
                Are you sure you want to delete this product?
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
                    console.log("deleted");
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
          children={<>Edit Order</>}
        />
      )}

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-5 hover:shadow-md transition-shadow">
          <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 mb-1">
            <span className="hidden sm:inline">Total Orders</span>
            <span className="sm:hidden">Total</span>
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {orders.length || 0}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-5 hover:shadow-md transition-shadow">
          <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 mb-1">
            <span className="hidden xs:inline">Noest Express</span>
            <span className="xs:hidden">Noest</span>
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {orders.filter((o) => o.shippingCompany === "noest-express")
              .length || 0}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-5 hover:shadow-md transition-shadow">
          <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 mb-1">
            <span className="hidden xs:inline">Dhd Express</span>
            <span className="xs:hidden">Dhd</span>
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {orders.filter((o) => o.shippingCompany === "dhd-express").length ||
              0}
          </p>
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
      <div className="rounded-2xl border overflow-hidden">
        {/* Desktop table (md+) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  "Delivery Agency",
                  "Order ID",
                  "Customer",
                  "Status",
                  "Date",
                  "Cost",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-10 text-sm text-gray-500"
                  >
                    Aucune commande récente
                  </td>
                </tr>
              )}
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition bg-white border-b"
                >
                  {/* Agency */}
                  <td className="px-4 lg:px-6 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {order.shippingCompany}
                  </td>

                  {/* Order ID */}
                  <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      #{order.id.slice(0, 8)}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {order.fullName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {order.phoneNumber}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {order.status}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-700">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </td>

                  {/* Cost */}
                  <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">
                      {order.total.toLocaleString()} DA
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          router.push(`/${{ lang }}/admin/orders/${order.id}`)
                        }
                        className="p-1.5 hover:bg-gray-100 rounded transition"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => openEditPopup(order)}
                        className="p-1.5 hover:bg-gray-100 rounded transition"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => openDeletePopup(order)}
                        className="p-1.5 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card list (below md) */}
        <div className="md:hidden divide-y divide-gray-100 bg-white">
          {orders.length === 0 && (
            <div className="text-center py-10 text-sm text-gray-500">
              Aucune commande récente
            </div>
          )}
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-3 sm:p-4 hover:bg-gray-50 transition-colors"
            >
              {/* Row 1: order ID + status */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-semibold text-gray-900 tabular-nums">
                    #{order.id.slice(0, 8)}
                  </span>
                  {/* Status pill */}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                      order.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "DELIVERED"
                          ? "bg-green-100 text-green-700"
                          : order.status === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : order.status === "SHIPPED"
                              ? "bg-blue-100 text-blue-700"
                              : order.status === "RETURNED"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                {/* Cost */}
                <span className="text-sm font-bold text-gray-900 flex-shrink-0 tabular-nums">
                  {order.total.toLocaleString()} DA
                </span>
              </div>

              {/* Row 2: customer + agency */}
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm text-gray-700 font-medium truncate flex-1">
                  {order.fullName}
                </span>
                <span className="text-gray-300 text-xs">·</span>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {order.phoneNumber}
                </span>
              </div>

              {/* Row 3: date + agency badge + products + actions */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                  <span className="text-[11px] text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-gray-300 text-xs">·</span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${
                      order.shippingCompany === "noest-express"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {order.shippingCompany === "noest-express"
                      ? "Noest"
                      : "DHD"}
                  </span>
                  {/* Product count */}
                  {order.items?.length > 0 && (
                    <span className="text-[10px] text-gray-400 flex-shrink-0">
                      {order.items.length} item
                      {order.items.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    onClick={() =>
                      router.push(`/${{ lang }}/admin/orders/${order.id}`)
                    }
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => openEditPopup(order)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => openDeletePopup(order)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default page;
