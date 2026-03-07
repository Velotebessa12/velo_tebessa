"use client";

import React from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useLang } from "@/components/LanguageContext";
import ProductCard from "@/components/ProductCard";
import useShopStore from "@/store/useShopStore";

const FavoritesPage = () => {
  const { lang } = useLang();
  const { favorites } = useShopStore();

  console.log(favorites);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
  {lang === "en"
    ? "Favorite Products"
    : lang === "fr"
    ? "Produits favoris"
    : "المنتجات المفضلة"}
</h1>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center">
            <Heart className="w-14 h-14 text-gray-300 mx-auto mb-4" />

            <p className="text-gray-600 text-base sm:text-lg mb-4">
              You haven’t added any products to favorites yet
            </p>

            <Link
              href={`/${lang}/products`}
              className="inline-flex items-center gap-2 bg-teal-500 text-white px-5 py-2 rounded-lg hover:bg-teal-600 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((product, i) => (
              <ProductCard key={i} product={product} lang="fr" />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FavoritesPage;
