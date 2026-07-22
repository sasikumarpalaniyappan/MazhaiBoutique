"use client";

import Link from "next/link";
import { useFavorites } from "@/components/context/FavoritesContext";

type ProductCardProps = {
  id: number | string;
  name: string;
  price: string;
  image: string;
  originalPrice?: string;
  salePrice?: string;
};

const formatPriceLabel = (value: string) => {
  const numericValue = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(numericValue) ? `₹${numericValue.toLocaleString()}` : value;
};

export default function ProductCard({
  id,
  name,
  price,
  image,
  originalPrice,
  salePrice,
}: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const idString = String(id);
  const favorite = isFavorite(idString);
  const discountPercent =
    originalPrice && salePrice
      ? Math.round(
          ((Number(String(originalPrice).replace(/[^0-9.]/g, "")) -
            Number(String(salePrice).replace(/[^0-9.]/g, ""))) /
            Number(String(originalPrice).replace(/[^0-9.]/g, ""))) *
            100
        )
      : null;

  return (
    <div className="relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300">
      <button
        type="button"
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggleFavorite(idString);
        }}
        className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition hover:scale-105"
      >
        <span className={`text-xl ${favorite ? "text-rose-700" : "text-rose-500"}`}>
          {favorite ? "❤" : "♡"}
        </span>
      </button>
      
      {/* Clickable Product Image */}
      <Link href={`/products/${id}`}>
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-80 object-cover cursor-pointer"
          />
        ) : (
          <div className="w-full h-80 bg-gray-100 flex items-center justify-center text-sm text-gray-500 rounded-t-xl">
            No image available
          </div>
        )}
      </Link>

      <div className="p-4">
        
        {/* Clickable Product Name */}
        <Link href={`/products/${id}`}>
          <h3 className="text-lg font-semibold hover:text-rose-700 cursor-pointer">
            {name}
          </h3>
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p className="text-rose-700 font-bold text-xl">
            {formatPriceLabel(price)}
          </p>
          {originalPrice && salePrice ? (
            <>
              <span className="text-sm text-gray-400 line-through">
                {formatPriceLabel(originalPrice)}
              </span>
              <span className="rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                {discountPercent}% OFF
              </span>
            </>
          ) : null}
        </div>

      </div>
    </div>
  );
}


