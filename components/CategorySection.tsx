export default function CategorySection() {
  const categories = [
    "Men",
    "Women",
    "Kids",
    "Kurtas",
    "Sarees",
    "Gifting",
  ];

  return (
    <section className="max-w-7xl mx-auto py-16 px-6">
      <h2 className="text-4xl font-bold text-center text-pink-600 mb-10">
        Shop by Category
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category}
            className="bg-white shadow-md rounded-xl p-10 text-center text-xl font-semibold hover:shadow-xl hover:scale-105 transition duration-300 cursor-pointer"
          >
            {category}
          </div>
        ))}
      </div>
    </section>
  );
}