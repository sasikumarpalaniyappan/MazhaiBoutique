import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase server configuration. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

export const runtime = "edge";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from("videos").select("*").order("created_at", { ascending: false }).limit(1);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const latest = data && data.length ? data[0] : null;
    return NextResponse.json({ video: latest });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
