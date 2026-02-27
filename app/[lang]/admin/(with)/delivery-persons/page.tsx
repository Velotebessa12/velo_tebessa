"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  RefreshCw,
  Truck,
  Edit,
  Trash2,
  CheckCircle,
  User,
  Eye,
  MotorbikeIcon,
  Package,
  Info,
} from "lucide-react";
import PopUp from "@/components/PopUp";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LanguageContext";
import Loader from "@/components/Loader";

  type DeliveryAction = "CONFIRM" | "RETURN"

export default function DeliveryPersonsPage() {
  const [showModal, setShowModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  // const [deliveryPersons, setDeliveryPersons] = useState([
  //   {
  //     id: "1",
  //     name: "All",
  //     phone: "0540048630",
  //     pendingBalance: "0 DA",
  //     pendingDeliveries: "0",
  //     totalDelivered: "5",
  //   },
  // ]);
  const [isEditingOpen, setIsEditingOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [pendingDeliveries, setPendingDeliveries] = useState<any[]>([]);
  const [deliveryPersons, setDeliveryPersons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDeliveriesOpen, setIsDeliveriesOpen] = useState(false);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<any | null>(null);
  const [deliveries, setDeliveries] = useState([]);
  const router = useRouter();
  const { lang } = useLang();
  const [isDeliveriesngLoading, setIsDeliveriesLoading] = useState(false);
  const [tab, setTab] = useState<"info" | "balance">("info");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Run both requests in parallel
        const [deliveryPersonsRes, ordersRes] = await Promise.all([
          fetch("/api/delivery/get-delivery-persons"),
          fetch("/api/delivery/persons/get-orders"),
        ]);

        if (!deliveryPersonsRes.ok || !ordersRes.ok) {
          throw new Error("Error occurred while fetching data");
        }

        const { deliveryPersons } = await deliveryPersonsRes.json();
        const { pendingDeliveries } = await ordersRes.json();

        setDeliveryPersons(deliveryPersons);
        setPendingDeliveries(pendingDeliveries);
      } catch (error) {
        toast.error("Error occurred: try again later");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRefresh = () => {
    console.log("Refreshing...");
  };

  const handleAddPerson = () => {
    setShowModal(true);
    // Add role Delivery and Permissions : delivery-person
  };

  const handleEdit = (id: string) => {
    console.log("Edit person:", id);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this delivery person?")) {
      setDeliveryPersons(deliveryPersons.filter((p) => p.id !== id));
    }
  };

  function openEditPopup(deliveryPerson : any) {
    setName(deliveryPerson.name);
    setPhoneNumber(deliveryPerson.phoneNumber);
    setEmail(deliveryPerson.email);
    setPassword(deliveryPerson.password);
    setSelectedDeliveryPerson(deliveryPerson);
    setIsEditingOpen(true);
  }

  function openDeletePopup(deliveryPerson : any) {
    setSelectedDeliveryPerson(deliveryPerson);
    setIsDeleteOpen(true);
  }

  function openDeliveriesPopup(deliveryPerson : any) {
    setIsDeliveriesLoading(true);
    setIsDeliveriesOpen(true);
    setSelectedDeliveryPerson(deliveryPerson);
    fetchPersonDeliveries(deliveryPerson.id);
  }

  const handleViewDeliveries = (id: string) => {
    console.log("View deliveries for:", id);
  };

  async function handleNewDeliveryPerson() {
    try {
      const response = await fetch("/api/delivery/create-delivery-person", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phoneNumber,
          email,
          password,
          permissions: [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create employee");
      }

      setDeliveryPersons(prev => [data.deliveryPerson , ...prev])
      setIsOpen(false);
      toast.success("Employee created successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong");
    }
  }

  async function handleWithdraw() {
    try {
      const response = await fetch("/api/delivery/persons/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deliveryPersonId: selectedDeliveryPerson?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create employee");
      }

      setSelectedDeliveryPerson((prev : any) => ({ ...prev, pendingBalance: 0 }));

      toast.success("Withraw created successfully , addded to caiss !");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong");
    }
  }

  const fetchPersonDeliveries = async (deliveryPersonId: string) => {
    try {
      setIsDeliveriesLoading(true);
      const res = await fetch(
        `/api/delivery/persons/get-orders?deliveryPersonId=${deliveryPersonId}`,
      );

      if (!res.ok) {
        throw new Error("Error fetching orders");
      }

      const { pendingDeliveries } = await res.json();
      setDeliveries(pendingDeliveries);
    } catch (error) {
      toast.error("Error fetching orders");
      console.error(error);
    } finally {
      setIsDeliveriesLoading(false);
    }
  };



const handleDeliveryAction = async (
  orderId: string,
  action: DeliveryAction
) => {
  try {
    const endpoint =
      action === "CONFIRM"
        ? "/api/delivery/persons/confirm-delivery"
        : "/api/delivery/persons/return-delivery"

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        deliveryPersonId: selectedDeliveryPerson.id, // assuming logged-in delivery user
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Action failed")
    }

    toast.success(
      action === "CONFIRM"
        ? "Delivery confirmed successfully"
        : "Order returned successfully"
    )

   
  } catch (error: any) {
    toast.error(error.message || "Something went wrong")
    console.error(error)
  }
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
                Delete DeliveryPerson
              </h2>
              <p className="mt-3 text-sm text-gray-600">
                Are you sure you want to delete this deliveryPerson?
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
          children={
            <>
              <div className=" p-4 sm:p-6">
          
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom
                        </label>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          type="text"
                          placeholder="Entrez le nom"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Téléphone
                        </label>
                        <input
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          type="tel"
                          placeholder="0555000000"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email (optionnel)
                      </label>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="email@example.com"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mot de passe
                      </label>
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        placeholder="********"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-sm"
                      />
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition text-sm">
                        Annuler
                      </button>

                      <button className="flex-1 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition text-sm">
                        Update
                      </button>
                    </div>
                  </div>
             

               
              </div>
            </>
          }
        />
      )}

      {/* ── Deliveries List Popup ────────────────────────────────────────────── */}
      {isDeliveriesOpen && (
        <PopUp
          title="Deliveries List"
          isOpen={isDeliveriesOpen}
          onClose={() => setIsDeliveriesOpen(false)}
          children={
            <div className="space-y-3">
              {isDeliveriesngLoading ? (
                <Loader />
              ) : deliveries.length === 0 ? (
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="p-4 bg-gray-100 rounded-full mb-4">
    <Package className="w-8 h-8 text-gray-400" />
  </div>
  <p className="text-sm font-medium text-gray-600">No deliveries found</p>
  <p className="text-xs text-gray-400 mt-1">Orders will appear here once created</p>
</div>
              ) : (
                deliveries.map((delivery : any) => (
             <div
  key={delivery.id}
  className="bg-white border border-gray-200 rounded-md px-4 py-4 shadow-sm hover:shadow-md transition flex items-center gap-4 w-full"
>
  {/* Customer */}
  <div className="flex-1 min-w-0">
    <p className="text-sm font-semibold text-gray-800 truncate">{delivery.fullName}</p>
    <p className="text-xs text-gray-400 truncate">{delivery.phoneNumber}</p>
  </div>

  {/* Location */}
  <div className="hidden sm:block shrink-0">
    <p className="text-sm font-medium text-gray-700">{delivery.wilaya}</p>
    <p className="text-xs text-gray-400">{delivery.commune}</p>
  </div>

  {/* Total */}
  <div className="shrink-0 text-right">
    <p className="text-sm font-bold text-gray-800">{delivery.total} Da</p>
    <p className="text-xs text-gray-400">+{delivery.shippingPrice || 0} ship</p>
  </div>

  {/* Status or Actions */}
  {delivery.status === "DELIVERED" ? (
    <div className="flex flex-col items-center gap-2 shrink-0">
     <button
  onClick={() => handleDeliveryAction(delivery.id, "CONFIRM")}
  className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition"
>
  Confirm
</button>

<button
  onClick={() => handleDeliveryAction(delivery.id, "RETURN")}
  className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition"
>
  Return
</button>
    </div>
  ) : (
    <span className={`shrink-0 px-3 py-1 text-xs font-medium rounded-full ${
      delivery.status === "CANCELLED"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700"
    }`}>
      {delivery.status}
    </span>
  )}
</div>
                ))
              )}
            </div>
          }
        />
      )}

      {/* ── Add Delivery Person Popup ────────────────────────────────────────── */}
      {isOpen && (
        <PopUp
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Ajouter un nouveau livreur"
          children={
            <div className="space-y-4">
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="Entrez le nom"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    type="tel"
                    placeholder="0555000000"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (optionnel)
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="email@example.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="********"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-sm"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition text-sm">
                  Annuler
                </button>
                <button
                  onClick={handleNewDeliveryPerson}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-1">
              Delivery Persons
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Manage delivery persons and pending payments
            </p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-xs sm:text-sm font-medium"
          >
            <Plus size={16} className="sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Add Delivery Person</span>
            <span className="xs:hidden">Add</span>
          </button>
        </div>

        {/* ── Delivery Person Cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          {deliveryPersons.map((person) => (
            <div
              key={person.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <img
                      src="/images/delivery-scooter.png"
                      alt="Scooter delivery"
                      className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                      {person.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {person.phoneNumber}
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">
                    Pending Balance
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-orange-600">
                     {person.deliveryOrders
    .filter((order : any) => order.status !== "DELIVERED")
    .reduce(
      (acc : number, order : any ) => acc + Number(order.shippingPrice || 0),
      0
    )
    .toLocaleString()}{" "}
  DA
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">
                    Pending Deliveries
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900">
                    {person.deliveryOrders.filter((o : any) => o.status !== "DELIVERED")
                      ?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">
                    Total Delivered
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900">
                    {person.deliveryOrders?.length || 0}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => openDeliveriesPopup(person)}
                  className="flex-1 px-3 sm:px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Deliveries
                </button>
                <button
                  onClick={() => openEditPopup(person)}
                  className="px-2.5 sm:px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Info
                    size={16}
                    className="text-gray-600 sm:w-[18px] sm:h-[18px]"
                  />
                </button>
                <button
                  onClick={() => openDeletePopup(person)}
                  className="px-2.5 sm:px-3 py-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2
                    size={16}
                    className="text-red-600 sm:w-[18px] sm:h-[18px]"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Pending Deliveries ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-xl font-semibold text-gray-900">
              Pending Deliveries
            </h2>
          </div>

          {/* Desktop table (md+) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </th>
                  {[
                    "Order",
                    "Customer",
                    "Status",
                    "Date",
                    "Amount",
                    "",
                    // "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {pendingDeliveries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-12 text-center text-gray-500 text-sm"
                    >
                      No pending deliveries
                    </td>
                  </tr>
                ) : (
                  pendingDeliveries.map((delivery: any) => (
                    <tr
                      key={delivery.id}
                      className="hover:bg-gray-50 transition border-b"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          #{delivery.id.slice(0, 8)}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {delivery.fullName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {delivery.phoneNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {delivery.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {new Date(delivery.createdAt).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {delivery.total.toLocaleString()} DA
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" />
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              router.push(
                                `/${{ lang }}/admin/orders/${delivery.id}`,
                              )
                            }
                            className="p-1.5 hover:bg-gray-100 rounded transition"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => openEditPopup(delivery)}
                            className="p-1.5 hover:bg-gray-100 rounded transition"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => openDeliveryServicePopup(delivery)}
                            className="p-1.5 hover:bg-gray-100 rounded transition"
                          >
                            <Truck className="w-4 h-4 text-gray-600" />
                          </button>
                          {delivery.wilaya === "Tébessa" && (
                            <button
                              onClick={() => openDeliveryPersonPopup(delivery)}
                              className="p-1.5 hover:bg-gray-100 rounded transition"
                            >
                              <User className="w-4 h-4 text-gray-600" />
                            </button>
                          )}
                          <button
                            onClick={() => openDeletePopup(delivery)}
                            className="p-1.5 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div> */}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile card list (below md) */}
          <div className="md:hidden divide-y divide-gray-100">
            {pendingDeliveries.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">
                No pending deliveries
              </div>
            ) : (
              pendingDeliveries.map((delivery: any) => (
                <div
                  key={delivery.id}
                  className="p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Row 1: order ID + status + amount */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-sm font-semibold text-gray-900 tabular-nums flex-shrink-0">
                        #{delivery.id.slice(0, 8)}
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full flex-shrink-0 ${
                          delivery.status === "DELIVERED"
                            ? "bg-green-100 text-green-700"
                            : delivery.status === "CANCELLED"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {delivery.status}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 flex-shrink-0 tabular-nums">
                      {delivery.total.toLocaleString()} DA
                    </span>
                  </div>

                  {/* Row 2: customer name + phone */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-sm text-gray-700 font-medium truncate flex-1">
                      {delivery.fullName}
                    </span>
                    <span className="text-gray-300 text-xs">·</span>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {delivery.phoneNumber}
                    </span>
                  </div>

                  {/* Row 3: product images + date + actions */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[11px] text-gray-400 flex-shrink-0">
                        {new Date(delivery.createdAt).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "short",
                          },
                        )}
                      </span>
                    </div>

                    {/* Actions */}
                    {/* <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button
                        onClick={() =>
                          router.push(
                            `/${{ lang }}/admin/orders/${delivery.id}`,
                          )
                        }
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => openEditPopup(delivery)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => openDeliveryServicePopup(delivery)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                      >
                        <Truck className="w-4 h-4 text-gray-600" />
                      </button>
                      {delivery.wilaya === "Tébessa" && (
                        <button
                          onClick={() => openDeliveryPersonPopup(delivery)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                        >
                          <User className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                      <button
                        onClick={() => openDeletePopup(delivery)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div> */}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
