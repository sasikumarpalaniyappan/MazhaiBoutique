"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/context/CartContext";

const WHATSAPP_NUMBER = "+919876543210";

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

  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = Number(String(item.price).replace(/[^0-9]/g, ""));
      return total + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const buildWhatsAppMessage = () => {
    const lines = [
      "*Mazhai Boutique Order*",
      "",
      `*Customer:* ${formData.name}`,
      `*Phone:* ${formData.phone}`,
      `*Email:* ${formData.email}`,
      `*Address:* ${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
      "",
      "*Items:*",
      ...cartItems.map(
        (item) =>
          `- ${item.name} (${item.selectedSize || "Standard"}) x${item.quantity} - ${item.price}`
      ),
      "",
      `*Total:* ₹${totalPrice.toLocaleString()}`,
      "",
      "Please confirm the order and share payment details.",
    ];

    return encodeURIComponent(lines.join("\n"));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.address || !formData.email) {
      setError("Please fill in all required fields before placing your order.");
      return;
    }

    setError("");

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage()}`;

    clearCart();
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    router.push("/order-success");
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-32">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.3em] text-rose-500">
          No-payment order flow
        </p>
        <h1 className="mt-2 text-5xl font-bold text-rose-600">
          Checkout
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-gray-600">
          Share your details and we’ll confirm your order manually over WhatsApp.
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[1.5rem] border border-rose-100 bg-white p-6 shadow-lg">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Order Summary
          </h2>

          {cartItems.length === 0 ? (
            <p className="text-gray-500">Your cart is empty.</p>
          ) : (
            <>
              {cartItems.map((item) => (
                <div
                  key={`${item.id}-${item.selectedSize || "Standard"}`}
                  className="flex items-center justify-between border-b border-gray-100 py-4"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {item.selectedSize || "Standard"} • Qty {item.quantity}
                    </p>
                  </div>

                  <p className="font-bold text-rose-600">
                    ₹{(Number(String(item.price).replace(/[^0-9]/g, "")) * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}

              <div className="mt-6 flex items-center justify-between text-2xl font-bold">
                <span>Total</span>
                <span className="text-rose-600">₹{totalPrice.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[1.5rem] border border-rose-100 bg-white p-6 shadow-lg"
        >
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Delivery Details
          </h2>

          {error ? (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="mt-4 w-full rounded-lg border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-rose-500"
            required
          />

          <textarea
            name="address"
            placeholder="Delivery Address"
            value={formData.address}
            onChange={handleChange}
            className="mt-4 w-full rounded-lg border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-rose-500"
            rows={4}
            required
          />

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />

            <input
              type="text"
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />

            <input
              type="text"
              name="pincode"
              placeholder="Pincode"
              value={formData.pincode}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Place Order via WhatsApp
          </button>
        </form>
      </div>
    </div>
  );
}