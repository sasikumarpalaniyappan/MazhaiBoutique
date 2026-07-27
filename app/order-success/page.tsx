"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/context/CartContext";

export default function OrderSuccessPage() {
  const { clearCart } = useCart();
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [orderNumber, setOrderNumber] = useState("");
  const [orderTotal, setOrderTotal] = useState(0);

  useEffect(() => {
    try {
      const lastOrderJson = localStorage.getItem("lastOrder");
      let order: any = null;

      if (lastOrderJson) {
        order = JSON.parse(lastOrderJson);
      } else {
        const ordersJson = localStorage.getItem("orders");
        if (ordersJson) {
          const savedOrders = JSON.parse(ordersJson);
          if (Array.isArray(savedOrders) && savedOrders.length > 0) {
            order = savedOrders[0];
          }
        }
      }

      if (order) {
        setOrderItems(order.items || []);
        setOrderTotal(order.total || 0);
        setOrderNumber(
          order.id
            ? `#${String(order.id).replace(/^ORD-/, "").slice(-9).toUpperCase()}`
            : ""
        );
      }

      if (lastOrderJson) {
        localStorage.removeItem("lastOrder");
      }
    } catch (error) {
      console.error("Unable to load order:", error);
    }

    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="max-w-3xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-8">
          <div className="text-center md:text-left">
            <div className="mb-6">
              <svg className="w-16 h-16 mx-auto md:mx-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Cormorant, serif", fontStyle: "italic" }}>
              Order Confirmed!
            </h1>

            <p className="text-gray-600 mb-2">Thank you for your order</p>
            <p className="text-gray-600 mb-6">We'll send you shipping details via email shortly</p>

            <div className="bg-white rounded-lg p-6 border border-rose-100 mb-6 inline-block">
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="text-2xl font-bold text-rose-600">{orderNumber}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-rose-100 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Summary</h2>

            {orderItems.length > 0 ? (
              <div className="space-y-4">
                {orderItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <img
                      src={
                        item.image ||
                        'data:image/svg+xml;utf8,' +
                          encodeURIComponent(
                            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#fff0f2"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9f1239" font-family="Arial" font-size="24">Saree</text></svg>'
                          )
                      }
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-md border"
                    />
                    <div className="flex-1">
                      <div className="text-gray-700 font-semibold">{item.name}</div>
                      <div className="text-sm text-gray-500">x{item.quantity}</div>
                    </div>
                    <div className="text-gray-700 font-semibold">₹{((Number(String(item.price).replace(/[^0-9.]/g, "")) || 0) * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-600">No items to show</div>
            )}

            <div className="mt-4 border-t border-rose-100 pt-4">
              <div className="flex justify-between text-gray-600 text-sm mb-2">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-rose-600">₹{orderTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-rose-100 shadow-sm">
          <Link
            href="/#featured"
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-lg transition text-center block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
