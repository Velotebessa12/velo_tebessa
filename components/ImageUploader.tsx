"use client";

import { useState, DragEvent, ChangeEvent } from "react";
import Image from "next/image";
import { Upload, Trash2, Loader2, ImageIcon, X } from "lucide-react";

type UploadType = "one" | "many";

type ImageRecord = {
  id: string;
  url: string | null;
};

interface ImageUploaderProps {
  type?: UploadType;
  images: any[]; // URLs ONLY
  setImages: any;
}

export default function ImageUploader({
  type = "many",
  images,
  setImages,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [showPicker, setShowPicker] = useState(false);
  const [libraryImages, setLibraryImages] = useState<ImageRecord[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  /* ============================
     Upload new image
  ============================ */
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/images/create-image", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");

    const { url } = await res.json();
    return url;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);

    try {
      const urls = await Promise.all(
        Array.from(files).map(uploadFile)
      );
      
      console.log(urls)
      setImages((prev : any) =>
        type === "one" ? [urls[0]] : [...prev, ...urls]
      );
    } finally {
      setUploading(false);
    }
  };

  /* ============================
     Drag & Drop
  ============================ */
  const dragHandlers = {
    onDragEnter: (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    },
    onDragOver: (e: DragEvent) => e.preventDefault(),
    onDragLeave: () => setIsDragging(false),
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
  };

  /* ============================
     Remove image
  ============================ */
  const removeImage = (url: string) => {
    setImages((prev : any) => prev.filter((img : any) => img !== url));
  };

  /* ============================
     Open image library
  ============================ */
  const openImagePicker = async () => {
    setShowPicker(true);
    setLoadingLibrary(true);

    const res = await fetch("/api/images/get-images");
    const data = await res.json();

    setLibraryImages(data.images || []);
    setLoadingLibrary(false);
  };

  /* ============================
     Select image from library
  ============================ */
  const selectImage = (image: ImageRecord) => {
    if (!image.url) return;

    setImages((prev : any) =>
      type === "one" ? [image.url] : [...prev, image.url]
    );

    setShowPicker(false);
  };

  const singleImage = type === "one" ? images[0] : null;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      {/* Choose from library */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openImagePicker}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ImageIcon className="w-4 h-4" />
          Choose from uploaded images
        </button>
      </div>

      {/* Drag area */}
      <div
        {...dragHandlers}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition ${
          isDragging
            ? "border-emerald-500 bg-emerald-50"
            : "border-slate-300 hover:border-slate-400"
        }`}
      >
        <input
          type="file"
          multiple={type === "many"}
          accept="image/*"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleFiles(e.target.files)
          }
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {/* ONE */}
        {singleImage ? (
          <div className="relative w-full h-64 rounded-lg overflow-hidden">
            <Image src={singleImage} alt="Image" fill className="object-cover" />
            <button
              onClick={() => removeImage(singleImage)}
              className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : uploading ? (
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" />
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-8 h-8 text-slate-400" />
            <p className="text-lg font-medium">
              Drop images here or click to upload
            </p>
          </div>
        )}
      </div>

      {/* MANY */}
      {type === "many" && images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((url) => (
            <div
              key={url}
              className="relative aspect-square rounded-lg overflow-hidden border"
            >
              <Image src={url} alt="Image" fill className="object-cover" />
              <button
                onClick={() => removeImage(url)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* IMAGE PICKER MODAL */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full p-5 relative">
            <button
              onClick={() => setShowPicker(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
            >
              <X />
            </button>

            <h3 className="text-lg font-semibold mb-4">
              Select an image
            </h3>

            {loadingLibrary ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 max-h-[60vh] overflow-y-auto">
                {libraryImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => selectImage(img)}
                    className="relative aspect-square rounded-lg overflow-hidden border hover:ring-2 hover:ring-emerald-500"
                  >
                    {img.url && (
                      <Image
                        src={img.url}
                        alt="Library image"
                        fill
                        className="object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}