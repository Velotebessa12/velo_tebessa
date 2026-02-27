"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import {
  ShoppingCart,
  User,
  Globe,
  Search,
  Heart,
  Star,
  X,
  ChevronDown,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { getTranslations } from "@/lib/getTranslations";
import { useLang } from "@/components/LanguageContext";

const page = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount] = useState(0);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedSort, setSelectedSort] = useState("");
  const {lang} = useLang();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);

        const params = new URLSearchParams();

        if (selectedCategory) {
          params.append("slug", selectedCategory);
        }

        if (selectedSort) {
          params.append("sort", selectedSort);
        }

        if (searchQuery) {
          params.append("query", searchQuery);
        }

        const res = await fetch(
          `/api/products/get-products?${params.toString()}`,
        );

        if (!res.ok) throw new Error();

        const { products } = await res.json();

        setProducts(products);
      } catch (error) {
        toast.error("Failed to load products");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    // 🔥 DEBOUNCE LOGIC
    const delay = setTimeout(() => {
      fetchProducts();
    }, 400); // wait 400ms after user stops typing

    return () => clearTimeout(delay);
  }, [selectedCategory, selectedSort, searchQuery]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Run both requests in parallel
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/products/get-products"),
          fetch("/api/categories/get-categories"),
        ]);

        if (!productsRes.ok || !categoriesRes.ok) {
          throw new Error("Error occurred while fetching data");
        }

        const { products } = await productsRes.json();
        const { categories } = await categoriesRes.json();

        setProducts(products);
        setCategories(categories);
      } catch (error) {
        toast.error("Error occurred: try again later");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    // Drop this JSX into your category/search page component

    <div className="min-h-screen bg-gray-50">
    {/* Search + Filters */}
<div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
    
    {/* Search input */}
    <div
      className="w-full max-w-xl mt-1 flex items-center bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm
      focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-50 transition-all"
    >
      <div className="relative flex flex-1 items-center">
        <Search className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none" />

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            lang === "en"
              ? "Search bikes, parts, accessories…"
              : lang === "fr"
              ? "Rechercher vélos, pièces, accessoires…"
              : "ابحث عن الدراجات، القطع، الإكسسوارات…"
          }
          className="w-full py-3.5 pl-11 pr-3 text-sm text-gray-800 bg-transparent
          outline-none font-medium placeholder-gray-400"
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

      <button
        type="button"
        className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800
        text-white text-sm font-bold px-6 py-3.5
        transition-colors whitespace-nowrap"
      >
        {lang === "en" ? "Search" : lang === "fr" ? "Rechercher" : "بحث"}
      </button>
    </div>

    {/* Category select */}
    <div className="relative flex-shrink-0">
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="appearance-none w-full sm:w-auto bg-gray-100 border border-transparent text-gray-700 text-sm font-semibold pl-3 pr-8 py-2.5 rounded-xl cursor-pointer outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
      >
        <option value="">
          {lang === "en"
            ? "All Categories"
            : lang === "fr"
            ? "Toutes les catégories"
            : "جميع الفئات"}
        </option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.slug}>
            {getTranslations(cat.translations, lang, "name")}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
    </div>

    {/* Sort select */}
    <div className="relative flex-shrink-0">
      <select
        value={selectedSort}
        onChange={(e) => setSelectedSort(e.target.value)}
        className="appearance-none w-full sm:w-auto bg-gray-100 border border-transparent text-gray-700 text-sm font-semibold pl-3 pr-8 py-2.5 rounded-xl cursor-pointer outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
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
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
    </div>

    {/* Clear button */}
    {(searchQuery || selectedCategory || selectedSort) && (
      <button
        onClick={() => {
          setSearchQuery("");
          setSelectedCategory("");
          setSelectedSort("");
        }}
        className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-2.5 rounded-xl transition-colors"
      >
        <X className="w-3 h-3" />
        {lang === "en" ? "Clear" : lang === "fr" ? "Effacer" : "مسح"}
      </button>
    )}
  </div>
</div>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Result count */}
        {!isLoading && (
          <p className="text-sm text-gray-400 font-medium mb-5">
            {products.length} product{products.length !== 1 ? "s" : ""} found
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
              >
                <div className="relative aspect-square">
                  <Skeleton className="w-full h-full bg-gray-200" />
                  <div className="absolute top-3 right-3">
                    <Skeleton className="w-9 h-9 rounded-full bg-gray-200" />
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4 rounded bg-gray-200" />
                  <Skeleton className="h-3 w-1/2 rounded bg-gray-200" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-20 rounded bg-gray-200" />
                    <Skeleton className="h-3 w-8 rounded bg-gray-200" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <Skeleton className="h-6 w-16 rounded bg-gray-200" />
                    <Skeleton className="h-9 w-24 rounded-xl bg-gray-200" />
                  </div>
                </div>
              </div>
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center gap-3 text-center">
              <Search className="w-10 h-10 text-gray-300" />
              <p className="font-bold text-gray-500">No products found</p>
              <p className="text-sm text-gray-400">
                Try different search terms or filters.
              </p>
            </div>
          ) : (
            products.map((product, index) => (
              <ProductCard key={index} product={product} lang="fr" />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default page;
