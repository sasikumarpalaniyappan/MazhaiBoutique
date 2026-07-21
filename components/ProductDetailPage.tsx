"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/context/CartContext";
import { useFavorites } from "@/components/context/FavoritesContext";
import { useProducts } from "@/components/context/ProductsContext";
import ProductCard from "@/components/ProductCard";
import CartIcon from "@/components/CartIcon";
import HeartIcon from "@/components/HeartIcon";

type ProductDetailPageProps = {
  product: {
    id: string;
    name: string;
    price: string;
    description: string;
    images: string[];
    sizes?: string[];
  };
};

export default function ProductDetailPage({
  product,
}: ProductDetailPageProps) {
  const [selectedImage, setSelectedImage] = useState(
    product.images[0] || ""
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.[0] || "Standard"
  );
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { products } = useProducts();
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedImage(product.images[0] || "");
    setSelectedSize(product.sizes?.[0] || "Standard");
  }, [product]);

  useEffect(() => {
    if (!added) return;

    const timer = window.setTimeout(() => setAdded(false), 1500);
    return () => window.clearTimeout(timer);
  }, [added]);

  useEffect(() => {
    const storageKey = "mazhai-boutique-recently-viewed";

    if (typeof window === "undefined") return;

    try {
      const storedValue = window.localStorage.getItem(storageKey);
      const parsed = storedValue ? JSON.parse(storedValue) : [];
      const ids = Array.isArray(parsed) ? parsed.map(String) : [];
      const updatedIds = [product.id, ...ids.filter((id) => id !== product.id)];
      const deduped = Array.from(new Set(updatedIds)).slice(0, 8);

      window.localStorage.setItem(storageKey, JSON.stringify(deduped));
      setRecentlyViewedIds(deduped);
    } catch {
      setRecentlyViewedIds([product.id]);
    }
  }, [product.id]);

  const recentlyViewedProducts = useMemo(
    () =>
      recentlyViewedIds
        .filter((id) => id !== product.id)
        .map((id) => products.find((item) => String(item.id) === String(id)))
        .filter((item): item is typeof products[number] => Boolean(item))
        .slice(0, 4),
    [products, recentlyViewedIds, product.id]
  );

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: selectedImage,
      },
      1,
      selectedSize
    );

    setAdded(true);
  };

  const handleWishlistToggle = () => {
    toggleFavorite(product.id);
  };

  const isWishlisted = isFavorite(product.id);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-24 lg:py-32">
      <div className="grid gap-6 sm:gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3 sm:space-y-4">
          <div className="overflow-hidden rounded-xl sm:rounded-[2rem] border border-rose-100 bg-rose-50 p-2 shadow-[0_25px_80px_-25px_rgba(128,0,32,0.35)]">
            <img
              src={selectedImage}
              alt={product.name}
              className="h-64 sm:h-96 lg:h-[460px] w-full rounded-lg sm:rounded-[1.5rem] object-cover"
            />
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            {product.images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedImage(image)}
                className={`h-16 sm:h-20 w-16 sm:w-20 overflow-hidden rounded-lg sm:rounded-2xl border-2 transition ${
                  selectedImage === image
                    ? "border-rose-700 shadow-md"
                    : "border-transparent"
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} view ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-rose-600">
            Mazhai Boutique
          </p>
          <h1 className="mt-2 sm:mt-3 text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900">
            {product.name}
          </h1>
          <p className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-bold text-rose-700">
            {typeof product.price === "string" && product.price.trim().length > 0
              ? product.price.startsWith("₹")
                ? product.price
                : `₹${product.price}`
              : "₹0"}
          </p>
          <p className="mt-3 text-xs text-gray-500">Tax included. Shipping calculated at checkout.</p>

          <div className="mt-6 sm:mt-8">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Select size
            </p>
            <div className="mt-2 sm:mt-3 flex flex-wrap gap-2 sm:gap-3">
              {(product.sizes?.length ? product.sizes : ["Standard"]).map(
                (size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition ${
                      selectedSize === size
                        ? "border-rose-600 bg-rose-700 text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:border-rose-500"
                    }`}
                  >
                    {size}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-6 sm:px-7 py-2.5 sm:py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              <CartIcon size={18} />
              <span>{added ? "Added!" : "Add to Cart"}</span>
            </button>

            <button
              type="button"
              onClick={handleWishlistToggle}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-6 sm:px-7 py-2.5 sm:py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              <span>{isWishlisted ? "Wishlisted" : "Wishlist"}</span>
              <HeartIcon
                size={18}
                filled={isWishlisted}
                strokeClass="stroke-white"
                fillClass="fill-white"
              />
            </button>

            <span
              className={`text-xs sm:text-sm font-medium ${
                added ? "text-emerald-600" : "text-transparent"
              }`}
            >
              Added to your cart
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                <CartIcon size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">Worldwide shipping</p>
                <p className="text-xs text-gray-500">Available</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M4 11V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v4" />
                  <path d="M5 11h14" />
                  <path d="M9 11v10" />
                  <path d="M15 11v10" />
                  <path d="M9 21h6" />
                  <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">Trusted product</p>
                <p className="text-xs text-gray-500">Quality assured</p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <details className="rounded-2xl border border-rose-100 bg-white shadow-sm">
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-rose-700">
                Description
                <span className="text-2xl leading-none">&gt;</span>
              </summary>
              <div className="border-t border-rose-100 px-5 py-4 text-sm sm:text-base text-gray-600">
                {product.description}
              </div>
            </details>

            <details className="rounded-2xl border border-rose-100 bg-white shadow-sm">
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-rose-700">
                Shipping
                <span className="text-2xl leading-none">&gt;</span>
              </summary>
              <div className="border-t border-rose-100 px-5 py-4 text-sm sm:text-base text-gray-600">
                Free shipping within India on every order. Standard delivery arrives in 3-7 business days, with express options available at checkout.
              </div>
            </details>

            <details className="rounded-2xl border border-rose-100 bg-white shadow-sm">
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-rose-700">
                Ask a question
                <span className="text-2xl leading-none">&gt;</span>
              </summary>
              <div className="border-t border-rose-100 px-5 py-4 text-sm sm:text-base text-gray-600">
                Need help with fit, fabric, or delivery? Email us at <a href="mailto:info@mazhaiboutique.com" className="font-semibold text-rose-700 underline">info@mazhaiboutique.com</a> and we’ll respond within one business day.
              </div>
            </details>
          </div>

        </div>
      </div>

      {recentlyViewedProducts.length > 0 ? (
        <section className="mt-12">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-rose-600 font-semibold">
                Recently viewed
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">
                Keep browsing
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {recentlyViewedProducts.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                name={item.name || item.title}
                price={item.price || item.originalPrice}
                image={item.thumbnailImage || item.image || ""}
                originalPrice={item.originalPrice}
                salePrice={item.salePrice}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}


