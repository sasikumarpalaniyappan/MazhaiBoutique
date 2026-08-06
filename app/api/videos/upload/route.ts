import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

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

    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    const publicUrl = publicData?.publicUrl || "";

    // Insert record into videos table if exists
    try {
      await supabase.from("videos").insert([{ name, path: filePath, url: publicUrl }]);
    } catch (_) {
      // ignore insert errors if table does not exist
    }

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
