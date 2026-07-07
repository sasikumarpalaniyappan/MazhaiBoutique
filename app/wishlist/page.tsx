"use client";

import { useWishlist } from "@/components/context/WishlistProviderTemp";
import { useCart } from "@/components/context/CartContext";

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-6 py-32">
      <h1 className="text-4xl font-bold text-pink-600 mb-10">
        My Wishlist
      </h1>

      {wishlistItems.length === 0 ? (
        <p className="text-gray-500 text-lg">
          Your wishlist is empty.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-72 object-cover"
              />

              <div className="p-4">
                <h2 className="text-lg font-semibold">
                  {item.name}
                </h2>

                <p className="text-pink-600 font-bold text-xl mt-2">
                  {item.price}
                </p>

                {/* Move to Cart */}
                <button
                  onClick={() => {
                    addToCart({
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      image: item.image,
                      quantity: 1,
                    })

                     removeFromWishlist(item.id);
                  }}
                  className="w-full mt-4 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700"
                >
                  Move to Cart
                </button>

                {/* Remove from Wishlist */}
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="w-full mt-2 border border-red-500 text-red-500 py-2 rounded-lg hover:bg-red-50"
                >
                  Remove from Wishlist
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}