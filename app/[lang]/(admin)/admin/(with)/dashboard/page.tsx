"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Package2,
  Users,
  UserPlus,
  ShoppingBag,
  RotateCcw,
  TrendingUp,
  UserCheck,
  Wallet,
  Receipt,
  Clock,
  BadgeDollarSign,
  CalendarDays,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useLang } from "@/components/LanguageContext";

// ─── Types ────────────────────────────────────────────────
interface DashboardData {
  products: {
    total: number;
    customers: number;
    newCustomers: number;
  };
  delivery: {
    totalOrders: number;
    returned: number;
    retourRate: number;
    byWilaya: { wilaya: string; total: number; returned: number; rate: number }[];
  };
  confirmation: {
    globalRate: number;
    totalOrders: number;
    totalConfirmed: number;
    team: { name: string; total: number; confirmed: number; rate: number }[];
  };
  finances: {
    caisse: number;
    expenses: number;
    pendingRevenue: number;
    returnLosses: number;
    netProfit: number;
  };
}

function fmt(n: number) {
  return Math.round(n).toLocaleString();
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function firstOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
}

function RateBar({ rate }: { rate: number }) {
  const color =
    rate > 20 ? "bg-red-400" : rate > 10 ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
      <div
        className={`h-1.5 rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${Math.min(rate, 100)}%` }}
      />
    </div>
  );
}

function ConfirmBar({ rate }: { rate: number }) {
  const color =
    rate >= 70 ? "bg-emerald-400" : rate >= 50 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
      <div
        className={`h-1.5 rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${Math.min(rate, 100)}%` }}
      />
    </div>
  );
}

