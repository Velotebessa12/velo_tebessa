"use client"
import { COLORS } from '@/data'
import { ChevronUp, Plus, Trash2, Upload, Wrench, ChevronDown, Palette } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast'

const Variant = ({variants , setVariants , handleAddVariant}: {
  variants : any[],
  setVariants : React.Dispatch<React.SetStateAction<any[]>>,
  handleAddVariant : () => void
}) => {



  // Calculate stock status
  const calculateStatus = (stock : any, preorder : any) => {
    if (stock > 0) return 'En stock'
    if (preorder === 'allowed') return 'Précommande'
    return 'Rupture de stock'
  }

 

  const handleDeleteVariant = (id : any) => {
    setVariants(variants.filter(v => v.id !== id))
  }

  const toggleVariant = (id : any) => {
    setVariants(variants.map(v => 
      v.id === id ? { ...v, expanded: !v.expanded } : v
    ))
  }

const updateVariant = (id : any, field : any, value : any) => {
  setVariants((prev) =>
    prev.map((v) => {
      if (v.id !== id) return v;

      const updated = { ...v, [field]: value };

      // Auto-calculate profit (if prices change)
      if (field === "regularPrice" || field === "buyingPrice") {
        const sellingPrice =
          updated.promoPrice && updated.promoPrice > 0
            ? updated.promoPrice
            : updated.regularPrice;

        updated.profit = sellingPrice - updated.buyingPrice;
      }

      // Auto-calculate status (if stock or preorder changes)
      if (field === "stock" || field === "preorder") {
        updated.calculatedStatus = calculateStatus(
          updated.stock,
          updated.preorder
        );
      }

      return updated;
    })
  );
};


  const handleImageUpload = (id : any, e : any) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateVariant(id, 'image', reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const getStatusColor = (status : any) => {
    switch (status) {
      case 'En stock': return 'bg-emerald-100 text-emerald-800'
      case 'Précommande': return 'bg-blue-100 text-blue-800'
      case 'Rupture de stock': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Variants</h1>
          <button
            onClick={handleAddVariant}
            className="flex items-center px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors shadow-sm"
          >
            <Plus size={20} className="mr-2" />
            Nouveau Variant
          </button>
        </div>

        {/* Variants List */}
        <div className="space-y-4">
          {variants.map((variant , index) => (
            <div key={variant.id || index} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Variant Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-teal-500 text-white rounded-md font-semibold">
                    #{variant.id.toString().slice(0, 1)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {variant.nameFr || 'Nouveau variant'}
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {variant.regularPrice} DA
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(variant.calculatedStatus)}`}>
                        {variant.calculatedStatus}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => toggleVariant(variant.id)}
                    className="p-2 hover:bg-gray-200 rounded-md transition-colors text-gray-600"
                  >
                    {variant.expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => handleDeleteVariant(variant.id)}
                    className="p-2 hover:bg-red-100 rounded-md transition-colors text-gray-600 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Variant Details */}
              {variant.expanded && (
                <div className="p-6">
                 

                  {/* Image Upload */}
                  <div className="mb-6">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Image du variant</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(variant.id, e)}
                        className="hidden"
                        id={`image-upload-${variant.id}`}
                      />
                      <label
                        htmlFor={`image-upload-${variant.id}`}
                        className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition-all"
                      >
                        {variant.image ? (
                          <div className="relative">
                            <img src={variant.image} alt="Preview" className="max-h-40 mx-auto rounded" />
                            <div className="mt-2 text-sm text-gray-600">Cliquez pour changer</div>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <div className="text-sm text-gray-600">Cliquez pour télécharger</div>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Status and Stock Management */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex flex-col gap-1.5">
  <label className="text-sm font-medium text-gray-700">
    Statut
  </label>

  <select
    value={variant.isActive ? "active" : "inactive"}
    onChange={(e) =>
      updateVariant(
        variant.id,
        "isActive",
        e.target.value === "active"
      )
    }
    className="px-3 py-2 border border-gray-300 rounded-md text-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500
               focus:border-transparent transition-all cursor-pointer"
  >
    <option value="active">Activé</option>
    <option value="inactive">Désactivé</option>
  </select>
</div>

                    {/* <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 mt-7">
                        <input
                          type="checkbox"
                          id={`manageStock-${variant.id}`}
                          checked={variant.manageStock}
                          onChange={(e) => updateVariant(variant.id, 'manageStock', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor={`manageStock-${variant.id}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                          Gérer le stock
                        </label>
                      </div>
                      <div className="text-xs text-gray-500 ml-6">Suivi automatique</div>
                    </div> */}
                  </div>

                  {/* Inventory Section */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Quantité (Stock)</label>
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => updateVariant(variant.id, 'stock', Number(e.target.value) || 0)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Précommande</label>
                      <select
                        value={variant.preorder}
                        onChange={(e) => updateVariant(variant.id, 'preorder', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                      >
                        <option value="not-allowed">Non autorisé</option>
                        <option value="allowed">Autorisé</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Statut (calculé)</label>
                      <input
                        type="text"
                        value={variant.calculatedStatus}
                        disabled
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Pricing Section */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Prix d'achat</label>
                      <input
                        type="number"
                        value={variant.buyingPrice}
                        onChange={(e) => updateVariant(variant.id, 'buyingPrice', parseFloat(e.target.value) || 0)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Prix régulier</label>
                      <input
                        type="number"
                        value={variant.regularPrice}
                        onChange={(e) => updateVariant(variant.id, 'regularPrice', parseFloat(e.target.value) || 0)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Prix promo</label>
                      <input
                        type="text"
                        value={variant.promoPrice}
                        onChange={(e) => updateVariant(variant.id, 'promoPrice', e.target.value)}
                        placeholder="Optionnel"
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Profit</label>
                      <input
                        type="text"
                        value={variant.profit}
                        disabled
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-emerald-100 text-emerald-700 font-semibold cursor-not-allowed"
                      />
                    </div>
                  </div>

  {/* Color OR Attribute Section */}
<div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
  {/* Header */}
  <div className="flex items-center gap-2 mb-4">
    <Palette className="w-4 h-4 text-gray-600" />
    <span className="text-sm font-semibold text-gray-900">
      Couleur ou Attribut
    </span>
  </div>

  {/* Color Selection */}
  <div className="mb-4">
    <label className="text-xs font-medium text-gray-600 mb-2 block">
      Couleur
    </label>
    <select
  value={variant.color || ""}
  onChange={(e) => {
    const value = e.target.value;

    updateVariant(variant.id, "color", value);

    // If user selects a color, clear custom attribute
    if (value) {
      updateVariant(variant.id, "attribute", "");
    }
  }}
  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
             focus:outline-none focus:ring-2 focus:ring-teal-500
             focus:border-teal-500 transition-all cursor-pointer"
>
  <option value="">-- Choisir une couleur --</option>
  {COLORS.map((color) => (
    <option key={color.value} value={color.value}>
      {color.name}
    </option>
  ))}
</select>


    {/* Color Preview */}
    {variant.color && (
      <div className="flex justify-center mt-3">
        {COLORS.filter(c => c.value === variant.color).map((color) => (
          <div
            key={color.value}
            className="w-12 h-12 rounded-full shadow-md border-2 border-gray-200"
            style={{
              backgroundColor: color.hex,
            }}
          />
        ))}
      </div>
    )}
  </div>

  {/* Divider */}
  <div className="relative my-4">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-gray-300"></div>
    </div>
    <div className="relative flex justify-center text-xs">
      <span className="px-2 bg-gray-50 text-gray-500">OR</span>
    </div>
  </div>

  {/* Custom Attribute Input */}
<div>
  <label className="text-xs font-medium text-gray-600 mb-2 block">
    Attribut personnalisé
  </label>

  <input
    type="text"
    value={variant.attribute || ""}
    onChange={(e) => {
      const value = e.target.value;

      updateVariant(variant.id, "attribute", value);

      // If user types custom attribute, clear color
      if (value.trim()) {
        updateVariant(variant.id, "color", "");
      }
    }}
    placeholder="ex: 23.3 - 24.2, S - M - XL"
    className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm
               focus:outline-none focus:ring-2 focus:ring-teal-500
               focus:border-teal-500 transition-all"
  />

  {/* Attribute Preview */}
  {variant.attribute && (
    <div className="flex justify-center mt-3">
      <div
        className="flex items-center justify-center
                   px-2 h-12 rounded-full
                   bg-gray-100 border border-gray-300
                   shadow-sm"
      >
        <span className="text-xs font-medium text-gray-700 text-center px-1">
          {variant.attribute}
        </span>
      </div>
    </div>
  )}
</div>


  {/* Quick Examples */}
 {/* Quick Examples */}
<div className="mt-4 pt-3 border-t border-gray-200">
  <p className="text-xs text-teal-600 mb-2">
    Exemples d'attributs :
  </p>

  <div className="flex flex-wrap gap-3">
    {["23.4 - 20.8", "S - M - XL", "42" , "14.6"].map((ex) => (
      <span
        key={ex}
        className="text-xs text-teal-600 underline
                   cursor-default select-none"
      >
        {ex}
      </span>
    ))}
  </div>
</div>

</div>

                 
                </div>
              )}
            </div>
          ))}
        </div>

        {variants.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Upload className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun variant</h3>
            <p className="text-gray-600 mb-4">Commencez par créer votre premier variant</p>
            <button
              onClick={handleAddVariant}
              className="inline-flex items-center px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Créer un variant
            </button>
          </div>
        )}
    </div>
    </div>
  )
}

export default Variant