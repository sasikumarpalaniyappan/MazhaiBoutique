"use client";

import Link from "next/link";
import { useCart } from "@/components/context/CartContext";

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalPrice = cartItems.reduce((total, item) => {
    const price = Number(
      item.price.replace("₹", "").replace(",", "")
    );

    return total + price * item.quantity;
  }, 0);

  return (
    <div className="max-w-6xl mx-auto px-6 py-32">
      <h1 className="text-5xl font-bold text-pink-600 mb-10">
        Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <p className="text-xl text-gray-500">
            Your cart is empty.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-28 h-28 object-cover rounded-lg"
                  />

                  <div>
                    <h2 className="text-3xl font-bold">
                      {item.name}
                    </h2>

                    <p className="text-pink-600 text-2xl font-bold mt-2">
                      {item.price}
                    </p>

                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="bg-gray-200 px-3 py-1 rounded"
                      >
                        -
                      </button>

                      <span className="font-semibold text-lg">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className="bg-gray-200 px-3 py-1 rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-10 text-right">
            <h2 className="text-3xl font-bold">
              Total Items: {totalItems}
            </h2>

            <h2 className="text-3xl font-bold mt-3">
              Total: ₹{totalPrice.toLocaleString()}
            </h2>

            <Link href="/checkout">
              <button className="mt-6 bg-pink-600 text-white px-8 py-3 rounded-lg hover:bg-pink-700">
                Proceed to Checkout
              </button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}