export default function AdminDashboard() {
  const { lang } = useLang();
  const [startDate, setStartDate] = useState(firstOfMonth());
  const [endDate, setEndDate] = useState(today());
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [showAllWilaya, setShowAllWilaya] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `/api/admin/get-stats?startDate=${startDate}&endDate=${endDate}`
      );
      if (!res.ok) throw new Error("Fetch failed");
      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Erreur lors du chargement des statistiques");
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wilayaList = data?.delivery.byWilaya || [];
  const visibleWilayas = showAllWilaya ? wilayaList : wilayaList.slice(0, 6);

  // ── Build stat card arrays ─────────────────────────────
  const section1Stats = data
    ? [
        {
          title: "Produits actifs",
          value: fmt(data.products.total),
          icon: <Package2 className="w-6 h-6" />,
          color: "from-violet-500 to-purple-600",
          href: `/${lang}/admin/products`,
        },
        {
          title: "Total clients",
          value: fmt(data.products.customers),
          icon: <Users className="w-6 h-6" />,
          color: "from-blue-500 to-cyan-600",
          href: `/${lang}/admin/customers`,
        },
        {
          title: "Nouveaux clients",
          value: fmt(data.products.newCustomers),
          icon: <UserPlus className="w-6 h-6" />,
          color: "from-emerald-500 to-teal-600",
          href: `/${lang}/admin/customers`,
        },
      ]
    : [];

  const section2Stats = data
    ? [
        {
          title: "Total commandes",
          value: fmt(data.delivery.totalOrders),
          icon: <ShoppingBag className="w-6 h-6" />,
          color: "from-blue-500 to-cyan-600",
          href: `/${lang}/admin/orders`,
        },
        {
          title: "Retours (Routeur)",
          value: fmt(data.delivery.returned),
          icon: <RotateCcw className="w-6 h-6" />,
          color: "from-red-500 to-rose-600",
          href: `/${lang}/admin/exchanges-returns`,
        },
        {
          title: "Taux de retour global",
          value: `${data.delivery.retourRate}%`,
          icon: <TrendingUp className="w-6 h-6" />,
          color:
            data.delivery.retourRate > 20
              ? "from-red-500 to-rose-600"
              : data.delivery.retourRate > 10
              ? "from-amber-500 to-orange-600"
              : "from-emerald-500 to-teal-600",
          href: `/${lang}/admin/exchanges-returns`,
        },
      ]
    : [];

  const section4Stats = data
    ? [
        {
          title: "La Caisse",
          value: `${fmt(data.finances.caisse)} DA`,
          icon: <Wallet className="w-6 h-6" />,
          color: "from-violet-500 to-purple-600",
          href: `/${lang}/admin/cash-register`,
          change: null as number | null,
        },
        {
          title: "Dépenses",
          value: `${fmt(data.finances.expenses)} DA`,
          icon: <Receipt className="w-6 h-6" />,
          color: "from-red-500 to-rose-600",
          href: `/${lang}/admin/finances?tab=expenses`,
          change: null as number | null,
        },
        {
          title: "Bénéfice en attente",
          value: `${fmt(data.finances.pendingRevenue)} DA`,
          icon: <Clock className="w-6 h-6" />,
          color: "from-amber-500 to-orange-600",
          href: `/${lang}/admin/orders?status=IN_TRANSIT`,
          change: null as number | null,
        },
        {
          title: "Bénéfice net",
          value: `${fmt(Math.abs(data.finances.netProfit))} DA`,
          icon: <BadgeDollarSign className="w-6 h-6" />,
          color:
            data.finances.netProfit >= 0
              ? "from-emerald-500 to-teal-600"
              : "from-red-500 to-rose-600",
          href: `/${lang}/admin/finances`,
          change: data.finances.netProfit >= 0 ? 1 : -1,
        },
      ]
    : [];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto ">

          {/* ── Welcome + Date Filter ── */}
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                Tableau de bord
              </h2>
              <p className="text-slate-600">
                Voici un aperçu de votre boutique
              </p>
            </div>

            {/* Date filter pill — same rounded-2xl white card style */}
            <div className="bg-white rounded-2xl border border-slate-200 px-5 py-3 flex flex-wrap items-center gap-3 shadow-sm">
              <CalendarDays className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-500">Du</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm text-slate-700 bg-transparent border-none outline-none cursor-pointer"
              />
              <span className="text-sm text-slate-500">Au</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm text-slate-700 bg-transparent border-none outline-none cursor-pointer"
              />
              <button
                onClick={fetchStats}
                disabled={isLoading}
                className="px-4 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-xl hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "..." : "Appliquer"}
              </button>
              <button
                onClick={() => {
                  const s = firstOfMonth();
                  const e = today();
                  setStartDate(s);
                  setEndDate(e);
                  setTimeout(fetchStats, 0);
                }}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition-colors"
              >
                Ce mois
              </button>
            </div>
          </div>

          {/* Loading */}
          {isLoading && !data && (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
            </div>
          )}

          {data && (
            <div
              className={`space-y-10 transition-opacity duration-200 ${
                isLoading ? "opacity-50 pointer-events-none" : "opacity-100"
              }`}
            >

              {/* ══════════════════════════════════════
                  SECTION 1 — Produits & Clients
              ══════════════════════════════════════ */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 px-1">
                  Produits &amp; Clients
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section1Stats.map((stat, index) => (
                    <Link
                      key={index}
                      href={stat.href}
                      className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl transition-all duration-300 group block"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}
                        >
                          {stat.icon}
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-1">
                        {stat.value}
                      </h3>
                      <p className="text-sm text-slate-600">{stat.title}</p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* ══════════════════════════════════════
                  SECTION 2 — Commandes & Retours
              ══════════════════════════════════════ */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 px-1">
                  Commandes &amp; Retours (Routeur)
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {section2Stats.map((stat, index) => (
                    <Link
                      key={index}
                      href={stat.href}
                      className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl transition-all duration-300 group block"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}
                        >
                          {stat.icon}
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-1">
                        {stat.value}
                      </h3>
                      <p className="text-sm text-slate-600">{stat.title}</p>
                    </Link>
                  ))}
                </div>

                {/* Retour by wilaya */}
                {wilayaList.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">
                          Taux de retour par wilaya
                        </h3>
                        <p className="text-sm text-slate-600">
                          Classé du taux le plus élevé au plus bas
                        </p>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                              Wilaya
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                              Commandes
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                              Retours
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                              Taux
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {visibleWilayas.map((w) => (
                            <tr
                              key={w.wilaya}
                              className="hover:bg-slate-50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-semibold text-slate-800">
                                  {w.wilaya}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-slate-700">
                                  {w.total}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-slate-700">
                                  {w.returned}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3 min-w-[140px]">
                                  <div className="flex-1">
                                    <RateBar rate={w.rate} />
                                  </div>
                                  <span
                                    className={`text-sm font-semibold w-10 text-right flex-shrink-0 ${
                                      w.rate > 20
                                        ? "text-red-500"
                                        : w.rate > 10
                                        ? "text-amber-600"
                                        : "text-emerald-600"
                                    }`}
                                  >
                                    {w.rate}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {wilayaList.length > 6 && (
                      <div className="p-6 border-t border-slate-200">
                        <button
                          onClick={() => setShowAllWilaya(!showAllWilaya)}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-colors"
                        >
                          {showAllWilaya
                            ? "Voir moins"
                            : `Voir toutes les wilayas (${wilayaList.length})`}
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              showAllWilaya ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ══════════════════════════════════════
                  SECTION 3 — Confirmation Team
              ══════════════════════════════════════ */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 px-1">
                  Équipe de confirmation
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Global rate — same card style */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${
                          data.confirmation.globalRate >= 70
                            ? "from-emerald-500 to-teal-600"
                            : data.confirmation.globalRate >= 50
                            ? "from-amber-500 to-orange-600"
                            : "from-red-500 to-rose-600"
                        } rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}
                      >
                        <UserCheck className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-1">
                      {data.confirmation.globalRate}%
                    </h3>
                    <p className="text-sm text-slate-600 mb-1">
                      Taux de confirmation global
                    </p>
                    <p className="text-xs text-slate-400">
                      {fmt(data.confirmation.totalConfirmed)} confirmés /{" "}
                      {fmt(data.confirmation.totalOrders)} assignés
                    </p>
                    <ConfirmBar rate={data.confirmation.globalRate} />
                  </div>

                  {/* Per-agent table */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">
                          Performance par agent
                        </h3>
                        <p className="text-sm text-slate-600">
                          Taux de confirmation individuel
                        </p>
                      </div>
                    </div>

                    {data.confirmation.team.length === 0 ? (
                      <div className="px-6 py-10 text-center text-sm text-slate-400">
                        Aucune donnée pour cette période
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Agent
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Assignées
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Confirmées
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Taux
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {data.confirmation.team.map((agent) => (
                              <tr
                                key={agent.name}
                                className="hover:bg-slate-50 transition-colors"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-xs flex-shrink-0">
                                      {agent.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-semibold text-slate-800">
                                      {agent.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm text-slate-700">
                                    {agent.total}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm text-slate-700">
                                    {agent.confirmed}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3 min-w-[140px]">
                                    <div className="flex-1">
                                      <ConfirmBar rate={agent.rate} />
                                    </div>
                                    <span
                                      className={`text-sm font-semibold w-10 text-right flex-shrink-0 ${
                                        agent.rate >= 70
                                          ? "text-emerald-600"
                                          : agent.rate >= 50
                                          ? "text-amber-600"
                                          : "text-red-500"
                                      }`}
                                    >
                                      {agent.rate}%
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ══════════════════════════════════════
                  SECTION 4 — Finances
              ══════════════════════════════════════ */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 px-1">
                  Statistiques financières
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {section4Stats.map((stat, index) => (
                    <Link
                      key={index}
                      href={stat.href}
                      className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl transition-all duration-300 group block"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}
                        >
                          {stat.icon}
                        </div>
                        {stat.change !== null && (
                          <div
                            className={`flex items-center gap-1 text-sm font-semibold ${
                              stat.change >= 0
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {stat.change >= 0 ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4" />
                            )}
                          </div>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-1">
                        {stat.value}
                      </h3>
                      <p className="text-sm text-slate-600">{stat.title}</p>
                    </Link>
                  ))}
                </div>

                {data.finances.returnLosses > 0 && (
                  <p className="text-xs text-slate-400 mt-3 px-1">
                    * Les dépenses incluent{" "}
                    <span className="font-medium text-slate-500">
                      {fmt(data.finances.returnLosses)} DA
                    </span>{" "}
                    de pertes sur retours.
                  </p>
                )}
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}