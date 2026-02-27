"use client";
import {
  Globe,
  ShoppingCart,
  User,
  Menu,
  X,
  Check,
  NetworkIcon,
  Info,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { useLang } from "./LanguageContext";
import useShopStore from "@/store/useShopStore";
import toast from "react-hot-toast";

const Navbar = () => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const { cart } = useShopStore();
  const { lang , dict} = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    setIsAuthenticated(!!auth);
  }, []);

  // Language configurations
  const languages = [
    { code: "ar", name: "العربية", nativeName: "Arabic", flag: "ar" },
    { code: "fr", name: "Français", nativeName: "French", flag: "🇫🇷" },
    { code: "en", name: "English", nativeName: "English", flag: "en" },
  ];

  const currentLanguage =
    languages.find((l) => l.code ===  lang ) || languages[0];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const changeLanguage = (langCode: string) => {
    const segments = pathname.split("/");
    segments[1] = langCode;
    router.push(segments.join("/"));
    setIsLangOpen(false);
  };

  const isActivePage = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  function logout() {
    localStorage.removeItem("isAuthenticated");
    toast.success("Logged out successfully !");
  }

  const totalQuantity = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0,
  );

  return (
   <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-lg"
          : "bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm"
      }`}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href={`/${lang}/`} className="flex items-center gap-3 group">
            <div className="w-12 h-12 relative transform group-hover:scale-110 transition-all duration-300 ease-out">
              <img
                src="/Velo-tebassa-Logo.png"
                alt="Velo Tebessa Logo"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 via-emerald-800 to-slate-700 bg-clip-text text-transparent hidden sm:block">
              Velo Tebessa
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <a
              href={`/${lang}/`}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActivePage(`/${lang}`)
                  ? "text-teal-600 bg-teal-50"
                  : "text-slate-700 hover:text-teal-600 hover:bg-slate-50"
              }`}
            >
              {dict.navbar.home}
            </a>
            <a
              href={`/${lang}/products`}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActivePage(`/${lang}/products`)
                  ? "text-teal-600 bg-teal-50"
                  : "text-slate-700 hover:text-teal-600 hover:bg-slate-50"
              }`}
            >
              {dict.navbar.products}
            </a>
            <a
              href={`/${lang}/categories`}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActivePage(`/${lang}/categories`)
                  ? "text-teal-600 bg-teal-50"
                  : "text-slate-700 hover:text-teal-600 hover:bg-slate-50"
              }`}
            >
              {dict.navbar.categories}
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg transition-all duration-200 group"
                aria-label="Change language"
              >
                <Globe className="w-5 h-5 text-slate-600 group-hover:text-emerald-600 transition-colors" />
                <span className="hidden sm:block text-sm font-medium text-slate-700">
                  {currentLanguage.code.toUpperCase()}
                </span>
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {dict.navbar.selectLanguage}
                    </div>
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => changeLanguage(language.code)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150 ${
                          lang === language.code
                            ? "bg-emerald-50 text-emerald-700"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{language.flag}</span>
                          <div className="text-left">
                            <div className="font-medium">{language.name}</div>
                            <div className="text-xs text-slate-500">
                              {language.nativeName}
                            </div>
                          </div>
                        </div>
                        {lang === language.code && (
                          <Check className="w-5 h-5 text-emerald-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push(`/${lang}/socials`)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-200 group"
              aria-label="User account"
            >
              <Info className="w-5 h-5 text-slate-600 group-hover:text-emerald-600 transition-colors" />
            </button>
            <button
              onClick={() => router.push(`/${lang}/cart`)}
              className="relative p-2 hover:bg-slate-100 rounded-lg transition-all duration-200 group"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-5 h-5 text-slate-600 group-hover:text-emerald-600 transition-colors" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {totalQuantity}
                </span>
              )}
            </button>

            {/* User Account */}
            <div className="relative">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setIsOpen(!isOpen);
                  } else {
                    router.push(`/${lang}/login`);
                  }
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-200 group"
                aria-label="User account"
              >
                <User className="w-5 h-5 text-slate-600 group-hover:text-emerald-600 transition-colors" />
              </button>

              {isOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50"
                  onMouseLeave={() => setIsOpen(false)}
                >
                  <button
                    onClick={() => router.push(`/${lang}/profile`)}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 text-sm"
                  >
                    {dict.navbar.profile}
                  </button>
                  <button
                    onClick={() => router.push(`/${lang}/orders`)}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 text-sm"
                  >
                    {dict.navbar.orders}
                  </button>
                  <hr />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-slate-200 animate-in slide-in-from-top duration-200">
            <div className="flex flex-col gap-1">
              <a
                href={`/${lang}/`}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActivePage(`/${lang}`)
                    ? "text-emerald-600 bg-emerald-50"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {dict.navbar.home}
              </a>
              <a
                href={`/${lang}/products`}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActivePage(`/${lang}/products`)
                    ? "text-emerald-600 bg-emerald-50"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {dict.navbar.products}
              </a>
              <a
                href={`/${lang}/categories`}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActivePage(`/${lang}/categories`)
                    ? "text-emerald-600 bg-emerald-50"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {dict.navbar.categories}
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
