"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/context/CartContext";

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const {
    cartItems,
    cartCount,
    cartTotal,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/35 transition-all duration-300 ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-rose-100 bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-rose-100 px-6 py-5">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-rose-500">
              Your Cart
            </p>
            <h2 className="text-2xl font-semibold text-gray-900">
              {cartCount} item{cartCount === 1 ? "" : "s"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:border-rose-300 hover:text-rose-600"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-rose-50 p-8 text-center">
              <p className="text-xl font-semibold text-gray-800">Your cart is empty</p>
              <p className="mt-2 text-sm text-gray-600">
                Add a few pieces to begin your boutique experience.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={`${item.id}-${item.selectedSize || "Standard"}`}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-24 w-24 rounded-xl object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">
                            {item.name}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Size: {item.selectedSize || "Standard"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id, item.selectedSize)}
                          className="text-sm text-rose-500 hover:text-rose-700"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-gray-200">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.selectedSize,
                                Math.max(0, item.quantity - 1)
                              )
                            }
                            className="px-3 py-1 text-lg text-gray-600"
                          >
                            −
                          </button>
                          <span className="min-w-8 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.selectedSize,
                                item.quantity + 1
                              )
                            }
                            className="px-3 py-1 text-lg text-gray-600"
                          >
                            +
                          </button>
                        </div>

                        <p className="text-base font-semibold text-rose-600">
                          {item.price}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-rose-100 bg-rose-50/70 px-6 py-5">
          <div className="flex items-center justify-between text-lg font-semibold text-gray-800">
            <span>Subtotal</span>
            <span>₹{cartTotal.toLocaleString()}</span>
          </div>

          <Link href="/checkout" onClick={onClose}>
            <button
              type="button"
              className="mt-4 w-full rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Proceed to Order
            </button>
          </Link>
        </div>
      </aside>
    </>
  );
}
