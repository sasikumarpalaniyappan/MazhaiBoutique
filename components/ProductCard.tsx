"use client";

import Link from "next/link";
import { useCart } from "@/components/context/CartContext";
import { useWishlist } from "@/components/context/WishlistProviderTemp";

type ProductCardProps = {
  id: number;
  name: string;
  price: string;
  image: string;
};

export default function ProductCard({
  id,
  name,
  price,
  image,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300">
      
      {/* Clickable Product Image */}
      <Link href={`/products/${id}`}>
        <img
          src={image}
          alt={name}
          className="w-full h-80 object-cover cursor-pointer"
        />
      </Link>

      <div className="p-4">
        
        {/* Clickable Product Name */}
        <Link href={`/products/${id}`}>
          <h3 className="text-lg font-semibold hover:text-pink-600 cursor-pointer">
            {name}
          </h3>
        </Link>

        {/* Product Price */}
        <p className="text-pink-600 font-bold text-xl mt-2">
          {price}
        </p>

        {/* Add to Cart Button */}
        <button
          onClick={() =>
            addToCart({
              id: String(id),
              name,
              price,
              image,
              quantity: 1,
            })
          }
          className="mt-4 w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700"
        >
          Add to Cart
        </button>

        {/* Wishlist Button */}
        <button
          onClick={() =>
            addToWishlist({
              id: String(id),
              name,
              price,
              image,
            })
          }
          className="mt-2 w-full border border-pink-600 text-pink-600 py-2 rounded-lg hover:bg-pink-50"
        >
          ❤️ Add to Wishlist
        </button>

      </div>
    </div>
  );
}