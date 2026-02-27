'use client'

import React, { useState } from 'react'
import { Upload, Download, Info, FileSpreadsheet, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const Page = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

 const handleDownloadTemplate = () => {
  const link = document.createElement("a");
  link.href = "/api/products/get-model-csv";
  link.download = "products-model.csv"; // optional, server already sets it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

   const upload = async () => {
try {
      const formData = new FormData();
    formData.append("file", selectedFile as File);

    const res = await fetch("/api/products/import", {
      method: "POST",
      body: formData,
    });

    if(!res.ok) throw new Error("Error occured")

      toast.success("Products imported successfully !")

} catch (error) {
  toast.error("Error")
 console.log("Error occured : try again later !") 
}
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">

         <div>
          <button onClick={() => {}}>
            <ArrowLeft/>
          </button>
         </div>
            
            <h1 className="text-2xl font-semibold text-gray-900">Import de produits en masse</h1>

          <p className="text-sm text-gray-500">Importez plusieurs produits depuis un fichier Excel ou CSV</p>
       
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Instructions Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Instructions d'importation :</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Téléchargez le modèle ci-dessous pour le bon format</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Remplissez toutes les colonnes requises (nom, prix, stock, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Utilisez les ID de catégorie existants du panneau des catégories</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Séparez plusieurs URL d'images par des virgules</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Enregistrez le fichier au format CSV ou XLSX</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Download Template Button */}
        <div className="mb-8">
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-150 font-medium"
          >
            <Download className="w-4 h-4" />
            Télécharger le modèle CSV
          </button>
        </div>

        {/* Upload Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <FileSpreadsheet className="w-8 h-8 text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Télécharger un fichier Excel ou CSV
            </h2>
            <p className="text-sm text-gray-500">
              Choisissez un fichier Excel (.xlsx, .xls) ou CSV (.csv)<br />
              contenant les données des produits
            </p>
          </div>

          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-200 ${
              dragActive
                ? 'border-teal-500 bg-teal-50'
                : 'border-gray-300 bg-gray-50 hover:border-teal-500 hover:bg-teal-50'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="pointer-events-none">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-1">
                <label htmlFor="file-upload" className="text-teal-600 hover:text-teal-700 cursor-pointer pointer-events-auto">
                  Cliquez pour sélectionner
                </label>
                {' '}ou glissez le fichier ici
              </p>
              {selectedFile && (
                <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg inline-block">
                  <p className="text-sm text-gray-700 font-medium">
                    Fichier sélectionné: {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Button */}
          {selectedFile && (
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedFile(null)}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-150 font-medium"
              >
                Annuler
              </button>
              <button
                onClick={upload}
                className="px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-150 font-medium"
              >
                Importer les produits
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Page