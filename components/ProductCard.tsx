"use client";
import { getTranslations } from "@/lib/getTranslations";
import useShopStore from "@/store/useShopStore";
import { Heart, Star, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

const ProductCard = ({ product, lang }: { product: any; lang: string }) => {
  const [cartCount] = useState(0);
  const { toggleFavorite, isFavorite, favorites, addToCart, cart } =
    useShopStore();
  const router = useRouter();

  const basePrice = useMemo(() => {
    if (product) {
      return product.promoPrice && product.promoPrice > 0
        ? product.promoPrice
        : product.regularPrice;
    }
    return 0;
  }, [product]);

  return (
    <a
      key={product.id}
      href={`/${lang}/products/${product.id}`}
      className="group block bg-white rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-emerald-200"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(product);
          }}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 z-10"
          aria-label="Add to favorites"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 transition-colors ${
              favorites.some((item : any) => item.id === product.id)
                ? "fill-red-500 text-red-500"
                : "text-slate-400"
            }`}
          />
        </button>

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-3 lg:p-4">
        {/* Product Name */}
        <h3 className="font-semibold text-slate-900 mb-1.5 sm:mb-2 group-hover:text-emerald-600 transition-colors text-xs sm:text-sm lg:text-base leading-snug min-h-[2.5rem] sm:min-h-[3rem] lg:min-h-[3.5rem]">
          {getTranslations(product.translations, lang, "name")}

          <span className="block mt-0.5 text-gray-400 text-[11px] sm:text-xs leading-tight">
            {getTranslations(product.translations, lang, "description")
              ?.split(" ")
              .slice(0, 7)
              .join(" ")}
            {getTranslations(product.translations, lang, "description")?.split(
              " ",
            ).length > 7 && "…"}
          </span>
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 ${
                  i < Math.floor(product.rating || 5)
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="mb-3 flex items-end gap-1.5 sm:gap-2 leading-none">
          {/* Crossed regular price (only if promo exists AND is valid) */}
          {product.promoPrice !== null &&
            product.promoPrice !== undefined &&
            product.promoPrice > 0 && (
              <span className="text-[10px] sm:text-xs text-slate-400 line-through whitespace-nowrap">
                {product.regularPrice?.toLocaleString()} DA
              </span>
            )}

          {/* Current price */}
          <span className="font-bold text-xs sm:text-sm md:text-base text-teal-600 whitespace-nowrap">
            {(product.promoPrice !== null &&
            product.promoPrice !== undefined &&
            product.promoPrice > 0
              ? product.promoPrice
              : product.regularPrice
            )?.toLocaleString()}{" "}
            DA
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          className="w-full px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl hover:from-teal-700 hover:to-teal-800 transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-1 sm:gap-1.5"
          onClick={() => router.push(`/${lang}/products/${product.id}`)}
        >
          {/* <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" /> */}
        <span>
  {lang === "en"
    ? "Buy now"
    : lang === "fr"
    ? "Acheter maintenant"
    : "اشترِ الآن"}
</span>
        </button>
      </div>
    </a>
  );
};

export default ProductCard;
