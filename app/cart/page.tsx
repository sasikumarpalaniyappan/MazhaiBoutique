"use client";

import Link from "next/link";
import { useCart } from "@/components/context/CartContext";
import CartIcon from "@/components/CartIcon";

export default function CartPage() {
  const { cartItems, removeFromCart } = useCart();

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (Number(String(item.price).replace(/[^0-9.]/g, "")) || 0) * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-rose-700 mb-12 text-center" style={{ fontFamily: "Cormorant, serif", fontStyle: "italic" }}>
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50 p-12 text-center">
            <CartIcon size={48} className="mx-auto mb-4 text-rose-400" />
            <p className="text-gray-600 mb-6">Your cart is empty</p>
            <Link
              href="/#featured"
              className="inline-block bg-rose-600 hover:bg-rose-700 text-white font-semibold px-8 py-3 rounded-full transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.selectedSize || "Standard"}`} className="flex gap-4 bg-white rounded-lg p-4 shadow-sm border border-rose-100">
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">Size: {item.selectedSize || "Standard"}</p>
                    <p className="text-rose-600 font-semibold">{item.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    <button
                      onClick={() => removeFromCart(item.id, item.selectedSize)}
                      className="mt-2 text-rose-600 hover:text-rose-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg border border-rose-100 h-fit">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6 pb-6 border-b border-rose-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-lg mb-6">
                <span>Total</span>
                <span className="text-rose-600">₹{totalPrice.toLocaleString()}</span>
              </div>
              <Link
                href="/checkout"
                className="w-full block text-center bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
