import ProductCard from "@/components/ProductCard";

const products = [
  {
    id: 1,
    name: "Premium Dress",
    price: "₹2,999",
    image: "https://via.placeholder.com/300x400",
  },
  {
    id: 2,
    name: "Designer Saree",
    price: "₹4,999",
    image: "https://via.placeholder.com/300x400",
  },
  {
    id: 3,
    name: "Men Jacket",
    price: "₹3,499",
    image: "https://via.placeholder.com/300x400",
  },
  {
    id: 4,
    name: "Kids Wear",
    price: "₹1,999",
    image: "https://via.placeholder.com/300x400",
  },
];

export default function FeaturedProducts() {
  return (
    <section className="mt-20">
      <h2 className="text-3xl font-bold text-center text-pink-600 mb-10">
        Featured Products
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            image={product.image}
          />
        ))}
      </div>
    </section>
  );
}