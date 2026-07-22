"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type CatalogProduct = {
  id: string;
  title: string;
  description: string;
  category: string;
  originalPrice: string;
  salePrice?: string;
  sizes: string[];
  thumbnailImage: string;
  galleryImages: string[];
  name?: string;
  price?: string;
  image?: string;
};

type ProductsContextType = {
  products: CatalogProduct[];
  isLoaded: boolean;
  error?: string;
};

const normalizeProduct = (product: Partial<CatalogProduct> & Record<string, unknown>): CatalogProduct => ({
  id: String(product.id ?? Date.now()),
  title: String(product.title ?? product.name ?? "Untitled Product"),
  description: String(product.description ?? ""),
  category: String(product.category ?? "Sarees"),
  originalPrice: String(product.originalPrice ?? product.price ?? "0"),
  salePrice: product.salePrice ? String(product.salePrice) : undefined,
  sizes: Array.isArray(product.sizes) ? product.sizes.map(String) : [],
  thumbnailImage: String(product.thumbnailImage ?? product.image ?? ""),
  galleryImages: Array.isArray(product.galleryImages)
    ? product.galleryImages.map(String)
    : [],
  name: typeof product.name === "string" ? product.name : undefined,
  price: typeof product.price === "string" ? product.price : undefined,
  image: typeof product.image === "string" ? product.image : undefined,
});

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadProducts = async () => {
      if (!db) {
        const message = "Firestore is not initialized.";
        console.warn("ProductsContext:", message);
        setError(message);
        setProducts([]);
        setIsLoaded(true);
        return;
      }

      if (!navigator.onLine) {
        console.log("ProductsContext: Offline mode detected; no products available.");
        setProducts([]);
        setIsLoaded(true);
        return;
      }

      try {
        const collectionNames = ["products", "Products", "product", "Product", "items", "Items"];
        let querySnapshot = null;
        let foundCollection = "products";

        for (const name of collectionNames) {
          const snapshot = await getDocs(collection(db, name));
          if (snapshot.size > 0) {
            querySnapshot = snapshot;
            foundCollection = name;
            break;
          }
        }

        if (!querySnapshot || querySnapshot.size === 0) {
          const message = "Firestore returned no products for known collections.";
          console.warn("ProductsContext:", message, { triedCollections: collectionNames });
          if (typeof window !== "undefined") {
            (window as any).__productsSource = "fallback";
            (window as any).__productsSourceReason = "firestore-no-docs";
            (window as any).__productsSourceCollections = collectionNames;
          }
          setError(message);
          setProducts([]);
          return;
        }

        const firebaseProducts = querySnapshot.docs.map((doc) => {
          const data = doc.data() as any;
          const rawPrice = data.price ?? data["price "] ?? data["price"] ?? data["price"];
          const rawImage =
            data.thumbnailImage ??
            data.image ??
            data.imageUrl ??
            data.img ??
            data.photo ??
            data["image"] ??
            data["image "] ??
            "";
          const rawName = data.name ?? data["name"] ?? data["name "];
          const rawCategory = data.category ?? data["category"] ?? data["category "];

          return {
            id: doc.id,
            title: rawName || "Untitled Product",
            description: "",
            category: rawCategory || "Sarees",
            originalPrice: String(rawPrice ?? 0),
            sizes: [],
            thumbnailImage: String(rawImage || ""),
            galleryImages: [],
            name: rawName,
            price: String(rawPrice ?? 0),
            image: String(rawImage || ""),
          } as CatalogProduct;
        });

        console.log("ProductsContext: Loaded from Firestore", {
          collection: foundCollection,
          count: firebaseProducts.length,
          docs: querySnapshot.docs.length,
          firstDocId: querySnapshot.docs[0]?.id,
        });
        if (typeof window !== "undefined") {
          (window as any).__productsSource = "firestore";
          (window as any).__productsSourceCollection = foundCollection;
          (window as any).__productsSourceDocCount = querySnapshot.docs.length;
        }
        setError(undefined);
        setProducts(firebaseProducts);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("ProductsContext: Firestore failed, loading fallback", error);
        if (typeof window !== "undefined") {
          (window as any).__productsSource = "fallback";
          (window as any).__productsSourceReason = "firestore-error";
          (window as any).__productsSourceError = message;
        }
        setError(message);
        setProducts([]);
      } finally {
        setIsLoaded(true);
      }
    };

    loadProducts();

    const handleOnline = () => loadProducts();

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const value = useMemo(
    () => ({
      products,
      isLoaded,
      error,
    }),
    [products, isLoaded, error]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const context = useContext(ProductsContext);

  if (!context) {
    throw new Error("useProducts must be used inside ProductsProvider");
  }

  return context;
}

