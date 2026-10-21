"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Home",
    href: "/#home",
    hash: "#home",
    icon: (
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z" />
    ),
  },
  {
    label: "Collection",
    href: "/#featured",
    hash: "#featured",
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
  },
  {
    label: "About",
    href: "/#about",
    hash: "#about",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </>
    ),
  },
  {
    label: "Contact",
    href: "/#contact",
    hash: "#contact",
    icon: (
      <path d="M3 5h18v14H3zM4 7l8 6 8-6" />
    ),
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const updateActiveHash = () => setActiveHash(window.location.hash || "#home");
    updateActiveHash();
    window.addEventListener("hashchange", updateActiveHash);
    window.addEventListener("popstate", updateActiveHash);

    return () => {
      window.removeEventListener("hashchange", updateActiveHash);
      window.removeEventListener("popstate", updateActiveHash);
    };
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/95 px-2 pt-2 shadow-[0_-6px_24px_rgba(26,13,26,0.12)] backdrop-blur-sm pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === "/" && activeHash === item.hash;

          return (
            <li key={item.label} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setActiveHash(item.hash)}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] transition-colors ${
                  isActive ? "text-rose-800" : "text-gray-500 hover:text-rose-700"
                }`}
              >
                <span className="relative">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </svg>
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
