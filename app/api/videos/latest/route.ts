import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  try {
    const { data, error } = await supabase.from("videos").select("*").order("created_at", { ascending: false }).limit(1);
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
