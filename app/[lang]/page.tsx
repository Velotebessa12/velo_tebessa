"use client";

import { useEffect, useState } from "react";
import {
  Search,
  X,
  ChevronDown,
  ArrowRight,
  SlidersHorizontal,
  TrendingUp,
  Bike,
  Truck,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/components/LanguageContext";
import ProductCard from "@/components/ProductCard";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "@/lib/getTranslations";

export default function Home() {
  const {lang , dict} = useLang();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSort, setSelectedSort] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.append("slug", selectedCategory);
    if (selectedSort) params.append("sort", selectedSort);
    if (searchQuery) params.append("query", searchQuery);

    const delay = setTimeout(async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `/api/products/get-products?${params.toString()}`,
        );
        if (!res.ok) throw new Error();
        const { products } = await res.json();
        setProducts(products);
      } catch {
        toast.error("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [selectedCategory, selectedSort, searchQuery]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/products/get-products"),
          fetch("/api/categories/get-categories"),
        ]);
        if (!productsRes.ok || !categoriesRes.ok) throw new Error();
        const { products } = await productsRes.json();
        const { categories } = await categoriesRes.json();
        setProducts(products);
        setCategories(categories);
      } catch {
        toast.error("Error loading data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const isFiltering =
    searchQuery.length > 0 || selectedCategory !== "" || selectedSort !== "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 py-2 px-4 text-xs sm:text-sm font-medium">
          <Truck className="w-4 h-4 opacity-90" />
          <span>{dict.home.delivery}</span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col items-center text-center gap-4">
          {/* Search bar */}
          <div className="w-full max-w-xl mt-1 flex items-center bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-50 transition-all">
            <div className="relative flex flex-1 items-center">
              <Search className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={dict.home.searchPlaceholder}
                className="w-full py-3.5 pl-11 pr-3 text-sm text-gray-800 bg-transparent outline-none font-medium placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="pr-3 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-bold px-6 py-3.5 transition-colors whitespace-nowrap">
              {dict.home.searchButton}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border transition-colors sm:hidden ${
              filtersOpen
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200"
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            Filters
          </button>

          {/* Desktop selects */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold pl-3 pr-7 py-2 rounded-full cursor-pointer outline-none transition-colors"
              >
                <option value="">{dict.home.allCategories}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {getTranslations(cat.translations, lang, "name")}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="appearance-none bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold pl-3 pr-7 py-2 rounded-full cursor-pointer outline-none transition-colors"
              >
                <option value="">
          {lang === "en"
            ? "Sort by"
            : lang === "fr"
            ? "Trier par"
            : "ترتيب حسب"}
        </option>
        <option value="price_asc">
          {lang === "en"
            ? "Price: Low → High"
            : lang === "fr"
            ? "Prix : croissant"
            : "السعر: من الأقل إلى الأعلى"}
        </option>
        <option value="price_desc">
          {lang === "en"
            ? "Price: High → Low"
            : lang === "fr"
            ? "Prix : décroissant"
            : "السعر: من الأعلى إلى الأقل"}
        </option>
        <option value="name_asc">
          {lang === "en"
            ? "Name: A → Z"
            : lang === "fr"
            ? "Nom : A → Z"
            : "الاسم: من A إلى Z"}
        </option>
        <option value="name_desc">
          {lang === "en"
            ? "Name: Z → A"
            : lang === "fr"
            ? "Nom : Z → A"
            : "الاسم: من Z إلى A"}
        </option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Clear filters */}
          {isFiltering && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
                setSelectedSort("");
              }}
              className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-full transition-colors"
            >
              <X className="w-3 h-3" />
              {dict.home.clear}
            </button>
          )}

          {/* Result count */}
          {isFiltering && !isLoading && (
            <span className="ml-auto flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              <TrendingUp className="w-3 h-3" />
              {products.length} {dict.home.results}
            </span>
          )}
        </div>

        {/* Mobile filter panel */}
        {filtersOpen && (
          <div className="sm:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-2.5 bg-white">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none bg-gray-100 text-gray-700 text-sm font-semibold pl-3 pr-8 py-2.5 rounded-xl cursor-pointer outline-none"
              >
                <option value="">{dict.home.allCategories}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {getTranslations(cat.translations, lang, "name")}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="w-full appearance-none bg-gray-100 text-gray-700 text-sm font-semibold pl-3 pr-8 py-2.5 rounded-xl cursor-pointer outline-none"
              >
                <option value="">{dict.home.sortBy}</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="name_asc">Name: A → Z</option>
                <option value="name_desc">Name: Z → A</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Categories */}
        {!isFiltering && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900">
                {dict.home.shopByCategory}
              </h2>
              <button
                onClick={() => router.push(`/${lang}/categories`)}
                className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
              >
                {dict.home.viewAll} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-2 scrollbar-hide">
              {isLoading
                ? [...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-2.5 flex-shrink-0"
                    >
                      <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-200" />
                      <Skeleton className="w-12 h-3 rounded bg-gray-200" />
                    </div>
                  ))
                : categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/${lang}/categories/${cat.slug}`}
                      className="group flex flex-col items-center gap-2.5 flex-shrink-0"
                    >
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-md group-hover:ring-2 group-hover:ring-teal-400 group-hover:ring-offset-2 transition-all duration-200">
                        <Image
                          src={cat.imageUrl}
                          alt={cat.name || "Category"}
                          fill
                          sizes="80px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-500 group-hover:text-teal-600 transition-colors text-center leading-tight max-w-[72px]">
                        {getTranslations(cat.translations, lang, "name")}
                      </span>
                    </Link>
                  ))}
            </div>
          </section>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {isLoading ? (
            [...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
              >
                <Skeleton className="aspect-square w-full bg-gray-200" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4 rounded bg-gray-200" />
                  <Skeleton className="h-3 w-1/2 rounded bg-gray-200" />
                  <div className="flex items-center justify-between pt-1">
                    <Skeleton className="h-9 w-24 rounded-xl bg-gray-200" />
                  </div>
                </div>
              </div>
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center gap-3 text-center">
              <Search className="w-10 h-10 text-gray-300" />
              <p className="font-bold text-gray-500 text-base">
                {dict.home.noProductsTitle}
              </p>
              <p className="text-sm text-gray-400">
                {dict.home.noProductsDesc}
              </p>
            </div>
          ) : (
            products.map((product, index) => (
              <ProductCard
                key={product.id ?? index}
                product={product}
                lang={lang}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
