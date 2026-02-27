"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Truck,
  User,
  Trash2,
  Package,
  RefreshCcw,
  Building2,
  Hash,
  AlertTriangle,
  Minus,
} from "lucide-react";
import toast from "react-hot-toast";
import { getStatusColor } from "@/data";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LanguageContext";
import PopUp from "@/components/PopUp";
import { getTranslations } from "@/lib/getTranslations";
import Loader from "@/components/Loader";

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
  const [exchangeOrder, setExchangeOrder] = useState(null);
 
  const [selectedOrder, setSelectedOrder] = useState(null);
  const router = useRouter();
  const { lang , dict } = useLang();
  const [user, setUser] = useState<any | null>(null);
  const [returned, setReturned] = useState([]);
  const [newItems, setNewItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const updateStatus = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);

        // 1️⃣ Trigger backend sync with delivery agency
        const res = await fetch("/api/delivery/agencies/orders/sync-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerId: user?.id,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to sync order statuses");
        }

        // 2️⃣ Re-fetch orders AFTER sync
        // await fetchOrders(); // 👈 your existing orders fetch function
      } catch (error) {
        console.error(error);
        toast.error("Impossible de synchroniser les commandes");
      } finally {
        setIsLoading(false);
      }
    };

    updateStatus();
  }, [user?.id]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products/get-products");

        if (!res.ok) {
          throw new Error("Error fetching products");
        }

        const { products } = await res.json();
        setProducts(products);
      } catch (error) {
        toast.error("Error fetching products");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);



  // Add new product
  const addNewProduct = (product : any) => {
    setNewItems((prev) => [...prev, { ...product, quantity: 1 }]);
  };

  // Totals
  const returnedTotal = useMemo(
    () => returned.reduce((sum, p : any) => sum + p.price * p.quantity, 0),
    [returned],
  );

  const newTotal = useMemo(
    () => newItems.reduce((sum, p : any) => sum + p.price * p.quantity, 0),
    [newItems],
  );

  const difference = newTotal - returnedTotal;

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `/api/orders/get-orders?customerId=${user?.id}`,
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
  }, [user?.id]);


 

  return (
   <div className="min-h-screen bg-white">
      <div className="p-4">
        <h1 className="text-3xl font-bold">{dict.orders.title}</h1>
        <p className="text-lg text-gray-700">{dict.orders.subtitle}</p>

        {/* Table */}
        <div className="flex flex-col gap-3 mt-6">
          {isLoading ? (
            <Loader />
          ) : orders.length === 0 ? (
            <p className="text-center py-6 text-sm text-gray-500">
              {dict.orders.empty}
            </p>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-4 border rounded-2xl px-5 py-5 hover:bg-gray-50 transition"
              >
                {/* Top row */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-gray-500" />
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-semibold text-gray-800 truncate">
                      {dict.orders.order} #{order.id.slice(0, 8)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Status */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(order.status)}`}
                  >
                    {order.status === "PENDING"
                      ? "En attente"
                      : order.status === "SHIPPED"
                        ? "Expédiée"
                        : order.status === "DELIVERED"
                          ? "Livrée"
                          : order.status === "CANCELLED"
                            ? "Annulée"
                            : "Retournée"}
                  </span>
                </div>

                {/* Middle info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gray-400" />
                    <span>
                      {dict.orders.delivery} :
                      <span className="font-medium ml-1">
  {order.deliveryMethod === "home"
    ? lang === "fr"
      ? "À domicile"
      : lang === "ar"
      ? "للمنزل"
      : "Home delivery"
    : order.deliveryMethod === "stopdesk"
    ? lang === "fr"
      ? "Au bureau"
      : lang === "ar"
      ? "للمكتب"
      : "Office pickup"
    : dict.orders.standard}
</span>
                    </span>
                  </div>

                  {order.shippingCompany && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span>{order.shippingCompany}</span>
                    </div>
                  )}

                  {order.trackingId && (
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-gray-400" />
                      <span className="truncate">
                        {dict.orders.tracking} : {order.trackingId}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom row */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Total */}
                  <div className="text-base font-bold text-gray-900">
                    {dict.orders.total} : {order.total.toLocaleString()} DA
                    {(order.wilaya === "Tebessa" ||
                      order.commune === "Tebessa") &&
                    order.shippingPrice === 0 ? (
                      <span className="text-xs text-orange-600 mx-2">
                        ({dict.orders.payLater})
                      </span>
                    ) : order.shippingPrice > 0 ? (
                      <span className="text-xs text-gray-500 ml-2">
                        (+ {order.shippingPrice.toLocaleString()} DA {dict.orders.deliveryFee})
                      </span>
                    ) : null}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                    <button
                      onClick={() => router.push(`/${lang}/orders/${order.id}`)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-medium transition"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                      <span>{dict.orders.view}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
