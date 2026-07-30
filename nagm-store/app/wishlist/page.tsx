"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ProductCard from "@/components/common/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Heart, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";

export default function WishlistPage() {
  const { wishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleMoveAllToCart = () => {
    wishlist.forEach((item) => addToCart(item, 1));
    showToast("Moved all wishlist items to Cart!", "success");
  };

  if (wishlist.length === 0) {
    return (
      <main className="min-h-screen bg-[#111111] text-gray-100 flex flex-col pt-32 pb-20">
        <Navbar />
        <div className="mx-auto max-w-xl px-4 text-center my-auto py-16">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#1B1B1B] text-red-500 mx-auto mb-6 border border-[#2D2D2D]">
            <Heart className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-black text-white">Your Saved Wishlist is Empty</h1>
          <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
            Explore our catalog and save your favorite lubricants, brake parts, or accessories for later.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#8B3A2E] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#a34436] transition shadow-xl"
          >
            <ArrowLeft className="h-4 w-4" /> Discover Products
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#111111] text-gray-100 flex flex-col pt-32 pb-20">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex-1">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D2D2D] pb-6 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
              SAVED FAVORITES
            </span>
            <h1 className="text-3xl font-black text-white mt-1">My Wishlist ({wishlist.length})</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleMoveAllToCart}
              className="flex items-center gap-2 rounded-xl bg-[#8B3A2E] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#a34436] transition shadow-md"
            >
              <ShoppingBag className="h-4 w-4" /> Move All To Cart
            </button>

            <button
              onClick={clearWishlist}
              className="flex items-center gap-2 rounded-xl border border-[#2D2D2D] bg-[#1B1B1B] px-4 py-2.5 text-xs font-bold text-gray-400 hover:text-red-400 transition"
            >
              <Trash2 className="h-4 w-4" /> Clear All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>

      <Footer />
    </main>
  );
}
