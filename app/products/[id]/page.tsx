type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const products = [
  {
    id: "1",
    name: "Premium Dress",
    price: "₹2,999",
    description: "Elegant premium dress for special occasions.",
    image: "https://via.placeholder.com/500x600",
  },
  {
    id: "2",
    name: "Designer Saree",
    price: "₹4,999",
    description: "Beautiful designer saree with modern styling.",
    image: "https://via.placeholder.com/500x600",
  },
  {
    id: "3",
    name: "Men Jacket",
    price: "₹3,499",
    description: "Stylish jacket for men.",
    image: "https://via.placeholder.com/500x600",
  },
  {
    id: "4",
    name: "Kids Wear",
    price: "₹1,999",
    description: "Comfortable and fashionable kids wear.",
    image: "https://via.placeholder.com/500x600",
  },
];

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  const product = products.find((p) => p.id === id);

  if (!product) {
    return <h1 className="text-center mt-20">Product not found</h1>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-32 grid md:grid-cols-2 gap-10">
      <img
        src={product.image}
        alt={product.name}
        className="w-full rounded-xl shadow-lg"
      />

      <div>
        <h1 className="text-4xl font-bold text-pink-600">
          {product.name}
        </h1>

        <p className="text-2xl font-bold mt-4">
          {product.price}
        </p>

        <p className="mt-6 text-gray-600">
          {product.description}
        </p>

        <button className="mt-8 bg-pink-600 text-white px-8 py-3 rounded-lg hover:bg-pink-700">
          Add to Cart
        </button>
      </div>
    </div>
  );
}