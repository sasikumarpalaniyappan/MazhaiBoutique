import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { products as fallbackProducts } from "@/components/data/products";

type CatalogProduct = {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  originalPrice?: string;
  salePrice?: string;
  thumbnailImage: string;
  galleryImages: string[];
  availableSizes: string[];
};

function normalizeWord(value: string) {
  return value.trim().toLowerCase();
}

function extractColor(input: string): string | null {
  const text = input.toLowerCase();
  const knownColors = [
    "red",
    "maroon",
    "wine",
    "purple",
    "pink",
    "blue",
    "navy",
    "green",
    "olive",
    "gold",
    "yellow",
    "orange",
    "peach",
    "cream",
    "white",
    "black",
    "brown",
    "silver",
    "grey",
    "gray",
    "floral",
  ];

  const found = knownColors.find((color) => text.includes(color));
  return found ?? null;
}

async function getCatalogFromSupabase(): Promise<CatalogProduct[]> {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, title, name, description, category, price, original_price, sale_price, thumbnail_image, image, gallery_images, available_sizes, created_at"
      )
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.warn("Chat catalog read failed:", error);
      return fallbackProducts.map((product, index) => ({
        id: String(product.id ?? index + 1),
        title: product.name,
        description: "Boutique collection item",
        category: product.name.toLowerCase().includes("dress") ? "Dresses" : "Sarees",
        price: product.price,
        originalPrice: product.price,
        thumbnailImage: product.image,
        galleryImages: [product.image],
        availableSizes: ["Standard"],
      }));
    }

    return data.map((row: any) => {
      const galleryImages = Array.isArray(row.gallery_images) ? row.gallery_images : [];
      const primaryImage = String(
        row.thumbnail_image ?? row.image ?? galleryImages[0] ?? ""
      );

      return {
        id: String(row.id),
        title: String(row.title ?? row.name ?? "Mazhai Product"),
        description: String(row.description ?? ""),
        category: String(row.category ?? "Sarees"),
        price: String(row.price ?? row.sale_price ?? row.original_price ?? "0"),
        originalPrice: String(row.original_price ?? row.price ?? "0"),
        salePrice: row.sale_price ? String(row.sale_price) : undefined,
        thumbnailImage: primaryImage,
        galleryImages: Array.from(
          new Set([primaryImage, ...(galleryImages || [])].filter(Boolean) as string[])
        ),
        availableSizes: Array.isArray(row.available_sizes) ? row.available_sizes : [],
      };
    });
  } catch (error) {
    console.error("Catalog load error:", error);
    return fallbackProducts.map((product, index) => ({
      id: String(product.id ?? index + 1),
      title: product.name,
      description: "Boutique collection item",
      category: product.name.toLowerCase().includes("dress") ? "Dresses" : "Sarees",
      price: product.price,
      originalPrice: product.price,
      thumbnailImage: product.image,
      galleryImages: [product.image],
      availableSizes: ["Standard"],
    }));
  }
}

function getBotReply(input: string): string {
  const normalized = input.trim().toLowerCase();

  if (normalized.includes("new") || normalized.includes("arrivals")) {
    return "Our newest collection features handwoven sarees, soft celebratory dresses, and statement accessories for timeless occasions.";
  }

  if (normalized.includes("gift")) {
    return "For thoughtful gifting, our silk scarves, layered jewelry sets, and elegant wraps make beautiful, memorable presents.";
  }

  if (normalized.includes("size") || normalized.includes("fit")) {
    return "We can guide you to the most flattering fit. Share the style you love and I'll recommend the best option.";
  }

  if (normalized.includes("ship") || normalized.includes("delivery")) {
    return "We offer reliable shipping and express delivery options, with free delivery on orders above ₹1500.";
  }

  if (normalized.includes("contact") || normalized.includes("help")) {
    return "You can reach our styling team at hello@mazhaiboutique.com or through the contact page on our website.";
  }

  if (normalized.includes("style") || normalized.includes("look")) {
    return "A graceful boutique look often begins with a refined silhouette, a rich texture, and one standout accessory.";
  }

  return "Thank you for visiting Mazhai Boutique. I can help you browse the collection, find a gift, or answer shipping questions.";
}

async function getProviderReply(input: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return getBotReply(input);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
      contents: `You are Mazhai Boutique's AI shopping assistant. Reply warmly and concisely about boutique products, gifts, sizing, shipping, styling, collections, and customer support. Only answer based on Mazhai Boutique information.\n\nUser: ${input}`,
    });

    const providerText = typeof response?.text === "string" ? response.text.trim() : "";
    if (providerText.length > 0) {
      return providerText;
    }

    return getBotReply(input);
  } catch (error) {
    console.error("Gemini API error:", error);
    return getBotReply(input);
  }
}

