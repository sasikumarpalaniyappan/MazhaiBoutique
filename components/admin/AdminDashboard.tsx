"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient, supabaseUrl } from "@/lib/supabaseClient";

type EditableProduct = {
  id?: string;
  title: string;
  description?: string;
  category?: string;
  originalPrice?: string;
  salePrice?: string;
  thumbnailImage?: string;
  image?: string;
  galleryImages?: string[];
  availableSizes?: string[];
};

const isBlobUrl = (value?: string) =>
  typeof value === "string" && value.startsWith("blob:");

const isValidImageUrl = (value?: unknown) => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed || isBlobUrl(trimmed)) return false;
  return /^https?:\/\//i.test(trimmed) || /^data:image\//i.test(trimmed);
};

const normalizeProduct = (row: any): EditableProduct => {
  const rawImageValue = row.thumbnail_image ?? row.image ?? "";
  const imageValue = isValidImageUrl(rawImageValue) ? String(rawImageValue) : "";

  return {
    id: String(row.id),
    title: String(row.title ?? row.name ?? "Untitled Product"),
    description: String(row.description ?? ""),
    category: String(row.category ?? "Sarees"),
    originalPrice: String(row.original_price ?? row.price ?? "0"),
    salePrice: row.sale_price != null ? String(row.sale_price) : "",
    thumbnailImage: imageValue,
    image: imageValue,
    galleryImages: Array.isArray(row.gallery_images) ? row.gallery_images : [],
    availableSizes: Array.isArray(row.available_sizes) ? row.available_sizes : [],
  };
};

const sanitizeFileName = (value?: string) => {
  if (!value) return "file";
  return value
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9._-]/g, "_");
};

const getSupabaseErrorMessage = (error: unknown) => {
  if (!error) return "Unknown Supabase error";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;

  const err = error as Record<string, any>;
  return (
    err.message || err.error_description || err.details || err.hint || JSON.stringify(error, Object.getOwnPropertyNames(error)) || String(error)
  );
};

const computeDiscountPercent = (originalPrice?: string, salePrice?: string) => {
  if (!originalPrice || !salePrice) return "-";
  const original = Number(String(originalPrice).replace(/[^0-9.]/g, ""));
  const sale = Number(String(salePrice).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(original) || !Number.isFinite(sale) || original <= 0 || sale >= original) {
    return "-";
  }
  return `${Math.round(((original - sale) / original) * 100)}%`;
};

