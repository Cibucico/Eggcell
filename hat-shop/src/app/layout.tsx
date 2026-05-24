import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Goodies Hat | Bespoke Hat Design",
  description:
    "Custom-designed hats for weddings, bridal parties, traditional ceremonies and special events. Let us design you a hat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <CartProvider>
        <body className="min-h-screen flex flex-col bg-ivory text-charcoal">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </body>
      </CartProvider>
    </html>
  );
}
