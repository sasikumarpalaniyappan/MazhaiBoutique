"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<null | boolean>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        router.push("/login");
        setAllowed(false);
        return;
      }

      if (!db) {
        // If Firestore not initialized, deny
        setAllowed(false);
        router.push("/login");
        return;
      }

      try {
        // Check admins collection by uid
        const adminDoc = await getDoc(doc(db as any, "admins", user.uid));
        if (adminDoc.exists()) {
          setAllowed(true);
          return;
        }

        // Fallback: check by email field in admins collection
        const q = query(collection(db as any, "admins"), where("email", "==", user.email || ""));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setAllowed(true);
          return;
        }

        // Not an admin
        setAllowed(false);
        router.push("/login");
      } catch (e) {
        console.error("AdminGuard error:", e);
        setAllowed(false);
        router.push("/login");
      }
    });

    return () => unsub();
  }, [router]);

  if (allowed === null) {
    return <div className="p-8">Checking admin access...</div>;
  }

  if (!allowed) return null;

  return <>{children}</>;
}
