"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";
import { cloudinaryService } from "@/lib/cloudinary";

type EditableProduct = {
  id?: string;
  title: string;
  description?: string;
  category?: string;
  status?: "draft" | "active" | "archived";
  isFeatured?: boolean;
  originalPrice?: string;
  salePrice?: string;
  thumbnailImage?: string;
  thumbnailPublicId?: string;
  image?: string;
  galleryImages?: string[];
  galleryImagePublicIds?: string[];
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
  const galleryImages = Array.isArray(row.gallery_images) ? row.gallery_images.map(String).filter(Boolean) : [];
  const rawImageValue = galleryImages[0] ?? row.thumbnail_image ?? row.image ?? "";
  const imageValue = isValidImageUrl(rawImageValue) ? String(rawImageValue) : "";

  return {
    id: String(row.id),
    title: String(row.title ?? row.name ?? "Untitled Product"),
    description: String(row.description ?? ""),
    category: String(row.category ?? "Sarees"),
    status: (row.status === "draft" || row.status === "archived" || row.status === "active") ? row.status : "active",
    isFeatured: Boolean(row.is_featured),
    originalPrice: String(row.original_price ?? row.price ?? "0"),
    salePrice: row.sale_price != null ? String(row.sale_price) : "",
    thumbnailImage: imageValue,
    thumbnailPublicId: typeof row.thumbnail_public_id === "string" ? row.thumbnail_public_id : "",
    image: imageValue,
    galleryImages,
    galleryImagePublicIds: Array.isArray(row.gallery_image_public_ids) ? row.gallery_image_public_ids : [],
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

const revokeObjectUrls = (urls: string[]) => {
  urls.forEach((url) => {
    if (isBlobUrl(url)) {
      URL.revokeObjectURL(url);
    }
  });
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

const getMissingSchemaColumn = (error: unknown) => {
  const message = getSupabaseErrorMessage(error);
  const match = message.match(/Could not find the '([^']+)' column of 'products' in the schema cache/i);
  return match?.[1] ?? null;
};

const runProductsWriteWithFallback = async <T,>(
  operation: (payload: Record<string, any>) => PromiseLike<{ data?: T | null; error: unknown }> | { data?: T | null; error: unknown },
  initialPayload: Record<string, any>
) => {
  const payload = { ...initialPayload };
  const removedColumns = new Set<string>();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const result = await operation(payload);
    if (!result.error) {
      return {
        data: result.data,
        error: null,
        removedColumns: Array.from(removedColumns),
      };
    }

    const missingColumn = getMissingSchemaColumn(result.error);
    if (!missingColumn || !(missingColumn in payload)) {
      return {
        data: result.data,
        error: result.error,
        removedColumns: Array.from(removedColumns),
      };
    }

    delete payload[missingColumn];
    removedColumns.add(missingColumn);
  }

  return {
    data: undefined,
    error: new Error("Failed to write product after schema fallback attempts."),
    removedColumns: Array.from(removedColumns),
  };
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

type ProductFormErrors = {
  title?: string;
  category?: string;
  originalPrice?: string;
  salePrice?: string;
};

const parsePriceValue = (value?: string) => {
  if (!value) return NaN;
  return Number(String(value).replace(/[^0-9.]/g, ""));
};

const validateProductForm = (product: EditableProduct): ProductFormErrors => {
  const errors: ProductFormErrors = {};
  const title = (product.title || "").trim();
  const category = (product.category || "").trim();
  const original = parsePriceValue(product.originalPrice);
  const hasSale = typeof product.salePrice !== "undefined" && String(product.salePrice).trim() !== "";
  const sale = parsePriceValue(product.salePrice);

  if (!title) {
    errors.title = "Title is required.";
  }

  if (!category) {
    errors.category = "Category is required.";
  }

  if (!Number.isFinite(original) || original <= 0) {
    errors.originalPrice = "Original price must be a valid number greater than 0.";
  }

  if (hasSale) {
    if (!Number.isFinite(sale) || sale <= 0) {
      errors.salePrice = "Sale price must be a valid number greater than 0.";
    } else if (Number.isFinite(original) && sale >= original) {
      errors.salePrice = "Sale price must be lower than original price.";
    }
  }

  return errors;
};

const syncPrimaryWithGallery = (product: EditableProduct): EditableProduct => {
  const firstGalleryImage = product.galleryImages?.[0] || "";
  const firstGalleryPublicId = product.galleryImagePublicIds?.[0] || "";

  if (!firstGalleryImage) return product;

  return {
    ...product,
    thumbnailImage: firstGalleryImage,
    image: firstGalleryImage,
    thumbnailPublicId: firstGalleryPublicId,
  };
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
  const [thumbnailUploadProgress, setThumbnailUploadProgress] = useState<number | null>(null);
  const [galleryUploadProgress, setGalleryUploadProgress] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<ProductFormErrors>({});
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

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
    setThumbnailUploadProgress(null);
    setGalleryUploadProgress(null);
    revokeObjectUrls(galleryPreviewUrls);
    setGalleryPreviewUrls([]);
    setFormErrors({});
    setSaveFeedback(null);
  };

  const handleEdit = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    resetUploadState();
    setEditing({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      status: p.status ?? "active",
      isFeatured: Boolean(p.isFeatured),
      originalPrice: p.originalPrice,
      salePrice: p.salePrice,
      thumbnailImage: p.thumbnailImage,
      thumbnailPublicId: p.thumbnailPublicId,
      image: p.image,
      galleryImages: p.galleryImages ?? [],
      galleryImagePublicIds: p.galleryImagePublicIds ?? [],
      availableSizes: p.availableSizes ?? [],
    });
  };

  const handleGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editing) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;
    let previewUrlsToRevoke: string[] = [];

    try {
      const existingCount = editing.galleryImages?.length || 0;
      const availableSlots = Math.max(0, 4 - existingCount);
      if (availableSlots === 0) {
        e.target.value = "";
        return;
      }

      const filesToProcess = Array.from(files).slice(0, availableSlots);
      const localPreviews = filesToProcess.map((file) => URL.createObjectURL(file));
      previewUrlsToRevoke = localPreviews;
      setGalleryPreviewUrls(localPreviews);
      setGalleryUploadProgress(0);

      const uploaded = await cloudinaryService.uploadImages(filesToProcess, {
        folder: "mazhai-boutique/product_gallery",
        tags: ["mazhai-boutique", "product", "gallery"],
        onOverallProgress: (percent) => setGalleryUploadProgress(percent),
      });

      const uploadedUrls = uploaded.map((item) => item.secureUrl).filter(Boolean);
      const uploadedPublicIds = uploaded.map((item) => item.publicId).filter(Boolean);

      if (uploadedUrls.length > 0) {
        setEditing((prev) => {
          if (!prev) return prev;
          const updated = syncPrimaryWithGallery({
            ...prev,
            galleryImages: [...(prev.galleryImages || []), ...uploadedUrls].slice(0, 4),
            galleryImagePublicIds: [...(prev.galleryImagePublicIds || []), ...uploadedPublicIds].slice(0, 4),
          });
          return updated;
        });
      }

      e.target.value = "";
      setGalleryUploadProgress(100);
    } catch (error: any) {
      const message = getSupabaseErrorMessage(error);
      console.error("Gallery image upload failed:", message, error);
      setSaveFeedback(`Gallery image upload failed: ${message}`);
      alert(`Gallery image upload failed: ${message}`);
    } finally {
      revokeObjectUrls(previewUrlsToRevoke);
      setGalleryPreviewUrls([]);
      setGalleryUploadProgress(null);
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
      setSaveFeedback(`Image preview setup failed: ${message}`);
      alert(`Image preview setup failed: ${message}`);
    }
  };

  const handleRemoveThumbnailImage = async () => {
    if (!editing) return;

    const hasLocalSelection = Boolean(selectedThumbnailFile || localPreviewUrl);
    const hasStoredThumbnail = Boolean(editing.thumbnailImage || editing.image);

    if (!hasLocalSelection && !hasStoredThumbnail) return;
    if (!confirm("Remove thumbnail image?")) return;

    try {
      if (editing.thumbnailPublicId) {
        await cloudinaryService.deleteByPublicId(editing.thumbnailPublicId);
      }

      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }

      setLocalPreviewUrl(null);
      setSelectedThumbnailFile(null);
      setManualImageUrl("");
      setEditing((prev) =>
        prev
          ? {
              ...prev,
              thumbnailImage: "",
              thumbnailPublicId: "",
              image: "",
            }
          : prev
      );
    } catch (error) {
      const message = getSupabaseErrorMessage(error);
      alert(`Thumbnail delete failed: ${message}`);
    }
  };

  const handleRemoveGalleryImage = async (index: number) => {
    if (!editing) return;

    const imageUrl = editing.galleryImages?.[index];
    if (!imageUrl) return;
    if (!confirm("Remove this gallery image?")) return;

    try {
      const publicId = editing.galleryImagePublicIds?.[index];
      if (publicId) {
        await cloudinaryService.deleteByPublicId(publicId);
      }

      setEditing((prev) => {
        if (!prev) return prev;
        const nextImages = [...(prev.galleryImages || [])];
        const nextPublicIds = [...(prev.galleryImagePublicIds || [])];
        nextImages.splice(index, 1);
        nextPublicIds.splice(index, 1);

        return syncPrimaryWithGallery({
          ...prev,
          galleryImages: nextImages,
          galleryImagePublicIds: nextPublicIds,
        });
      });
    } catch (error) {
      const message = getSupabaseErrorMessage(error);
      alert(`Gallery image delete failed: ${message}`);
    }
  };

  const handleMoveGalleryImage = (fromIndex: number, toIndex: number) => {
    if (!editing) return;

    const galleryImages = editing.galleryImages || [];
    if (fromIndex < 0 || toIndex < 0) return;
    if (fromIndex >= galleryImages.length || toIndex >= galleryImages.length) return;

    setEditing((prev) => {
      if (!prev) return prev;

      const nextImages = [...(prev.galleryImages || [])];
      const nextPublicIds = [...(prev.galleryImagePublicIds || [])];

      const [movedImage] = nextImages.splice(fromIndex, 1);
      nextImages.splice(toIndex, 0, movedImage);

      if (nextPublicIds.length > 0) {
        const [movedPublicId] = nextPublicIds.splice(fromIndex, 1);
        nextPublicIds.splice(toIndex, 0, movedPublicId);
      }

      return syncPrimaryWithGallery({
        ...prev,
        galleryImages: nextImages,
        galleryImagePublicIds: nextPublicIds,
      });
    });
  };

  const uploadThumbnailForProduct = async (productId: string, file: File) => {
    const filenameTag = sanitizeFileName(file.name);
    const result = await cloudinaryService.uploadImage(file, {
      folder: `mazhai-boutique/product_thumbnails/${productId}`,
      tags: ["mazhai-boutique", "product", "thumbnail", filenameTag],
      onProgress: (percent) => setThumbnailUploadProgress(percent),
    });

    return {
      secureUrl: result.secureUrl,
      publicId: result.publicId,
    };
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const target = products.find((p) => String(p.id) === String(id));
      const publicIds = [
        ...(target?.thumbnailPublicId ? [target.thumbnailPublicId] : []),
        ...((target?.galleryImagePublicIds || []).filter(Boolean) as string[]),
      ];

      if (publicIds.length > 0) {
        await Promise.all(
          publicIds.map(async (publicId) => {
            try {
              await cloudinaryService.deleteByPublicId(publicId);
            } catch (deleteError) {
              console.warn("Cloudinary asset cleanup failed:", publicId, deleteError);
            }
          })
        );
      }

      const { error } = await supabaseClient
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await loadProducts();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("products:updated"));
      }
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

    const validationErrors = validateProductForm(editing);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setSaveFeedback("Please fix the highlighted fields before saving.");
      return;
    }

    setFormErrors({});
    setSaveFeedback(null);

    setSaving(true);

    try {
      const firstGalleryImage = editing.galleryImages?.[0] || "";
      const firstGalleryPublicId = editing.galleryImagePublicIds?.[0] || "";
      let imageUrl = firstGalleryImage || editing.thumbnailImage || editing.image || "";
      let thumbnailPublicId = firstGalleryPublicId || editing.thumbnailPublicId || "";
      let currentId = editing.id;

      if (selectedThumbnailFile) {
        setThumbnailUploadProgress(0);
        if (!currentId) {
          const draftPayload: Record<string, any> = {
            name: editing.title,
            title: editing.title,
            description: editing.description ?? "",
            category: editing.category ?? "",
            status: editing.status ?? "active",
            is_featured: Boolean(editing.isFeatured),
            price: editing.originalPrice ?? "0",
            original_price: editing.originalPrice ?? "0",
            thumbnail_image: "",
            thumbnail_public_id: "",
            image: "",
            gallery_images: editing.galleryImages ?? [],
            gallery_image_public_ids: editing.galleryImagePublicIds ?? [],
            available_sizes: editing.availableSizes ?? [],
          };

          if (typeof editing.salePrice !== "undefined" && editing.salePrice !== "") {
            draftPayload.sale_price = editing.salePrice;
          }

          const { data, error, removedColumns } = await runProductsWriteWithFallback<{ id: string }>(
            async (payload) => {
              const { data, error } = await (supabaseClient as any)
                .from("products")
                .insert([payload])
                .select()
                .single();

              return { data, error };
            },
            draftPayload
          );

          if (error) throw error;
          if (!data?.id) throw new Error("Failed to create draft product");

          if (removedColumns.length > 0) {
            console.warn("Draft save skipped columns not yet in Supabase schema:", removedColumns);
          }

          currentId = data.id;
        }

        if (!currentId) {
          throw new Error("Could not determine product id for thumbnail upload");
        }

        const thumbnailUpload = await uploadThumbnailForProduct(currentId, selectedThumbnailFile);
        imageUrl = thumbnailUpload.secureUrl;
        thumbnailPublicId = thumbnailUpload.publicId;
      }

      const payload: Record<string, any> = {
        name: editing.title,
        title: editing.title,
        description: editing.description ?? "",
        category: editing.category ?? "",
        status: editing.status ?? "active",
        is_featured: Boolean(editing.isFeatured),
        price: editing.originalPrice ?? "0",
        original_price: editing.originalPrice ?? "0",
        thumbnail_image: imageUrl || firstGalleryImage,
        thumbnail_public_id: thumbnailPublicId,
        image: imageUrl || firstGalleryImage,
        gallery_images: editing.galleryImages ?? [],
        gallery_image_public_ids: editing.galleryImagePublicIds ?? [],
        available_sizes: editing.availableSizes ?? [],
      };

      if (typeof editing.salePrice !== "undefined" && editing.salePrice !== "") {
        payload.sale_price = editing.salePrice;
      }

      if (!currentId) {
        const { error, removedColumns } = await runProductsWriteWithFallback(
          async (nextPayload) => {
            const { data, error } = await (supabaseClient as any)
              .from("products")
              .insert([nextPayload]);

            return { data, error };
          },
          payload
        );

        if (removedColumns.length > 0) {
          console.warn("Product insert skipped columns not yet in Supabase schema:", removedColumns);
        }

        if (error) throw error;
      } else {
        const { error, removedColumns } = await runProductsWriteWithFallback(
          async (nextPayload) => {
            const { data, error } = await (supabaseClient as any)
              .from("products")
              .update(nextPayload)
              .eq("id", currentId);

            return { data, error };
          },
          payload
        );

        if (removedColumns.length > 0) {
          console.warn("Product update skipped columns not yet in Supabase schema:", removedColumns);
        }

        if (error) throw error;
      }

      await loadProducts();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("products:updated"));
      }
      resetUploadState();
      setSaveFeedback("Product saved successfully.");
      setEditing(null);
    } catch (e) {
      const message = getSupabaseErrorMessage(e);
      console.error("Save failed:", e, message);
      setError(message);
      setSaveFeedback(`Save failed: ${message}`);
      alert("Save failed: " + message);
    } finally {
      setSaving(false);
      setThumbnailUploadProgress(null);
    }
  };

  const handleAddProduct = () => {
    resetUploadState();
    setEditing({
      title: "New Product",
      description: "",
      category: "Sarees",
      status: "active",
      isFeatured: false,
      originalPrice: "0",
      salePrice: "",
      thumbnailImage: "",
      thumbnailPublicId: "",
      image: "",
      galleryImages: [],
      galleryImagePublicIds: [],
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
                <th className="p-4">Status</th>
                <th className="p-4">Featured</th>
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
                  <td className="p-4 capitalize">{p.status || "active"}</td>
                  <td className="p-4">{p.isFeatured ? "Yes" : "No"}</td>
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
                    <p className="text-xs text-gray-500 mt-1">Status: <span className="capitalize">{p.status || "active"}</span></p>
                    <p className="text-xs text-gray-500">Featured: {p.isFeatured ? "Yes" : "No"}</p>
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

            {saveFeedback ? (
              <div className={`mb-4 rounded border px-3 py-2 text-xs sm:text-sm ${saveFeedback.startsWith("Product saved") ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
                {saveFeedback}
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 font-semibold mb-1">Title</label>
                  <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={`w-full border rounded px-3 py-2 text-sm ${formErrors.title ? "border-rose-400" : "border-gray-200"}`} />
                  {formErrors.title ? <p className="mt-1 text-xs text-rose-600">{formErrors.title}</p> : null}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 font-semibold mb-1">Description</label>
                  <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full border border-gray-200 rounded px-3 py-2 text-sm" />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 font-semibold mb-1">Category</label>
                  <input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className={`w-full border rounded px-3 py-2 text-sm ${formErrors.category ? "border-rose-400" : "border-gray-200"}`} />
                  {formErrors.category ? <p className="mt-1 text-xs text-rose-600">{formErrors.category}</p> : null}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-600 font-semibold mb-1">Status</label>
                    <select
                      value={editing.status ?? "active"}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          status: e.target.value as "draft" | "active" | "archived",
                        })
                      }
                      className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-600 font-semibold mb-1">Featured</label>
                    <label className="h-[42px] border border-gray-200 rounded px-3 py-2 text-sm flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={Boolean(editing.isFeatured)}
                        onChange={(e) => setEditing({ ...editing, isFeatured: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                      <span>{editing.isFeatured ? "Yes" : "No"}</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-600 font-semibold mb-1">Original Price (₹)</label>
                    <input value={editing.originalPrice} onChange={(e) => setEditing({ ...editing, originalPrice: e.target.value })} className={`w-full border rounded px-3 py-2 text-sm ${formErrors.originalPrice ? "border-rose-400" : "border-gray-200"}`} />
                    {formErrors.originalPrice ? <p className="mt-1 text-xs text-rose-600">{formErrors.originalPrice}</p> : null}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-600 font-semibold mb-1">Sale Price (₹)</label>
                    <input value={editing.salePrice} onChange={(e) => setEditing({ ...editing, salePrice: e.target.value })} className={`w-full border rounded px-3 py-2 text-sm ${formErrors.salePrice ? "border-rose-400" : "border-gray-200"}`} />
                    {formErrors.salePrice ? <p className="mt-1 text-xs text-rose-600">{formErrors.salePrice}</p> : null}
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
                  <button
                    type="button"
                    onClick={handleRemoveThumbnailImage}
                    className="mt-2 text-xs text-rose-700 hover:text-rose-800"
                  >
                    Remove thumbnail image
                  </button>
                  {thumbnailUploadProgress !== null ? (
                    <p className="text-xs text-gray-500 mt-2">Thumbnail upload: {thumbnailUploadProgress}%</p>
                  ) : null}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 font-semibold mb-2">Gallery Images (up to 4)</label>
                  <div className="space-y-2 mb-2">
                    {(() => {
                      const previewImages = [...(editing.galleryImages || []), ...galleryPreviewUrls].slice(0, 4);
                      const persistedCount = editing.galleryImages?.length || 0;
                      return [0, 1, 2, 3].map((idx) => (
                        <div key={idx} className="w-full bg-gray-100 rounded p-1 text-xs text-gray-400">
                          <div className="h-16 sm:h-20 rounded flex items-center justify-center overflow-hidden">
                            {previewImages[idx] ? (
                              <img src={previewImages[idx]} alt={`gallery-${idx}`} className="w-full h-full object-cover rounded" />
                            ) : (
                              `Image ${idx + 1}`
                            )}
                          </div>
                          {idx < persistedCount ? (
                            <div className="mt-1 flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => handleMoveGalleryImage(idx, idx - 1)}
                                disabled={idx === 0}
                                className="px-2 py-1 text-[11px] border rounded text-gray-700 disabled:opacity-40"
                              >
                                Left
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(idx)}
                                className="px-2 py-1 text-[11px] border rounded text-rose-700"
                              >
                                Remove
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveGalleryImage(idx, idx + 1)}
                                disabled={idx >= persistedCount - 1}
                                className="px-2 py-1 text-[11px] border rounded text-gray-700 disabled:opacity-40"
                              >
                                Right
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ));
                    })()}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryFileChange}
                    className="w-full text-xs sm:text-sm file:mr-2 file:py-1 file:px-2 sm:file:px-3 file:rounded file:border-0 file:text-xs file:bg-rose-50 file:text-rose-700"
                  />
                  {galleryUploadProgress !== null ? (
                    <p className="text-xs text-gray-500 mt-2">Gallery upload: {galleryUploadProgress}%</p>
                  ) : null}
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
