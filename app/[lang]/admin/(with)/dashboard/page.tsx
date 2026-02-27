"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Settings,
  Bell,
  Search,
  ChevronDown,
  Plus,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Euro,
  ShoppingBag,
  UserCheck,
  Package2,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useLang } from "@/components/LanguageContext";
import { getTranslations } from "@/lib/getTranslations";

interface StatCard {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface RecentOrder {
  id: string;
  client: string;
  produit: string;
  montant: number;
  statut: "En attente" | "Expédié" | "Livré" | "Annulé";
  date: string;
}

interface TopProduct {
  id: string;
  nom: string;
  ventes: number;
  revenus: number;
  stock: number;
}

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("7j");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const { lang } = useLang();

  useEffect(() => {
    const savedUser = localStorage.getItem("admin");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [, set] = useState([]);
  const [data, setData] = useState<any>({
    stats: {
      totalRevenue: 0,
      orders: 0,
      products: 0,
      customers: 0,
    },
    data: {
      users: [],
      products: [],
      orders: [],
    },
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);

        const res = await fetch("/api/admin/get-stats");

        if (!res.ok) {
          throw new Error("Error fetching products");
        }

        const data = await res.json();
        setData(data);
      } catch (error) {
        toast.error("Error fetching products");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const stats: any[] = [
    {
      title: "Total Revenues (Da)",
      value: `${Math.round(data.stats.totalRevenue).toLocaleString() || 0} Da`,
      change: 12.5,
      icon: <Euro className="w-6 h-6" />,
      color: "from-violet-500 to-purple-600",
      href: "/admin/finances",
    },
    {
      title: "Orders",
      value: data.stats.ordersCount || 0,
      change: 8.2,
      icon: <ShoppingBag className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-600",
      href: "/admin/orders",
    },
    {
      title: "Clients",
      value: data.stats.usersCount || 0,
      change: 15.3,
      icon: <UserCheck className="w-6 h-6" />,
      color: "from-emerald-500 to-teal-600",
      href: "/admin/customers",
    },
    {
      title: "Products",
      value: data.stats.productsCount || 0,
      change: -2.4,
      icon: <Package2 className="w-6 h-6" />,
      color: "from-orange-500 to-red-600",
      href: "/admin/products",
    },
  ];

  const recentOrders: RecentOrder[] = [
    {
      id: "#CM-2847",
      client: "Ahmed Benali",
      produit: "Vélo électrique",
      montant: 2500,
      statut: "Expédié",
      date: "05/02/2026",
    },
    {
      id: "#CM-2846",
      client: "Fatima Zohra",
      produit: "Casque protecteur",
      montant: 150,
      statut: "Livré",
      date: "05/02/2026",
    },
    {
      id: "#CM-2845",
      client: "Karim Mansouri",
      produit: "Vélo de route",
      montant: 3200,
      statut: "En attente",
      date: "04/02/2026",
    },
    {
      id: "#CM-2844",
      client: "Samia Khelil",
      produit: "Accessoires vélo",
      montant: 450,
      statut: "Expédié",
      date: "04/02/2026",
    },
    {
      id: "#CM-2843",
      client: "Youcef Amrani",
      produit: "Vélo VTT",
      montant: 2800,
      statut: "Annulé",
      date: "03/02/2026",
    },
  ];

  const topProducts: TopProduct[] = [
    {
      id: "1",
      nom: "Vélo électrique Pro",
      ventes: 142,
      revenus: 35500,
      stock: 23,
    },
    {
      id: "2",
      nom: "Vélo de route Carbon",
      ventes: 98,
      revenus: 31360,
      stock: 15,
    },
    { id: "3", nom: "VTT Mountain X", ventes: 87, revenus: 24360, stock: 31 },
    {
      id: "4",
      nom: "Vélo urbain Comfort",
      ventes: 76,
      revenus: 15200,
      stock: 45,
    },
  ];

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "Livré":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Expédié":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "En attente":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Annulé":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const menuItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Tableau de bord",
      active: true,
      href: "/admin",
    },
    {
      icon: <Package className="w-5 h-5" />,
      label: "Produits",
      active: false,
      href: "/admin/products",
    },
    {
      icon: <ShoppingCart className="w-5 h-5" />,
      label: "Commandes",
      active: false,
      href: "/admin/orders",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Clients",
      active: false,
      href: "/admin/clients",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: "Analyses",
      active: false,
      href: "/admin/analytics",
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: "Paramètres",
      active: false,
      href: "/admin/settings",
    },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Bonjour, {user?.name || "Admin"}{" "}
            </h2>
            <p className="text-slate-600">
              Voici un aperçu de votre boutique aujourd'hui
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat : any, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl transition-all duration-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}
                  >
                    {stat.icon}
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-semibold ${
                      stat.change >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {stat.change >= 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {Math.abs(stat.change)}%
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-1">
                  {stat.value}
                </h3>
                <Link
                  href={`/${ lang }${stat.href}`}
                  className="text-sm text-slate-600 hover:underline"
                >
                  {stat.title}
                </Link>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Commandes Récentes
                  </h3>
                  <p className="text-sm text-slate-600">
                    Gérez vos dernières commandes
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Commande
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.data.orders.map((order : any) => (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-slate-800">
                            {order.id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-700">
                            {order.customer?.name || "Undefined"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-700">
                            {order.items.length}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-slate-800">
                            {order.total} DA
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(order.statut)}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-600">
                            {order.createdAt}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4 text-slate-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-6 border-t border-slate-200">
                <Link
                  href={`/${ lang }/admin/orders`}
                  className="block text-center py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-colors"
                >
                  Voir tous les commands
                </Link>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  Produits Populaires
                </h3>
                <p className="text-sm text-slate-600">
                  Vos meilleures produits
                </p>
              </div>

              <div className="p-6 space-y-4">
                {data.data.products.map((product : any, index : number) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-800 truncate">
                        {getTranslations(
                          product.translations,
                           lang ,
                          "name",
                        )}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        {/* <span className="text-xs text-slate-600">{product.ventes || 0} ventes</span> */}
                        <span className="text-xs font-semibold text-emerald-600">
                          {product.regularPrice.toLocaleString()} DA
                        </span>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        product.stock < product.minimumStock
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {product.stock} en stock
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-slate-200">
                <Link
                  href={`/${ lang }/admin/products`}
                  className="block text-center py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-colors"
                >
                  Voir tous les produits
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <button className="p-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl text-white hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 group">
              <ShoppingCart className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="text-lg font-bold mb-1">Nouvelle Commande</h4>
              <p className="text-sm text-blue-100">
                Créer une commande manuellement
              </p>
            </button>

            <button className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 group">
              <Package className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="text-lg font-bold mb-1">Ajouter Produit</h4>
              <p className="text-sm text-emerald-100">
                Enrichir votre catalogue
              </p>
            </button>

            <button className="p-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl text-white hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 group">
              <TrendingUp className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="text-lg font-bold mb-1">Rapport Complet</h4>
              <p className="text-sm text-orange-100">
                Analyser les performances
              </p>
            </button>
          </div>

          {/* Zakat Calculation Box */}
          {/* <div className="mt-2 bg-purple-50 border border-purple-200 rounded-lg p-5 sm:p-6 hover:shadow-lg transition-all">
  <div className="flex items-start justify-between mb-3">
    <div>
      <p className="text-sm font-medium text-purple-700 mb-1">
        Zakat (2.5%)
      </p>
      <p className="text-xs text-purple-600">
        Calculé sur le total
      </p>
    </div>
    <div className="bg-purple-100 rounded-full p-2">
      <svg 
        className="w-5 h-5 text-purple-600" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
    </div>
  </div>
  
  <div className="space-y-2">
    <div className="flex justify-between items-baseline">
      <span className="text-xs text-purple-600">Total des revenus</span>
      <span className="text-sm font-semibold text-purple-900">{data.stats.totalRevenue || `107 901 DA`}</span>
    </div>
    
    <div className="border-t border-purple-200 pt-2">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-medium text-purple-700">Zakat à payer</span>
        <span className="text-2xl sm:text-3xl font-bold text-purple-900">2 697,53 DA</span>
      </div>
    </div>
  </div>
  
  <div className="mt-4 bg-purple-100/50 rounded-md p-2 text-center">
    <p className="text-xs text-purple-700">
      2.5% du total
    </p>
  </div>
</div> */}
        </main>
      </div>
    </div>
  );
}
