"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  ArrowLeftRight,
  Package,
  Layers,
  Users,
  Percent,
  Ticket,
  Archive,
  FileText,
  DollarSign,
  CreditCard,
  Truck,
  PackageOpen,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  UsersRound,
  PictureInPicture2,
  Store,
} from "lucide-react";
import { useLang } from "@/components/LanguageContext";
import { PERMISSIONS } from "@/data";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  requiredPermissions?: string[];
}

const navItems: NavItem[] = [
  { label: "Tableau de bord", icon: <LayoutDashboard size={18} />, href: "/admin/dashboard", requiredPermissions: [] },
  { label: "Commandes", icon: <ShoppingCart size={18} />, href: "/admin/orders", requiredPermissions: [PERMISSIONS.MANAGE_ORDERS, PERMISSIONS.CONFIRM_ORDERS, PERMISSIONS.UPDATE_ORDER_STATUS] },
  { label: "Produits", icon: <Package size={18} />, href: "/admin/products", requiredPermissions: [PERMISSIONS.MANAGE_PRODUCTS] },
  { label: "Catégories", icon: <Layers size={18} />, href: "/admin/categories", requiredPermissions: [PERMISSIONS.MANAGE_PRODUCTS] },
  { label: "Clients", icon: <Users size={18} />, href: "/admin/customers", requiredPermissions: [PERMISSIONS.MANAGE_CUSTOMERS] },
  { label: "Réductions", icon: <Percent size={18} />, href: "/admin/discounts", requiredPermissions: [PERMISSIONS.MANAGE_DISCOUNTS] },
  { label: "Coupons", icon: <Ticket size={18} />, href: "/admin/coupons", requiredPermissions: [PERMISSIONS.MANAGE_DISCOUNTS] },
  { label: "Inventaire", icon: <Archive size={18} />, href: "/admin/inventory", requiredPermissions: [PERMISSIONS.VIEW_INVENTORY] },
  { label: "Factures", icon: <FileText size={18} />, href: "/admin/invoices", requiredPermissions: [PERMISSIONS.VIEW_FINANCES] },
  { label: "Caisse", icon: <DollarSign size={18} />, href: "/admin/cash-register", requiredPermissions: [PERMISSIONS.VIEW_FINANCES] },
  { label: "Finances", icon: <CreditCard size={18} />, href: "/admin/finances", requiredPermissions: [PERMISSIONS.VIEW_FINANCES] },
  { label: "Livraison", icon: <Truck size={18} />, href: "/admin/delivery", requiredPermissions: [PERMISSIONS.MANAGE_ORDERS] },
  { label: "Livreurs", icon: <PackageOpen size={18} />, href: "/admin/delivery-persons", requiredPermissions: [PERMISSIONS.MANAGE_ORDERS] },
  { label: "Employés", icon: <UsersRound size={18} />, href: "/admin/employees", requiredPermissions: [PERMISSIONS.MANAGE_EMPLOYEES] },
  { label: "Delivery prices", icon: <Truck size={18} />, href: "/admin/delivery-prices" },
  { label: "My deliveries", icon: <Truck size={18} />, href: "/admin/dashboard/delivery-person" },
  { label: "Exchanges & Returns", icon: <ArrowLeftRight size={18} />, href: "/admin/exchanges-returns", requiredPermissions: [PERMISSIONS.MANAGE_ORDERS] },
  { label: "Upload images", icon: <PictureInPicture2 size={18} />, href: "/admin/images" },
];

const MOCK_NOTIFICATIONS = [
  { id: 1, title: "New order #1042", desc: "A new order was placed just now.", time: "2 min ago", unread: true },
  { id: 2, title: "Stock alert", desc: "Product Running Shoes M is low on stock.", time: "18 min ago", unread: true },
  { id: 3, title: "Exchange request", desc: "Customer requested an exchange on #EX-008.", time: "1 hr ago", unread: false },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang } = useLang();

  const [user, setUser] = useState<any | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("7j");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

  const periodOptions: Record<string, string> = {
    "24h": "Dernières 24h",
    "7j": "7 derniers jours",
    "30j": "30 derniers jours",
    "12m": "12 derniers mois",
  };

  useEffect(() => {
    const saved = localStorage.getItem("admin");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (periodRef.current && !periodRef.current.contains(e.target as Node)) setPeriodOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const hasPermission = (userPermissions: any[] = [], required?: string[]) => {
    if (!required || required.length === 0) return true;
    return required.some((p) => userPermissions.includes(p));
  };

  const visibleNavItems = navItems.filter((item) =>
    user ? hasPermission(user.permissions, item.requiredPermissions) : !item.requiredPermissions
  );

  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
    : "AD";

  function handleLogout() {
    localStorage.removeItem("admin");
    router.replace(`/${lang}/admin`);
  }

  return (
    <>
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 sm:px-6 gap-3 z-30 relative">

        {/* Mobile hamburger */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="md:hidden flex-shrink-0 p-2 rounded-xl hover:bg-gray-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} className="text-gray-600" />
        </button>

     

      

        {/* Spacer */}
        <div className="flex-1" />

        {/* ── Right actions ── */}
        <div className="flex items-center gap-1.5">
        

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((p) => !p)}
              className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-0.5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full leading-none">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="divide-y divide-gray-50">
                  {MOCK_NOTIFICATIONS.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${n.unread ? "bg-teal-50/40" : ""}`}
                    >
                      <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${n.unread ? "bg-teal-500" : "bg-gray-300"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.desc}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5">{n.time}</span>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                  <button className="text-xs text-teal-600 font-medium hover:underline">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Avatar button (opens drawer on all screens as an alternative) */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl flex items-center justify-center font-semibold text-xs shadow-sm hover:from-teal-600 hover:to-teal-700 transition-all ml-1"
            aria-label="Open menu"
          >
            {initials}
          </button>
        </div>
      </header>

      {/* ── Backdrop ───────────────────────────────────────────────────────── */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ── Slide-in Drawer ─────────────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl flex items-center justify-center font-semibold text-sm shadow-sm">
              {initials}
            </div>
            <div className="flex flex-col leading-tight">
              <p className="text-sm font-semibold text-gray-800 truncate max-w-[140px]">
                {user?.name || "Admin"}
              </p>
              <p className="text-xs text-gray-400 truncate max-w-[140px]">
                {user?.email || "admin@store.com"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-gray-500 capitalize">{user?.role?.toLowerCase() || "admin"}</span>
                <span className="text-[10px] bg-teal-100 text-teal-600 px-1.5 py-px rounded-full font-medium">Active</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

      
        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <ul className="space-y-0.5">
            {/* visisible navItems */}
            {navItems.map((item) => {
              const isActive = pathname === `/${lang}${item.href}`;
              return (
                <li key={item.href}>
                  <Link
                    href={`/${lang}${item.href}`}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                      isActive
                        ? "bg-teal-50 text-teal-700 font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className={`flex-shrink-0 ${isActive ? "text-teal-600" : "text-gray-400 group-hover:text-gray-600"}`}>
                      {item.icon}
                    </span>
                    <span className="text-sm">{item.label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Drawer footer */}
        <div className="border-t border-gray-100 p-3 flex-shrink-0 space-y-1">
          <button
            onClick={() => { router.push(`/${lang}/`); setDrawerOpen(false); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Store size={18} className="text-gray-400" />
            <span className="text-sm">Back to Store</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors group"
          >
            <LogOut size={18} className="text-gray-400 group-hover:text-red-500" />
            <span className="text-sm">Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}