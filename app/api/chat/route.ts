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

function normalizeSearchText(value: string): string {
  const cleaned = value
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(sarres|sarrs|sareis|sari|saris|sarree|saree|sarees)\b/g, "saree")
    .replace(/\b(dreses|dresess|dress|dresses)\b/g, "dress")
    .replace(/\b(cottn|cottn|cottons)\b/g, "cotton")
    .replace(/\s+/g, " ")
    .trim();

  const withCompoundWords = cleaned.replace(
    /\b(black|blue|pink|green|gold|white|red|purple|olive|navy|cream|lavender|coral|ivory|beige|orange|maroon|wine|gray|grey|silver|brown|peach)\s*(cotton|silk|saree|dress)\b/g,
    "$1 $2"
  );

  return withCompoundWords.replace(/\s+/g, " ").trim();
}

function extractSearchTerms(input: string): string[] {
  const normalized = normalizeSearchText(input);

  if (!normalized) {
    return [];
  }

  const stopWords = new Set([
    "add",
    "show",
    "me",
    "the",
    "this",
    "that",
    "it",
    "to",
    "in",
    "my",
    "cart",
    "wishlist",
    "please",
    "find",
    "look",
    "buy",
    "save",
    "remove",
    "delete",
    "do",
    "you",
    "have",
    "want",
    "need",
    "for",
    "with",
    "under",
    "and",
    "or",
    "of",
    "from",
    "out",
    "on",
    "about",
    "product",
    "products",
    "item",
    "items",
    "into",
  ]);

  const tokens = normalized
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stopWords.has(token));

  return Array.from(new Set(tokens));
}

function scoreProductMatch(product: CatalogProduct, query: string): number {
  const terms = extractSearchTerms(query);
  if (terms.length === 0) {
    return 0;
  }

  const title = normalizeSearchText(product.title);
  const description = normalizeSearchText(product.description);
  const category = normalizeSearchText(product.category);
  const searchableText = [title, description, category].join(" ");
  const normalizedQuery = normalizeSearchText(query);

  let score = 0;
  const queryColors = [
    "pink",
    "blue",
    "black",
    "red",
    "green",
    "gold",
    "white",
    "orange",
    "peach",
    "purple",
    "olive",
    "navy",
    "cream",
    "lavender",
    "coral",
    "ivory",
    "beige",
    "maroon",
    "wine",
    "gray",
    "grey",
    "silver",
    "brown",
  ].filter((color) => normalizedQuery.includes(color));

  const queryCategories = ["saree", "dress", "cotton", "silk", "dress", "wedding", "party"].filter(
    (token) => normalizedQuery.includes(token)
  );

  for (const token of terms) {
    if (!token) continue;

    if (searchableText.includes(token)) {
      score += 8;
    }

    if (title.includes(token)) {
      score += 12;
    }

    if (description.includes(token)) {
      score += 6;
    }

    if (category.includes(token)) {
      score += 18;
    }
  }

  for (const color of queryColors) {
    if (title.includes(color)) {
      score += 25;
    }
    if (description.includes(color)) {
      score += 12;
    }
    if (category.includes(color)) {
      score += 10;
    }
  }

  for (const categoryToken of queryCategories) {
    if (title.includes(categoryToken)) {
      score += 18;
    }
    if (description.includes(categoryToken)) {
      score += 10;
    }
    if (category.includes(categoryToken)) {
      score += 22;
    }
  }

  if (queryColors.length > 0 && queryCategories.length > 0) {
    const colorHit = queryColors.some((color) => title.includes(color) || description.includes(color));
    const categoryHit = queryCategories.some((token) => category.includes(token) || title.includes(token));
    if (colorHit && categoryHit) {
      score += 30;
    }
  }

  return score;
}

