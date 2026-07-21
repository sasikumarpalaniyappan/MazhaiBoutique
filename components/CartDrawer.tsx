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
        className={`fixed right-0 top-0 z-[70] flex h-full w-full sm:max-w-md flex-col border-l border-rose-100 bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-rose-100 px-4 sm:px-6 py-3 sm:py-5">
          <div>
            <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-rose-600">
              Your Cart
            </p>
            <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">
              {cartCount} item{cartCount === 1 ? "" : "s"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-200 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:border-rose-600 hover:text-rose-700"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-5">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center rounded-xl sm:rounded-2xl border border-dashed border-rose-200 bg-rose-50 p-4 sm:p-8 text-center">
              <p className="text-base sm:text-xl font-semibold text-gray-800">Your cart is empty</p>
              <p className="mt-2 text-xs sm:text-sm text-gray-600">
                Add a few pieces to begin your boutique experience.
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {cartItems.map((item) => (
                <div
                  key={`${item.id}-${item.selectedSize || "Standard"}`}
                  className="rounded-lg sm:rounded-2xl border border-gray-100 bg-white p-3 sm:p-4 shadow-sm"
                >
                  <div className="flex gap-3 sm:gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg sm:rounded-xl object-cover flex-shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2 sm:gap-3">
                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                            {item.name}
                          </h3>
                          <p className="mt-1 text-xs sm:text-sm text-gray-500">
                            Size: {item.selectedSize || "Standard"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id, item.selectedSize)}
                          className="text-xs sm:text-sm text-rose-600 hover:text-rose-800 whitespace-nowrap flex-shrink-0"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-3 sm:mt-4 flex items-center justify-between gap-2">
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
                            className="px-2.5 sm:px-3 py-1 text-base sm:text-lg text-gray-600"
                          >
                            −
                          </button>
                          <span className="min-w-8 text-center text-xs sm:text-sm font-semibold">
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
                            className="px-2.5 sm:px-3 py-1 text-base sm:text-lg text-gray-600"
                          >
                            +
                          </button>
                        </div>

                        <p className="text-sm sm:text-base font-semibold text-rose-700 flex-shrink-0">
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

        <div className="border-t border-rose-100 bg-rose-50/70 px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between text-base sm:text-lg font-semibold text-gray-800">
            <span>Subtotal</span>
            <span>₹{cartTotal.toLocaleString()}</span>
          </div>

          <Link href="/checkout" onClick={onClose}>
            <button
              type="button"
              className="mt-3 sm:mt-4 w-full rounded-full bg-rose-600 px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Proceed to Order
            </button>
          </Link>
        </div>
      </aside>
    </>
  );
}


