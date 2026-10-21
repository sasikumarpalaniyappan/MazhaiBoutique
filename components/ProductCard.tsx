"use client";

import { useEffect, useState } from "react";
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
  const [favoriteFeedback, setFavoriteFeedback] = useState<boolean | null>(null);
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

  useEffect(() => {
    if (favoriteFeedback === null) return;

    const timeout = window.setTimeout(() => setFavoriteFeedback(null), 1400);
    return () => window.clearTimeout(timeout);
  }, [favoriteFeedback]);

  return (
    <Link href={`/products/${id}`} className="group block">
      <div className="relative overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 ease-out motion-safe:hover:-translate-y-1 hover:shadow-xl">
        <button
          type="button"
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleFavorite(idString);
            setFavoriteFeedback(!favorite);
          }}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition duration-200 hover:scale-110 active:scale-95"
        >
          <span className={`text-xl transition-transform duration-200 ${favoriteFeedback !== null ? "scale-125 motion-safe:animate-bounce" : "scale-100"} ${favorite ? "text-rose-700" : "text-rose-500"}`}>
            {favorite ? "❤" : "♡"}
          </span>
        </button>
        {favoriteFeedback !== null && (
          <div
            role="status"
            className="product-favorite-popup absolute right-3 top-16 z-10 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-rose-800 shadow-md"
          >
            <span aria-hidden="true" className="text-sm text-rose-600">
              {favoriteFeedback ? "♥" : "♡"}
            </span>
            {favoriteFeedback ? "Added to favorites" : "Removed from favorites"}
          </div>
        )}
        
        {/* Clickable Product Image */}
        <div className="cursor-pointer">
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-80 w-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-105"
            />
          ) : (
            <div className="h-80 w-full rounded-t-xl bg-gray-100 flex items-center justify-center text-sm text-gray-500">
              No image available
            </div>
          )}
        </div>

        <div className="p-4">
          
          {/* Clickable Product Name */}
          <h3 className="text-lg font-semibold group-hover:text-rose-700 cursor-pointer">
            {name}
          </h3>

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
    </Link>
  );
}
