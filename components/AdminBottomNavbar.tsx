"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ShoppingCart, BarChart2 } from "lucide-react";

const AdminBottomNavbar = () => {
  const pathname = usePathname();

  const links = [
    {
      name: "Main",
      href: "/admin/dashboard",
      icon: Home,
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: Package,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart2,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 sm:hidden z-50">
      <div className="grid grid-cols-4">

        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center py-2 transition ${
                isActive
                  ? "text-teal-600"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <link.icon className="w-5 h-5" />
              <span className="text-[10px] mt-1">{link.name}</span>
            </Link>
          );
        })}

      </div>
    </nav>
  );
};

export default AdminBottomNavbar;
