import ProductDetailPage from "@/components/ProductDetailPage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const getFirebaseApp = () => {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
};

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

  const app = getFirebaseApp();
  const db = getFirestore(app);
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