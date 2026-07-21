import "./globals.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { CartProvider } from "@/components/context/CartContext";
import { FavoritesProvider } from "@/components/context/FavoritesContext";
import { ProductsProvider } from "@/components/context/ProductsContext";

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
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
    <FavoritesProvider>
      <ProductsProvider>
        <Header />

        <main className="scroll-smooth pt-20 sm:pt-[100px]">
          {children}
        </main>

        <Footer />
      </ProductsProvider>
    </FavoritesProvider>
  </CartProvider>
</body>
    </html>
  );
}

