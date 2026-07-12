"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  CatalogProduct,
  fallbackProducts,
  mergeProductsWithFallback,
  STORAGE_EVENT,
  STORAGE_KEY,
} from "@/components/context/ProductsContext";

type ProductSize = "S" | "M" | "L" | "XL" | "Standard";

type ProductCategory =
  | "Sarees"
  | "Kurtas"
  | "Dresses"
  | "Lehengas"
  | "Dupattas"
  | "Jewelry";

type BoutiqueProduct = Omit<CatalogProduct, "category"> & {
  category: ProductCategory;
};

type ProductFormState = {
  title: string;
  description: string;
  category: ProductCategory;
  originalPrice: string;
  salePrice: string;
  sizes: ProductSize[];
};

type ModalMode = "add" | "edit" | "view" | null;

const categories: ProductCategory[] = [
  "Sarees",
  "Kurtas",
  "Dresses",
  "Lehengas",
  "Dupattas",
  "Jewelry",
];
const sizeOptions: ProductSize[] = ["Standard", "S", "M", "L", "XL"];

const emptyFormState = (): ProductFormState => ({
  title: "",
  description: "",
  category: "Sarees",
  originalPrice: "",
  salePrice: "",
  sizes: [],
});

const toBoutiqueProduct = (product: CatalogProduct): BoutiqueProduct => ({
  ...product,
  category: (product.category as ProductCategory) || "Sarees",
});

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });

const convertFilesToBase64 = async (files: FileList | null) => {
  if (!files || files.length === 0) return [];
  return Promise.all(Array.from(files).slice(0, 4).map((file) => fileToBase64(file)));
};

const formatPrice = (value: string | undefined) => {
  if (!value) return "—";
  return `₹${Number(value).toLocaleString()}`;
};

