import ProductDetailPage from "@/components/ProductDetailPage";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

  if (!db) {
    return (
      <div className="mt-20 text-center">
        <h1 className="text-2xl font-semibold">Product not available</h1>
        <p className="mt-4 text-sm text-gray-600">
          Cannot connect to Firestore. Check your Firebase environment configuration.
        </p>
      </div>
    );
  }

  const productRef = doc(db, "products", id);
  const productSnap = await getDoc(productRef);

  if (!productSnap.exists()) {
    return (
      <div className="mt-20 text-center">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <p className="mt-4 text-sm text-gray-600">Requested id: {String(id)}</p>
        <p className="mt-2 text-sm text-gray-500">Try another product from Firestore</p>
      </div>
    );
  }

  const data = productSnap.data() as Record<string, any>;
  const rawPrice = data.price ?? data["price "] ?? 0;
  const rawImage = data.image ?? data["image"] ?? "";
  const rawName = data.name ?? data["name"] ?? "Untitled Product";

  const detailProduct = {
    id: productSnap.id,
    name: rawName,
    price: String(rawPrice),
    description: data.description || "A beautifully crafted piece from Mazhai Boutique.",
    images: [String(rawImage)].filter(Boolean) as string[],
    sizes: data.sizes ?? ["Standard"],
  };

  return <ProductDetailPage product={detailProduct} />;
}