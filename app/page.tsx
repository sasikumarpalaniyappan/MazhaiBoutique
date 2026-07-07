import CategorySection from "@/components/CategorySection";
import FeaturedProducts from "@/components/FeaturedProducts";

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10">

      <section className="text-center mt-20">
        <h1 className="text-5xl font-bold text-pink-600">
          Welcome to Boutique Bliss
        </h1>

        <p className="mt-6 text-gray-600 text-lg">
          Discover premium fashion collections for Men, Women and Kids.
        </p>

        <button className="mt-8 bg-pink-600 text-white px-8 py-3 rounded-lg hover:bg-pink-700">
          Shop Now
        </button>
      </section>

      <CategorySection />

      <FeaturedProducts />

    </main>
  );
}