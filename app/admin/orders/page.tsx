"use client";

import { useEffect, useState } from "react";

type OrderItem = {
  id: string;
  name: string;
  price: string | number;
  quantity: number;
  image?: string;
};

type OrderRecord = {
  id: string;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
  };
  items: OrderItem[];
  total: number;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    try {
      const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      setOrders(Array.isArray(storedOrders) ? storedOrders : []);
    } catch {
      setOrders([]);
    }
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
        <p className="text-sm text-gray-500">Review customer orders placed from the storefront.</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-rose-200 bg-white p-10 text-center text-gray-600">
          No orders have been placed yet.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-rose-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 border-b border-rose-100 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-rose-600">{order.id}</p>
                  <h2 className="text-xl font-semibold text-gray-900">{order.customer.name}</h2>
                  <p className="text-sm text-gray-500">{order.customer.phone}</p>
                </div>
                <div className="text-sm text-gray-600">
                  <p><span className="font-semibold">Email:</span> {order.customer.email || "—"}</p>
                  <p><span className="font-semibold">Placed:</span> {new Date(order.createdAt).toLocaleString()}</p>
                  <p><span className="font-semibold">Total:</span> ₹{order.total.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-sm font-semibold text-gray-700">Delivery Address</p>
                <p className="text-sm text-gray-600">{order.customer.address}</p>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-sm font-semibold text-gray-700">Items</p>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={`${order.id}-${item.id}`} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm text-gray-600">
                      <span>{item.name} × {item.quantity}</span>
                      <span>₹{(Number(item.price) || 0) * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
