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
import { getTranslations } from "@/lib/getTranslations";
import { getWilayaCodeByName } from "@/lib";

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
  const [orders, setOrders] = useState<any[]>([]);
  const [isEditingOpen, setIsEditingOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isDeliveryServiceOpen, setIsDeliveryServiceOpen] = useState(false);
  const [isDeliveryPersonOpen, setIsDeliveryPersonOpen] = useState(false);
  const [deliveryPersons, setDeliveryPersons] = useState<any[]>([]);
  const router = useRouter();
  const { lang } = useLang();
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);

  useEffect(() => {
    const fetchDeliveryPersons = async () => {
      try {
        const res = await fetch("/api/delivery/get-delivery-persons");

        if (!res.ok) {
          throw new Error("Error fetching products");
        }

        const { deliveryPersons } = await res.json();
        setDeliveryPersons(deliveryPersons);
      } catch (error) {
        toast.error("Error fetching products");
        console.error(error);
      }
    };

    fetchDeliveryPersons();
  }, []);

  function openEditPopup(order: any) {
    setSelectedOrder(order);
    setIsEditingOpen(true);
  }

  function openDeletePopup(order: any) {
    setSelectedOrder(order);
    setIsDeleteOpen(true);
  }

  function openDeliveryServicePopup(order: any) {
    setSelectedOrder(order);
    setIsDeliveryServiceOpen(true);
  }

  function openDeliveryPersonPopup(order: any) {
    setSelectedPerson(null);
    setSelectedOrder(order);
    setIsDeliveryPersonOpen(true);
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);

        const res = await fetch("/api/orders/get-orders");

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
  }, []);

  const editOrder = async (id: string, data: Record<string, any>) => {
  try {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      throw new Error("Error updating order")
    }

    const updatedOrder = await res.json()

    // Optional: update state locally
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? updatedOrder : o))
    )

    toast.success("Order updated successfully")
  } catch (error) {
    toast.error("Error updating order")
    console.error(error)
  }
}


  const deleteOrder = async (id: string) => {
  try {
    const res = await fetch(`/api/orders/${id}`, {
      method: "DELETE",
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Error deleting order")
    }

    // Optional: remove from UI
    setOrders((prev) => prev.filter((o) => o.id !== id))
    setIsDeleteOpen(false)
    toast.success("Order deleted successfully")
  } catch (error: any) {
    toast.error(error.message || "Error deleting order")
    console.error(error)
  }
}

  async function handleSendViaNoest() {
    if (!selectedOrder) {
      return toast.error("No order selected");
    }

    try {
      // Build product description from items
      const produit =
        selectedOrder.items
          ?.map((item: any) => `${item.name} x${item.quantity}`)
          .join(", ") || "Products";

      const payload = {
        orderId: selectedOrder.id,

        reference: selectedOrder.id,

        client: selectedOrder.fullName,

        phone: selectedOrder.phoneNumber,

        phone_2: null,

        adresse:
          selectedOrder.detailedAddress || "Client will pick up at agency",

        wilaya_id: Number(getWilayaCodeByName(selectedOrder.wilaya)),

        commune: selectedOrder.commune,

        montant: selectedOrder.total,

        station_code: selectedOrder.station_code,

        produit: produit,

        // These may depend on your business logic:
        type_id: 1, // example: 1 = home delivery
        poids: 5, // default weight (change if you store real weight)

        stop_desk: 1,

        remarque: selectedOrder.deliveryNote || "",

        can_open: true,
      };

      const response = await fetch(
        "/api/delivery/agencies/noest-express/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send order via Noest");
      }

      toast.success("Order sent successfully via Noest", {
        icon: <Package size={18} />,
      });

      console.log("Noest API response:", data);
    } catch (error) {
      console.error("Noest error:", error);
    }
  }

  async function handleSendViaDhd() {
    try {
      toast.success("Order sent successfully via Dhd", {
        icon: <Package size={18} />,
      });
    } catch (error) {
      console.error("Dhd error:", error);
    }
  }

  async function handleSendViaPerson() {
    if (!selectedOrder && !selectedPerson) {
      return toast.error("No order / person selected");
    }

    try {
      const response = await fetch("/api/delivery/persons/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          deliveryPersonId: selectedPerson?.id as any,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send order via Noest");
      }

      setIsDeliveryPersonOpen(false);
      toast.success("Order sent successfully via Person", {
        icon: <Package size={18} />,
      });
    } catch (error) {
      console.error("error:", error);
    }
  }

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
              <h2 className="text-lg font-semibold text-gray-900">
                Delete Order
              </h2>
              <p className="mt-3 text-sm text-gray-600">
                Are you sure you want to delete this order?
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
                  onClick={() => deleteOrder(selectedOrder.id)}
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
                <div className="relative w-14 h-14 flex-shrink-0">
                  <img
                    src={
                      selectedOrder?.items?.[0]?.product?.images?.[0] ||
                      "/api/placeholder/60/60"
                    }
                    alt="Product"
                    className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                  />
                  {selectedOrder?.items?.length > 1 && (
                    <div className="absolute inset-0 rounded-lg bg-black/40 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        +{selectedOrder.items.length - 1}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {getTranslations(
                      selectedOrder?.items?.[0]?.product?.translations,
                       lang ,
                      "name",
                    ) || "Undefined"}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-gray-500 mb-0.5">
                    Qty: {selectedOrder?.items?.[0]?.quantity || 1}
                  </div>
                  <div className="text-base font-semibold text-teal-700">
                    {selectedOrder?.items?.[0]?.unitPrice.toLocaleString() || 0}{" "}
                    DA
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
                  <span className="text-teal-600 font-bold">
                    {selectedOrder?.total?.toLocaleString() || 0} DA
                  </span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Statut <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedOrder?.status || ""}
                      onChange={(e) => (selectedOrder.status = e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all cursor-pointer"
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
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
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
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
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
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {selectedOrder?.commune && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Commune <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={selectedOrder?.commune || ""}
                      onChange={(e) => (selectedOrder.commune = e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                )}

                {selectedOrder?.detailedAddress && (
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
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Société de livraison
                  </label>
                  <select
                    value={selectedOrder?.shippingCompany || ""}
                    onChange={(e) =>
                      (selectedOrder.shippingCompany = e.target.value)
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="">-- Choisir --</option>
                    <option value="noest-express">Noest-Express</option>
                    <option value="dhd-express">Dhd-Express</option>
                  </select>
                </div>

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
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-gray-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Station Code
                  </label>
                  <input
                    disabled
                    type="text"
                    value={selectedOrder?.station_code || ""}
                    onChange={(e) =>
                      (selectedOrder.station_code = e.target.value)
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>

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
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-gray-400"
                  />
                </div>

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
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 px-4 pb-4 pt-2">
                <button className="px-4 sm:px-5 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button className="px-4 sm:px-5 py-2.5 bg-teal-500 text-white rounded-md text-sm font-medium hover:bg-teal-600 transition-colors">
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
            <div className="bg-white rounded-lg shadow border">
              <div className="px-4 py-3 border-b">
                <h3 className="font-semibold text-gray-800">
                  Choose delivery service:
                </h3>
              </div>
              <div className="divide-y">
                <div
                  onClick={handleSendViaNoest}
                  className="flex items-center justify-between px-4 py-3 cursor-pointer transition rounded-md hover:bg-blue-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Noest-Express</p>
                      <p className="text-sm text-gray-500">
                        Fast nationwide delivery
                      </p>
                    </div>
                  </div>
                  <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium transition shadow-sm flex-shrink-0 ml-2">
                    Send
                  </button>
                </div>
                <div
                  onClick={handleSendViaDhd}
                  className="flex items-center justify-between px-4 py-3 cursor-pointer transition rounded-md hover:bg-orange-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Dhd-Express</p>
                      <p className="text-sm text-gray-500">
                        Affordable local delivery
                      </p>
                    </div>
                  </div>
                  <button className="text-xs bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-md font-medium transition shadow-sm flex-shrink-0 ml-2">
                    Send
                  </button>
                </div>
              </div>
            </div>
          }
        />
      )}

      {isDeliveryPersonOpen && (
        <PopUp
          title="Delivery persons"
          isOpen={isDeliveryPersonOpen}
          onClose={() => setIsDeliveryPersonOpen(false)}
          children={
            <div className="bg-white rounded-lg shadow border">
              <div className="px-4 py-3 border-b">
                <h3 className="font-semibold text-gray-800">
                  Choose your delivery Person:
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
                      className={`flex items-center justify-between px-4 py-3 cursor-pointer transition rounded-md ${
                        selectedPerson?.id === person.id
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            selectedPerson?.id === person.id
                              ? "bg-blue-600 text-white"
                              : "bg-blue-100 text-blue-600"
                          }`}
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
                          onClick={handleSendViaPerson}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium transition shadow-sm flex-shrink-0 ml-2"
                        >
                          Delivery Now
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          }
        />
      )}

      <div className="p-3 sm:p-4">
        {/* ── Statistics Grid ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-5 hover:shadow-md transition-shadow">
            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 mb-1">
              Total Orders
            </p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              {orders.length || 0}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-5 hover:shadow-md transition-shadow">
            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 mb-1">
              Pending
            </p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              {orders.filter((o) => o.status === "PENDING").length || 0}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-5 hover:shadow-md transition-shadow">
            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 mb-1">
              Delivered
            </p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              {orders.filter((o) => o.status === "DELIVERED").length || 0}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-5 hover:shadow-md transition-shadow">
            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 mb-1">
              Returned
            </p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              {orders.filter((o) => o.status === "RETURNED").length || 0}
            </p>
          </div>
        </div>

        {/* ── Table ────────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border overflow-hidden">
          {/* ── Desktop table (md+) ── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Commande
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Client
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Statut
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Montant
                  </th>
                  <th className="px-4 lg:px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-10 text-sm text-gray-500"
                    >
                      Aucune commande récente
                    </td>
                  </tr>
                )}
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className={`hover:bg-gray-50 transition ${
                      order.status === "PENDING" ? "bg-yellow-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        #{order.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {order.fullName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {order.phoneNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-gray-700">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap font-semibold text-gray-900">
                      {order.total.toLocaleString()} DA
                    </td>
                    <td className="px-4 lg:px-6 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            router.push(`/${{ lang }}/admin/orders/${order.id}`)
                          }
                          className="p-1.5 hover:bg-gray-100 rounded transition"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => openEditPopup(order)}
                          className="p-1.5 hover:bg-gray-100 rounded transition"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => openDeliveryServicePopup(order)}
                          className="p-1.5 hover:bg-gray-100 rounded transition"
                          title="Livraison"
                        >
                          <Truck className="w-4 h-4 text-gray-600" />
                        </button>
                        {["Tebessa", "Tébessa"].includes(order.wilaya) &&
                          order.commune === "Tebessa" && (
                            <button
                              onClick={() => openDeliveryPersonPopup(order)}
                              className="p-1.5 hover:bg-gray-100 rounded transition"
                              title="Livreur"
                            >
                              <User className="w-4 h-4 text-gray-600" />
                            </button>
                          )}
                        <button
                          onClick={() => openDeletePopup(order)}
                          className="p-1.5 hover:bg-gray-100 rounded transition"
                          title="Supprimer"
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

          {/* ── Mobile card list (below md) ── */}
          <div className="md:hidden divide-y divide-gray-100">
            {orders.length === 0 && (
              <div className="text-center py-10 text-sm text-gray-500">
                Aucune commande récente
              </div>
            )}
            {orders.map((order) => (
              <div
                key={order.id}
                className={`p-3 sm:p-4 ${
                  order.status === "PENDING" ? "bg-yellow-50" : "bg-white"
                }`}
              >
                {/* Row 1: order ID + amount */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-gray-900 text-sm tabular-nums">
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
                  <span className="font-bold text-gray-900 text-sm tabular-nums flex-shrink-0">
                    {order.total.toLocaleString()} DA
                  </span>
                </div>

                {/* Row 2: client info */}
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="text-sm text-gray-700 font-medium truncate">
                    {order.fullName}
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {order.phoneNumber}
                  </span>
                </div>

                {/* Row 3: date + actions */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>

                  {/* Action buttons */}
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() =>
                        router.push(`/${{ lang }}/admin/orders/${order.id}`)
                      }
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                      title="Voir"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => openEditPopup(order)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => openDeliveryServicePopup(order)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                      title="Livraison"
                    >
                      <Truck className="w-4 h-4 text-gray-600" />
                    </button>
                    {["Tebessa", "Tébessa"].includes(order.wilaya) &&
                      order.commune === "Tebessa" && (
                        <button
                          onClick={() => openDeliveryPersonPopup(order)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                          title="Livreur"
                        >
                          <User className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                    <button
                      onClick={() => openDeletePopup(order)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
