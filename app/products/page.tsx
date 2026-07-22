"use client";

import Link from "next/link";
import { useProducts } from "@/components/context/ProductsContext";

export default function ProductsIndex() {
  const { products, isLoaded, error } = useProducts();

  const visibleProducts = products;

  return (
    <div className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
      <h1 className="text-3xl font-semibold text-center text-rose-700">Our Collections</h1>

      {error ? (
        <div className="mt-10 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center text-sm text-rose-700">
          <p className="font-semibold">Unable to load products from Firebase.</p>
          <p className="mt-1">{error}. Showing fallback collection.</p>
        </div>
      ) : !isLoaded ? (
        <div className="mt-10 rounded-2xl border border-dashed border-rose-200 bg-rose-50 px-6 py-10 text-center text-sm text-gray-600">
          Loading collection...
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-rose-200 bg-rose-50 px-6 py-10 text-center text-sm text-gray-600">
          No products available in this collection yet.
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group block rounded-xl border p-4 hover:shadow-lg"
            >
              <img
                src={product.thumbnailImage || product.image || ""}
                alt={product.title}
                className="h-48 w-full rounded-md object-cover"
              />
              <h2 className="mt-3 font-medium text-gray-800 group-hover:text-rose-700">
                {product.title}
              </h2>
              <p className="mt-1 text-rose-700 font-semibold">
                {product.salePrice || product.originalPrice}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


