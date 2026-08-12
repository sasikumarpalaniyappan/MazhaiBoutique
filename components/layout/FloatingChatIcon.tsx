"use client";

import Link from "next/link";

export default function FloatingChatIcon() {
  return (
    <Link
      href="/ai-assistance"
      className="fixed bottom-6 right-6 z-40 bg-rose-700 hover:bg-rose-800 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
      title="AI Assistance Chat"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
        aria-hidden="true"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 9h8M8 13h6" />
      </svg>
    </Link>
  );
}
