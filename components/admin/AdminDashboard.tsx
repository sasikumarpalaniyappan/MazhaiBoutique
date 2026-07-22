"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, QueryDocumentSnapshot } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

type EditableProduct = {
  id?: string;
  title: string;
  description?: string;
  category?: string;
  originalPrice?: string;
  salePrice?: string;
  thumbnailImage?: string;
  image?: string;
};

const collectionCandidates = [
  "products",
  "Products",
  "product",
  "Product",
  "items",
  "Items",
];

const normalizeProduct = (doc: QueryDocumentSnapshot): EditableProduct => {
  const data = doc.data() as Record<string, unknown>;
  const imageValue = String(
    data.thumbnailImage ?? data.image ?? data.imageUrl ?? data.img ?? data.photo ?? ""
  );

  return {
    id: doc.id,
    title: String(data.title ?? data.name ?? "Untitled Product"),
    description: String(data.description ?? ""),
    category: String(data.category ?? "Sarees"),
    originalPrice: String(data.originalPrice ?? data.price ?? "0"),
    salePrice: data.salePrice != null ? String(data.salePrice) : "",
    thumbnailImage: imageValue,
    image: imageValue,
  };
};

export default function AdminDashboard() {
  const [products, setProducts] = useState<EditableProduct[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editing, setEditing] = useState<EditableProduct | null>(null);
  const [collectionName, setCollectionName] = useState<string | null>(null);
  const [loadingCollection, setLoadingCollection] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async (collectionKey: string) => {
    setError(null);
    setIsLoaded(false);
    try {
      const snap = await getDocs(collection(db as any, collectionKey));
      const loaded = snap.docs.map(normalizeProduct);
      setProducts(loaded);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError("Unable to load products from Firestore.");
      setProducts([]);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    const findCollection = async () => {
      if (!db) return;
      setLoadingCollection(true);
      let foundCollection = false;

      for (const name of collectionCandidates) {
        try {
          const snap = await getDocs(collection(db as any, name));
          if (snap.size > 0) {
            setCollectionName(name);
            await loadProducts(name);
            foundCollection = true;
            break;
          }
        } catch (e) {
          // ignore invalid names and continue
        }
      }

      if (!foundCollection) {
        setCollectionName("products");
        await loadProducts("products");
      }

      setLoadingCollection(false);
      setIsLoaded(true);
    };
    findCollection();
  }, []);

  const handleEdit = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setEditing({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      originalPrice: p.originalPrice,
      salePrice: p.salePrice,
      thumbnailImage: p.thumbnailImage,
      image: p.image,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editing) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (!storage) return alert("Firebase Storage is not configured.");

    try {
      const filename = `${editing.id ?? "new"}_${Date.now()}_${file.name}`;
      const sRef = storageRef(storage, `product_thumbnails/${filename}`);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);
      setEditing({ ...editing, thumbnailImage: url, image: url });
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed: " + String(err));
    }
  };

  const router = useRouter();

  const handleView = (id: string) => {
    router.push(`/products/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!collectionName) return alert("Products collection not detected; cannot delete.");
    if (!confirm("Delete this product?")) return;
    try {
      await deleteDoc(doc(db as any, collectionName, id));
      await loadProducts(collectionName);
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
    if (!collectionName) return alert("Products collection not detected; cannot save.");

    const payload: Record<string, any> = {
      name: editing.title,
      title: editing.title,
      description: editing.description ?? "",
      category: editing.category ?? "",
      price: editing.originalPrice ?? "0",
      thumbnailImage: editing.thumbnailImage ?? "",
      image: editing.thumbnailImage ?? editing.image ?? "",
    };

    if (typeof editing.salePrice !== "undefined" && editing.salePrice !== "") {
      payload.salePrice = editing.salePrice;
    }

    try {
      if (!editing.id) {
        await addDoc(collection(db as any, collectionName), payload);
      } else {
        const ref = doc(db as any, collectionName, editing.id);
        await updateDoc(ref, payload);
      }

      await loadProducts(collectionName);
      setEditing(null);
    } catch (e) {
      console.error(e);
      alert("Save failed: " + String(e));
    }
  };

  const handleAddProduct = () => {
    setEditing({
      title: "New Product",
      description: "",
      category: "Sarees",
      originalPrice: "0",
      salePrice: "",
      thumbnailImage: "",
      image: "",
    });
  };

  const rows = useMemo(() => products || [], [products]);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Manage Products</h2>
          <p className="text-sm text-gray-500">Add, edit, review, and remove your collection pieces.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleAddProduct} className="px-4 py-2 rounded bg-rose-600 text-white">+ Add New Product</button>
        </div>
      </div>

      <div className="bg-white shadow rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-rose-50 text-sm text-gray-600">
              <tr>
                <th className="p-4">Thumbnail</th>
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Original Price</th>
                <th className="p-4">Sale Price</th>
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
                    {(p.thumbnailImage || p.image) ? (
                      <img src={p.thumbnailImage || p.image} alt={p.title} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-400">No image</div>
                    )}
                  </td>
                  <td className="p-4">{p.title}</td>
                  <td className="p-4">{p.category}</td>
                  <td className="p-4">{p.originalPrice}</td>
                  <td className="p-4">{p.salePrice ?? "-"}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleView(p.id)} className="px-3 py-1 border rounded text-sm">View</button>
                      <button onClick={() => handleEdit(p.id)} className="px-3 py-1 border rounded text-sm">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="px-3 py-1 bg-rose-500 text-white rounded text-sm">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Editing {editing.title}</h3>
              <button onClick={() => setEditing(null)} className="text-gray-500">Close</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600">Title</label>
                <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full border rounded px-3 py-2 mt-1" />
                <label className="block text-sm text-gray-600 mt-3">Description</label>
                <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full border rounded px-3 py-2 mt-1" />
                <label className="block text-sm text-gray-600 mt-3">Category</label>
                <input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full border rounded px-3 py-2 mt-1" />
                <label className="block text-sm text-gray-600 mt-3">Original Price</label>
                <input value={editing.originalPrice} onChange={(e) => setEditing({ ...editing, originalPrice: e.target.value })} className="w-full border rounded px-3 py-2 mt-1" />
                <label className="block text-sm text-gray-600 mt-3">Sale Price</label>
                <input value={editing.salePrice} onChange={(e) => setEditing({ ...editing, salePrice: e.target.value })} className="w-full border rounded px-3 py-2 mt-1" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Thumbnail Image</label>
                <div className="mt-2">
                  {(editing.thumbnailImage || editing.image) ? (
                    <img src={editing.thumbnailImage || editing.image} alt="thumb" className="w-48 h-32 object-cover rounded" />
                  ) : (
                    <div className="w-48 h-32 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-400">No image</div>
                  )}
                </div>
                <label className="block text-sm text-gray-600 mt-3">Replace Thumbnail</label>
                <input
                  type="file"
                  accept="image/png,image/webp"
                  className="mt-2"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-gray-400 mt-2">Selected image will be uploaded to Firebase Storage.</p>
                <label className="block text-sm text-gray-600 mt-4">Or enter image URL</label>
                <input
                  type="text"
                  value={editing.image ?? editing.thumbnailImage ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      image: e.target.value,
                      thumbnailImage: e.target.value,
                    })
                  }
                  placeholder="https://example.com/product.png"
                  className="w-full border rounded px-3 py-2 mt-2"
                />
                <p className="text-xs text-gray-400 mt-2">You can paste a direct image URL instead of uploading a file.</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-rose-600 text-white rounded">Add Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
