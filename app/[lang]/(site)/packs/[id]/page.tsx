"use client";
import { notFound, useParams } from "next/navigation";
import {
  Check,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Package,
  MessageCircle,
  Tag,
  BoxIcon,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";
import { useLang } from "@/components/LanguageContext";
import { getTranslations } from "@/lib/getTranslations";
import useShopStore from "@/store/useShopStore";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PackPage() {
  const { id } = useParams();
  const [pack, setPack] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const router = useRouter();
  const { addToCart  } = useShopStore();
  const { lang } = useLang();

  // Fetch pack
  useEffect(() => {
    const fetchPack = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/packs/${id}`);
        if (!res.ok) throw new Error("Failed to fetch pack");
        const { pack } = await res.json();
        setPack(pack);
      } catch (error) {
        console.error(error);
        toast.error("Error occurred: try again later");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPack();
  }, [id]);

  // Price helpers
  const basePrice = useMemo(() => {
    if (!pack) return 0;
    return pack.promoPrice && pack.promoPrice > 0
      ? pack.promoPrice
      : pack.regularPrice ?? 0;
  }, [pack]);

  const totalPrice : any = useMemo(() => basePrice * quantity, [basePrice, quantity]);

  // Collect all images: pack image first, then product images
  const allImages = useMemo(() => {
    if (!pack) return [];
    const imgs: string[] = [];
    if (pack.imageUrl) imgs.push(pack.imageUrl);
    pack.items?.forEach((item: any) => {
      const productImgs: string[] =
        item.product?.images?.map((img: any) =>
          typeof img === "string" ? img : img.url
        ) || [];
      imgs.push(...productImgs.slice(0, 1)); // 1 image per product
    });
    return imgs;
  }, [pack]);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  const handleIncrease = () => setQuantity((q) => q + 1);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) setQuantity(value);
  };

  if (isLoading || !pack) return <Loader />;

  const isActive = pack.isActive;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 px-4 text-center">
        <p className="text-sm md:text-base flex items-center justify-center gap-2">
          <Package className="w-4 h-4" />
          Pack spécial — Commandez maintenant et payez uniquement à la réception
        </p>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Images */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm">
              {allImages.length > 0 ? (
                <img
                  src={allImages[activeImageIndex]}
                  alt={getTranslations(pack.translations, lang, "name")}
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <BoxIcon className="w-24 h-24" />
                </div>
              )}

              {/* Pack badge */}
              <div className="absolute top-3 left-3 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Package className="w-3 h-3" />
                PACK
              </div>
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImageIndex === idx
                        ? "border-teal-500 ring-2 ring-teal-300"
                        : "border-gray-200 hover:border-teal-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-3">
                {getTranslations(pack.translations, lang, "name")}
              </h1>

              {/* Price */}
              <div className="mb-4 flex flex-col gap-1">
                <div className="flex items-end gap-3 flex-wrap">
                  {pack.promoPrice && pack.promoPrice > 0 && (
                    <span className="text-base sm:text-lg text-gray-400 line-through">
                      {(pack.regularPrice ?? 0).toLocaleString()} DA
                    </span>
                  )}
                  <span className="text-2xl sm:text-3xl font-bold text-teal-600 leading-tight">
                    {basePrice.toLocaleString()}{" "}
                    <span className="text-base sm:text-lg font-medium">DA</span>
                  </span>
                </div>

                {(pack.promoPrice && pack.promoPrice > 0
                  ? pack.promoPriceText
                  : pack.regularPriceText) && (
                  <span
                    dir="rtl"
                    className="text-sm sm:text-base text-gray-500 leading-snug"
                  >
                    {pack.promoPrice && pack.promoPrice > 0
                      ? pack.promoPriceText
                      : pack.regularPriceText}
                  </span>
                )}
              </div>
            </div>

            {/* Purchase card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              {/* Status */}
              <div
                className={`flex items-center justify-center gap-2 mb-6 ${isActive ? "text-teal-600" : "text-red-600"}`}
              >
                {isActive ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Disponible</span>
                  </>
                ) : (
                  <span className="font-medium">Non disponible</span>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleDecrease}
                    disabled={quantity <= 1 || !isActive}
                    className="w-10 h-10 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Diminuer la quantité"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={handleQuantityChange}
                      disabled={!isActive}
                      className="w-16 text-center border border-gray-300 rounded px-2 py-2 disabled:opacity-50"
                    />
                    <span className="text-gray-600">pack</span>
                  </div>
                  <button
                    onClick={handleIncrease}
                    disabled={!isActive}
                    className="w-10 h-10 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Augmenter la quantité"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Prix du pack</span>
                  <span className="font-medium">
                    {basePrice.toLocaleString()} DA
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quantité</span>
                  <span className="font-medium">×{quantity}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-teal-600">
                  {totalPrice.toLocaleString()} DA
                </span>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  // onClick={() => {
                  //   addToCart({
                  //     id: pack.id,
                  //     translations: pack.translations,
                  //     imageUrl: pack.imageUrl,
                  //     quantity,
                  //     price: basePrice,
                  //     totalPrice ,
                  //     isPack: true,
                  //     packItems: pack.items,
                  //   });
                  // }}
                  disabled={!isActive}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Ajouter au panier
                </button>

                <a
                  href="https://wa.me/213XXXXXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact us on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Pack items */}
        {pack.items?.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Contenu du pack
            </h2>
            <div className="border-b-4 border-teal-600 w-24 mb-6"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {pack.items.map((item: any) => {
                const product = item.product;
                const productImages: string[] =
                  product?.images?.map((img: any) =>
                    typeof img === "string" ? img : img.url
                  ) || [];
                const productName = getTranslations(
                  product?.translations,
                  lang,
                  "name"
                );

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:border-teal-200 hover:bg-teal-50 transition-all cursor-pointer group"
                    onClick={() => router.push(`/products/${product.id}`)}
                  >
                    {/* Image */}
                    <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                      {productImages[0] ? (
                        <img
                          src={productImages[0]}
                          alt={productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <BoxIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-teal-700 transition-colors">
                        {productName}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                          ×{item.quantity}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          {(item.price || 0).toLocaleString()} DA
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 transition-colors flex-shrink-0" />
                  </div>
                );
              })}
            </div>

            {/* Pack savings callout */}
            {pack.regularPrice && pack.promoPrice && pack.promoPrice > 0 && (
              <div className="mt-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <Tag className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p className="text-sm text-amber-800 font-medium">
                  Économisez{" "}
                  <span className="font-bold text-amber-600">
                    {(pack.regularPrice - pack.promoPrice).toLocaleString()} DA
                  </span>{" "}
                  en achetant ce pack !
                </p>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {getTranslations(pack.translations, lang, "description") && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Description du pack
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {getTranslations(pack.translations, lang, "description")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}