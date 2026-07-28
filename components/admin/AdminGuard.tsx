"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasSupabaseEnv, supabaseClient } from "@/lib/supabaseClient";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<null | boolean>(null);
  const [guardError, setGuardError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!hasSupabaseEnv) {
      setAllowed(false);
      setGuardError("Admin is unavailable because Supabase environment variables are not configured in this deployment.");
      return;
    }

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
        setGuardError(e instanceof Error ? e.message : "Unable to verify admin access.");
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

  if (guardError) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-2xl rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {guardError}
        </div>
      </div>
    );
  }

  if (!allowed) return null;

  return <>{children}</>;
}
