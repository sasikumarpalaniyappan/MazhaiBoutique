"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/context/CartContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart } = useCart();
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", address: "" });

  // keep local snapshot for rendering (CartContext may be empty if user navigates directly)
  const [items, setItems] = useState(cartItems);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) setItems(parsed);
        else setItems(cartItems);
      } else {
        setItems(cartItems);
      }
    } catch {
      setItems(cartItems);
    }
  }, [cartItems]);

  const totalPrice = items.reduce(
    (s: number, it: any) => s + ((Number(String(it.price).replace(/[^0-9.]/g, "")) || 0) * it.quantity),
    0
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // minimal validation
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Please complete the required fields.");
      return;
    }

    // clear cart then redirect to success
    try {
      clearCart();
    } catch {}

    router.push("/order-success");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <p className="text-sm text-rose-500 tracking-widest">PREMIUM CHECKOUT EXPERIENCE</p>
          <h1 className="text-5xl font-extrabold text-gray-900 mt-3" style={{ fontFamily: "Cormorant, serif", fontStyle: "italic" }}>
            Secure Your Order
          </h1>
          <p className="text-gray-600 mt-3">Complete your information and we'll send a confirmation to your email.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-rose-100">
            <div className="mb-6">
              <h3 className="text-sm tracking-widest text-rose-500">ORDER SUMMARY</h3>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">Your Cart</h2>
            </div>

            {items.length === 0 ? (
              <p className="text-gray-600">Your cart is empty.</p>
            ) : (
              <div className="space-y-4">
                {items.map((it: any) => (
                  <div key={`${it.id}-${it.selectedSize || "std"}`} className="flex items-center gap-4">
                    <img
                      src={it.image || ('data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="#fff0f2"/></svg>'))}
                      alt={it.name}
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{it.name}</div>
                      <div className="text-sm text-gray-500">Qty: {it.quantity}</div>
                    </div>
                    <div className="font-semibold text-gray-800">₹{((Number(String(it.price).replace(/[^0-9.]/g, "")) || 0) * it.quantity).toLocaleString()}</div>
                  </div>
                ))}

                <div className="mt-4 border-t border-rose-100 pt-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-lg font-bold">Total</div>
                  <div className="text-2xl font-extrabold text-rose-600">₹{totalPrice.toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-rose-100">
            <div className="mb-6">
              <h3 className="text-sm tracking-widest text-rose-500">DELIVERY INFORMATION</h3>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">Checkout</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">Full Name *</label>
                <input name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border border-rose-100 rounded-lg focus:ring-2 focus:ring-rose-200 outline-none" placeholder="Your full name" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">Phone Number *</label>
                <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border border-rose-100 rounded-lg focus:ring-2 focus:ring-rose-200 outline-none" placeholder="10-digit phone number" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">Email Address</label>
                <input name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border border-rose-100 rounded-lg focus:ring-2 focus:ring-rose-200 outline-none" placeholder="your@email.com (optional)" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">Delivery Address *</label>
                <textarea name="address" value={formData.address} onChange={handleChange} rows={4} className="w-full px-4 py-3 border border-rose-100 rounded-lg focus:ring-2 focus:ring-rose-200 outline-none" placeholder="Street address, apartment, building number, etc." />
              </div>

              <div>
                <button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-full transition">Place Order</button>
              </div>

              <p className="text-center text-sm text-gray-500">We'll send a confirmation email shortly.</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
