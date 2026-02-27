"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Globe,
  Package,
  Truck,
  CheckCircle2,
  User,
  MapPin,
  Clock,
  X,
  Home,
  Building2,
  Palette,
  Wrench,
  Tag,
} from "lucide-react";
import PopUp from "@/components/PopUp";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";
import { getTranslations } from "@/lib/getTranslations";
import { useLang } from "@/components/LanguageContext";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState("PENDING");
  const [note, setNote] = useState("");
  const { lang } = useLang();

  const statusLabels: Record<string, string> = {
    PENDING: "Pending",
    PREPARING: "Preparing",
    SHIPPED: "Shipped",
    IN_TRANSIT: "In Transit",
    AT_OFFICE: "At Office",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Delivered",
    CANCELED: "Cancelled",
    RETURNED: "Returned",
  };

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

  const orderStatuses = [
    { id: "PENDING", label: "Pending", icon: <Clock size={24} /> },
    { id: "PREPARING", label: "Preparing", icon: <Package size={24} /> },
    { id: "SHIPPED", label: "Shipped", icon: <Truck size={24} /> },
    { id: "IN_TRANSIT", label: "In Transit", icon: <Truck size={24} /> },
    { id: "AT_OFFICE", label: "At Office", icon: <Building2 size={24} /> },
    {
      id: "OUT_FOR_DELIVERY",
      label: "Out for Delivery",
      icon: <User size={24} />,
    },
    { id: "DELIVERED", label: "Delivered", icon: <CheckCircle2 size={24} /> },
  ];

  const handleUpdateStatus = async () => {
    try {
      const res = await fetch("/api/orders/update-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: orderId,
          status: selectedStatus,
          note: note,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      toast.success("Status updated successfully!");

      // Update local order state
      setOrder({ ...order, status: selectedStatus });
      setIsOpen(false);
      setNote("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update order status");
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/get-order?orderId=${orderId}`);

        if (!res.ok) {
          throw new Error("Error fetching Order");
        }

        const { order } = await res.json();
        setOrder(order);
        setSelectedStatus(order.status);
      } catch (error) {
        toast.error("Error fetching Order");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  console.log(order);

  if (isLoading) {
    return <Loader />;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Order not found</p>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const subtotal =
    order.items?.reduce(
      (acc: number, item: any) => acc + item.price * item.quantity,
      0,
    ) || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {isOpen && (
        <PopUp
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Update Order Status"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="PENDING">Pending</option>
                <option value="PREPARING">Preparing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="AT_OFFICE">At Office</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELED">Cancelled</option>
                <option value="RETURNED">Returned</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about this status update..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </PopUp>
      )}

      <div>
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Order #{order.id}
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

            <div className="flex items-center space-x-3">
              <div
                className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                  order.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-800"
                    : order.status === "PREPARING"
                      ? "bg-blue-100 text-blue-800"
                      : order.status === "SHIPPED" ||
                          order.status === "IN_TRANSIT"
                        ? "bg-purple-100 text-purple-800"
                        : order.status === "AT_OFFICE" ||
                            order.status === "OUT_FOR_DELIVERY"
                          ? "bg-indigo-100 text-indigo-800"
                          : order.status === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : order.status === "CANCELED"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                }`}
              >
                <Clock size={18} className="mr-2" />
                {statusLabels[order.status]}
              </div>
            </div>
          </div>
        </div>

        {/* Order Progress */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-6">Order Progress</h2>

            <div className="relative mb-8">
              {/* Progress Line */}
              <div
                className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200"
                style={{ width: "calc(100% - 48px)", marginLeft: "24px" }}
              >
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{
                    width: `${(currentStatusIndex / (orderStatuses.length - 1)) * 100}%`,
                  }}
                ></div>
              </div>

              {/* Status Steps */}
              <div className="flex justify-between relative">
                {orderStatuses.map((status, index) => (
                  <div
                    key={status.id}
                    className="flex flex-col items-center"
                    style={{ zIndex: 1 }}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        index <= currentStatusIndex
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {status.icon}
                    </div>
                    <p
                      className={`text-xs mt-2 text-center ${index <= currentStatusIndex ? "text-gray-900 font-medium" : "text-gray-400"}`}
                    >
                      {status.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsOpen(true)}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Update Status
            </button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <User className="mr-2" size={20} />
                <h2 className="text-lg font-semibold">Customer</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-base font-medium">{order.fullName}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-base font-medium">{order.phoneNumber}</p>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <MapPin className="mr-2" size={20} />
                <h2 className="text-lg font-semibold">Delivery</h2>
              </div>

              <div className="space-y-4">
                {order.deliveryMethod && (
                  <div>
                    <p className="text-sm text-gray-600">Delivery Method</p>
                    <p className="text-base font-medium">
                      {order.deliveryMethod}
                    </p>
                  </div>
                )}

                {order.shippingCompany && (
                  <div>
                    <p className="text-sm text-gray-600">Delivery Company</p>
                    <p className="text-base font-medium">
                      {order.shippingCompany}
                    </p>
                  </div>
                )}

                {order.detailedAddress && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      Address
                    </p>
                    <div className="flex items-start mt-2">
                      <MapPin
                        size={16}
                        className="text-blue-600 mr-1 mt-0.5 flex-shrink-0"
                      />
                      <p className="text-sm text-blue-700">
                        {order.detailedAddress}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600">Wilaya</p>
                  <p className="text-base font-medium">{order.wilaya}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Commune</p>
                  <p className="text-base font-medium">{order.commune}</p>
                </div>

                {order.deliveryNote && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Delivery Note
                    </p>
                    <p className="text-sm text-gray-700">
                      {order.deliveryNote}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Products</h2>

              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      router.push(`/${{ lang }}/products/${item.productId}`)
                    }
                    className="flex group items-start space-x-4 pb-4 border-b border-gray-200 last:border-0 cursor-pointer"
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="border w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-medium group-hover:underline text-gray-900">
                        {getTranslations(
                          item.product?.translations,
                          { lang },
                          "name",
                        ) || "Product"}
                      </h3>

                      {item.variantName && (
                        <span className="my-2 inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          <Tag className="w-3 h-3 text-gray-500" />
                          {item.variantName}
                        </span>
                      )}

                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {getTranslations(
                          item.product?.translations,
                          { lang },
                          "description",
                        )}
                      </p>

                      {/* Add-ons */}
                      {item.addOns?.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {item.addOns.map((addOn) => (
                            <p key={addOn.id} className="text-sm text-gray-500">
                              + {addOn.name} × {addOn.quantity} (
                              {addOn.unitPrice.toLocaleString()} DA)
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Unit price & quantity */}
                    <div className="text-right">
                      <p>
                        <span className="font-semibold text-teal-600">
                          {item.unitPrice.toLocaleString()} DA
                        </span>{" "}
                        <span className="text-sm text-gray-500">
                          x {item.quantity}
                        </span>
                      </p>
                      <p className="font-semibold text-gray-900">
                        {item.total.toLocaleString()} DA
                      </p>
                    </div>

                    {/* Total */}
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {order.subtotal.toLocaleString()} DA
                  </span>
                </div>

                <div className="flex justify-between text-green-600">
                  <span>Réduction</span>
                  <span className="font-semibold">
                    {/* discount.toLocaleString() */}−{" "}
                    {order.discountTotal.toLocaleString()} DA
                  </span>
                </div>

                {order.shippingPrice && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Shipping / Delivery cost
                    </span>
                    <span className="font-medium">
                      + {order.shippingPrice.toLocaleString()} DA
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{order.total.toLocaleString()} DA</span>
                </div>
              </div>
            </div>

            {/* Status History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Clock className="mr-2" size={20} />
                <h2 className="text-lg font-semibold">Order Information</h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      order.status === "PENDING"
                        ? "bg-yellow-100"
                        : order.status === "DELIVERED"
                          ? "bg-green-100"
                          : order.status === "CANCELED"
                            ? "bg-red-100"
                            : "bg-blue-100"
                    }`}
                  >
                    <Clock
                      size={16}
                      className={
                        order.status === "PENDING"
                          ? "text-yellow-600"
                          : order.status === "DELIVERED"
                            ? "text-green-600"
                            : order.status === "CANCELED"
                              ? "text-red-600"
                              : "text-blue-600"
                      }
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {statusLabels[order.status]}
                    </p>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
