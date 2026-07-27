"use client";

import Link from "next/link";
import { useProducts } from "@/components/context/ProductsContext";

const formatPriceLabel = (value: string) => {
  const numericValue = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(numericValue) ? `₹${numericValue.toLocaleString()}` : value;
};

const calculateDiscountPercent = (originalPrice?: string, salePrice?: string) => {
  if (!originalPrice || !salePrice) return null;
  const original = Number(String(originalPrice).replace(/[^0-9.]/g, ""));
  const sale = Number(String(salePrice).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(original) || !Number.isFinite(sale) || original <= 0 || sale >= original) {
    return null;
  }
  return Math.round(((original - sale) / original) * 100);
};

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
          {visibleProducts.map((product) => {
            const discountPercent = calculateDiscountPercent(
              product.originalPrice,
              product.salePrice
            );

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group block rounded-xl border p-4 hover:shadow-lg"
              >
                <img
                  src={product.thumbnailImage || product.image || ""}
                  alt={product.title}
                  className="h-[520px] sm:h-[600px] w-full rounded-md object-cover"
                />
                <h2 className="mt-3 font-medium text-gray-800 group-hover:text-rose-700">
                  {product.title}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="text-rose-700 font-semibold text-lg">
                    {formatPriceLabel(product.salePrice || product.originalPrice)}
                  </p>
                  {product.salePrice && product.originalPrice ? (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPriceLabel(product.originalPrice)}
                    </span>
                  ) : null}
                  {discountPercent ? (
                    <span className="rounded-full bg-rose-700 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                      {discountPercent}% OFF
                    </span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}


