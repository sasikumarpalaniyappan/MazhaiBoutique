"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useCart } from "@/components/context/CartContext";
import { useFavorites } from "@/components/context/FavoritesContext";

type ChatRole = "assistant" | "user";

type ChatProduct = {
  id: string;
  title: string;
  category: string;
  price: string;
  originalPrice?: string;
  salePrice?: string;
  image: string;
};

type ChatMessage = {
  role: ChatRole;
  content: string;
  products?: ChatProduct[];
};

type ChatAction = "add_to_cart" | "add_to_wishlist" | "clear_cart" | "empty_wishlist" | null;

export default function AIChat() {
  const STORAGE_KEY = "mazhai-boutique-chat-history";
  const { addToCart, removeFromCart, clearCart } = useCart();
  const { toggleFavorite, clearFavorites, isFavorite } = useFavorites();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Welcome to Mazhai Boutique. I can help with new arrivals, gift ideas, sizing, shipping, and styling advice.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<"clear_cart" | "clear_wishlist" | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const isNearBottomRef = useRef(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [recentProducts, setRecentProducts] = useState<ChatProduct[]>([]);
  const isMountedRef = useRef(true);

  const getHistoryForApi = (currentMessages: ChatMessage[]) =>
    currentMessages
      .filter((message) => {
        const isWelcomeMessage =
          message.role === "assistant" &&
          message.content.startsWith("Welcome to Mazhai Boutique");

        return !isWelcomeMessage && Boolean(message.content?.trim());
      })
      .map(({ role, content, products }) => ({
        role,
        content,
        products: products && products.length > 0 ? products : undefined,
      }));

  // Load messages from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
    setIsHydrated(true);

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  }, [messages, isHydrated]);

  useEffect(() => {
    const container = messageListRef.current;
    if (!container) {
      return;
    }

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= 120;
    if (isNearBottomRef.current && isNearBottom) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, loading]);

  const handleConversationScroll = () => {
    const container = messageListRef.current;
    if (!container) {
      return;
    }

    isNearBottomRef.current = container.scrollHeight - container.scrollTop - container.clientHeight <= 120;
  };

  const isConfirmationMessage = (message: string) => {
    const normalized = message.trim().toLowerCase();
    return [
      "yes",
      "yes please",
      "confirm",
      "do it",
      "clear it",
      "yes, clear my cart",
      "yes, clear my wishlist",
    ].includes(normalized);
  };

  const resolveProductReference = (message: string, candidateProducts: ChatProduct[]) => {
    const normalizedMessage = message.toLowerCase();

    if (candidateProducts.length === 0) {
      return null;
    }

    const firstMatch = /\bfirst\b|\b1st\b/.test(normalizedMessage) ? candidateProducts[0] : null;
    const secondMatch = /\bsecond\b|\b2nd\b/.test(normalizedMessage) ? candidateProducts[1] ?? candidateProducts[0] : null;
    const thirdMatch = /\bthird\b|\b3rd\b/.test(normalizedMessage) ? candidateProducts[2] ?? candidateProducts[0] : null;

    if (firstMatch) {
      return firstMatch;
    }

    if (secondMatch) {
      return secondMatch;
    }

    if (thirdMatch) {
      return thirdMatch;
    }

    const explicitReference = normalizedMessage.includes("this") || normalizedMessage.includes("that") || normalizedMessage.includes("it");
    const recentProduct = explicitReference ? candidateProducts[0] : null;

    const exactMatch = candidateProducts.find((product) => {
      const title = product.title.toLowerCase();
      const cleanedMessage = normalizedMessage
        .replace(/\b(this|that|it|product|item|saree|dress|to|my|cart|wishlist|add|remove|first|second|third|one)\b/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      return normalizedMessage.includes(title) || title.includes(cleanedMessage) || cleanedMessage.includes(title);
    });

    if (exactMatch) {
      return exactMatch;
    }

    const keywordMatches = candidateProducts.filter((product) => {
      const title = product.title.toLowerCase();
      return Array.from(new Set(title.split(/[^a-z]+/).filter(Boolean))).some((word) =>
        normalizedMessage.includes(word) && word.length > 2
      );
    });

    if (keywordMatches.length === 1) {
      return keywordMatches[0];
    }

    if (recentProduct && explicitReference) {
      return recentProduct;
    }

    if (candidateProducts.length === 1) {
      return candidateProducts[0];
    }

    return null;
  };

  const sendMessage = async (nextPrompt: string) => {
    const trimmed = nextPrompt.trim();

    if (!trimmed || loading) {
      return;
    }

    if (pendingAction && isConfirmationMessage(trimmed)) {
      const action = pendingAction;
      setPendingAction(null);

      if (action === "clear_cart") {
        clearCart();
        if (isMountedRef.current) {
          setMessages((current) => [
            ...current,
            {
              role: "assistant",
              content: "Your cart has been cleared successfully. 🛒",
            },
          ]);
        }
        setLoading(false);
        return;
      }

      if (action === "clear_wishlist") {
        clearFavorites();
        if (isMountedRef.current) {
          setMessages((current) => [
            ...current,
            {
              role: "assistant",
              content: "Your wishlist has been cleared successfully. ❤️",
            },
          ]);
        }
        setLoading(false);
        return;
      }
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmed,
    };

    if (isMountedRef.current) {
      setMessages((current) => [...current, userMessage]);
      setInput("");
      setLoading(true);
    } else {
      return;
    }

    try {
      const history = getHistoryForApi(messages);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          history,
        }),
      });

      const data = await response.json().catch(() => ({
        error: "Unable to parse AI response",
      }));

      if (!response.ok) {
        const fallbackMessage =
          data.error ===
          "The AI assistant is not configured. Set GEMINI_API_KEY in your environment."
            ? "The AI assistant is currently unavailable because the Gemini API key is not configured."
            : "Sorry, I couldn't connect to the AI assistant right now. Please try again.";

        if (isMountedRef.current) {
          setMessages((current) => [
            ...current,
            {
              role: "assistant",
              content: fallbackMessage,
            },
          ]);
        }

        return;
      }

      const productsToUse = Array.isArray(data.products) ? data.products : [];

      if (data.requiresConfirmation && (data.action === "clear_cart" || data.action === "clear_wishlist")) {
        setPendingAction(data.action);
        if (isMountedRef.current) {
          setMessages((current) => [
            ...current,
            {
              role: "assistant",
              content: data.reply || "Are you sure? Please say 'yes' to confirm.",
            },
          ]);
        }
        return;
      }

      const actionCommands = [
        "add_to_cart",
        "remove_from_cart",
        "clear_cart",
        "add_to_wishlist",
        "remove_from_wishlist",
        "clear_wishlist",
      ];
      const isAction = actionCommands.includes(data.action || "");
      const shouldShowProducts = !isAction;
      const productsToDisplay = shouldShowProducts ? productsToUse : [];

      let finalReply = data.reply;
      if (isAction) {
        if (data.action === "add_to_cart") {
          finalReply = data.reply || "Product added to your cart.";
        } else if (data.action === "remove_from_cart") {
          finalReply = data.reply || "The item has been removed from your cart.";
        } else if (data.action === "clear_cart") {
          finalReply = data.reply || "Your cart has been cleared.";
        } else if (data.action === "add_to_wishlist") {
          finalReply = data.reply || "Product added to your wishlist.";
        } else if (data.action === "remove_from_wishlist") {
          finalReply = data.reply || "The item has been removed from your wishlist.";
        } else if (data.action === "clear_wishlist") {
          finalReply = data.reply || "Your wishlist has been cleared.";
        } else {
          finalReply = data.reply || "Action completed successfully.";
        }
      } else if (!isAction && productsToUse.length > 0) {
        const summaryProducts = productsToUse.slice(0, 3).map((product: ChatProduct) => {
          const price = product.salePrice || product.price;
          return `${product.title} - ₹${parseInt(price).toLocaleString()}`;
        });

        finalReply = `I found ${productsToUse.length} products: ${summaryProducts.join(", ")}${
          productsToUse.length > 3 ? ", and more." : "."
        }`;
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: finalReply,
        products: productsToDisplay,
      };

      // Track products shown in this response (for next message's context)
      // Use productsToUse for tracking, not productsToDisplay, so user can still take actions on products
      if (productsToUse.length > 0 && isMountedRef.current) {
        setRecentProducts(productsToUse);
      }

      // Helper function to find the best matching product by name
      const findMatchingProduct = (message: string, availableProducts: ChatProduct[]): ChatProduct => {
        if (availableProducts.length === 0) {
          throw new Error("No products available");
        }

        const messageLower = message.toLowerCase();
        
        // Find products mentioned by name in the message
        let bestMatch: { product: ChatProduct; score: number } | null = null;

        for (const product of availableProducts) {
          const productNameLower = product.title.toLowerCase();
          const words = productNameLower.split(" ");
          
          // Check for exact phrase match
          if (messageLower.includes(productNameLower)) {
            return product; // Exact match, return immediately
          }

          // Check for key words (e.g., "moonlit" in "Moonlit Lavender Artisan Cotton Saree")
          for (const word of words) {
            if (word.length > 3 && messageLower.includes(word)) {
              const score = word.length; // Longer matches score higher
              if (!bestMatch || score > bestMatch.score) {
                bestMatch = { product, score };
              }
            }
          }
        }

        return bestMatch?.product || availableProducts[0]!; // Default to first if no match
      };

      if (data.action) {
        let actionMessage = "";
        let targetProductName = "";

        try {
          const candidateProducts = [...productsToUse, ...recentProducts];

          if (data.action === "add_to_cart") {
            const targetProduct = resolveProductReference(trimmed, candidateProducts);

            if (!targetProduct) {
              actionMessage = "I couldn't find that product. Could you tell me the product name?";
            } else {
              targetProductName = targetProduct.title;
              const quantity = Number(data.quantity) > 0 ? Number(data.quantity) : 1;
              addToCart(
                {
                  id: targetProduct.id,
                  name: targetProduct.title,
                  price: targetProduct.salePrice || targetProduct.price,
                  image: targetProduct.image,
                },
                quantity
              );
              actionMessage = `${targetProduct.title} has been added to your cart. 🛍️`;
            }
          } else if (data.action === "remove_from_cart") {
            const targetProduct = resolveProductReference(trimmed, candidateProducts);

            if (!targetProduct) {
              actionMessage = "I couldn't find that product in your cart. Could you tell me the product name?";
            } else {
              targetProductName = targetProduct.title;
              removeFromCart(targetProduct.id);
              actionMessage = `${targetProduct.title} has been removed from your cart.`;
            }
          } else if (data.action === "clear_cart") {
            clearCart();
            actionMessage = "Your cart has been cleared successfully. 🛒";
            targetProductName = "Cart";
          } else if (data.action === "add_to_wishlist") {
            const targetProduct = resolveProductReference(trimmed, candidateProducts);

            if (!targetProduct) {
              actionMessage = "I couldn't find that product. Could you tell me the product name?";
            } else {
              targetProductName = targetProduct.title;
              if (!isFavorite(targetProduct.id)) {
                toggleFavorite(targetProduct.id);
              }
              actionMessage = `${targetProduct.title} has been added to your wishlist. ❤️`;
            }
          } else if (data.action === "remove_from_wishlist") {
            const targetProduct = resolveProductReference(trimmed, candidateProducts);

            if (!targetProduct) {
              actionMessage = "I couldn't find that product in your wishlist. Could you tell me the product name?";
            } else {
              targetProductName = targetProduct.title;
              if (isFavorite(targetProduct.id)) {
                toggleFavorite(targetProduct.id);
              }
              actionMessage = `${targetProduct.title} has been removed from your wishlist.`;
            }
          } else if (data.action === "clear_wishlist") {
            clearFavorites();
            actionMessage = "Your wishlist has been cleared successfully. ❤️";
            targetProductName = "Wishlist";
          }
        } catch (e) {
          console.error("Error executing action:", e);
          actionMessage = "I couldn't complete that action. Please try again.";
        }

        if (actionMessage) {
          assistantMessage.content = actionMessage.trim();
        }

        if (isMountedRef.current) {
          setMessages((current) => [...current, assistantMessage]);
        }
      } else {
        if (isMountedRef.current) {
          setMessages((current) => [...current, assistantMessage]);
        }
      }
    } catch (error) {
      console.error("Chat error:", error);

      if (isMountedRef.current) {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content:
              "Sorry, I couldn't connect to the AI assistant right now. Please try again.",
          },
        ]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage(input);
  };

  return (
    <section className="ai-chat-section flex min-h-[600px] items-center justify-center bg-[#f8f6f4] px-4 py-4">
      <div className="ai-chat-card flex h-[500px] w-full max-w-[760px] flex-col rounded-[26px] border border-[#d7d1d7] bg-white shadow-[0_12px_34px_rgba(83,28,65,0.12)] pb-3">
        <div className="px-7 pt-5">
          <div className="mb-3 text-center text-[9px] font-bold uppercase tracking-[0.24em] text-[#5d305a]">
            MAZHAI BOUTIQUE ASSISTANCE
          </div>
          <h1 className="text-center text-2xl font-black leading-[0.86] tracking-[-0.04em] text-[#4a2443] md:text-[40px]">
            AI Chat
          </h1>
        </div>

        <div className="conversation-panel mx-6 mt-5 flex min-h-0 flex-1 flex-col rounded-[21px] border border-[#cfcbd2] bg-[#fbf9fa] shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e8ddea] px-4 py-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#8b587d]">
              CONVERSATION
            </div>
            <span className="rounded-full bg-[#4c204a] px-3 py-1 text-[8px] font-bold uppercase tracking-wide text-white">
              Live
            </span>
          </div>

          <div className="ai-chat-content flex min-h-0 flex-1 flex-col">
            <div
              ref={messageListRef}
              onScroll={handleConversationScroll}
              className="ai-chat-scroll min-h-[120px] min-h-0 flex-1 overflow-y-auto px-4 py-3"
            >
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`mb-2 flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                >
                  <div className={`max-w-[92%] rounded-[16px] border px-3 py-2 text-[11px] leading-5 shadow-sm md:text-[13px] ${
                    message.role === "assistant"
                      ? "border-[#efe8ee] bg-[#f5eef3] text-[#4c2a45]"
                      : "border-[#b891a0] bg-[#4c204a] text-white text-right"
                  }`}>
                    <div>{message.content}</div>
                    {message.role === "assistant" && message.products && message.products.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {message.products.map((product) => (
                          <Link key={product.id} href={`/products/${product.id}`}>
                            <div className="rounded-xl border border-[#d3bdcf] bg-white p-2 cursor-pointer hover:shadow-md transition-shadow flex flex-col">
                              <img
                                src={product.image}
                                alt={product.title}
                                className="h-28 w-full rounded-md object-cover"
                                onError={(event) => {
                                  event.currentTarget.src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80";
                                }}
                              />
                              <div className="mt-3 text-[10px] font-bold text-[#4c204a]">{product.title}</div>
                              <div className="text-[9px] text-[#7a566d]">{product.category}</div>
                              <div className="mt-2 flex items-center gap-2">
                                <div className="text-[9px] font-semibold text-[#c1305f]">
                                  ₹{product.salePrice ? parseInt(product.salePrice).toLocaleString() : parseInt(product.price).toLocaleString()}
                                </div>
                                {product.originalPrice && product.salePrice && (
                                  <div className="text-[8px] text-[#999] line-through">
                                    ₹{parseInt(product.originalPrice).toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-full border border-[#efe8ee] bg-[#f5eef3] px-4 py-2 text-[12px] font-semibold text-[#7a566d]">
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            <div className="ai-chat-composer border-t border-[#e8ddea] px-4 py-3 pb-5">
              <form className="flex items-center gap-2" onSubmit={handleSubmit}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4b2446] text-[20px] font-black text-white shadow-inner">
                  +
                </div>

                <div className="flex min-w-0 flex-1 items-center rounded-full border border-[#b9aab8] bg-white px-3 py-2 shadow-sm">
                  <input
                    aria-label="Message Mazhai Boutique"
                    className="w-full bg-transparent text-[12px] text-[#4c2a45] outline-none placeholder:text-[#897b84]"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Message Mazhai Boutique..."
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4c204a] text-[20px] font-bold leading-none text-white disabled:cursor-not-allowed disabled:opacity-75"
                >
                  ↑
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}