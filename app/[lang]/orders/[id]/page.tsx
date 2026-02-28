"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  User,
  MapPin,
  Clock,
  Building2,
  Phone,
  Edit2,
  XCircle,
  ChevronRight,
  History,
  Tag,
  Trash2,
  Edit,
  RefreshCcw,
} from "lucide-react";
import PopUp from "@/components/PopUp";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";
import { getTranslations } from "@/lib/getTranslations";
import { useLang } from "@/components/LanguageContext";

export default function OrderDetailsMobilePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState("PENDING");
  const [note, setNote] = useState("");
  const { lang , dict} = useLang();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isExchangeOpen, setIsExchangeOpen] = useState(false);

  const statusLabels: Record<string, string> = {
    PENDING: "En attente",
    PREPARING: "En préparation",
    SHIPPED: "Expédiée",
    IN_TRANSIT: "En transit",
    AT_OFFICE: "Au bureau",
    OUT_FOR_DELIVERY: "Avec le livreur",
    DELIVERED: "Livrée",
    CANCELED: "Annulée",
    RETURNED: "Retournée",
  };

  const statusColors: Record<
    string,
    { bg: string; text: string; border: string }
  > = {
    PENDING: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    PREPARING: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    SHIPPED: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
    },
    IN_TRANSIT: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
    },
    AT_OFFICE: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
    },
    OUT_FOR_DELIVERY: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
    },
    DELIVERED: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
    },
    CANCELED: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
    },
    RETURNED: {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
    },
  };

  const orderStatuses = [
    { id: "PENDING", label: "En attente", icon: <Clock size={18} /> },
    { id: "PREPARING", label: "En préparation", icon: <Package size={18} /> },
    { id: "SHIPPED", label: "Expédiée", icon: <Truck size={18} /> },
    { id: "IN_TRANSIT", label: "En transit", icon: <Truck size={18} /> },
    { id: "AT_OFFICE", label: "Au bureau", icon: <Building2 size={18} /> },
    {
      id: "OUT_FOR_DELIVERY",
      label: "Avec le livreur",
      icon: <User size={18} />,
    },
    { id: "DELIVERED", label: "Livrée", icon: <CheckCircle2 size={18} /> },
  ];

  const getStatusIndex = (status: string) => {
    const statusOrder = [
      "PENDING",
      "PREPARING",
      "SHIPPED",
      "IN_TRANSIT",
      "AT_OFFICE",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ];
    return statusOrder.indexOf(status);
  };

  const handleUpdateStatus = async () => {
    try {
      const res = await fetch("/api/orders/update-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: selectedStatus, note }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success("Statut mis à jour avec succès!");
      setOrder({ ...order, status: selectedStatus });
      setIsOpen(false);
      setNote("");
    } catch (error) {
      console.error(error);
      toast.error("Échec de la mise à jour du statut");
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/get-order?orderId=${orderId}`);
        if (!res.ok) throw new Error("Error fetching Order");
        const { order } = await res.json();
        setOrder(order);
        setSelectedStatus(order.status);
      } catch (error) {
        toast.error("Erreur lors du chargement de la commande");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  function openDeletePopup(order: any) {
    setIsDeleteOpen(true);
    // setSelectedOrder(order);
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
  

      router.push(`/${ lang }/`);
      toast.success("Order deleted successfully")
    } catch (error: any) {
      toast.error(error.message || "Error deleting order")
      console.error(error)
    }
  }

  if (isLoading) return <Loader />;

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">{dict.orderDetails.notFound}</p>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const subtotal =
    order.items?.reduce(
      (acc: number, item: any) => acc + item.price * item.quantity,
      0,
    ) || 0;
  const statusColor = statusColors[order.status] || statusColors["PENDING"];
  const isCancelable = ![
    "DELIVERED",
    "CANCELED",
    "RETURNED",
    "SHIPPED",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
  ].includes(order.status);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {isDeleteOpen && (
        <PopUp
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          children={
            <div className="w-full flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {dict.orderDetails.deleteTitle}
              </h2>

              <p className="mt-3 text-sm text-gray-600">
                {dict.orderDetails.deleteConfirm}
                <br />
                <span className="text-red-500 font-medium">
                  {dict.orderDetails.deleteWarning}
                </span>
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  {dict.orderDetails.cancel}
                </button>
{/* handleDeleteOrder() */}
                <button
                  onClick={() => deleteOrder(order.id)}
                  className="px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
                >
                  {dict.orderDetails.confirmDelete}
                </button>
              </div>
            </div>
          }
        />
      )}

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          {dict.orderDetails.back}
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {dict.orderDetails.order} #{order.id}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div
            className={`flex items-center px-4 py-2 rounded-lg font-medium ${statusColor.bg} ${statusColor.text}`}
          >
            <Clock size={18} className="mr-2" />
            {statusLabels[order.status]}
          </div>
        </div>
      </div>

      {/* Order Progress */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-6">
            {dict.orderDetails.orderProgress}
          </h2>

          <div className="relative mb-8">
            <div
              className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200"
              style={{ width: "calc(100% - 48px)", marginLeft: "24px" }}
            >
              <div
                className="h-full bg-green-500 transition-all"
                style={{
                  width:
                    orderStatuses.length > 1
                      ? `${(currentStatusIndex / (orderStatuses.length - 1)) * 100}%`
                      : "0%",
                }}
              />
            </div>

            <div className="flex justify-between relative">
              {orderStatuses.map((status, index) => (
                <div key={status.id} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      index <= currentStatusIndex
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {status.icon}
                  </div>
                  <p
                    className={`text-xs mt-2 ${
                      index <= currentStatusIndex
                        ? "text-gray-900 font-medium"
                        : "text-gray-400"
                    }`}
                  >
                    {status.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-1 space-y-6">
          {/* Customer */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <User size={20} className="mr-2" />
              {dict.orderDetails.customer}
            </h2>
            <p className="font-medium">{order.fullName}</p>
            <p className="text-sm text-gray-600">{order.phoneNumber}</p>
          </div>

          {/* Delivery */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin size={20} className="mr-2" />
              {dict.orderDetails.delivery}
            </h2>

            <div className="space-y-3 text-sm">
         <div className="flex items-center gap-2">
                             <span >
                              <span className="text-gray-600">
                               {dict.orders.delivery}:
                              </span>
                               <span className="font-medium mx-1">
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
              <p>
                <span className="text-gray-600">{dict.orderDetails.wilaya}:</span>{" "}
                <span className="font-medium">{order.wilaya}</span>
              </p>
              <p>
                <span className="text-gray-600">{dict.orderDetails.commune}:</span>{" "}
                <span className="font-medium">{order.commune}</span>
              </p>

              {order.shippingCompany && (
                <p>
                  <span className="text-gray-600">{dict.orderDetails.company}:</span>{" "}
                  <span className="font-medium">{order.shippingCompany}</span>
                </p>
              )}

              {order.detailedAddress && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-semibold text-blue-900 mb-1">
                    {dict.orderDetails.address}
                  </p>
                  <p className="text-blue-700">{order.detailedAddress}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">
              {dict.orderDetails.products}
            </h2>

            <div className="space-y-4">
              {order.items.map((item : any) => (
                <div
                  key={item.id}
                  className="flex space-x-4 pb-4 border-b border-gray-200 last:border-0"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    {item.product?.images?.[0] ? (
                      <img
                        src={item.product.images[0]}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-gray-400 mx-auto my-auto" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {getTranslations(item.product?.translations,  lang , "name")}
                    </p>

                    {item.variantName && (
                      <span className="my-2 inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        <Tag className="w-3 h-3 text-gray-500" />
                        {item.variantName}
                      </span>
                    )}

                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {getTranslations(item.product?.translations,  lang , "description")}
                    </p>

                    {item.addOns?.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {item.addOns.map((addOn : any) => (
                          <p key={addOn.id} className="text-sm text-gray-500">
                            + {addOn.name} × {addOn.quantity} (
                            {addOn.unitPrice.toLocaleString()} DA)
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <p>
                      <span className="font-semibold text-teal-600">
                        {item.unitPrice.toLocaleString()} DA
                      </span>
                      <span className="text-sm text-gray-500"> x {item.quantity}</span>
                    </p>
                    <p className="font-semibold text-gray-900">
                      {item.total.toLocaleString()} DA
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{dict.orderDetails.subtotal}</span>
                <span className="font-medium">
                  {order.subtotal.toLocaleString()} DA
                </span>
              </div>

              {order.discountTotal > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{dict.orderDetails.discount}</span>
                  <span>- {order.discountTotal.toLocaleString()} DA</span>
                </div>
              )}

              {order.shippingPrice != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{dict.orderDetails.shipping}</span>
                  <span className="font-medium">
                   + {order.shippingPrice.toLocaleString()} DA
                  </span>
                </div>
              )}

              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                <span>{dict.orderDetails.total}</span>
               <span>
  {(Number(order.total) + Number(order.shippingPrice)).toLocaleString()} DA
</span>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Clock size={20} className="mr-2" />
              {dict.orderDetails.orderInfo}
            </h2>

            <p className="font-medium">{statusLabels[order.status]}</p>
            <p className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="mt-4 gap-3">
            {order.status === "DELIVERED" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Exchange */}
                <button
                  onClick={() => router.push(`/${lang}/orders/${order.id}/exchange`)}
                  className="w-full p-4 rounded-2xl border bg-yellow-50 border-yellow-200 hover:bg-yellow-100 transition text-left flex items-center gap-4"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-yellow-100 text-yellow-700">
                    <RefreshCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-yellow-800">{dict.orderDetails.exchange}</p>
                    <p className="text-xs text-yellow-700">{dict.orderDetails.exchangeDesc}</p>
                  </div>
                </button>

                {/* Return */}
                <button
                  onClick={() => router.push(`/${lang}/orders/${order.id}/return`)}
                  className="w-full p-4 rounded-2xl border bg-red-50 border-red-200 hover:bg-red-100 transition text-left flex items-center gap-4"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 text-red-700">
                    <RefreshCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-800">{dict.orderDetails.return}</p>
                    <p className="text-xs text-red-700">{dict.orderDetails.returnDesc}</p>
                  </div>
                </button>
              </div>
            )}

            {order.status === "PENDING" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Edit */}
                <button
                  onClick={() => router.push(`/${lang}/checkout?editOrder=${order.id}`)}
                  className="w-full p-4 rounded-2xl border bg-blue-50 border-blue-200 hover:bg-blue-100 transition text-left flex items-center gap-4"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 text-blue-700">
                    <Edit className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-800">{dict.orderDetails.edit}</p>
                    <p className="text-xs text-blue-700">{dict.orderDetails.editDesc}</p>
                  </div>
                </button>

                {/* Delete */}
                <button
                  onClick={() => openDeletePopup(order)}
                  className="w-full p-4 rounded-2xl border bg-red-50 border-red-200 hover:bg-red-100 transition text-left flex items-center gap-4"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 text-red-700">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-800">{dict.orderDetails.delete}</p>
                    <p className="text-xs text-red-700">{dict.orderDetails.deleteDesc}</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
