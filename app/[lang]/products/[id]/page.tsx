"use client";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import {
  Check,
  ChevronDown,
  Minus,
  Plus,
  ShoppingCart,
  Palette,
  Wrench,
  MessageCircle,
} from "lucide-react";
import ProductImageGallery from "../_components/ProductImageGalery";
import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";
import { useLang } from "@/components/LanguageContext";
import { getTranslations } from "@/lib/getTranslations";
import ProductCard from "@/components/ProductCard";
import useShopStore from "@/store/useShopStore";
import { useRouter } from "next/navigation";
import { getYouTubeEmbedUrl } from "@/lib/getYoutubeEmbedUrl";
import { COLORS } from "@/data";
import ProductVideos from "@/components/ProductVideos";

export default function Page() {
  const { id } = useParams();
  const [product, setProduct] = useState<any | null>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<any | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);

  const router = useRouter();
  const { addToCart, updateQuantity } = useShopStore();
  const { lang } = useLang();

  // Fetch product and similar products
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const productRes = await fetch(
          `/api/products/get-product?productId=${id}`,
        );
        if (!productRes.ok) throw new Error("Failed to fetch product");

        const { product } = await productRes.json();
        setProduct(product);

        // Auto-select first available variant if exists
        if (product.variants?.length > 0) {
          const firstAvailable = product.variants.find((v : any) => v.stock > 0);
          if (firstAvailable) setSelectedVariantId(firstAvailable.id);
        }

        // Auto-select required addons (as full addon objects)
        if (product.addonsAsMain?.length > 0) {
          const requiredAddons = product.addonsAsMain
            .filter((addon : any) => addon.required)
            .map((addon : any) => {
              const p = addon.addonProduct;
              return {
                id: p.id,
                translations: p.translations,
                imageUrl: p.images?.[0] || p.imageUrl,
                price:
                  p.promoPrice && p.promoPrice > 0
                    ? p.promoPrice
                    : (p.regularPrice ?? 0),
                quantity: 1,
                required: true,
              };
            });
          setSelectedAddons(requiredAddons);
        }

      const productId = product?.id;
const categorySlug = product?.category?.slug;

// If neither exists, clear and exit
if (!productId && !categorySlug) {
  setSimilarProducts([]);
  return;
}

// Build query params dynamically
const params = new URLSearchParams();

if (productId) {
  params.append("productId", productId);
} else if (categorySlug) {
  params.append("slug", categorySlug);
}

const similarRes = await fetch(
  `/api/products/get-similar-products?${params.toString()}`
);

if (!similarRes.ok) {
  throw new Error("Failed to fetch similar products");
}

