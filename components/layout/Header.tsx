"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/context/CartContext";
import { useFavorites } from "@/components/context/FavoritesContext";
import { useProducts } from "@/components/context/ProductsContext";
import CartDrawer from "@/components/CartDrawer";
import CartIcon from "@/components/CartIcon";
import HeartIcon from "@/components/HeartIcon";

export default function Header() {
  const router = useRouter();

  const { cartItems } = useCart();
  const { favoriteCount, favoriteIds, toggleFavorite } = useFavorites();
  const { products } = useProducts();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Home");

  const navItems = [
    { label: "Home", href: "/#home" },
    { label: "Collections", href: "/#featured" },
    { label: "Featured", href: "/#featured" },
    { label: "About", href: "/#about" },
    { label: "Contact", href: "/#contact" },
  ];

  useEffect(() => {
    const updateActive = () => {
      const hash = (typeof window !== "undefined" && window.location.hash.replace("#", "")) || "home";
      const found = navItems.find((n) => n.href.endsWith(hash));
      setActiveNav(found?.label ?? "Home");
    };

    updateActive();
    window.addEventListener("hashchange", updateActive);
    return () => window.removeEventListener("hashchange", updateActive);
  }, []);

  const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalWishlistItems = favoriteCount;

  const handleOpenFavorite = (favoriteId: number | string) => {
    setIsFavoritesOpen(false);
    router.push(`/products/${favoriteId}`);
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-6 h-[100px]">

        <div className="flex items-center justify-between gap-4 h-full">

          <Link href="/" className="flex h-full items-center flex-shrink-0 overflow-hidden">
            <img src="/mazhai-logo-exact.jpeg" alt="Mazhai Boutique logo" className="block h-full w-auto max-w-[580px] object-contain" />
          </Link>

          <nav className="flex flex-1 justify-center min-w-[240px]">
            <ul className="flex items-center justify-center gap-4">
              {navItems.map((item) => {
                const isActive = activeNav === item.label;
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setActiveNav(item.label)}
                      className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium transition-shadow ${
                          isActive
                            ? "bg-pink-600 text-white shadow-lg"
                            : "bg-pink-50 border-2 border-pink-200 text-pink-700 hover:shadow-md"
                        }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setIsFavoritesOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full px-2 text-sm font-medium transition-shadow bg-pink-50 border-2 border-pink-200 text-pink-700 hover:shadow-md"
            >
              <HeartIcon size={18} strokeClass="stroke-pink-600" fillClass="fill-pink-100" />
              {totalWishlistItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-600 px-1 text-xs text-white">
                  {totalWishlistItems}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full px-2 text-sm font-medium transition-shadow ${
                isCartOpen ? "bg-pink-600 text-white shadow-lg" : "bg-pink-50 border-2 border-pink-200 text-pink-700 hover:shadow-md"
              }`}
            >
              <CartIcon size={20} />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-600 px-1 text-xs text-white">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>

      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <div className={`fixed inset-0 z-[60] transition ${isFavoritesOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div className={`absolute inset-0 bg-black/30 transition ${isFavoritesOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setIsFavoritesOpen(false)} />

        <aside className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ${isFavoritesOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between border-b border-pink-100 px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-pink-600">Favorites</h2>
              <p className="text-sm text-gray-500">Saved picks for later</p>
            </div>
            <button type="button" onClick={() => setIsFavoritesOpen(false)} className="text-2xl text-gray-500">×</button>
          </div>

          <div className="max-h-[calc(100vh-80px)] overflow-y-auto px-6 py-4">
            {favoriteIds.length === 0 ? (
              <div className="rounded-xl border border-dashed border-pink-200 bg-pink-50 p-6 text-center text-sm text-gray-600">
                No favorites yet. Tap the heart on any product to save it here.
              </div>
            ) : (
              <div className="space-y-3">
                {favoriteIds.map((favoriteId) => {
                  const product = products.find((item) => String(item.id) === String(favoriteId));
                  if (!product) return null;
                  const displayPrice = product.salePrice || product.originalPrice || product.price || "—";

                  return (
                    <div key={favoriteId} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 shadow-sm">
                      <button type="button" onClick={() => handleOpenFavorite(favoriteId)} className="flex flex-1 items-center gap-3 text-left">
                        <img src={product.thumbnailImage || product.image || ""} alt={product.title} className="h-16 w-16 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{product.title}</p>
                          <p className="text-sm text-pink-600">{displayPrice}</p>
                          <p className="mt-1 text-xs font-medium text-pink-500">View details →</p>
                        </div>
                      </button>
                      <button type="button" onClick={() => toggleFavorite(Number(favoriteId))} className="text-xl text-pink-600">❤</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </header>
  );
}
