"use client";
import {
  Home,
  ShoppingBag,
  LayoutGrid,
  ShoppingCart,
  User,
  Heart,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useLang } from "./LanguageContext";
import useShopStore from "@/store/useShopStore";

const BottomNavbar = () => {
  const { lang , dict} = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { cart } = useShopStore();

  // Auto-hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false); // Scrolling down
      } else {
        setIsVisible(true); // Scrolling up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const totalQuantity = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0,
  );

  const navItems = [
  {
    icon: Home,
    label: dict.bottomNav.home,
    href: `/${lang}/`,
    activeColor: "text-emerald-600",
    activeBg: "bg-emerald-50",
  },
  {
    icon: Heart,
    label: dict.bottomNav.favorites,
    href: `/${lang}/favorites`,
    activeColor: "text-purple-600",
    activeBg: "bg-purple-50",
  },
  {
    icon: ShoppingCart,
    label: dict.bottomNav.cart,
    href: `/${lang}/cart`,
    activeColor: "text-orange-600",
    activeBg: "bg-orange-50",
    badge: totalQuantity,
  },
];

  

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === `/${ lang }`;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleNavClick = (href: string) => {
    // Add haptic feedback for mobile devices
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
    router.push(href);
  };

  return (
    <>
      {/* Spacer to prevent content from being hidden behind bottom nav */}
      <div className="md:hidden h-16" />

      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Gradient overlay for depth */}
        <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />

        <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-2xl">
          <div className="grid grid-cols-3 h-16 px-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <button
                  key={index}
                  onClick={() => handleNavClick(item.href)}
                  className={`relative flex flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-95 ${
                    active ? "" : "hover:bg-slate-50/50"
                  }`}
                  aria-label={item.label}
                >
                  {/* Active indicator - top bar */}
                  <div
                    className={`absolute top-0 left-1/2 -translate-x-1/2 h-1 rounded-b-full transition-all duration-300 ${
                      active
                        ? "w-10 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 opacity-100"
                        : "w-0 opacity-0"
                    }`}
                  />

                  {/* Icon container with background */}
                  <div className="relative">
                    <div
                      className={`p-2 rounded-2xl transition-all duration-300 ${
                        active
                          ? `${item.activeBg} scale-100 shadow-sm`
                          : "scale-90 bg-transparent"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 transition-all duration-300 ${
                          active
                            ? `${item.activeColor} drop-shadow-sm`
                            : "text-slate-500"
                        }`}
                        strokeWidth={active ? 2.5 : 2}
                      />
                    </div>

                    {/* Badge for cart - enhanced design */}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1.5 bg-gradient-to-br from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg ring-2 ring-white animate-in zoom-in duration-200">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}

                    {/* Notification dot (optional - for alerts) */}
                    {/* {item.hasNotification && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                    )} */}
                  </div>

                  {/* Label with weight change on active */}
                  <span
                    className={`text-[10px] transition-all duration-300 leading-tight ${
                      active
                        ? `${item.activeColor} font-semibold`
                        : "text-slate-500 font-medium"
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* Ripple effect on tap */}
                  <span className="absolute inset-0 rounded-lg overflow-hidden">
                    <span
                      className={`absolute inset-0 transition-transform duration-300 ${
                        active ? "scale-100" : "scale-0"
                      }`}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Safe area padding for devices with notches/home indicators */}
        <div className="bg-white/95 backdrop-blur-xl h-[env(safe-area-inset-bottom)]" />
      </nav>
    </>
  );
};

export default BottomNavbar;
