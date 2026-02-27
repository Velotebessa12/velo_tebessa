"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  MoreVertical,
  Eye,
  Printer,
  Edit,
  Download,
  FileText,
  Trash2,
  Package,
  Truck,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LanguageContext";
import PopUp from "@/components/PopUp";
import Image from "next/image";
import Loader from "@/components/Loader";
import { useAuth } from "@/components/AuthContext";

type Order = {
  id: string;
  client: string;
  produit: string;
  montant: number;
  statut: string;
  date: string;
};

const Page = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [isEditingOpen, setIsEditingOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDeliveryServiceOpen, setIsDeliveryServiceOpen] = useState(false);
  const [isDeliveryPersonOpen, setIsDeliveryPersonOpen] = useState(false);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const router = useRouter();
  const { lang } = useLang();
  const [selectedPerson, setSelectedPerson] = useState(null);
  const { admin } = useAuth();

  function openEditPopup(order) {
    setSelectedOrder(order);
    setIsEditingOpen(true);
  }

  function openDeletePopup(order) {
    setSelectedOrder(order);
    setIsDeleteOpen(true);
  }

  function openDeliveryServicePopup(order) {
    setSelectedOrder(order);
    setIsDeliveryServiceOpen(true);
  }

  function openDeliveryPersonPopup(order) {
    setSelectedOrder(order);
    setIsDeliveryPersonOpen(true);
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);

        const res = await fetch(
          `/api/delivery/persons/get-orders?deliveryPersonId=${admin?.id}`,
        );

        if (!res.ok) {
          throw new Error("Error fetching orders");
        }

        const { pendingDeliveries } = await res.json();
        setOrders(pendingDeliveries);
      } catch (error) {
        toast.error("Error fetching orders");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [admin?.id]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-white">
      {isDeleteOpen && (
        <PopUp
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          children={
            <div className="w-full flex flex-col items-center justify-center p-6 text-center">
              {/* Title */}
              <h2 className="text-lg font-semibold text-gray-900">
                Delete Order
              </h2>

              {/* Message */}
              <p className="mt-3 text-sm text-gray-600">
                Are you sure you want to delete this order?
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
          children={
            <>
              <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                <img
                  src={
                    selectedOrder?.items?.[0]?.product?.image ||
                    "/api/placeholder/60/60"
                  }
                  alt="Product"
                  className="w-14 h-14 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {selectedOrder?.items?.[0]?.product?.name ||
                      "لمبة ريشكال LED بطاقة شمسية"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-0.5">
                    Qté: {selectedOrder?.items?.[0]?.quantity || 1}
                  </div>
                  <div className="text-base font-semibold text-emerald-600">
                    {selectedOrder?.items?.[0]?.price || 0} DA
                  </div>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="px-4 py-3 border-b border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="text-gray-900 font-medium">
                    {selectedOrder?.total - selectedOrder?.shippingPrice || 0}{" "}
                    DA
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frais de livraison</span>
                  <span className="text-gray-900 font-medium">
                    {selectedOrder?.shippingPrice || 0} DA
                  </span>
                </div>
                <div className="flex justify-between text-base pt-2 border-t border-gray-100">
                  <span className="text-gray-900 font-semibold">Total</span>
                  <span className="text-emerald-600 font-bold">
                    {selectedOrder?.total || 0} DA
                  </span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="p-4 space-y-4">
                {/* Order Status and Customer Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Statut de la commande{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedOrder?.status || ""}
                      onChange={(e) => (selectedOrder.status = e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                    >
                      <option value="PENDING">En attente</option>
                      <option value="CONFIRMED">Confirmée</option>
                      <option value="SHIPPED">Expédiée</option>
                      <option value="DELIVERED">Livrée</option>
                      <option value="CANCELLED">Annulée</option>
                      <option value="RETURNED">Retournée</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Nom du client <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={selectedOrder?.fullName || ""}
                      onChange={(e) =>
                        (selectedOrder.fullName = e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Phone and Wilaya */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Téléphone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={selectedOrder?.phoneNumber || ""}
                      onChange={(e) =>
                        (selectedOrder.phoneNumber = e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Wilaya <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={selectedOrder?.wilaya || ""}
                      onChange={(e) => (selectedOrder.wilaya = e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Commune */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Commune <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={selectedOrder?.commune || ""}
                    onChange={(e) => (selectedOrder.commune = e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Address */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Adresse <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={selectedOrder?.detailedAddress || ""}
                    onChange={(e) =>
                      (selectedOrder.detailedAddress = e.target.value)
                    }
                    rows={3}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Delivery Company */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Société de livraison
                  </label>
                  <select
                    value={selectedOrder?.shippingCompany || ""}
                    onChange={(e) =>
                      (selectedOrder.shippingCompany = e.target.value)
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="">-- Choisir --</option>
                    <option value="noest-express">Noest-Express</option>
                    <option value="dhd-express">Dhd-Express</option>
                  </select>
                </div>

                {/* Delivery Method */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Méthode de livraison
                  </label>
                  <input
                    type="text"
                    value={selectedOrder?.deliveryMethod || ""}
                    onChange={(e) =>
                      (selectedOrder.deliveryMethod = e.target.value)
                    }
                    placeholder="Domicile, Point relais, etc."
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                  />
                </div>

                {/* Tracking ID */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Numéro de suivi
                  </label>
                  <input
                    type="text"
                    value={selectedOrder?.trackingId || ""}
                    onChange={(e) =>
                      (selectedOrder.trackingId = e.target.value)
                    }
                    placeholder="ID de tracking"
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                  />
                </div>

                {/* Delivery Notes */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-900">
                    Notes de livraison
                  </label>
                  <div className="text-xs text-gray-500 mb-1">
                    Ajouter une nouvelle note
                  </div>
                  <textarea
                    value={selectedOrder?.deliveryNote || ""}
                    onChange={(e) =>
                      (selectedOrder.deliveryNote = e.target.value)
                    }
                    placeholder="Écrivez une note sur cette livraison"
                    rows={2}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 px-4 pb-4 pt-2">
                <button className="px-5 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button className="px-5 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                  Enregistrer
                </button>
              </div>
            </>
          }
        />
      )}

      {isDeliveryServiceOpen && (
        <PopUp
          title="Delivery Services"
          isOpen={isDeliveryServiceOpen}
          onClose={() => setIsDeliveryServiceOpen(false)}
          children={
            <>
              <div className="bg-white rounded-lg shadow border">
                {/* Header */}
                <div className="px-4 py-3 border-b">
                  <h3 className="font-semibold text-gray-800">
                    Choose delivery service :
                  </h3>
                </div>

                {/* Providers */}
                <div className="divide-y">
                  {/* NOEST */}
                  <div
                    onClick={handleSendViaNoest}
                    className="flex items-center justify-between px-4 py-3 cursor-pointer
                 transition rounded-md hover:bg-blue-50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full bg-blue-100 text-blue-600
                        flex items-center justify-center"
                      >
                        <Truck className="w-5 h-5" />
                      </div>

                      <div>
                        <p className="font-medium text-gray-800">
                          Noest-Express
                        </p>
                        <p className="text-sm text-gray-500">
                          Fast nationwide delivery
                        </p>
                      </div>
                    </div>

                    <button
                      className="text-xs bg-blue-600 hover:bg-blue-700
                   text-white px-3 py-1.5 rounded-md
                   font-medium transition shadow-sm"
                    >
                      Send
                    </button>
                  </div>

                  {/* DHD */}
                  <div
                    onClick={handleSendViaDhd}
                    className="flex items-center justify-between px-4 py-3 cursor-pointer
                 transition rounded-md hover:bg-orange-50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full bg-orange-100 text-orange-600
                        flex items-center justify-center"
                      >
                        <Truck className="w-5 h-5" />
                      </div>

                      <div>
                        <p className="font-medium text-gray-800">Dhd-Express</p>
                        <p className="text-sm text-gray-500">
                          Affordable local delivery
                        </p>
                      </div>
                    </div>

                    <button
                      className="text-xs bg-orange-600 hover:bg-orange-700
                   text-white px-3 py-1.5 rounded-md
                   font-medium transition shadow-sm"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </>
          }
        />
      )}

      {isDeliveryPersonOpen && (
        <PopUp
          title="Delivery persons"
          isOpen={isDeliveryPersonOpen}
          onClose={() => setIsDeliveryPersonOpen(false)}
          children={
            <>
              <div>
                <div className="bg-white rounded-lg shadow border">
                  <div className="px-4 py-3 border-b">
                    <h3 className="font-semibold text-gray-800">
                      Choose your delivery Person :
                    </h3>
                  </div>

                  {deliveryPersons.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No delivery persons available
                    </div>
                  ) : (
                    <div className="divide-y">
                      {deliveryPersons.map((person) => (
                        <div
                          key={person.id}
                          onClick={() => setSelectedPerson(person)}
                          className={`flex items-center justify-between px-4 py-3 cursor-pointer transition rounded-md
    ${
      selectedPerson?.id === person.id
        ? "bg-blue-50 border border-blue-200"
        : "hover:bg-gray-50"
    }
  `}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center
      ${
        selectedPerson?.id === person.id
          ? "bg-blue-600 text-white"
          : "bg-blue-100 text-blue-600"
      }
    `}
                            >
                              <User className="w-5 h-5" />
                            </div>

                            <div>
                              <p className="font-medium text-gray-800">
                                {person.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {person.phoneNumber}
                              </p>
                            </div>
                          </div>

                          {selectedPerson?.id === person.id && (
                            <button
                              onClick={() =>
                                handleSendViaPerson(selectedPerson.id)
                              }
                              className="text-xs bg-blue-600 hover:bg-blue-700 
               text-white px-3 py-1.5 
               rounded-md font-medium 
               transition duration-200 shadow-sm"
                            >
                              Delivery Now
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          }
        />
      )}

      <div className="p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Deliveries wilaya Tebessa
          </h1>
          <p className="text-slate-600 mt-2">
            All your deliveries Tebessa / Tebessa will be here
          </p>
        </div>
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          {/* Stat Box 1 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-shadow">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
              Total Orders
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {orders.length || 0}
            </p>
          </div>

          {/* Stat Box 2 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-shadow">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
              Pending
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {orders.filter((o) => o.status === "PENDING").length || 0}
            </p>
          </div>

          {/* Stat Box 3 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-shadow">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
              Delivered
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {orders.filter((o) => o.status === "DELIVERED").length || 0}
            </p>
          </div>

          {/* Stat Box 4 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-shadow">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
              Returned
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {orders.filter((o) => o.status === "RETURN").length || 0}
            </p>
          </div>
          {/* Stat Box 5 */}
          <div className="bg-yellow-100 border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-shadow">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
              Pending Money
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {admin?.pendingBalance || 0} Da
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="flex flex-col gap-4">
          {orders.length === 0 && (
            <div className="text-center py-10 text-sm text-gray-500">
              Aucune commande assignée
            </div>
          )}

          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col gap-4 border rounded-2xl px-5 py-5
                 hover:bg-gray-50 transition"
            >
              {/* Top row */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-semibold text-gray-800 truncate">
                    Commande #{order.id.slice(0, 8)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Status */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap
           `}
                >
                  {order.status}
                </span>
              </div>

              {/* Client */}
              <div className="flex flex-col gap-1 text-sm text-gray-700">
                <span className="font-medium">{order.fullName}</span>
                <span className="text-xs text-gray-500">
                  {order.phoneNumber}
                </span>
              </div>

              {/* Address */}
              <div className="text-sm text-gray-700">
                <span className="font-medium">Adresse :</span> {order.wilaya} –{" "}
                {order.commune}
                {order.detailedAddress && (
                  <span className="block text-xs text-gray-500 mt-1">
                    {order.detailedAddress}
                  </span>
                )}
              </div>

              {/* Total */}
              <div className="text-base font-bold text-gray-900">
                Total : {order.total.toLocaleString()} DA
                {order.shippingPrice > 0 && (
                  <span className="text-xs text-gray-500 ml-2">
                    (+ {order.shippingPrice.toLocaleString()} DA livraison)
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() =>
                    router.push(`/${{ lang }}/admin/orders/${order.id}`)
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-xl
                     bg-gray-50 hover:bg-gray-100
                     border border-gray-200
                     text-gray-700 text-xs font-medium transition"
                >
                  Check
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
