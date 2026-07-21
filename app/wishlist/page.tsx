"use client";

import Link from "next/link";
import { useFavorites } from "@/components/context/FavoritesContext";
import { useProducts } from "@/components/context/ProductsContext";
import HeartIcon from "@/components/HeartIcon";

export default function WishlistPage() {
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { products } = useProducts();

  const wishlistProducts = products.filter((product) => favoriteIds.includes(String(product.id)));

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-rose-700 mb-12 text-center" style={{ fontFamily: "Cormorant, serif", fontStyle: "italic" }}>
          My Wishlist
        </h1>

        {wishlistProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50 p-12 text-center">
            <HeartIcon size={48} className="mx-auto mb-4 text-rose-400" filled={false} />
            <p className="text-gray-600 mb-6">Your wishlist is empty</p>
            <Link
              href="/#featured"
              className="inline-block bg-rose-600 hover:bg-rose-700 text-white font-semibold px-8 py-3 rounded-full transition"
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => {
              const displayPrice = product.salePrice || product.originalPrice || product.price || "—";
              return (
                <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
                  <div className="relative">
                    <img
                      src={product.thumbnailImage || product.image || ""}
                      alt={product.title}
                      className="w-full h-80 object-cover"
                    />
                    <button
                      onClick={() => toggleFavorite(String(product.id))}
                      className="absolute top-3 right-3 bg-white rounded-full p-2 hover:scale-110 transition"
                    >
                      <HeartIcon size={20} filled={true} fillClass="fill-rose-600" strokeClass="stroke-rose-600" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.title}</h3>
                    <p className="text-rose-600 font-bold text-lg mb-4">{displayPrice}</p>
                    <Link
                      href={`/products/${product.id}`}
                      className="w-full block text-center bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 rounded-lg transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
