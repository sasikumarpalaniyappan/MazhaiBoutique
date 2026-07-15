import Link from "next/link";
import { products as seedProducts } from "@/components/data/products";

export default function ProductsIndex() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
      <h1 className="text-3xl font-semibold text-center text-pink-600">Our Collections</h1>
      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {seedProducts.map((p) => (
          <Link key={p.id} href={`/products/${p.id}`} className="group block rounded-xl border p-4 hover:shadow-lg">
            <img src={p.image} alt={p.name} className="h-48 w-full rounded-md object-cover" />
            <h2 className="mt-3 font-medium text-gray-800 group-hover:text-pink-600">{p.name}</h2>
            <p className="mt-1 text-pink-600 font-semibold">{p.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
