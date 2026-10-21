"use client";

import Link from "next/link";

export default function FloatingChatIcon() {
  return (
    <Link
      href="/ai-assistance"
      className="fixed bottom-6 right-6 z-40 bg-rose-700 hover:bg-rose-800 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
      title="AI Assistance Chat"
    >
      <span className="text-lg font-bold tracking-wide">Ask AI</span>
    </Link>
  );
}
