import "./globals.css";
import Header from "../components/layout/Header";
import Navbar from "../components/layout/Navbar";
import { CartProvider } from "@/components/context/CartContext";
import { WishlistProvider } from "@/components/context/WishlistProviderTemp";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
  <CartProvider>
    <WishlistProvider>
      <Header />
      <Navbar />

      <main className="pt-40">
        {children}
      </main>

    </WishlistProvider>
  </CartProvider>
</body>
    </html>
  );
}
