"use client";

import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/components/context/ProductsContext";

export default function FeaturedProducts() {
  const { products, isLoaded, error } = useProducts();

  const visibleProducts = products;

  return (
    <section className="pb-8">
      <div className="mb-8 flex flex-col items-center justify-center">
        <h2
          className="text-3xl font-semibold text-rose-700 sm:text-4xl"
          style={{ fontFamily: "Cormorant, serif", fontStyle: "italic" }}
        >
          Our Collections
        </h2>
        <div className="mt-3 h-px w-24 bg-rose-500" />
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center text-sm text-rose-700">
          <p className="font-semibold">Unable to load products from Firebase.</p>
          <p className="mt-1">{error}. Showing fallback product collection.</p>
        </div>
      ) : !isLoaded ? (
        <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50 px-6 py-10 text-center text-sm text-gray-600">
          Loading collection...
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50 px-6 py-10 text-center text-sm text-gray-600">
          No products available in this collection yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.title}
              price={product.salePrice || product.originalPrice}
              image={product.thumbnailImage || product.image || ""}
              originalPrice={product.salePrice ? product.originalPrice : undefined}
              salePrice={product.salePrice}
            />
          ))}
        </div>
      )}
    </section>
  );
}


