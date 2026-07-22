"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkIsAdmin = async (userUid: string, userEmail?: string | null) => {
    if (!db) return false;
    try {
      const adminDoc = await getDoc(doc(db as any, "admins", userUid));
      if (adminDoc.exists()) return true;
      const q = query(collection(db as any, "admins"), where("email", "==", userEmail || ""));
      const snap = await getDocs(q);
      return !snap.empty;
    } catch (e) {
      console.error("admin check error", e);
      return false;
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const auth = getAuth();
      const res = await signInWithEmailAndPassword(auth, email, password);
      const user = res.user;
      const isAdmin = await checkIsAdmin(user.uid, user.email);
      if (isAdmin) {
        router.push("/admin");
      } else {
        setError("This account is not an admin. Contact the site owner.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 sm:p-10">
        <h1 className="text-3xl font-bold text-rose-700 mb-2 text-center" style={{ fontFamily: "Cormorant, serif", fontStyle: "italic" }}>
          Welcome Back
        </h1>
        <p className="text-center text-gray-600 mb-8">Sign in to your account</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-transparent outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 rounded-lg transition mt-6 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {error && <p className="text-center text-red-600 mt-4">{error}</p>}

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link href="/register" className="text-rose-600 hover:text-rose-700 font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
