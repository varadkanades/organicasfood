import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/shared/WhatsAppFloat";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import CartSlidePanel from "@/components/cart/CartSlidePanel";

export const metadata: Metadata = {
  title: {
    default: "Organika's Food — 100% Natural Food Powders",
    template: "%s | Organika's Food",
  },
  description:
    "Premium natural food powders. 100% vegan, preservative-free, FSSAI approved. Ships Pan-India & Internationally.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Serif+Display&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-warm-cream text-rich-black antialiased">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <WhatsAppFloat />
            <CartSlidePanel />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
