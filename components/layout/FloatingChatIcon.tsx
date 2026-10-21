"use client";

import Link from "next/link";

export default function FloatingChatIcon() {
  return (
    <Link
      href="/ai-assistance"
      className="fixed bottom-20 right-4 z-40 flex items-center justify-center rounded-full bg-rose-700 p-4 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-rose-800 md:bottom-6 md:right-6"
      title="AI Assistance Chat"
    >
      <span className="text-lg font-bold tracking-wide">Ask AI</span>
    </Link>
  );
}
