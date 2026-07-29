"use client";

import AdminGuard from "@/components/admin/AdminGuard";
import HeroEditor from "@/components/admin/HeroEditor";

export default function HeroEditorPage() {
  return (
    <AdminGuard>
      <main className="min-h-screen bg-gray-50">
        <HeroEditor />
      </main>
    </AdminGuard>
  );
}