function findMatchingCatalogProducts(catalog: CatalogProduct[], query: string): CatalogProduct[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return [];
  }

  return catalog
    .map((product) => ({ product, score: scoreProductMatch(product, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ product }) => product)
    .slice(0, 4);
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

function getRelevantHistory(history: unknown[], limit = 12): Array<{ role: string; content: string }> {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((entry): entry is { role: string; content: string } => {
      return !!entry && typeof entry === "object" && typeof (entry as { content?: unknown }).content === "string";
    })
    .map((entry) => ({
      role: String(entry.role ?? "user"),
      content: String(entry.content ?? "").trim(),
    }))
    .filter(({ content, role }) => {
      const isWelcomeMessage =
        role === "assistant" && content.startsWith("Welcome to Mazhai Boutique");

      return content.length > 0 && !isWelcomeMessage;
    })
    .slice(-limit);
}

function inferProductSearchQuery(currentMessage: string, history: Array<{ role: string; content: string }>): string {
  const trimmed = currentMessage.trim();
  const lower = trimmed.toLowerCase();

  if (!/(cheaper|affordable|budget|lower price|less expensive|more affordable|similar|other options|different|alternatives)/i.test(lower)) {
    return trimmed;
  }

  const priorUserMessages = history
    .filter((entry) => entry.role === "user")
    .map((entry) => entry.content)
    .slice(-3);

  if (priorUserMessages.length === 0) {
    return trimmed;
  }

  const lastProductHints = priorUserMessages
    .map((entry) => normalizeSearchText(entry))
    .filter(Boolean)
    .join(" ");

  if (!lastProductHints) {
    return trimmed;
  }

  const fallbackTerms = extractSearchTerms(`${lastProductHints} ${normalizeSearchText(trimmed)}`);
  return fallbackTerms.length > 0 ? fallbackTerms.join(" ") : trimmed;
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

  if (isGreetingMessage(normalized)) {
    return "Hi! 👋 Welcome to Mazhai Boutique! How can I help you today? You can ask me about sarees, dresses, prices, sizes, or products.";
  }

  if (normalized.includes("how are you") || normalized.includes("what can you help me with") || normalized.includes("what can you do")) {
    return "I can help you explore our sarees, dresses, styles, sizing, gifting, shipping, and product recommendations at Mazhai Boutique.";
  }

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

function isGreetingMessage(message: string): boolean {
  const normalized = message.trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  const greetingOnly = /^(hi|hello|hey|hii|hiii|good morning|good afternoon|good evening|how are you|thanks|thank you|bye|goodbye)([!?.,\s]+)?$/;

  return greetingOnly.test(normalized);
}

function hasProductIntent(message: string): boolean {
  const normalized = normalizeSearchText(message);

  if (!normalized) {
    return false;
  }

  const productKeywords = [
    "saree",
    "dress",
    "product",
    "products",
    "collection",
    "catalog",
    "price",
    "under",
    "available",
    "wedding",
    "cotton",
    "silk",
    "jacket",
    "outfit",
    "blouse",
    "lehenga",
    "kurta",
    "look for",
    "show me",
    "do you have",
    "want",
    "need",
    "find",
    "search",
  ];

  const knownColors = [
    "pink",
    "blue",
    "black",
    "red",
    "green",
    "gold",
    "white",
    "orange",
    "peach",
    "purple",
    "olive",
    "navy",
    "cream",
    "lavender",
    "coral",
    "ivory",
    "beige",
    "maroon",
    "wine",
    "gray",
    "grey",
    "silver",
    "brown",
  ];

  const hasProductKeyword = productKeywords.some((keyword) => normalized.includes(keyword));
  const hasColorKeyword = knownColors.some((color) => normalized.includes(color));
  const hasActionWord = /(show|find|search|look|browse|want|need|buy|compare|do you have|available|under|price)/.test(normalized);

  if (hasProductKeyword && (hasActionWord || hasColorKeyword)) {
    return true;
  }

  if (hasColorKeyword && normalized.split(/\s+/).some((word) => word === "saree" || word === "dress")) {
    return true;
  }

  return false;
}

function detectIntent(
  message: string,
  history: Array<{ role: string; content: string }> = []
): "greeting" | "general" | "product" | "unknown" {
  const normalized = message.trim().toLowerCase();

  if (!normalized) {
    return "unknown";
  }

  const productIntent =
    hasProductIntent(normalized) ||
    (/(cheaper|affordable|budget|lower price|less expensive|more affordable|similar|other options|different|alternatives)/i.test(normalized) &&
      history.some((entry) => entry.role === "user" && hasProductIntent(entry.content)));

  if (productIntent) {
    return "product";
  }

  if (isGreetingMessage(normalized)) {
    return "greeting";
  }

  if (
    normalized.includes("what can you help me with") ||
    normalized.includes("what can you do") ||
    normalized.includes("how are you")
  ) {
    return "general";
  }

  return "general";
}

function getGeminiErrorStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const candidate = error as {
    status?: number;
    code?: number;
    statusCode?: number;
  };

  const value = candidate.status ?? candidate.code ?? candidate.statusCode;
  return typeof value === "number" ? value : null;
}

function getGeminiErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const candidate = error as {
      message?: string;
      error?: { message?: string };
    };

    if (candidate.message) {
      return candidate.message;
    }

    if (candidate.error && typeof candidate.error.message === "string") {
      return candidate.error.message;
    }
  }

  return "Unknown Gemini API error";
}

