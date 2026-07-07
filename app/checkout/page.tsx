"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/context/CartContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart } = useCart();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const totalPrice = cartItems.reduce((total, item) => {
    const price = Number(item.price.replace(/[^0-9]/g, ""));

    return total + price * item.quantity;
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Later this will save the order to a database
    console.log("Order Details:", formData);

    clearCart();

    // Redirect to success page
    router.push("/order-success");
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-32">
      <h1 className="text-5xl font-bold text-pink-600 mb-10">
        Checkout
      </h1>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Order Summary */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">
            Order Summary
          </h2>

          {cartItems.length === 0 ? (
            <p className="text-gray-500">
              Your cart is empty.
            </p>
          ) : (
            <>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border-b py-4"
                >
                  <div>
                    <h3 className="font-semibold text-lg">
                      {item.name}
                    </h3>

                    <p className="text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <p className="font-bold text-pink-600">
                    ₹
                    {(
                      Number(item.price.replace(/[^0-9]/g, "")) *
                      item.quantity
                    ).toLocaleString()}
                  </p>
                </div>
              ))}

              <div className="flex justify-between mt-6 text-2xl font-bold">
                <span>Total</span>

                <span className="text-pink-600">
                  ₹{totalPrice.toLocaleString()}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Shipping Details */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-xl p-6"
        >
          <h2 className="text-2xl font-bold mb-6">
            Shipping Details
          </h2>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg mb-4"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg mb-4"
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg mb-4"
            required
          />

          <textarea
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg mb-4"
            rows={4}
            required
          />

          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg mb-4"
            required
          />

          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg mb-4"
            required
          />

          <input
            type="text"
            name="pincode"
            placeholder="Pincode"
            value={formData.pincode}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg mb-6"
            required
          />

          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700"
          >
            Place Order
          </button>
        </form>
      </div>
    </div>
  );
}