export default function AdminDashboard() {
  const [products, setProducts] = useState<EditableProduct[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editing, setEditing] = useState<EditableProduct | null>(null);
  const editingRef = React.useRef<EditableProduct | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState<string>("");
  const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<string[]>([]);
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);

  useEffect(() => {
    editingRef.current = editing;
  }, [editing]);

  useEffect(() => {
    if (editing) {
      setManualImageUrl(editing.image ?? editing.thumbnailImage ?? "");
    } else {
      setManualImageUrl("");
    }
  }, [editing]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const loadProducts = async () => {
    setError(null);
    setIsLoaded(false);
    try {
      const { data, error: fetchError } = await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw new Error(fetchError.message);

      const loaded = (data || []).map(normalizeProduct);
      setProducts(loaded);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError("Unable to load products from Supabase.");
      setProducts([]);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const router = useRouter();

  const handleView = (id: string) => {
    router.push(`/products/${id}`);
  };

  const resetUploadState = () => {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
    setManualImageUrl("");
    setSelectedThumbnailFile(null);
  };

  const handleEdit = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    resetUploadState();
    setGalleryPreviewUrls([]);
    setEditing({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      originalPrice: p.originalPrice,
      salePrice: p.salePrice,
      thumbnailImage: p.thumbnailImage,
      image: p.image,
      galleryImages: p.galleryImages ?? [],
      availableSizes: p.availableSizes ?? [],
    });
  };

  const handleGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editing) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const filesToProcess = Array.from(files).slice(0, 4);
      const uploadedUrls: string[] = [];

      for (const file of filesToProcess) {
        const filename = `${editing.id || 'draft'}_gallery_${Date.now()}_${Math.random().toString(36).substring(7)}_${sanitizeFileName(file.name)}`;
        const filePath = `product_gallery/${filename}`;

        const { error: uploadError } = await supabaseClient.storage
          .from("product-images")
          .upload(filePath, file, { contentType: file.type || undefined });

        if (uploadError) throw uploadError;

        const { data } = supabaseClient.storage.from("product-images").getPublicUrl(filePath);
        if (!data?.publicUrl) throw new Error("Failed to generate public URL for gallery image");
        uploadedUrls.push(data.publicUrl);
      }

      if (uploadedUrls.length > 0) {
        setEditing((prev) => {
          if (!prev) return prev;
          const updated = { ...prev, galleryImages: [...(prev.galleryImages || []), ...uploadedUrls].slice(0, 4) };
          return updated;
        });
      }

      e.target.value = "";
    } catch (error: any) {
      const message = getSupabaseErrorMessage(error);
      console.error("Gallery image upload failed:", message, error);
      alert(`Gallery image upload failed: ${message}`);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editing) return;
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const previewUrl = URL.createObjectURL(file);
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }

      setLocalPreviewUrl(previewUrl);
      setManualImageUrl(previewUrl);
      setSelectedThumbnailFile(file);
      setEditing((prev) => (prev ? { ...prev, image: previewUrl } : prev));
    } catch (error: any) {
      const message = getSupabaseErrorMessage(error);
      console.error("Image preview setup failed:", message, error);
      alert(`Image preview setup failed: ${message}`);
    }
  };

  const uploadThumbnailForProduct = async (productId: string, file: File) => {
    const filename = `${productId}_${Date.now()}_${sanitizeFileName(file.name)}`;
    const filePath = `product_thumbnails/${filename}`;

    const { error: uploadError } = await supabaseClient.storage
      .from("product-images")
      .upload(filePath, file, { contentType: file.type || undefined });

    if (uploadError) throw uploadError;

    const { data } = supabaseClient.storage.from("product-images").getPublicUrl(filePath);
    if (!data?.publicUrl) throw new Error("Failed to generate public URL for thumbnail image");

    return data.publicUrl;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const { error } = await supabaseClient
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await loadProducts();
      if (editing?.id === id) {
        setEditing(null);
      }
    } catch (e) {
      console.error(e);
      alert("Delete failed: " + String(e));
    }
  };

  const handleSave = async () => {
    if (!editing) return;

    setSaving(true);

    try {
      let imageUrl = editing.thumbnailImage ?? editing.image ?? "";
      let currentId = editing.id;

      if (selectedThumbnailFile) {
        if (!currentId) {
          const draftPayload: Record<string, any> = {
            name: editing.title,
            title: editing.title,
            description: editing.description ?? "",
            category: editing.category ?? "",
            price: editing.originalPrice ?? "0",
            original_price: editing.originalPrice ?? "0",
            thumbnail_image: "",
            image: "",
            gallery_images: editing.galleryImages ?? [],
            available_sizes: editing.availableSizes ?? [],
          };

          if (typeof editing.salePrice !== "undefined" && editing.salePrice !== "") {
            draftPayload.sale_price = editing.salePrice;
          }

          const { data, error } = await supabaseClient
            .from("products")
            .insert([draftPayload])
            .select()
            .single();

          if (error) throw error;
          if (!data?.id) throw new Error("Failed to create draft product");

          currentId = data.id;
        }

        if (!currentId) {
          throw new Error("Could not determine product id for thumbnail upload");
        }

        imageUrl = await uploadThumbnailForProduct(currentId, selectedThumbnailFile);
      }

      const payload: Record<string, any> = {
        name: editing.title,
        title: editing.title,
        description: editing.description ?? "",
        category: editing.category ?? "",
        price: editing.originalPrice ?? "0",
        original_price: editing.originalPrice ?? "0",
        thumbnail_image: imageUrl,
        image: imageUrl || editing.image || "",
        gallery_images: editing.galleryImages ?? [],
        available_sizes: editing.availableSizes ?? [],
      };

      if (typeof editing.salePrice !== "undefined" && editing.salePrice !== "") {
        payload.sale_price = editing.salePrice;
      }

      if (!currentId) {
        const { error } = await supabaseClient
          .from("products")
          .insert([payload]);
        if (error) throw error;
      } else {
        const { error } = await supabaseClient
          .from("products")
          .update(payload)
          .eq("id", currentId);
        if (error) throw error;
      }

      await loadProducts();
      resetUploadState();
      setGalleryPreviewUrls([]);
      setEditing(null);
    } catch (e) {
      const message = getSupabaseErrorMessage(e);
      console.error("Save failed:", e, message);
      setError(message);
      alert("Save failed: " + message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddProduct = () => {
    resetUploadState();
    setGalleryPreviewUrls([]);
    setEditing({
      title: "New Product",
      description: "",
      category: "Sarees",
      originalPrice: "0",
      salePrice: "",
      thumbnailImage: "",
      image: "",
      galleryImages: [],
      availableSizes: [],
    });
  };

  const rows = useMemo(() => products || [], [products]);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Manage Products</h2>
          <p className="text-xs sm:text-sm text-gray-500">Add, edit, review, and remove your collection pieces.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button onClick={() => router.push("/admin/orders")} className="px-3 sm:px-4 py-2 rounded border border-rose-300 bg-white text-rose-700 text-sm">Order Details</button>
          <button onClick={handleAddProduct} className="px-3 sm:px-4 py-2 rounded bg-rose-600 text-white text-sm">+ Add New Product</button>
        </div>
      </div>

      <div className="bg-white shadow rounded overflow-hidden">
        {/* Desktop Table - Hidden on mobile */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-rose-50 text-sm text-gray-600">
              <tr>
                <th className="p-4">Thumbnail</th>
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Original Price</th>
                <th className="p-4">Sale Price</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!isLoaded && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">Loading...</td>
                </tr>
              )}
              {isLoaded && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">No products found.</td>
                </tr>
              )}
              {rows.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-4 w-24">
                    {(p.thumbnailImage && isValidImageUrl(p.thumbnailImage)) || (p.image && isValidImageUrl(p.image)) ? (
                      <img src={p.thumbnailImage || p.image} alt={p.title} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-400">No image</div>
                    )}
                  </td>
                  <td className="p-4">{p.title}</td>
                  <td className="p-4">{p.category}</td>
                  <td className="p-4">{p.originalPrice}</td>
                  <td className="p-4">{p.salePrice ?? "-"}</td>
                  <td className="p-4">{computeDiscountPercent(p.originalPrice, p.salePrice)}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleView(String(p.id))} className="px-3 py-1 border rounded text-sm">View</button>
                      <button onClick={() => handleEdit(String(p.id))} className="px-3 py-1 border rounded text-sm">Edit</button>
                      <button onClick={() => handleDelete(String(p.id))} className="px-3 py-1 bg-rose-500 text-white rounded text-sm">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards - Hidden on desktop */}
        <div className="md:hidden">
          {!isLoaded && (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          )}
          {isLoaded && rows.length === 0 && (
            <div className="p-6 text-center text-gray-500">No products found.</div>
          )}
          <div className="space-y-3 p-4">
            {rows.map((p) => (
              <div key={p.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    {(p.thumbnailImage && isValidImageUrl(p.thumbnailImage)) || (p.image && isValidImageUrl(p.image)) ? (
                      <img src={p.thumbnailImage || p.image} alt={p.title} className="w-16 h-16 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">No image</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{p.title}</h3>
                    <p className="text-xs text-gray-500">{p.category}</p>
                    <div className="mt-2 space-y-1 text-xs">
                      <p><span className="text-gray-600">Original:</span> ₹{p.originalPrice}</p>
                      <p><span className="text-gray-600">Sale:</span> {p.salePrice ?? "-"}</p>
                      {computeDiscountPercent(p.originalPrice, p.salePrice) !== "-" && (
                        <p><span className="text-gray-600">Discount:</span> {computeDiscountPercent(p.originalPrice, p.salePrice)}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <button onClick={() => handleView(String(p.id))} className="flex-1 px-2 py-1 border rounded text-xs hover:bg-gray-50">View</button>
                  <button onClick={() => handleEdit(String(p.id))} className="flex-1 px-2 py-1 border rounded text-xs hover:bg-gray-50">Edit</button>
                  <button onClick={() => handleDelete(String(p.id))} className="flex-1 px-2 py-1 bg-rose-500 text-white rounded text-xs hover:bg-rose-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl p-4 sm:p-6 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6 pb-4 border-b gap-2">
              <div className="min-w-0">
                <p className="text-xs text-rose-600 font-semibold tracking-widest">EDIT PRODUCT</p>
                <h3 className="text-lg sm:text-xl font-semibold mt-1 truncate">Editing {editing.title}</h3>
              </div>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600 text-xl flex-shrink-0">Close</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 font-semibold mb-1">Title</label>
                  <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full border border-gray-200 rounded px-3 py-2 text-sm" />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 font-semibold mb-1">Description</label>
                  <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full border border-gray-200 rounded px-3 py-2 text-sm" />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 font-semibold mb-1">Category</label>
                  <input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full border border-gray-200 rounded px-3 py-2 text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-600 font-semibold mb-1">Original Price (₹)</label>
                    <input value={editing.originalPrice} onChange={(e) => setEditing({ ...editing, originalPrice: e.target.value })} className="w-full border border-gray-200 rounded px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-600 font-semibold mb-1">Sale Price (₹)</label>
                    <input value={editing.salePrice} onChange={(e) => setEditing({ ...editing, salePrice: e.target.value })} className="w-full border border-gray-200 rounded px-3 py-2 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 font-semibold mb-2">Available Sizes</label>
                  <div className="space-y-2">
                    {["Standard", "S", "M", "L", "XL"].map((size) => (
                      <label key={size} className="flex items-center text-xs sm:text-sm">
                        <input
                          type="checkbox"
                          checked={(editing.availableSizes || []).includes(size)}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...(editing.availableSizes || []), size]
                              : (editing.availableSizes || []).filter(s => s !== size);
                            setEditing({ ...editing, availableSizes: updated });
                          }}
                          className="mr-2 w-4 h-4 rounded"
                        />
                        {size}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 font-semibold mb-2">Thumbnail Image</label>
                  <div className="w-full h-24 sm:h-32 bg-gray-100 rounded flex items-center justify-center mb-2 overflow-hidden">
                    {localPreviewUrl ? (
                      <img src={localPreviewUrl} alt="thumb preview" className="w-full h-full object-cover" />
                    ) : (editing.thumbnailImage || editing.image) ? (
                      <img src={editing.thumbnailImage || editing.image} alt="thumb" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-400">Choose File to Select</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="w-full text-xs sm:text-sm file:mr-2 file:py-1 file:px-2 sm:file:px-3 file:rounded file:border-0 file:text-xs file:bg-rose-50 file:text-rose-700"
                    onChange={handleFileChange}
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 font-semibold mb-2">Gallery Images (up to 4)</label>
                  <div className="space-y-2 mb-2">
                    {[0, 1, 2, 3].map((idx) => (
                      <div key={idx} className="w-full h-16 sm:h-20 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                        {editing.galleryImages?.[idx] ? (
                          <img src={editing.galleryImages[idx]} alt={`gallery-${idx}`} className="w-full h-full object-cover rounded" />
                        ) : (
                          `Image ${idx + 1}`
                        )}
                      </div>
                    ))}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryFileChange}
                    className="w-full text-xs sm:text-sm file:mr-2 file:py-1 file:px-2 sm:file:px-3 file:rounded file:border-0 file:text-xs file:bg-rose-50 file:text-rose-700"
                  />
                  <p className="text-xs text-gray-400 mt-2">Existing image previews are shown above. Upload new files to replace them.</p>
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t">
              <button
                onClick={() => {
                  resetUploadState();
                  setEditing(null);
                }}
                className="px-4 py-2 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                type="button"
                className={`px-4 py-2 rounded text-white text-sm font-semibold ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-rose-600 hover:bg-rose-700"}`}
              >
                {saving ? "Saving…" : editing?.id ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
