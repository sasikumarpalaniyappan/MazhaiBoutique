"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type ProductSize = "S" | "M" | "L" | "XL" | "Standard";

type ProductCategory =
  | "Sarees"
  | "Kurtas"
  | "Dresses"
  | "Lehengas"
  | "Dupattas"
  | "Jewelry";

type BoutiqueProduct = {
  id: string;
  title: string;
  originalPrice: string;
  discountedPrice?: string;
  category: ProductCategory;
  thumbnailImage: string;
  galleryImages: string[];
  description: string;
  sizes: ProductSize[];
};

type ProductFormState = {
  title: string;
  originalPrice: string;
  discountedPrice: string;
  category: ProductCategory;
  description: string;
  sizes: ProductSize[];
};

const STORAGE_KEY = "mazhai-boutique-products";
const categories: ProductCategory[] = [
  "Sarees",
  "Kurtas",
  "Dresses",
  "Lehengas",
  "Dupattas",
  "Jewelry",
];
const sizeOptions: ProductSize[] = ["S", "M", "L", "XL", "Standard"];

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });

const convertFilesToBase64 = async (files: FileList | null) => {
  if (!files || files.length === 0) return [];
  const fileArray = Array.from(files).slice(0, 4);
  return Promise.all(fileArray.map((file) => fileToBase64(file)));
};

export default function AdminProductUpload() {
  const [products, setProducts] = useState<BoutiqueProduct[]>([]);
  const [formData, setFormData] = useState<ProductFormState>({
    title: "",
    originalPrice: "",
    discountedPrice: "",
    category: "Sarees",
    description: "",
    sizes: [],
  });
  const [thumbnailImage, setThumbnailImage] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem(STORAGE_KEY);
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }
    } catch {
      setProducts([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    if (!success) return;
    const timeoutId = window.setTimeout(() => setSuccess(""), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [success]);

  const discountPercent = useMemo(() => {
    const original = Number(formData.originalPrice);
    const discounted = Number(formData.discountedPrice);

    if (!formData.discountedPrice || !Number.isFinite(original) || !Number.isFinite(discounted)) {
      return null;
    }

    if (discounted >= original) return null;

    return Math.round(((original - discounted) / original) * 100);
  }, [formData.originalPrice, formData.discountedPrice]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSizeChange = (size: ProductSize) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((item) => item !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleThumbnailUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const base64 = await fileToBase64(e.target.files?.[0] as File);
    setThumbnailImage(base64);
  };

  const handleGalleryUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const images = await convertFilesToBase64(e.target.files);
    setGalleryImages(images);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Please enter a product title.");
      return;
    }

    if (!formData.originalPrice || Number(formData.originalPrice) <= 0) {
      setError("Please enter a valid original price.");
      return;
    }

    if (formData.discountedPrice && Number(formData.discountedPrice) >= Number(formData.originalPrice)) {
      setError("Discounted price must be lower than the original price.");
      return;
    }

    if (!thumbnailImage) {
      setError("Please upload a thumbnail image.");
      return;
    }

    if (galleryImages.length === 0) {
      setError("Please upload at least one gallery image.");
      return;
    }

    const newProduct: BoutiqueProduct = {
      id: Date.now().toString(),
      title: formData.title.trim(),
      originalPrice: formData.originalPrice,
      discountedPrice: formData.discountedPrice || undefined,
      category: formData.category,
      thumbnailImage,
      galleryImages,
      description: formData.description.trim(),
      sizes: formData.sizes,
    };

    setProducts((prev) => [newProduct, ...prev]);
    setFormData({
      title: "",
      originalPrice: "",
      discountedPrice: "",
      category: "Sarees",
      description: "",
      sizes: [],
    });
    setThumbnailImage("");
    setGalleryImages([]);
    setError("");
    setSuccess("Product added successfully to the boutique catalog.");
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
      <div className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-rose-500">Admin Dashboard</p>
        <h1 className="mt-2 text-4xl font-semibold text-gray-900 sm:text-5xl">
          Add a New Product
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          Curate elegant new arrivals with polished imagery, price details, and size availability.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-rose-100 bg-white p-6 shadow-[0_25px_80px_-30px_rgba(190,24,93,0.35)] sm:p-8"
        >
          <div className="grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Product Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Silk Saree - Maroon"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none ring-0 transition focus:border-rose-400"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Original Price (₹)</label>
                <input
                  name="originalPrice"
                  type="number"
                  min="0"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-rose-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Discounted Price (₹)</label>
                <input
                  name="discountedPrice"
                  type="number"
                  min="0"
                  value={formData.discountedPrice}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-rose-400"
                />
              </div>
            </div>

            {discountPercent !== null && (
              <div className="inline-flex w-fit items-center rounded-full bg-rose-600 px-3 py-1 text-sm font-semibold text-white">
                {discountPercent}% OFF
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-rose-400"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Thumbnail Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="w-full rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Gallery Images (up to 4)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  className="w-full rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                placeholder="Describe the craftsmanship, fabric, and occasion for this piece."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-rose-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Sizes Available</label>
              <div className="mt-2 flex flex-wrap gap-3">
                {sizeOptions.map((size) => (
                  <label key={size} className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.sizes.includes(size)}
                      onChange={() => handleSizeChange(size)}
                      className="accent-rose-600"
                    />
                    {size}
                  </label>
                ))}
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            ) : null}

            <button
              type="submit"
              className="rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Publish Product
            </button>
          </div>
        </form>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-rose-100 bg-white p-6 shadow-[0_25px_80px_-30px_rgba(190,24,93,0.35)]">
            <h2 className="text-xl font-semibold text-gray-900">Image Preview</h2>
            <div className="mt-4 grid gap-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700">Thumbnail</p>
                {thumbnailImage ? (
                  <img src={thumbnailImage} alt="Thumbnail preview" className="h-48 w-full rounded-2xl object-cover" />
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-rose-50 text-sm text-gray-500">
                    Thumbnail preview will appear here.
                  </div>
                )}
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700">Gallery</p>
                {galleryImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {galleryImages.map((image, index) => (
                      <img key={`${image}-${index}`} src={image} alt={`Gallery preview ${index + 1}`} className="h-28 w-full rounded-2xl object-cover" />
                    ))}
                  </div>
                ) : (
                  <div className="flex h-28 items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-rose-50 text-sm text-gray-500">
                    Gallery preview will appear here.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-rose-100 bg-rose-50/70 p-6 shadow-[0_25px_80px_-30px_rgba(190,24,93,0.35)]">
            <h2 className="text-xl font-semibold text-gray-900">Saved Products</h2>
            <div className="mt-4 space-y-3">
              {products.length === 0 ? (
                <p className="text-sm text-gray-600">No products saved yet. Your latest uploads will appear here.</p>
              ) : (
                products.slice(0, 4).map((product) => (
                  <div key={product.id} className="rounded-2xl border border-rose-100 bg-white p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{product.title}</p>
                        <p className="text-sm text-gray-500">{product.category}</p>
                      </div>
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                        {product.sizes.join(", ") || "Standard"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
