import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { VehicleProvider } from "@/context/VehicleContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Negm Store | Premium Automotive Spare Parts & Accessories Egypt",
  description: "Shop 100% genuine motor oils, brake pads, filters, batteries, tyres, and car accessories in Egypt with fast delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#111111] text-gray-100 selection:bg-[#8B3A2E] selection:text-white">
        <ToastProvider>
          <VehicleProvider>
            <WishlistProvider>
              <CartProvider>
                {children}
              </CartProvider>
            </WishlistProvider>
          </VehicleProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
