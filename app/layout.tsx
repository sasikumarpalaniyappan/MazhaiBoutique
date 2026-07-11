import "./globals.css";
import Header from "../components/layout/Header";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { CartProvider } from "@/components/context/CartContext";
import { WishlistProvider } from "@/components/context/WishlistProviderTemp";

export const metadata = {
  title: "Mazhai Boutique",
  description: "Premium Fashion Collections",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Cormorant:ital,wght@1,400;1,700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          * {
            font-family: 'Poppins', sans-serif;
          }
          .font-elegant {
            font-family: 'Cormorant', serif;
            font-style: italic;
          }
        `}</style>
      </head>
      <body style={{ fontFamily: "'Poppins', sans-serif" }}>
  <CartProvider>
    <WishlistProvider>
      <Header />
      <Navbar />

      <main className="pt-40">
        {children}
      </main>

      <Footer />
    </WishlistProvider>
  </CartProvider>
</body>
    </html>
  );
}
