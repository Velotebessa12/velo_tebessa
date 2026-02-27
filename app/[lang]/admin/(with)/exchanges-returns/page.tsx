"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronDownCircleIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import PopUp from "@/components/PopUp";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LanguageContext";
import Loader from "@/components/Loader";

export default function ExchangeManagementPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [isExchangeOpen, setIsExchangeOpen] = useState(false);
  const router = useRouter();
  const { lang } = useLang();
  const [tab, setTab] = useState<"exchanges" | "returns">("exchanges");
  const [exchanges, setExchanges] = useState([]);

  useEffect(() => {
    const fetchExchanges = async () => {
      try {
        const res = await fetch("/api/exchanges/get-exchanges");

        if (!res.ok) {
          throw new Error("Error fetching exchanges");
        }

        const { exchanges } = await res.json();
        setExchanges(exchanges);
      } catch (error) {
        toast.error("Error fetching exchanges");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchanges();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-orange-100 text-orange-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleRefresh = () => {
    console.log("Refreshing...");
  };

  const handleViewOrder = (id: string) => {
    console.log("View order:", id);
    setIsOpen(true);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4">
      {/* ── View Popup ───────────────────────────────────────────────────────── */}
      {isOpen && (
        <PopUp
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          children={
            <>View Order (Exchange) with all products : update status</>
          }
        />
      )}

      <div>
        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="flex items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
              Exchange / Returns Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
              Review and approve product exchange requests
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("exchanges")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition
            ${
              tab === "exchanges"
                ? "bg-teal-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Exchanges
          </button>

          <button
            onClick={() => setTab("returns")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition
            ${
              tab === "returns"
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Returns
          </button>
        </div>

        {tab === "exchanges" && (
          <>
            {/* ── Exchange Cards ───────────────────────────────────────────────────── */}
            <div className="space-y-3 sm:space-y-4">
              {exchanges.map((exchange : any) => (
                <div
                  key={exchange.id}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  {/* Top accent bar based on status */}
                  <div
                    className={`h-1 w-full ${
                      exchange.status === "PENDING"
                        ? "bg-amber-400"
                        : exchange.status === "APPROVED"
                          ? "bg-blue-500"
                          : exchange.status === "COMPLETED"
                            ? "bg-emerald-500"
                            : "bg-red-400"
                    }`}
                  />

                  <div className="p-4 sm:p-5 md:p-6">
                    {/* Card header */}
                    <div className="flex items-start sm:items-center justify-between gap-3 mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-4 h-4 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                              #{exchange.exchangeNumber}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-md tracking-wide uppercase ${
                                exchange.status === "PENDING"
                                  ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                                  : exchange.status === "APPROVED"
                                    ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                                    : exchange.status === "COMPLETED"
                                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                      : "bg-red-50 text-red-700 ring-1 ring-red-200"
                              }`}
                            >
                              {exchange.status.charAt(0) +
                                exchange.status.slice(1).toLowerCase()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(exchange.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                            {exchange.reason && (
                              <span className="ml-2 text-gray-400 italic">
                                · {exchange.reason}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* setIsOpen(true) */}
                        <button
                          onClick={() =>
                            router.push(
                              `/${{ lang }}/admin/orders/${exchange.orderId}`,
                            )
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Eye size={13} />
                          <span className="hidden sm:inline">View Order</span>
                        </button>

                        <button
                          onClick={() => setIsExchangeOpen((prev) => !prev)}
                          className={`p-1.5 rounded-lg border transition-all duration-200 ${
                            isExchangeOpen
                              ? "bg-gray-900 border-gray-900 text-white"
                              : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <ChevronDownCircleIcon
                            size={16}
                            className={`transition-transform duration-300 ${isExchangeOpen ? "rotate-180" : ""}`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Totals row */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {/* Returned */}
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 sm:p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
                            <span className="hidden sm:inline">Returned</span>
                            <span className="sm:hidden">Ret.</span>
                          </p>
                        </div>
                        <p className="text-base sm:text-xl font-bold text-gray-800 tabular-nums">
                          {exchange.returnedTotal.toLocaleString()}
                          <span className="text-xs font-medium text-gray-400 ml-1">
                            DA
                          </span>
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {
                            exchange.items.filter((i : any) => i.type === "RETURNED")
                              .length
                          }{" "}
                          item(s)
                        </p>
                      </div>

                      {/* New */}
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 sm:p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
                            New
                          </p>
                        </div>
                        <p className="text-base sm:text-xl font-bold text-gray-800 tabular-nums">
                          {exchange.newTotal.toLocaleString()}
                          <span className="text-xs font-medium text-gray-400 ml-1">
                            DA
                          </span>
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {
                            exchange.items.filter((i : any) => i.type === "NEW")
                              .length
                          }{" "}
                          item(s)
                        </p>
                      </div>

                      {/* Difference */}
                      <div
                        className={`rounded-xl border p-3 sm:p-4 ${
                          exchange.difference > 0
                            ? "border-orange-100 bg-orange-50"
                            : exchange.difference < 0
                              ? "border-blue-100 bg-blue-50"
                              : "border-gray-100 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              exchange.difference > 0
                                ? "bg-orange-400"
                                : exchange.difference < 0
                                  ? "bg-blue-400"
                                  : "bg-gray-300"
                            }`}
                          />
                          <p
                            className={`text-[10px] sm:text-xs font-medium uppercase tracking-wide ${
                              exchange.difference > 0
                                ? "text-orange-500"
                                : exchange.difference < 0
                                  ? "text-blue-500"
                                  : "text-gray-500"
                            }`}
                          >
                            Diff.
                          </p>
                        </div>
                        <p
                          className={`text-base sm:text-xl font-bold tabular-nums ${
                            exchange.difference > 0
                              ? "text-orange-600"
                              : exchange.difference < 0
                                ? "text-blue-600"
                                : "text-gray-500"
                          }`}
                        >
                          {exchange.difference > 0 ? "+" : ""}
                          {exchange.difference.toLocaleString()}
                          <span className="text-xs font-medium ml-1 opacity-60">
                            DA
                          </span>
                        </p>
                        <p
                          className={`text-[10px] mt-1 ${
                            exchange.difference > 0
                              ? "text-orange-400"
                              : exchange.difference < 0
                                ? "text-blue-400"
                                : "text-gray-400"
                          }`}
                        >
                          {exchange.difference > 0
                            ? "Customer pays"
                            : exchange.difference < 0
                              ? "Refund due"
                              : "Even"}
                        </p>
                      </div>
                    </div>

                    {/* Expanded items */}
                    {isExchangeOpen && (
                      <div className="mt-4 space-y-3">
                        {/* Divider */}
                        <div className="flex items-center gap-2">
                          <div className="h-px flex-1 bg-gray-100" />
                          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                            Items
                          </span>
                          <div className="h-px flex-1 bg-gray-100" />
                        </div>

                        {/* RETURNED */}
                        {exchange.items.filter((i : any) => i.type === "RETURNED")
                          .length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-semibold text-red-500 uppercase tracking-widest">
                                ↩ Returned
                              </span>
                            </div>
                            {exchange.items
                              .filter((i : any) => i.type === "RETURNED")
                              .map((item : any) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-3 p-3 rounded-xl border border-red-50 bg-red-50/40 hover:bg-red-50 transition-colors"
                                >
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-red-100 flex-shrink-0 flex items-center justify-center">
                                    <span className="text-xs font-bold text-red-400">
                                      {item.name.slice(0, 2).toUpperCase()}
                                      <img
                                        src={item.product.images?.[0]}
                                        alt=""
                                      />
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">
                                      {item.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                      {item.variant && (
                                        <span className="text-[10px] bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded-md">
                                          {item.variant}
                                        </span>
                                      )}
                                      <span className="text-[10px] text-gray-400">
                                        Qty: {item.quantity}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <div className="text-sm font-semibold text-gray-800">
                                      {item.total.toLocaleString()}{" "}
                                      <span className="text-xs font-normal text-gray-400">
                                        DA
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-gray-400">
                                      {item.price.toLocaleString()} ×{" "}
                                      {item.quantity}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}

                        {/* NEW */}
                        {exchange.items.filter((i : any) => i.type === "NEW").length >
                          0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-widest">
                                ✦ New
                              </span>
                            </div>
                            {exchange.items
                              .filter((i : any) => i.type === "NEW")
                              .map((item : any) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-3 p-3 rounded-xl border border-emerald-50 bg-emerald-50/40 hover:bg-emerald-50 transition-colors"
                                >
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-emerald-100 flex-shrink-0 flex items-center justify-center">
                                    <span className="text-xs font-bold text-emerald-500">
                                      {item.name.slice(0, 2).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">
                                      {item.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                      {item.variant && (
                                        <span className="text-[10px] bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded-md">
                                          {item.variant}
                                        </span>
                                      )}
                                      <span className="text-[10px] text-gray-400">
                                        Qty: {item.quantity}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <div className="text-sm font-semibold text-gray-800">
                                      {item.total.toLocaleString()}{" "}
                                      <span className="text-xs font-normal text-gray-400">
                                        DA
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-gray-400">
                                      {item.price.toLocaleString()} ×{" "}
                                      {item.quantity}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {exchanges.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-8 sm:p-12 text-center">
                <p className="text-gray-500 text-sm">No exchanges found</p>
              </div>
            )}
          </>
        )}

        {tab === "returns" && <div></div>}
      </div>
    </div>
  );
}
