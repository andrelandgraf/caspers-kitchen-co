import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/themes/provider";
import { Toaster } from "@/components/ui/sonner";
import { ChatTrigger } from "@/components/chat/chat-trigger";
import { CartProvider } from "@/lib/cart/context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { LocationProvider } from "@/lib/locations/context";
import { LocationSelectorModal } from "@/components/locations/location-selector-modal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Caspers Kitchen",
  description: "Ghost kitchen powered by Databricks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LocationProvider>
            <CartProvider>
              {children}
              <CartDrawer />
              <LocationSelectorModal />
              <ChatTrigger />
              <Toaster richColors position="top-center" />
            </CartProvider>
          </LocationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
