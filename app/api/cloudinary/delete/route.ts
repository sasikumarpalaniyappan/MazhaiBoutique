import { createHash } from "crypto";
import { NextResponse } from "next/server";

const getServerConfig = () => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Missing Cloudinary server config. Set CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, and NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.");
  }

  return { cloudName, apiKey, apiSecret };
};

const buildSignature = (publicId: string, timestamp: number, apiSecret: string) => {
  const signatureBase = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  return createHash("sha1").update(signatureBase).digest("hex");
};

export async function POST(request: Request) {
  try {
    const { publicId } = (await request.json()) as { publicId?: string };

    if (!publicId || typeof publicId !== "string") {
      return NextResponse.json({ error: "publicId is required" }, { status: 400 });
    }

    const { cloudName, apiKey, apiSecret } = getServerConfig();
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = buildSignature(publicId, timestamp, apiSecret);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        public_id: publicId,
        timestamp: String(timestamp),
        api_key: apiKey,
        signature,
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const message = payload?.error?.message || "Cloudinary destroy request failed";
      return NextResponse.json({ error: message }, { status: response.status });
    }

    return NextResponse.json(payload ?? { result: "ok" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
