"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import emailjs from "@emailjs/browser";
import { useCart } from "@/components/context/CartContext";

// EmailJS Configuration - Replace these with your credentials
const EMAILJS_SERVICE_ID = "service_7dt6egj";
const EMAILJS_TEMPLATE_ID = "template_xfkroy2";
const EMAILJS_PUBLIC_KEY = "cVzLRJ7k-cJz9FaxU";

// Initialize EmailJS on component mount
if (typeof window !== "undefined") {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [phoneDisplay, setPhoneDisplay] = useState("");

  useEffect(() => {
    if (!isOrderComplete) return;
    clearCart();
  }, [isOrderComplete, clearCart]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = Number(String(item.price).replace(/[^0-9]/g, ""));
      return total + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const formatOrderDetails = (): string => {
    return cartItems
      .map(
        (item) =>
          `${item.quantity}x ${item.name} (${item.selectedSize || "Standard"}) - ₹${Number(String(item.price).replace(/[^0-9]/g, "")).toLocaleString()}`
      )
      .join("\n");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone.replace(/\D/g, "");
    const trimmedAddress = formData.address.trim();

    // Validation
    if (!trimmedName || !trimmedPhone || !trimmedAddress) {
      setError("Please fill in all required fields (Name, Phone, Address).");
      return;
    }

    if (trimmedPhone.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty. Please add items before placing an order.");
      return;
    }

    setError("");
    setIsLoading(true);
    setPhoneDisplay(trimmedPhone);

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          customer_name: trimmedName,
          customer_phone: trimmedPhone,
          customer_address: trimmedAddress,
          customer_email: formData.email.trim() || "Not provided",
          order_details: formatOrderDetails(),
          grand_total: `₹${totalPrice.toLocaleString()}`,
        }
      );

      setIsOrderComplete(true);
    } catch (emailError) {
      setError(
        "Failed to send order. Please check your EmailJS configuration and try again."
      );
      console.error("EmailJS Error:", emailError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#fffafc_0%,#fff4f7_100%)] px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl">
        {!isOrderComplete ? (
          <>
            <div className="mb-10">
              <p className="text-sm uppercase tracking-[0.35em] text-rose-500">
                Premium Checkout Experience
              </p>
              <h1 className="mt-2 text-5xl font-bold text-gray-900">
                Secure Your Order
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-gray-600">
                Complete your information and we'll send a confirmation to your email.
              </p>
            </div>

            <div className="grid gap-10 md:grid-cols-[0.95fr_1.05fr]">
              {/* Order Summary */}
              <div className="rounded-[2rem] border border-rose-100 bg-white p-6 shadow-[0_25px_80px_-30px_rgba(190,24,93,0.35)] sm:p-8">
                <p className="text-sm uppercase tracking-[0.35em] text-rose-500">
                  Order Summary
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                  Your Cart
                </h2>

                {cartItems.length === 0 ? (
                  <p className="mt-6 text-gray-500">Your cart is empty.</p>
                ) : (
                  <>
                    <div className="mt-6 space-y-4">
                      {cartItems.map((item) => (
                        <div
                          key={`${item.id}-${item.selectedSize || "Standard"}`}
                          className="flex items-start justify-between border-b border-rose-50 pb-4 last:border-b-0"
                        >
                          <div className="flex gap-4">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-16 w-16 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900">
                                {item.name}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {item.selectedSize || "Standard"} • Qty {item.quantity}
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold text-rose-600">
                            ₹{(Number(String(item.price).replace(/[^0-9]/g, "")) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 border-t border-rose-100 pt-6">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">
                          Grand Total
                        </span>
                        <span className="text-2xl font-bold text-rose-600">
                          ₹{totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 text-xs text-gray-500">
                      ✓ All prices include applicable taxes.
                    </p>
                  </>
                )}
              </div>

              {/* Checkout Form */}
              <form
                onSubmit={handleSubmit}
                className="rounded-[2rem] border border-rose-100 bg-white p-6 shadow-[0_25px_80px_-30px_rgba(190,24,93,0.35)] sm:p-8"
              >
                <p className="text-sm uppercase tracking-[0.35em] text-rose-500">
                  Delivery Information
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                  Checkout
                </h2>

                {error && (
                  <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                    {error}
                  </div>
                )}

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-700">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="10-digit phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="your@email.com (optional)"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-700">
                      Delivery Address *
                    </label>
                    <textarea
                      name="address"
                      placeholder="Street address, apartment, building number, etc."
                      value={formData.address}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
                      rows={4}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-8 w-full rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Processing..." : "Place Order"}
                </button>

                <p className="mt-4 text-center text-xs text-gray-500">
                  We'll send a confirmation email shortly.
                </p>
              </form>
            </div>
          </>
        ) : (
          /* Success View */
          <div className="rounded-[2rem] border border-rose-100 bg-white p-8 shadow-[0_25px_80px_-30px_rgba(190,24,93,0.35)] sm:p-10">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-600 text-4xl text-white shadow-lg">
                ✓
              </div>
              <h2 className="mt-8 text-4xl font-bold text-gray-900 sm:text-5xl">
                Order Received!
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Thank you for choosing <span className="font-semibold text-rose-600">Mazhai Boutique</span>. We will contact you at <span className="font-semibold text-rose-600">+91 {phoneDisplay}</span> shortly to confirm your delivery and manual payment details.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                A confirmation email has been sent to the owner.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/"
                  className="rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
                >
                  Continue Shopping
                </Link>
                <Link
                  href="/wishlist"
                  className="rounded-full border border-rose-200 px-6 py-3 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50"
                >
                  View Wishlist
                </Link>
              </div>

              <div className="mt-8 rounded-xl border border-rose-100 bg-rose-50 px-6 py-4 text-sm text-gray-600">
                Your cart has been cleared and is ready for new selections.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
