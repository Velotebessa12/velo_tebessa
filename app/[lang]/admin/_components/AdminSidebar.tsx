"use client";
import React, { useEffect, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  Users2Icon,
  UsersRound,
  PictureInPicture2,
} from "lucide-react";
import { useLang } from "@/components/LanguageContext";
import { PERMISSIONS } from "@/data";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  requiredPermissions?: String[];
}

const AdminSidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { lang } = useLang();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("admin");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  React.useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 768); // md breakpoint
    };

    handleResize(); // run on mount

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems: NavItem[] = [
    {
      label: "Tableau de bord",
      icon: <LayoutDashboard size={20} />,
      href: "/admin/dashboard",
      requiredPermissions: [],
    },
    {
      label: "Commandes",
      icon: <ShoppingCart size={20} />,
      href: "/admin/orders",
      requiredPermissions: [
        PERMISSIONS.MANAGE_ORDERS,
        PERMISSIONS.CONFIRM_ORDERS,
        PERMISSIONS.UPDATE_ORDER_STATUS,
      ],
    },
    {
      label: "Exchanges & Returns",
      icon: <ArrowLeftRight size={20} />,
      href: "/admin/exchanges-returns",
      requiredPermissions: [PERMISSIONS.MANAGE_ORDERS],
    },
    {
      label: "Produits",
      icon: <Package size={20} />,
      href: "/admin/products",
      requiredPermissions: [PERMISSIONS.MANAGE_PRODUCTS],
    },
    {
      label: "Catégories",
      icon: <Layers size={20} />,
      href: "/admin/categories",
      requiredPermissions: [PERMISSIONS.MANAGE_PRODUCTS],
    },
    {
      label: "Clients",
      icon: <Users size={20} />,
      href: "/admin/customers",
      requiredPermissions: [PERMISSIONS.MANAGE_CUSTOMERS],
    },
    {
      label: "Réductions",
      icon: <Percent size={20} />,
      href: "/admin/discounts",
      requiredPermissions: [PERMISSIONS.MANAGE_DISCOUNTS],
    },
    {
      label: "Coupons",
      icon: <Ticket size={20} />,
      href: "/admin/coupons",
      requiredPermissions: [PERMISSIONS.MANAGE_DISCOUNTS],
    },
    {
      label: "Inventaire",
      icon: <Archive size={20} />,
      href: "/admin/inventory",
      requiredPermissions: [PERMISSIONS.VIEW_INVENTORY],
    },
    {
      label: "Factures",
      icon: <FileText size={20} />,
      href: "/admin/invoices",
      requiredPermissions: [PERMISSIONS.VIEW_FINANCES],
    },
    {
      label: "Caisse",
      icon: <DollarSign size={20} />,
      href: "/admin/cash-register",
      requiredPermissions: [PERMISSIONS.VIEW_FINANCES],
    },
    {
      label: "Finances",
      icon: <CreditCard size={20} />,
      href: "/admin/finances",
      requiredPermissions: [PERMISSIONS.VIEW_FINANCES],
    },
    {
      label: "Livraison",
      icon: <Truck size={20} />,
      href: "/admin/delivery",
      requiredPermissions: [PERMISSIONS.MANAGE_ORDERS],
    },
    {
      label: "Livreurs",
      icon: <PackageOpen size={20} />,
      href: "/admin/delivery-persons",
      requiredPermissions: [PERMISSIONS.MANAGE_ORDERS],
    },
    {
      label: "Employés",
      icon: <UsersRound size={20} />,
      href: "/admin/employees",
      requiredPermissions: [PERMISSIONS.MANAGE_EMPLOYEES],
    },
    {
      label: "Delivery prices",
      icon: <Truck size={20} />,
      href: "/admin/delivery-prices",
      // requiredPermissions: [PERMISSIONS.MANAGE_EMPLOYEES],
    },
    {
      label: "My deliveries",
      icon: <Truck size={20} />,
      href: "/admin/dashboard/delivery-person",
      // requiredPermissions: [PERMISSIONS.MANAGE_EMPLOYEES],
    },
    {
      label: "Upload images",
      icon: <PictureInPicture2 size={20} />,
      href: "/admin/images",
      // requiredPermissions: [PERMISSIONS.MANAGE_EMPLOYEES],
    },
  ];

  const hasPermission = (
    userPermissions: Permission[] = [],
    required?: Permission[],
  ) => {
    if (!required || required.length === 0) return true;
    return required.some((p) => userPermissions.includes(p));
  };

  const visibleNavItems = navItems.filter((item) =>
    user
      ? hasPermission(user.permissions, item.requiredPermissions)
      : !item.requiredPermissions,
  );

  function handleLogout() {
    localStorage.removeItem("admin");
    router.replace(`/${{ lang }}/admin`);
  }

  return (
    <aside
      className={` left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-40 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
        {!isCollapsed && (
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div
              className="w-10 h-10 shrink-0 bg-gradient-to-br from-teal-500 to-teal-600
               text-white rounded-xl flex items-center justify-center
               font-semibold text-sm shadow-sm"
            >
              {user?.name
                ? user.name
                    .split(" ")
                    .map((word) => word[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "AD"}
            </div>

            {/* User Info */}
            <div className="flex flex-col min-w-0 leading-tight">
              {/* Name */}
              <p className="text-sm font-semibold text-slate-800 truncate">
                {user?.name || "Admin"}
              </p>

              {/* Email */}
              <p className="text-xs text-slate-500 truncate">
                {user?.email || "admin@gmail.com"}
              </p>

              {/* Meta row */}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-slate-500 capitalize">
                  {user?.role?.toLowerCase() || "admin"}
                </span>

                <span className="text-[10px] bg-gray-100 text-teal-600 px-2 py-0.5 rounded-full font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight size={20} className="text-gray-600" />
          ) : (
            <ChevronLeft size={20} className="text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {/* visible only later */}
          {navItems.map((item) => {
            const isActive = pathname === `/${{ lang }}${item.href}`;

            return (
              <li key={item.href}>
                <Link
                  href={`/${ lang }${item.href}`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  title={isCollapsed ? item.label : ""}
                >
                  <span
                    className={`flex-shrink-0 ${
                      isActive
                        ? "text-teal-600"
                        : "text-gray-500 group-hover:text-gray-700"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="text-sm truncate">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer - Logout */}
      <div className="border-t flex flex-col gap-1 border-gray-200 p-3">
        <button
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full group"
          onClick={handleLogout}
          title={isCollapsed ? "Déconnexion" : ""}
        >
          <LogOut
            size={20}
            className="flex-shrink-0 text-gray-500 group-hover:text-red-600"
          />
          {!isCollapsed && <span className="text-sm">Déconnexion</span>}
        </button>
        <button
          className="flex items-center bg-gray-100 gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-200 cursor-pointer transition-all duration-200 w-full group"
          onClick={() => router.push(`/${{ lang }}/`)}
          title={isCollapsed ? "Back to store" : ""}
        >
          <Package
            size={20}
            className="flex-shrink-0 text-gray-500 group-hover:text-gray-600"
          />
          {!isCollapsed && <span className="text-sm">Back to Store</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
