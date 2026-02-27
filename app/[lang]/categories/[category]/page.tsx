"use client";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Search, Star } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const page = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount] = useState(0);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { category } = useParams();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);

        const res = await fetch(`/api/products/get-products?slug=${category}`);

        if (!res.ok) {
          throw new Error("Error fetching products");
        }

        const { products } = await res.json();
        setProducts(products);
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
    <div>
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white text-center py-5 px-4 shadow-md">
        <h1 className="text-2xl font-bold underline">{category}</h1>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        <main className="container mx-auto p-4  max-w-7xl">
          <form onSubmit={() => {}} className="max-w-2xl mx-auto mb-2">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, categories..."
                className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 text-slate-900 placeholder:text-slate-400 shadow-sm hover:shadow-md"
              />
            </div>
          </form>

          <section>
            {products.length === 0 && !isLoading && (
              <div className="w-full flex items-center justify-center my-6 text-center">
                <p className="text-gray-600">
                  No products are currently available in this category.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading
                ? [...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100"
                    >
                      {/* Image Skeleton */}
                      <div className="relative aspect-square">
                        <Skeleton className="w-full h-full bg-gray-300" />

                        {/* Favorite button placeholder */}
                        <div className="absolute top-3 right-3">
                          <Skeleton className="w-10 h-10 rounded-full bg-gray-300" />
                        </div>
                      </div>

                      {/* Content Skeleton */}
                      <div className="p-5 space-y-4">
                        <Skeleton className="h-5 w-3/4 bg-gray-300" />
                        <Skeleton className="h-5 w-1/2 bg-gray-300" />

                        {/* Rating row */}
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-24 bg-gray-300" />
                          <Skeleton className="h-4 w-10 bg-gray-300" />
                        </div>

                        {/* Price + Button */}
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-8 w-24 bg-gray-300" />
                          <Skeleton className="h-10 w-28 rounded-xl bg-gray-300" />
                        </div>
                      </div>
                    </div>
                  ))
                : products.map((product, index) => (
                    <ProductCard key={index} product={product} lang={"fr"} />
                  ))}
            </div>
          </section>
        </main>

        {/* Animations */}
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default page;
