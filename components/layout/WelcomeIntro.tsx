"use client";

import { useEffect, useState } from "react";

export default function WelcomeIntro() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 100 : 1800;
    const timeout = window.setTimeout(() => setIsVisible(false), duration);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      aria-label="Welcome to Mazhai Boutique"
      className="welcome-intro fixed inset-0 z-[100] flex items-center justify-center bg-white"
    >
      <div className="welcome-intro-content flex w-full max-w-md flex-col items-center px-8 text-center">
        <img
          src="/mazhai-logo-exact.jpeg"
          alt="Mazhai Boutique logo"
          className="h-auto w-full max-w-xs object-contain"
        />
        <p className="welcome-intro-title mt-2 text-2xl font-semibold tracking-wide text-[#4c1130] sm:text-3xl">
          Mazhai Boutique
        </p>
        <p className="welcome-intro-tagline mt-1 text-xs tracking-[0.22em] text-rose-700 sm:text-sm">
          DRESS CLASSY, FEEL SASSY
        </p>
      </div>
      <button
        type="button"
        onClick={() => setIsVisible(false)}
        className="absolute bottom-8 rounded-full px-4 py-2 text-sm text-rose-800 transition-colors hover:bg-rose-50"
      >
        Skip intro
      </button>
    </div>
  );
}
