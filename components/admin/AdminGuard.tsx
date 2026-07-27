"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<null | boolean>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkAdmin = async () => {
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();

        if (sessionError || !session?.user) {
          // No authenticated user - redirect to login
          setAllowed(false);
          router.push("/login");
          return;
        }

        // Check if user exists in admins table
        const { data, error } = await supabaseClient
          .from("admins")
          .select("*")
          .or(`uid.eq.${session.user.id},email.eq.${session.user.email}`)
          .limit(1)
          .single();

        if (error || !data) {
          setAllowed(false);
          router.push("/login");
          return;
        }

        setAllowed(true);
      } catch (e) {
        console.error("AdminGuard error:", e);
        setAllowed(false);
        router.push("/");
      }
    };

    checkAdmin();

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setAllowed(false);
        router.push("/login");
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  if (allowed === null) {
    return <div className="p-8">Checking admin access...</div>;
  }

  if (!allowed) return null;

  return <>{children}</>;
}
