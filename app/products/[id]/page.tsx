import ProductDetailPage from "@/components/ProductDetailPage";
import { products as seedProducts } from "@/components/data/products";

export default async function ProductPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  const product = seedProducts.find((item) => String(item.id) === String(id));

  if (!product) {
    return (
      <div className="mt-20 text-center">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <p className="mt-4 text-sm text-gray-600">Requested id: {String(id)}</p>
        <p className="mt-2 text-sm text-gray-500">Available ids: {seedProducts.map((p) => String(p.id)).join(", ")}</p>
      </div>
    );
  }

  const detailProduct = {
    id: String(product.id),
    name: product.name,
    price: product.price,
    description: "A beautifully crafted piece from Mazhai Boutique.",
    images: [product.image].filter(Boolean) as string[],
    sizes: ["Standard"],
  };

  return <ProductDetailPage product={detailProduct} />;
}