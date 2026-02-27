'use client'

import React, { useEffect, useState } from 'react'
import { Copy, Check, Upload, X, Trash2 } from 'lucide-react'
import Loader from '@/components/Loader'

const Page = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<Array<{ file: File; url: string; uploading?: boolean }>>([])
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch("/api/images/get-images");

        if (!res.ok) {
          throw new Error("Error fetching images");
        }

        const { images } = await res.json();
        
        // Convert fetched images to the correct format
        const formattedImages = images.map((img: any) => ({
          file: new File([], img.filename || 'image.jpg'),
          url: img.url,
          uploading: false
        }));
        
        setUploadedImages(formattedImages);

      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/')
      )
      setSelectedFiles(prev => [...prev, ...files])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter(file => 
        file.type.startsWith('image/')
      )
      setSelectedFiles(prev => [...prev, ...files])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    for (const file of selectedFiles) {
      // optimistic preview
      const tempUrl = URL.createObjectURL(file);

      setUploadedImages((prev) => [
        ...prev,
        { file, url: tempUrl, uploading: true },
      ]);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/images/create-image", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");

        const { image } = await res.json();

        // replace temp preview with real Cloudinary URL
        setUploadedImages((prev) =>
          prev.map((img) =>
            img.url === tempUrl
              ? { ...img, url: image.url, uploading: false }
              : img
          )
        );
      } catch (error) {
        console.error(error);

        // remove failed image
        setUploadedImages((prev) =>
          prev.filter((img) => img.url !== tempUrl)
        );
      } finally {
        URL.revokeObjectURL(tempUrl);
      }
    }

    setSelectedFiles([]);
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => {
      const updated = prev.filter((_, i) => i !== index)
      if (prev[index].url.startsWith('blob:')) {
        URL.revokeObjectURL(prev[index].url)
      }
      return updated
    })
  }

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(url)
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  if (isLoading) {
    return <Loader/>
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Image Library</h1>
          <p className="mt-1 text-sm text-gray-500">Upload multiple images and copy their URLs</p>
        </div>

        {/* Upload Card */}
        <div className="px-4 sm:px-6 lg:px-8">
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
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="pointer-events-none">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-1">
                <label htmlFor="file-upload" className="text-teal-600 hover:text-teal-700 cursor-pointer pointer-events-auto font-medium">
                  Click to select
                </label>
                {' '}or drag and drop images here
              </p>
              <p className="text-xs text-gray-500 mt-1">You can select multiple images at once</p>
            </div>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">
                  Selected Files ({selectedFiles.length})
                </h3>
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 font-medium truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          {selectedFiles.length > 0 && (
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedFiles([])}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-150 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-150 font-medium"
              >
                Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'Image' : 'Images'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Images Grid */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {uploadedImages.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {uploadedImages.map((image, index) => (
                <div
                  key={index}
                  className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-teal-500 hover:shadow-md transition-all duration-200"
                >
                  <div className="relative aspect-video overflow-hidden bg-gray-100">
                    <img
                      src={image.url}
                      alt={image.file.name}
                      className="w-full h-full object-cover"
                    />
                    {image.uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <p className="text-white text-sm">Uploading...</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-700 truncate mb-2">
                      {image.file.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={image.url}
                        readOnly
                        className="flex-1 text-xs text-gray-500 bg-transparent border-none outline-none truncate"
                      />
                      <button
                        onClick={() => copyToClipboard(image.url)}
                        className="flex-shrink-0 p-1.5 rounded hover:bg-teal-50 transition-colors duration-150 group"
                        title="Copy URL"
                      >
                        {copiedUrl === image.url ? (
                          <Check className="w-4 h-4 text-teal-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400 group-hover:text-teal-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">
              No images uploaded yet. Upload some images to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Page