export default function BoutiqueAdminPanel() {
  const [products, setProducts] = useState<BoutiqueProduct[]>([]);
  const [formData, setFormData] = useState<ProductFormState>(emptyFormState());
  const [thumbnailImage, setThumbnailImage] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<BoutiqueProduct | null>(null);
  const [viewingProduct, setViewingProduct] = useState<BoutiqueProduct | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setProducts(mergeProductsWithFallback(parsed).map(toBoutiqueProduct));
      } else {
        setProducts(fallbackProducts.map(toBoutiqueProduct));
      }
    } catch {
      setProducts(fallbackProducts.map(toBoutiqueProduct));
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }, [products]);

  useEffect(() => {
    if (!notification) return;
    const timer = window.setTimeout(() => setNotification(""), 2800);
    return () => window.clearTimeout(timer);
  }, [notification]);

  const discountPercent = useMemo(() => {
    const original = Number(formData.originalPrice);
    const sale = Number(formData.salePrice);

    if (!formData.salePrice || !Number.isFinite(original) || !Number.isFinite(sale)) {
      return null;
    }

    if (sale >= original) return null;

    return Math.round(((original - sale) / original) * 100);
  }, [formData.originalPrice, formData.salePrice]);

  const resetForm = () => {
    setFormData(emptyFormState());
    setThumbnailImage("");
    setGalleryImages([]);
    setEditingProduct(null);
    setError("");
  };

  const openAddModal = () => {
    resetForm();
    setModalMode("add");
  };

  const openEditModal = (product: BoutiqueProduct) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      category: product.category,
      originalPrice: product.originalPrice,
      salePrice: product.salePrice || "",
      sizes: product.sizes as ProductSize[],
    });
    setThumbnailImage(product.thumbnailImage);
    setGalleryImages(product.galleryImages);
    setModalMode("edit");
    setError("");
  };

  const openViewModal = (product: BoutiqueProduct) => {
    setViewingProduct(product);
    setModalMode("view");
  };

  const closeModal = () => {
    setModalMode(null);
    setViewingProduct(null);
    resetForm();
  };

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
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setThumbnailImage(base64);
  };

  const handleGalleryUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const images = await convertFilesToBase64(e.target.files);
    setGalleryImages(images);
  };

  const handleFolderUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((file) => file.type.startsWith("image/"));

    if (files.length === 0) {
      setError("No image files were found in that folder.");
      return;
    }

    try {
      const importedProducts = await Promise.all(
        files.map(async (file, index) => {
          const base64 = await fileToBase64(file);
          return {
            id: `${Date.now()}-${index}`,
            title: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ").trim() || `Imported Product ${index + 1}`,
            description: "Imported from a folder upload.",
            category: "Sarees" as ProductCategory,
            originalPrice: "1999",
            sizes: ["Standard"] as ProductSize[],
            thumbnailImage: base64,
            galleryImages: [base64],
          } satisfies BoutiqueProduct;
        })
      );

      setProducts((prev) => [...importedProducts, ...prev]);
      setNotification(`Imported ${importedProducts.length} products from your folder.`);
      setError("");
    } catch {
      setError("Some files could not be imported. Please try again.");
    } finally {
      e.target.value = "";
    }
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

    if (formData.salePrice && Number(formData.salePrice) >= Number(formData.originalPrice)) {
      setError("Sale price must be lower than the original price.");
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

    const productPayload: BoutiqueProduct = {
      id: editingProduct?.id || Date.now().toString(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      originalPrice: formData.originalPrice,
      salePrice: formData.salePrice || undefined,
      sizes: formData.sizes,
      thumbnailImage,
      galleryImages,
    };

    setProducts((prev) => {
      if (editingProduct) {
        return prev.map((item) => (item.id === editingProduct.id ? productPayload : item));
      }
      return [productPayload, ...prev];
    });

    setNotification(editingProduct ? "Product updated successfully." : "Product added successfully.");
    closeModal();
  };

  const handleDelete = (productId: string) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    const confirmDelete = window.confirm(`Delete ${product.title}?`);
    if (!confirmDelete) return;

    setProducts((prev) => prev.filter((item) => item.id !== productId));
    setNotification("Product deleted successfully.");
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
      <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-rose-100 bg-white/90 p-6 shadow-[0_25px_80px_-30px_rgba(190,24,93,0.35)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-rose-500">Boutique Control Center</p>
          <h1 className="mt-2 text-4xl font-semibold text-gray-900">Manage Products</h1>
          <p className="mt-2 text-gray-600">Add, edit, review, and remove your finest collection pieces in one place.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="cursor-pointer rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100">
            📁 Upload Folder
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFolderUpload}
            />
          </label>
          <button
            type="button"
            onClick={openAddModal}
            className="rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            + Add New Product
          </button>
        </div>
      </div>

      {notification ? (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notification}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[2rem] border border-rose-100 bg-white shadow-[0_25px_80px_-30px_rgba(190,24,93,0.35)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-rose-50/70 text-gray-700">
              <tr>
                <th className="px-4 py-4 font-semibold">Thumbnail</th>
                <th className="px-4 py-4 font-semibold">Title</th>
                <th className="px-4 py-4 font-semibold">Category</th>
                <th className="px-4 py-4 font-semibold">Original Price</th>
                <th className="px-4 py-4 font-semibold">Sale Price</th>
                <th className="px-4 py-4 font-semibold">Discount %</th>
                <th className="px-4 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    No products yet. Add your first collection piece to get started.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const discount = product.salePrice
                    ? Math.round(((Number(product.originalPrice) - Number(product.salePrice)) / Number(product.originalPrice)) * 100)
                    : null;

                  return (
                    <tr key={product.id} className="border-t border-rose-100/70 text-gray-700">
                      <td className="px-4 py-4">
                        <img src={product.thumbnailImage} alt={product.title} className="h-16 w-16 rounded-2xl object-cover" />
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-900">{product.title}</td>
                      <td className="px-4 py-4">{product.category}</td>
                      <td className="px-4 py-4">{formatPrice(product.originalPrice)}</td>
                      <td className="px-4 py-4">{formatPrice(product.salePrice)}</td>
                      <td className="px-4 py-4">
                        {discount !== null ? <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white">{discount}% OFF</span> : "—"}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => openViewModal(product)} className="rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:border-rose-300 hover:text-rose-600">
                            View
                          </button>
                          <button type="button" onClick={() => openEditModal(product)} className="rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:border-rose-300 hover:text-rose-600">
                            Edit
                          </button>
                          <button type="button" onClick={() => handleDelete(product.id)} className="rounded-full bg-rose-600 px-3 py-1.5 text-sm text-white hover:bg-rose-700">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(modalMode === "add" || modalMode === "edit") && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-rose-100 bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-rose-500">{editingProduct ? "Edit Product" : "Add Product"}</p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">{editingProduct ? `Editing ${editingProduct.title}` : "Create a New Collection Piece"}</h2>
              </div>
              <button type="button" onClick={closeModal} className="rounded-full border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:border-rose-300 hover:text-rose-600">
                Close
              </button>
            </div>

            {error ? <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}

            <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Title</label>
                  <input name="title" value={formData.title} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3" placeholder="Silk Saree - Maroon" />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={5} className="w-full rounded-xl border border-gray-200 px-4 py-3" placeholder="Crafted for special occasions with graceful detailing." />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3">
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Original Price (₹)</label>
                    <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Sale Price (₹)</label>
                    <input type="number" name="salePrice" value={formData.salePrice} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3" />
                  </div>
                </div>

                {discountPercent !== null ? (
                  <div className="inline-flex w-fit rounded-full bg-rose-600 px-3 py-1 text-sm font-semibold text-white">{discountPercent}% OFF</div>
                ) : null}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Available Sizes</label>
                  <div className="flex flex-wrap gap-3">
                    {sizeOptions.map((size) => (
                      <label key={size} className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-sm text-gray-700">
                        <input type="checkbox" checked={formData.sizes.includes(size)} onChange={() => handleSizeChange(size)} className="accent-rose-600" />
                        {size}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Thumbnail Image</label>
                  <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="w-full rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm" />
                  {thumbnailImage ? (
                    <img src={thumbnailImage} alt="Thumbnail preview" className="mt-3 h-40 w-full rounded-2xl object-cover" />
                  ) : (
                    <div className="mt-3 flex h-40 items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-rose-50 text-sm text-gray-500">No thumbnail selected</div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Gallery Images (up to 4)</label>
                  <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="w-full rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm" />
                  {galleryImages.length > 0 ? (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {galleryImages.map((image, index) => (
                        <img key={`${image}-${index}`} src={image} alt={`Gallery preview ${index + 1}`} className="h-24 w-full rounded-2xl object-cover" />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 flex h-24 items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-rose-50 text-sm text-gray-500">No gallery images selected</div>
                  )}
                </div>

                {editingProduct ? (
                  <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4 text-sm text-gray-600">
                    Existing image previews are shown above. Upload new files to replace them.
                  </div>
                ) : null}
              </div>

              <div className="lg:col-span-2 flex flex-wrap items-center justify-end gap-3">
                <button type="button" onClick={closeModal} className="rounded-full border border-gray-200 px-5 py-2.5 text-sm text-gray-700 hover:border-rose-300 hover:text-rose-600">
                  Cancel
                </button>
                <button type="submit" className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700">
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalMode === "view" && viewingProduct ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="w-full max-w-3xl rounded-[2rem] border border-rose-100 bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-rose-500">Product Preview</p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">{viewingProduct.title}</h2>
              </div>
              <button type="button" onClick={closeModal} className="rounded-full border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:border-rose-300 hover:text-rose-600">Close</button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <img src={viewingProduct.thumbnailImage} alt={viewingProduct.title} className="h-72 w-full rounded-[1.5rem] object-cover" />
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-rose-500">{viewingProduct.category}</p>
                <p className="mt-3 text-lg leading-8 text-gray-600">{viewingProduct.description}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700">Original {formatPrice(viewingProduct.originalPrice)}</span>
                  {viewingProduct.salePrice ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">Sale {formatPrice(viewingProduct.salePrice)}</span> : null}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {viewingProduct.sizes.map((size) => (
                    <span key={size} className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-700">{size}</span>
                  ))}
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {viewingProduct.galleryImages.map((image, index) => (
                    <img key={`${image}-${index}`} src={image} alt={`${viewingProduct.title} ${index + 1}`} className="h-24 w-full rounded-2xl object-cover" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