function detectAction(message: string): "add_to_cart" | "add_to_wishlist" | "clear_cart" | "empty_wishlist" | null {
  const lower = message.toLowerCase();

  if (
    lower.includes("add to cart") ||
    lower.includes("add the product") ||
    lower.includes("add this") ||
    lower.includes("add it") ||
    (lower.includes("add") && (lower.includes("cart") || lower.includes("shopping cart")))
  ) {
    return "add_to_cart";
  }

  if (
    lower.includes("add to wishlist") ||
    lower.includes("add to wish list") ||
    lower.includes("move to wishlist") ||
    lower.includes("move to wish list") ||
    (lower.includes("wishlist") && (lower.includes("add") || lower.includes("move")))
  ) {
    return "add_to_wishlist";
  }

  if (
    lower.includes("clear cart") ||
    lower.includes("clear the cart") ||
    lower.includes("empty cart") ||
    lower.includes("empty the cart") ||
    lower.includes("remove all from cart")
  ) {
    return "clear_cart";
  }

  if (
    lower.includes("empty wishlist") ||
    lower.includes("empty the wishlist") ||
    lower.includes("clear wishlist") ||
    lower.includes("clear the wishlist") ||
    lower.includes("remove all from wishlist")
  ) {
    return "empty_wishlist";
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid message" },
        { status: 400 }
      );
    }

    const catalog = await getCatalogFromSupabase();
    const lowerMessage = message.toLowerCase();
    const colorWord = extractColor(lowerMessage);
    const detectedAction = detectAction(message);

    const catalogMatches = catalog.filter((product) => {
      const combined = `${product.title} ${product.description} ${product.category} ${product.availableSizes.join(" ")}`.toLowerCase();

      const isColorRequested = Boolean(colorWord);
      const colorMatchesProduct = !isColorRequested || combined.includes(colorWord as string);

      const isProductQuestion =
        lowerMessage.includes("product") ||
        lowerMessage.includes("products") ||
        lowerMessage.includes("collection") ||
        lowerMessage.includes("saree") ||
        lowerMessage.includes("dress") ||
        lowerMessage.includes("details") ||
        lowerMessage.includes("price") ||
        lowerMessage.includes("show") ||
        lowerMessage.includes("catalog") ||
        lowerMessage.includes("look") ||
        lowerMessage.includes("available");

      const requestedProductMatches =
        !isProductQuestion ||
        combined.includes(lowerMessage.replace(/what|where|show|give|me|the|a|an|and|for|about|please|tell|is|i|want|need|of|to|details|details of|product/g, "").trim()) ||
        false;

      return colorMatchesProduct && (isProductQuestion || requestedProductMatches || true);
    });

    const matchedProducts = colorWord
      ? catalog.filter((product) => {
          const title = `${product.title} ${product.description} ${product.category}`.toLowerCase();
          return title.includes(colorWord);
        })
      : catalogMatches;

    const selectedProducts = matchedProducts.slice(0, 4);

    const reply = await getProviderReply(message);

    let assistantReply = reply;

    if (selectedProducts.length > 0) {
      const productList = selectedProducts
        .map((product) => {
          const detailLabel = colorWord
            ? `${colorWord} ${product.category || "product"} available`
            : product.title;

          return `${detailLabel}: ${product.title}, ${product.description || "Boutique collection piece"}. Price ${product.price}. Sizes: ${product.availableSizes.length ? product.availableSizes.join(", ") : "Standard"}.`;
        })
        .join(" ");

      assistantReply = colorWord
        ? `I found ${selectedProducts.length} ${colorWord} product${selectedProducts.length > 1 ? "s" : ""} that match your request: ${productList}`
        : `I found ${selectedProducts.length} product${selectedProducts.length > 1 ? "s" : ""} from the website collection: ${productList}`;
    }

    let persistenceError: string | null = null;

    try {
      const supabase = createSupabaseServerClient();
      const normalizedSessionId =
        typeof sessionId === "string" && sessionId.trim().length > 0
          ? sessionId.trim()
          : "default-session";

      await supabase.from("ai_chat_messages").insert([
        {
          role: "user",
          content: message,
          session_id: normalizedSessionId,
          metadata: {
            source: "ai-assistance",
          },
        },
        {
          role: "assistant",
          content: assistantReply,
          session_id: normalizedSessionId,
          metadata: {
            source: "ai-assistance",
          },
        },
      ]);
    } catch (error) {
      console.error("AI chat persistence error:", error);
      persistenceError = error instanceof Error ? error.message : "Unknown persistence error";
    }

    return NextResponse.json(
      {
        reply: assistantReply,
        action: detectedAction,
        products: selectedProducts.map((product) => ({
          id: product.id,
          title: product.title,
          category: product.category,
          price: product.price,
          originalPrice: product.originalPrice,
          salePrice: product.salePrice,
          image: product.thumbnailImage || product.galleryImages?.[0] || "",
        })),
        imageUrls: selectedProducts.map((product) => product.thumbnailImage || product.galleryImages?.[0] || "").filter(Boolean),
        persisted: !persistenceError,
        persistenceError,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Chat request error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
