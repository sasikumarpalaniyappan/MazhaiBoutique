import Link from "next/link";

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-5xl font-bold text-green-600 mb-6">
        Order Placed Successfully!
      </h1>

      <p className="text-xl text-gray-600 mb-8">
        Thank you for shopping with Boutique Bliss.
      </p>

      <p className="text-lg text-gray-500 mb-10">
        Your order is being processed and you will receive
        confirmation details soon.
      </p>

      <Link href="/">
        <button className="bg-pink-600 text-white px-8 py-3 rounded-lg hover:bg-pink-700">
          Continue Shopping
        </button>
      </Link>
    </div>
  );
}