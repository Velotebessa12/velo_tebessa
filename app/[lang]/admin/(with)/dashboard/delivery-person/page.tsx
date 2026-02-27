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
  const [orders, setOrders] = useState<any[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const router = useRouter();
  const { lang } = useLang();
  const { admin } = useAuth();

  

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

           {/* Stat Box 6 */}
          <div className="bg-orange-100 border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-shadow">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
              Money to pay
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {admin?.pendingBalance * 4 || 0} Da
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
