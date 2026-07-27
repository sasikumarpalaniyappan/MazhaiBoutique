"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabaseClient } from "@/lib/supabaseClient";

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
      if (!navigator.onLine) {
        console.log("ProductsContext: Offline mode detected; no products available.");
        setProducts([]);
        setIsLoaded(true);
        return;
      }

      try {
        const { data, error: fetchError } = await supabaseClient
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (!data || data.length === 0) {
          const message = "No products found in database.";
          console.warn("ProductsContext:", message);
          if (typeof window !== "undefined") {
            (window as any).__productsSource = "supabase-empty";
          }
          setError(undefined);
          setProducts([]);
          setIsLoaded(true);
          return;
        }

        const supabaseProducts = data.map((row: any) => ({
          id: String(row.id),
          title: String(row.title ?? row.name ?? "Untitled Product"),
          description: String(row.description ?? ""),
          category: String(row.category ?? "Sarees"),
          originalPrice: String(row.original_price ?? row.price ?? "0"),
          salePrice: row.sale_price ? String(row.sale_price) : undefined,
          sizes: Array.isArray(row.available_sizes) ? row.available_sizes : [],
          thumbnailImage: String(row.thumbnail_image ?? row.image ?? ""),
          galleryImages: Array.isArray(row.gallery_images) ? row.gallery_images : [],
          name: row.name,
          price: String(row.sale_price ?? row.original_price ?? row.price ?? "0"),
          image: String(row.image ?? row.thumbnail_image ?? ""),
        })) as CatalogProduct[];

        console.log("ProductsContext: Loaded from Supabase", {
          count: supabaseProducts.length,
        });
        if (typeof window !== "undefined") {
          (window as any).__productsSource = "supabase";
          (window as any).__productsSourceCount = supabaseProducts.length;
        }
        setError(undefined);
        setProducts(supabaseProducts);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("ProductsContext: Supabase failed", error);
        if (typeof window !== "undefined") {
          (window as any).__productsSource = "error";
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

