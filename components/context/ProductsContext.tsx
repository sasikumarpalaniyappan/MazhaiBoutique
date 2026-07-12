"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { products as fallbackSeedProducts } from "@/components/data/products";

export const STORAGE_KEY = "mazhai-boutique-products";
export const STORAGE_EVENT = "mazhai-products-updated";

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

export const fallbackProducts: CatalogProduct[] = fallbackSeedProducts.map((product) =>
  normalizeProduct({
    id: String(product.id),
    title: product.name,
    originalPrice: product.price,
    thumbnailImage: product.image,
    image: product.image,
    name: product.name,
    price: product.price,
  })
);

export const mergeProductsWithFallback = (savedProducts: unknown): CatalogProduct[] => {
  const normalizedSaved = Array.isArray(savedProducts)
    ? savedProducts.map((item) =>
        normalizeProduct(item as Partial<CatalogProduct> & Record<string, unknown>)
      )
    : [];

  const merged = [...fallbackProducts];

  normalizedSaved.forEach((item) => {
    const existingIndex = merged.findIndex(
      (existing) =>
        String(existing.id) === String(item.id) ||
        existing.title.trim().toLowerCase() === item.title.trim().toLowerCase()
    );

    if (existingIndex >= 0) {
      merged[existingIndex] = { ...merged[existingIndex], ...item };
    } else {
      merged.push(item);
    }
  });

  return merged;
};

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<CatalogProduct[]>(fallbackProducts);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadProducts = () => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);

        if (saved) {
          const parsed = JSON.parse(saved);
          setProducts(mergeProductsWithFallback(parsed));
        } else {
          setProducts(fallbackProducts);
        }
      } catch {
        setProducts(fallbackProducts);
      } finally {
        setIsLoaded(true);
      }
    };

    loadProducts();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        loadProducts();
      }
    };

    const handleUpdated = () => loadProducts();

    window.addEventListener("storage", handleStorage);
    window.addEventListener(STORAGE_EVENT, handleUpdated);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(STORAGE_EVENT, handleUpdated);
    };
  }, []);

  const value = useMemo(
    () => ({
      products,
      isLoaded,
    }),
    [products, isLoaded]
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
