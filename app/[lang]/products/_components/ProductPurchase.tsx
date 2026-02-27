"use client";

import { useState } from "react";
import { ShoppingCart, Check, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LanguageContext";
import useShopStore from "@/store/useShopStore";

interface ProductPurchaseProps {
  product: {
    id: string;
    name: string;
    price: number;
    currency: string;
    inStock: boolean;
  };
}

export default function ProductPurchase({ product }: ProductPurchaseProps) {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const { addToCart } = useShopStore();
  const { lang } = useLang();
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const totalPrice = product.price * quantity;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      {/* Stock status */}
      <div className="flex items-center justify-center gap-2 mb-6 text-teal-600">
        <Check className="w-5 h-5" />
        <span className="font-medium">En stock</span>
      </div>

      {/* Variants selector */}
      {product.variants?.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Variante
          </label>

          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => {
              const isOutOfStock = variant.stock === 0;
              const isSelected = variant.id === selectedVariantId;

              return (
                <button
                  key={variant.id}
                  onClick={() => {
                    if (!isOutOfStock) setSelectedVariantId(variant.id);
                  }}
                  disabled={isOutOfStock}
                  className={`
              px-3 py-2 rounded-full text-sm border transition
              ${
                isSelected
                  ? "border-teal-600 bg-teal-50 text-teal-700"
                  : "border-gray-300 bg-white text-gray-700"
              }
              ${
                isOutOfStock
                  ? "opacity-40 cursor-not-allowed line-through"
                  : "hover:border-teal-500"
              }
            `}
                >
                  {variant.color || variant.attribute}

                  {isOutOfStock && (
                    <span className="ml-1 text-xs text-red-500">(Rupture)</span>
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
            disabled={quantity <= 1}
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
              className="w-16 text-center border border-gray-300 rounded px-2 py-2"
            />
            <span className="text-gray-600">pièce</span>
          </div>
          <button
            onClick={handleIncrease}
            className="w-10 h-10 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Augmenter la quantité"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Prix par pièce</span>
          <span className="font-medium">
            {product.price} {product.currency}
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
          {totalPrice} {product.currency || "DA"}
        </span>
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        <button
          onClick={() => addToCart(product)}
          className="w-full bg-black hover:bg-teal-600 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          Ajouter au panier
        </button>
        {/* <button 
          onClick={handleBuyNow}
          className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Acheter maintenant
        </button> */}
      </div>
    </div>
  );
}
