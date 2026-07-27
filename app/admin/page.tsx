"use client";

import AdminGuard from "@/components/admin/AdminGuard";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  return (
    <AdminGuard>
      <main className="min-h-screen bg-gray-50">
        <AdminDashboard />
      </main>
    </AdminGuard>
  );
}
