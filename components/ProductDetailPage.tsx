"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/context/CartContext";

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

  useEffect(() => {
    setSelectedImage(product.images[0] || "");
    setSelectedSize(product.sizes?.[0] || "Standard");
  }, [product]);

  useEffect(() => {
    if (!added) return;

    const timer = window.setTimeout(() => setAdded(false), 1500);
    return () => window.clearTimeout(timer);
  }, [added]);

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

  return (
    <div className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[2rem] border border-rose-100 bg-[#fff8fb] p-2 shadow-[0_25px_80px_-25px_rgba(190,24,93,0.35)]">
            <img
              src={selectedImage}
              alt={product.name}
              className="h-[460px] w-full rounded-[1.5rem] object-cover"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {product.images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedImage(image)}
                className={`h-20 w-20 overflow-hidden rounded-2xl border-2 transition ${
                  selectedImage === image
                    ? "border-rose-500 shadow-md"
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
          <p className="text-sm uppercase tracking-[0.35em] text-rose-500">
            Mazhai Boutique
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-gray-900 sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 text-3xl font-bold text-rose-600">
            {product.price}
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {product.description}
          </p>

          <div className="mt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Select size
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {(product.sizes?.length ? product.sizes : ["Standard"]).map(
                (size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      selectedSize === size
                        ? "border-rose-500 bg-rose-600 text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:border-rose-300"
                    }`}
                  >
                    {size}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleAddToCart}
              className="rounded-full bg-rose-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              {added ? "Added!" : "Add to Cart"}
            </button>
            <span
              className={`text-sm font-medium ${
                added ? "text-emerald-600" : "text-transparent"
              }`}
            >
              Added to your cart
            </span>
          </div>

          <div className="mt-8 rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm leading-7 text-rose-700">
            Complimentary styling help is available for every order. Choose your size and add this piece to your wardrobe instantly.
          </div>
        </div>
      </div>
    </div>
  );
}
