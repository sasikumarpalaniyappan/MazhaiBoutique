"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/context/CartContext";
import { useFavorites } from "@/components/context/FavoritesContext";
import { useProducts } from "@/components/context/ProductsContext";
import CartDrawer from "@/components/CartDrawer";

export default function Header() {
  const router = useRouter();

  const { cartItems } = useCart();
  const { favoriteCount, favoriteIds, toggleFavorite } = useFavorites();
  const { products } = useProducts();

  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      const loggedUser = localStorage.getItem("loggedInUser");

      if (loggedUser) {
        setUser(JSON.parse(loggedUser));
      } else {
        setUser(null);
      }
    };

    loadUser();

    window.addEventListener("focus", loadUser);
    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("focus", loadUser);
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("loggedInUser");

    alert("Logged out successfully!");

    window.location.replace("/");
  };

  const totalCartItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalWishlistItems = favoriteCount;

  const handleOpenFavorite = (favoriteId: number | string) => {
    setIsFavoritesOpen(false);
    router.push(`/products/${favoriteId}`);
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">

        {/* Top Row */}
        <div className="flex justify-between items-center">

          {/* Logo */}
          <Link href="/">
            <h1 className="text-3xl font-black text-pink-600 cursor-pointer" style={{ fontFamily: 'Cormorant, serif', fontStyle: 'italic', fontWeight: 900 }}>
              Mazhai Boutique
            </h1>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-6">

            {/* Search */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="text-2xl"
            >
              🔍
            </button>

            {/* Favorites Icon */}
            <button
              type="button"
              onClick={() => setIsFavoritesOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-pink-50"
            >
              <span className="text-2xl">❤️</span>
              {totalWishlistItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-600 px-1 text-xs text-white">
                  {totalWishlistItems}
                </span>
              )}
            </button>

            {/* Cart Icon */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center"
            >
              <span className="text-2xl">🛒</span>
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-600 px-1 text-xs text-white">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* Profile */}
            <div className="relative">

              {user ? (
                <>
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="font-semibold text-pink-600 hover:text-pink-700"
                  >
                    Hi, {user.name} 👋
                  </button>

                  {showProfile && (
                    <div className="absolute right-0 mt-3 w-56 bg-white border rounded-lg shadow-lg">

                      <Link
                        href="/profile"
                        className="block px-4 py-3 hover:bg-pink-50"
                      >
                        👤 My Profile
                      </Link>

                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-3 text-red-600 hover:bg-pink-50"
                      >
                        🚪 Logout
                      </button>

                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-2xl hover:scale-110 transition"
                >
                  👤
                </Link>
              )}

            </div>

          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-pink-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        )}

      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <div
        className={`fixed inset-0 z-[60] transition ${isFavoritesOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <div
          className={`absolute inset-0 bg-black/30 transition ${isFavoritesOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsFavoritesOpen(false)}
        />

        <aside
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ${isFavoritesOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex items-center justify-between border-b border-pink-100 px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-pink-600">Favorites</h2>
              <p className="text-sm text-gray-500">Saved picks for later</p>
            </div>
            <button
              type="button"
              onClick={() => setIsFavoritesOpen(false)}
              className="text-2xl text-gray-500"
            >
              ×
            </button>
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
                      <button
                        type="button"
                        onClick={() => handleOpenFavorite(favoriteId)}
                        className="flex flex-1 items-center gap-3 text-left"
                      >
                        <img src={product.thumbnailImage || product.image || ""} alt={product.title} className="h-16 w-16 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{product.title}</p>
                          <p className="text-sm text-pink-600">{displayPrice}</p>
                          <p className="mt-1 text-xs font-medium text-pink-500">View details →</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(Number(favoriteId))}
                        className="text-xl text-pink-600"
                      >
                        ❤
                      </button>
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