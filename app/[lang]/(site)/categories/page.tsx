"use client";

import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/components/LanguageContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getTranslations } from "@/lib/getTranslations";

type Category = {
  id: number;
  name: string;
  image: string;
  slug: string;
};

const Page = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { lang } = useLang();
  console.log(lang)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);

        const res = await fetch("/api/categories/get-categories");

        if (!res.ok) {
          throw new Error("Error fetching products");
        }

        const { categories } = await res.json();
        setCategories(categories);
      } catch (error) {
        toast.error("Error fetching products");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Page header */}
        <div className="mb-7">
  <p className="text-xs font-bold tracking-widest text-teal-600 uppercase mb-1">
    {lang === "en"
      ? "Browse"
      : lang === "fr"
      ? "Parcourir"
      : "تصفح"}
  </p>

  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
    {lang === "en"
      ? "All Categories"
      : lang === "fr"
      ? "Toutes les catégories"
      : "جميع الفئات"}
  </h1>
</div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-5">
          {isLoading
            ? [...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
                >
                  <Skeleton className="w-full h-32 bg-gray-200" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4 mx-auto rounded bg-gray-200" />
                    <Skeleton className="h-3 w-full rounded bg-gray-200" />
                    <Skeleton className="h-3 w-2/3 mx-auto rounded bg-gray-200" />
                    <Skeleton className="h-9 w-full rounded-xl bg-gray-200 mt-1" />
                  </div>
                </div>
              ))
            : categories.map((category : any) => (
                <div
                  key={category.id}
                  onClick={() =>
                    router.push(`/${ lang }/categories/${category.slug}`)
                  }
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-300 cursor-pointer transition-all duration-200"
                >
                  {/* Image */}
                  <div className="relative w-full h-32 overflow-hidden bg-gray-100">
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-4 flex flex-col gap-2">
                    <h3 className="text-sm font-bold text-gray-800 text-center truncate">
                      {getTranslations(category.translations,  lang , "name")}
                    </h3>

                    <p className="text-xs text-gray-400 text-center line-clamp-2 leading-relaxed">
                      {getTranslations(
                        category.translations,
                         lang ,
                        "description",
                      )}
                    </p>

                    <button className="mt-1 w-full text-xs font-bold px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white transition-colors">
  {lang === "en"
    ? "Browse"
    : lang === "fr"
    ? "Parcourir"
    : "تصفح"}
</button>
                  </div>
                </div>
              ))}
        </div>
      </section>
    </div>
  );
};

export default Page;
