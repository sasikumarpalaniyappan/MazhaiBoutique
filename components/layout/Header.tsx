"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/context/CartContext";
import { useWishlist } from "@/components/context/WishlistProviderTemp";

export default function Header() {
  const router = useRouter();

  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();

  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");

  const [user, setUser] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);

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

  const totalWishlistItems = wishlistItems.length;

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">

        {/* Top Row */}
        <div className="flex justify-between items-center">

          {/* Logo */}
          <Link href="/">
            <h1 className="text-2xl font-bold text-pink-600 cursor-pointer">
              Boutique Bliss
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

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative w-10 h-10 flex items-center justify-center"
            >
              <span className="text-2xl">❤️</span>

              {totalWishlistItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-pink-600 text-white text-xs rounded-full flex items-center justify-center">
                  {totalWishlistItems}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative w-10 h-10 flex items-center justify-center"
            >
              <span className="text-2xl">🛒</span>

              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-pink-600 text-white text-xs rounded-full flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </Link>

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

                      <Link
                        href="/orders"
                        className="block px-4 py-3 hover:bg-pink-50"
                      >
                        📦 My Orders
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
    </header>
  );
}