const { products } = await similarRes.json();
setSimilarProducts(products);
      } catch (error) {
        console.error(error);
        toast.error("Error occurred: try again later");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Get current variant or product pricing
  const selectedVariant = useMemo(() => {
    if (!product) return null;
    if (product.variants?.length > 0 && selectedVariantId) {
      return product.variants.find((v : any) => v.id === selectedVariantId);
    }
    return null;
  }, [product, selectedVariantId]);

  // Calculate base price (from variant or product)
  const basePrice = useMemo(() => {
    if (selectedVariant) {
      return selectedVariant.promoPrice && selectedVariant.promoPrice > 0
        ? selectedVariant.promoPrice
        : selectedVariant.regularPrice;
    }
    if (product) {
      return product.promoPrice && product.promoPrice > 0
        ? product.promoPrice
        : product.regularPrice;
    }
    return 0;
  }, [product, selectedVariant]);

  // Calculate addons total (use selectedAddons array directly)
  const addonsTotal = useMemo(() => {
    return selectedAddons.reduce(
      (sum, a) => sum + (a.price || 0) * (a.quantity || 1),
      0,
    );
  }, [selectedAddons]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    return (basePrice + addonsTotal) * quantity;
  }, [basePrice, addonsTotal, quantity]);

  // Get current stock
  const currentStock = useMemo(() => {
    if (selectedVariant) return selectedVariant.stock;
    return product?.stock || 0;
  }, [product, selectedVariant]);

  // Get current images
  const currentImages = useMemo(() => {
    if (selectedVariant?.imageUrl) {
      console.log(selectedVariant);
      return [selectedVariant.imageUrl]; // 👈 normalize to array
    }

    return product?.images || [];
  }, [product, selectedVariant]);

  // Handle addon toggle
  const toggleAddon = (product : any, isRequired : boolean) => {
    if (isRequired) return;

    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a.id === product.id);

      if (exists) {
        return prev.filter((a) => a.id !== product.id);
      }

      return [
        ...prev,
        {
          id: product.id,
          translations: product.translations,
          imageUrl: product.images?.[0],
          price:
            product.promoPrice && product.promoPrice > 0
              ? product.promoPrice
              : (product.regularPrice ?? 0),
          quantity: 1,
          required: false,
        },
      ];
    });
  };

  // Quantity handlers
  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < currentStock) {
      setQuantity(quantity + 1);
    } else {
      toast.error(`Only ${currentStock} items in stock`);
    }
  };

  const handleQuantityChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= currentStock) {
      setQuantity(value);
    } else if (value > currentStock) {
      toast.error(`Only ${currentStock} items in stock`);
      setQuantity(currentStock);
    }
  };

  const getSelectedAddon = (id: string) =>
    selectedAddons.find((a) => a.id === id);

  const updateAddonQuantity = (id: string, quantity: number, max?: number) => {
    setSelectedAddons((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              quantity: Math.max(1, Math.min(quantity, max ?? quantity)),
            }
          : a,
      ),
    );
  };

  if (isLoading || !product) {
    return <Loader />;
  }

  const hasVariants = product.variants?.length > 0;
  const isInStock = currentStock > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Green banner */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 px-4 text-center">
        <p className="text-sm md:text-base flex items-center justify-center gap-2">
          Commandez maintenant et payez uniquement à la réception du produit
        </p>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Product images */}
          <ProductImageGallery
            images={currentImages}
            productName={getTranslations(product.translations, lang, "name")}
          />

          {/* Right column - Product details */}
          <div className="space-y-6">
            <div>
              {/* Product Name */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-3">
                {getTranslations(product.translations, lang, "name")}
              </h1>

              {/* Price */}
              <div className="flex items-end gap-3 mb-6">
                <div className="flex items-end gap-3">
                  {/* Show original price if promo exists */}
                  {((selectedVariant?.promoPrice &&
                    selectedVariant.promoPrice > 0) ||
                    (!selectedVariant &&
                      product.promoPrice &&
                      product.promoPrice > 0)) && (
                    <span className="text-lg sm:text-xl text-gray-400 line-through">
                      {(
                        selectedVariant?.regularPrice || product.regularPrice
                      )?.toLocaleString()}{" "}
                      DA
                    </span>
                  )}

                  {/* Current price */}
                  <span className="text-3xl sm:text-4xl font-extrabold text-teal-600">
                    {basePrice.toLocaleString()} DA
                  </span>
                </div>

                {((selectedVariant?.promoPrice &&
                selectedVariant?.promoPrice > 0
                  ? selectedVariant?.promoPriceText
                  : selectedVariant?.regularPriceText) ||
                  (product?.promoPrice && product?.promoPrice > 0
                    ? product?.promoPriceText
                    : product?.regularPriceText)) && (
                  <span
                    dir="rtl"
                    className="text-base sm:text-lg text-gray-500 font-medium pb-1"
                  >
                    {selectedVariant?.promoPrice &&
                    selectedVariant?.promoPrice > 0
                      ? selectedVariant?.promoPriceText
                      : selectedVariant?.regularPriceText ||
                        (product?.promoPrice && product?.promoPrice > 0
                          ? product?.promoPriceText
                          : product?.regularPriceText)}
                  </span>
                )}
              </div>
            </div>

            {/* Purchase section */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              {/* Stock status */}
              <div
                className={`flex items-center justify-center gap-2 mb-6 ${isInStock ? "text-teal-600" : "text-red-600"}`}
              >
                {isInStock ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span className="font-medium">
                      En stock ({currentStock} disponibles)
                    </span>
                  </>
                ) : (
                  <span className="font-medium">Rupture de stock</span>
                )}
              </div>

              {/* Variants selector */}
              {hasVariants && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Sélectionnez une variante
                  </label>

                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((variant : any) => {
                      const isOutOfStock = variant.stock === 0;
                      const isSelected = variant.id === selectedVariantId;

                      const colorData = COLORS.find(
                        (c) => c.value === variant.color,
                      );

                      return (
                        <button
                          key={variant.id}
                          onClick={() => {
                            if (!isOutOfStock) {
                              setSelectedVariantId(variant.id);
                              if (quantity > variant.stock) {
                                setQuantity(Math.min(quantity, variant.stock));
                              }
                            }
                          }}
                          disabled={isOutOfStock}
                          className={`
            relative
            w-12 h-12 rounded-full
            flex items-center justify-center
            border-2 transition-all
            ${
              isSelected
                ? "border-teal-600 ring-2 ring-teal-400"
                : "border-gray-300"
            }
            ${
              isOutOfStock
                ? "opacity-40 cursor-not-allowed"
                : "hover:border-teal-500"
            }
          `}
                          style={
                            colorData
                              ? { backgroundColor: colorData.hex }
                              : undefined
                          }
                        >
                          {/* If no color → show text */}
                          {!colorData && (
                            <span
                              className={`
                text-sm font-medium
                ${isSelected ? "text-teal-700" : "text-gray-700"}
              `}
                            >
                              {variant.attribute}
                            </span>
                          )}

                          {/* Out of stock overlay */}
                          {isOutOfStock && (
                            <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-600 line-through">
                              ×
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleDecrease}
                    disabled={quantity <= 1 || !isInStock}
                    className="w-10 h-10 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Diminuer la quantité"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max={currentStock}
                      value={quantity}
                      onChange={handleQuantityChange}
                      disabled={!isInStock}
                      className="w-16 text-center border border-gray-300 rounded px-2 py-2 disabled:opacity-50"
                    />
                    <span className="text-gray-600">pièce</span>
                  </div>
                  <button
                    onClick={handleIncrease}
                    disabled={quantity >= currentStock || !isInStock}
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
                  <span className="text-gray-600">Prix de base</span>
                  <span className="font-medium">
                    {basePrice.toLocaleString()} DA
                  </span>
                </div>

                {addonsTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Options sélectionnées</span>
                    <span className="font-medium">
                      {addonsTotal.toLocaleString()} DA
                    </span>
                  </div>
                )}

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

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    addToCart({
                      ...product,
                      ...(selectedVariant && {
                        variantId: selectedVariantId,
                        variant: selectedVariant,
                      }),
                      quantity: quantity,
                      price: basePrice,
                      totalPrice: totalPrice,
                      addons: selectedAddons,
                    });
                  }}
                  disabled={!isInStock || (hasVariants && !selectedVariantId)}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Ajouter au panier
                </button>

                <a
                  href="https://wa.me/213XXXXXXXXX" // ← replace with your number (no +, no spaces)
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
    mt-3 w-full
    flex items-center justify-center gap-2
    px-4 py-3
    rounded-xl
    bg-green-500 hover:bg-green-600
    text-white text-sm font-semibold
    transition
  "
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact us on WhatsApp
                </a>
              </div>
            </div>

            {/* Addons Section */}
            {product.addonsAsMain?.length > 0 && (
              <div className="space-y-3 py-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Options disponibles
                </h3>
                {product.addonsAsMain.map((addon : any) => {
                  const addonPrice =
                    addon.addonProduct.promoPrice &&
                    addon.addonProduct.promoPrice > 0
                      ? addon.addonProduct.promoPrice
                      : addon.addonProduct.regularPrice || 0;

                  const isSelected = selectedAddons.some(
                    (a) => a.id === addon.addonProduct.id,
                  );

                  return (
                    <label
                      key={addon.addonProduct.id}
                      className={`
    group flex items-center gap-3 py-2.5 px-3 border rounded-md transition-all
    ${
      addon.addonProduct.stock === 0
        ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-200"
        : "cursor-pointer"
    }
    ${
      addon.required || isSelected
        ? "border-teal-400 bg-teal-50"
        : addon.addonProduct.stock === 0
          ? ""
          : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
    }
  `}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          toggleAddon(addon.addonProduct, addon.required)
                        }
                        disabled={addon.required}
                        className="h-4 w-4 accent-teal-500 disabled:opacity-60"
                      />

                      {/* Image */}
                      <div className="w-10 h-10 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                        {addon.addonProduct.images?.[0] ? (
                          <img
                            src={addon.addonProduct.images[0]}
                            alt="Addon"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Name + meta */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getTranslations(
                            addon.addonProduct.translations,
                            lang,
                            "name",
                          )}
                        </p>

                        <span
                          className={`text-[11px] ${
                            addon.required ? "text-teal-600" : "text-gray-500"
                          }`}
                        >
                          {addon.required ? "Obligatoire" : "Optionnel"}
                        </span>
                      </div>

                      {/* Quantity */}
                      {isSelected &&
                        addon.addonProduct.stock &&
                        addon.addonProduct.stock > 1 && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                updateAddonQuantity(
                                  addon.addonProduct.id,
                                  getSelectedAddon(addon.addonProduct.id)!
                                    .quantity - 1,
                                );
                              }}
                              className="w-6 h-6 border rounded-sm flex items-center justify-center text-sm hover:bg-gray-100"
                            >
                              −
                            </button>

                            <span className="w-6 text-center text-xs font-medium">
                              {
                                getSelectedAddon(addon.addonProduct.id)
                                  ?.quantity
                              }
                            </span>

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                updateAddonQuantity(
                                  addon.addonProduct.id,
                                  getSelectedAddon(addon.addonProduct.id)!
                                    .quantity + 1,
                                  addon.addonProduct.stock,
                                );
                              }}
                              className="w-6 h-6 border rounded-sm flex items-center justify-center text-sm hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>
                        )}

                      {/* Price */}
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                          +{addonPrice.toLocaleString()} DA
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-12 mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Description du produit
          </h2>

          <p className="text-gray-700 leading-relaxed mb-6">
            {getTranslations(product.translations, lang, "description")}
          </p>

          {product.youtubeVideoUrls && (
            <ProductVideos urls={product.youtubeVideoUrls || []}/>
          )}
        </div>

        {/* Similar products */}
        {similarProducts.filter((p) => p.id !== id).length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Produits similaires
            </h2>
            <div className="border-b-4 border-teal-600 w-32 mx-auto mb-8"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {similarProducts
                .filter((p) => p.id !== id)
                .map((p) => (
                  <ProductCard key={p.id} product={p} lang={lang} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
