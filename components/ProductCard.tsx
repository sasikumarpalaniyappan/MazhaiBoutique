"use client";

import Link from "next/link";

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

      </div>
    </div>
  );
}