async function getProviderReply(
  input: string,
  history: Array<{ role: string; content: string }> = []
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return getBotReply(input);
  }

  try {
    const conversationContext = history.length
      ? history
          .slice(-8)
          .map((entry) => `${entry.role === "user" ? "User" : "Assistant"}: ${entry.content}`)
          .join("\n")
      : "";

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite",
      contents: `You are Mazhai Boutique's AI shopping assistant. Reply warmly and concisely about boutique products, gifts, sizing, shipping, styling, collections, and customer support. Only answer based on Mazhai Boutique information.\n\n${conversationContext ? `Conversation history:\n${conversationContext}\n\n` : ""}User: ${input}`,
    });

    const providerText = typeof response?.text === "string" ? response.text.trim() : "";
    if (providerText.length > 0) {
      return providerText;
    }

    return getBotReply(input);
  } catch (error) {
    const status = getGeminiErrorStatus(error);
    const message = getGeminiErrorMessage(error);

    if (status === 429 || message.toLowerCase().includes("rate limit") || message.toLowerCase().includes("quota")) {
      console.warn("Gemini API quota/rate limit reached:", { status, message });
      return getBotReply(input);
    }

    console.error("Gemini API error:", { status, message, error });
    return getBotReply(input);
  }
}

function detectAction(message: string):
  | "add_to_cart"
  | "remove_from_cart"
  | "clear_cart"
  | "add_to_wishlist"
  | "remove_from_wishlist"
  | "clear_wishlist"
  | null {
  const lower = normalizeSearchText(message);

  const hasCartIntent = lower.includes("cart");
  const hasWishlistIntent = lower.includes("wishlist");

  if (/\b(clear|empty|remove everything|delete everything)\b/.test(lower) && hasCartIntent) {
    return "clear_cart";
  }

  if (/\b(clear|empty|remove everything|delete everything)\b/.test(lower) && hasWishlistIntent) {
    return "clear_wishlist";
  }

  if ((/\b(remove|delete)\b/.test(lower) || /\btake\b/.test(lower)) && hasCartIntent) {
    return "remove_from_cart";
  }

  if ((/\b(remove|delete|unwishlist|don't save)\b/.test(lower) || /\btake\b/.test(lower)) && hasWishlistIntent) {
    return "remove_from_wishlist";
  }

  if (/\b(add|put|buy|purchase)\b/.test(lower) && hasCartIntent) {
    return "add_to_cart";
  }

  if (/\b(add|save|wishlist|put)\b/.test(lower) && hasWishlistIntent) {
    return "add_to_wishlist";
  }

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
    lower.includes("remove from cart") ||
    lower.includes("remove this from cart") ||
    lower.includes("delete this item from cart") ||
    lower.includes("take this out of my cart")
  ) {
    return "remove_from_cart";
  }

  if (
    lower.includes("remove from wishlist") ||
    lower.includes("remove this from wishlist") ||
    lower.includes("remove this from my wishlist") ||
    lower.includes("unwishlist this")
  ) {
    return "remove_from_wishlist";
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId, history } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid message" },
        { status: 400 }
      );
    }

    const relevantHistory = getRelevantHistory(history);
    const trimmedMessage = message.trim();
    const lowerMessage = trimmedMessage.toLowerCase();
    const detectedAction = detectAction(trimmedMessage);
    const intent = detectIntent(lowerMessage, relevantHistory);

    let catalog: CatalogProduct[] = [];
    let colorWord: string | null = null;
    let selectedProducts: CatalogProduct[] = [];

    const shouldSearchCatalog = intent === "product";

    if (shouldSearchCatalog) {
      catalog = await getCatalogFromSupabase();
      colorWord = extractColor(lowerMessage);

      const searchQuery = inferProductSearchQuery(trimmedMessage, relevantHistory);
      const normalizedQuery = normalizeSearchText(searchQuery);
      const matchedProducts = findMatchingCatalogProducts(catalog, normalizedQuery);

      if (matchedProducts.length > 0) {
        selectedProducts = matchedProducts;
      }

      if (detectedAction && ["add_to_cart", "add_to_wishlist"].includes(detectedAction)) {
        const topMatch = selectedProducts[0];
        const secondMatch = selectedProducts[1];
        const strongSingleMatch =
          topMatch &&
          (!secondMatch || scoreProductMatch(secondMatch, normalizedQuery) < scoreProductMatch(topMatch, normalizedQuery) * 0.9);

        if (!strongSingleMatch && selectedProducts.length > 1) {
          return NextResponse.json(
            {
              reply: "I found a few matching products. Which one would you like?",
              action: null,
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
            },
            { status: 200 }
          );
        }
      }
    }

    const reply = await getProviderReply(trimmedMessage, relevantHistory);

    let assistantReply = reply;

    if (detectedAction === "clear_cart") {
      assistantReply = "Are you sure you want to clear your entire cart? This will remove all items. Please say 'yes, clear my cart' to confirm.";
    } else if (detectedAction === "clear_wishlist") {
      assistantReply = "Are you sure you want to clear your entire wishlist? Please say 'yes, clear my wishlist' to confirm.";
    } else if (selectedProducts.length > 0) {
      const normalizedQuery = normalizeSearchText(trimmedMessage);
      const productLabel = normalizedQuery.includes("dress") ? "dresses" : normalizedQuery.includes("saree") ? "sarees" : "products";
      const searchContext = normalizedQuery
        .replace(/^(show me|find|search|look for|browse|i want|i need)\s+/, "")
        .replace(/\b(please|me|my|the|a|an)\b/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const searchPhrase = searchContext || (colorWord ? `${colorWord} ${productLabel}` : productLabel);
      assistantReply = `I found ${selectedProducts.length} ${productLabel} that match your search for ${searchPhrase}. 🌸`;
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

    const quantityMatch = trimmedMessage.match(/(\d+)\s+of\s+this|\d+\s+of\s+that|\d+\s+items?/i);
    const quantity = quantityMatch ? Number(quantityMatch[1] || 1) : 1;

    return NextResponse.json(
      {
        reply: assistantReply,
        action: detectedAction,
        quantity: detectedAction === "add_to_cart" ? quantity : undefined,
        requiresConfirmation: detectedAction === "clear_cart" || detectedAction === "clear_wishlist",
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
