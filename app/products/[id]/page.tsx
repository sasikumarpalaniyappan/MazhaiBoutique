import ProductDetailPage from "@/components/ProductDetailPage";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function ProductPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!id) {
    return (
      <div className="mt-20 text-center">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <p className="mt-4 text-sm text-gray-600">Requested id: unknown</p>
      </div>
    );
  }

  let productData: Record<string, any> | null = null;
  let fetchError: string | null = null;

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      fetchError = error.message;
    } else if (data) {
      productData = data;
    }
  } catch (e) {
    fetchError = e instanceof Error ? e.message : String(e);
  }

  if (fetchError || !productData) {
    return (
      <div className="mt-20 text-center">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <p className="mt-4 text-sm text-gray-600">Requested id: {String(id)}</p>
        <p className="mt-2 text-sm text-gray-500">
          {fetchError ? `Error: ${fetchError}` : "Try another product"}
        </p>
      </div>
    );
  }

  const data = productData;
  const rawPrice = data.price ?? data.original_price ?? 0;
  const rawOriginalPrice = data.original_price ?? rawPrice;
  const rawSalePrice = data.sale_price ?? undefined;
  const galleryImages = Array.isArray(data.gallery_images)
    ? data.gallery_images.map(String).filter(Boolean)
    : [];
  const primaryImage = String(galleryImages[0] ?? data.thumbnail_image ?? data.image ?? "");
  const detailImages = Array.from(new Set([primaryImage, ...galleryImages].filter(Boolean)));
  const rawName = data.name ?? data.title ?? "Untitled Product";

  const detailProduct = {
    id: id,
    name: rawName,
    price: String(rawSalePrice ?? rawOriginalPrice ?? rawPrice),
    originalPrice: String(rawOriginalPrice),
    salePrice: rawSalePrice != null ? String(rawSalePrice) : undefined,
    description: data.description || "A beautifully crafted piece from Mazhai Boutique.",
    images: detailImages,
    sizes: data.available_sizes ?? ["Standard"],
  };

  return <ProductDetailPage product={detailProduct} />;
}