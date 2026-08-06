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

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;
    const name = (form.get("name") as string) || (file && (file as any).name) || `video-${Date.now()}`;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const bucket = "videos";
    const filePath = `${Date.now()}-${name}`;

    const { error: uploadError } = await supabaseAdmin.storage.from(bucket).upload(filePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicData } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
    const publicUrl = publicData?.publicUrl || "";

    const { error: insertError } = await supabaseAdmin
      .from("videos")
      .insert([{ name, path: filePath, url: publicUrl }]);

    if (insertError) {
      console.warn("Video metadata insert failed:", insertError.message);
    }

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
