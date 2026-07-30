"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, ShoppingBag, Heart, Check, Star, ShieldCheck, ArrowRight } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!isOpen) return null;

  const isLiked = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-4xl rounded-2xl border border-[#D4A017]/30 bg-[#1B1B1B] p-6 shadow-2xl overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-[#111111] text-gray-400 hover:text-white hover:bg-[#8B3A2E] transition-all"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Gallery Column */}
            <div className="flex flex-col gap-4">
              <div className="relative h-72 w-full overflow-hidden rounded-xl bg-[#111111] p-4 flex items-center justify-center">
                <Image
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.name}
                  fill
                  className="object-contain p-2"
                />
                {product.discount && (
                  <span className="absolute top-3 left-3 rounded-full bg-[#8B3A2E] px-3 py-1 text-xs font-bold text-white shadow-md">
                    -{product.discount}% OFF
                  </span>
                )}
              </div>

              {product.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border-2 bg-[#111111] transition-all ${
                        selectedImageIndex === idx ? "border-[#D4A017]" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image src={img} alt="" fill className="object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info Column */}
            <div className="flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
                  {product.brand} • {product.category.toUpperCase()}
                </span>

                <h2 className="mt-1 text-xl font-bold text-white leading-tight">
                  {product.name}
                </h2>

                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center text-[#D4A017]">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 text-sm font-bold text-white">{product.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500">({product.reviewsCount} verified reviews)</span>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> 100% Genuine
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-white">
                    {product.price.toLocaleString()} <span className="text-base text-[#D4A017] font-semibold">EGP</span>
                  </span>
                  {product.oldPrice && (
                    <span className="text-base text-gray-500 line-through">
                      {product.oldPrice.toLocaleString()} EGP
                    </span>
                  )}
                </div>

                <p className="mt-3 text-sm text-gray-300 leading-relaxed line-clamp-3">
                  {product.shortDescription}
                </p>

                {/* Specs Snippet */}
                <div className="mt-4 rounded-xl border border-[#2D2D2D] bg-[#111111]/60 p-3 space-y-1.5">
                  {product.specifications.slice(0, 3).map((spec, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-gray-400">{spec.label}:</span>
                      <span className="font-semibold text-gray-200">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantity & CTA */}
              <div className="mt-6 pt-4 border-t border-[#2D2D2D] flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-gray-400 uppercase">Quantity</span>
                  <div className="flex items-center border border-[#2D2D2D] rounded-xl bg-[#111111]">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 text-gray-300 hover:text-white transition"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 text-sm font-bold text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stockCount, q + 1))}
                      className="px-3 py-1.5 text-gray-300 hover:text-white transition"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">
                    {product.stockCount} items in stock
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#8B3A2E] text-white font-bold text-sm hover:bg-[#a34436] transition shadow-lg"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Add {quantity} to Cart</span>
                  </button>

                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`p-3 rounded-xl border transition ${
                      isLiked
                        ? "border-red-500 bg-red-500/10 text-red-500"
                        : "border-[#2D2D2D] bg-[#111111] text-gray-400 hover:text-white"
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                  </button>
                </div>

                <Link
                  href={`/product/${product.id}`}
                  onClick={onClose}
                  className="text-center text-xs font-semibold text-[#D4A017] hover:underline flex items-center justify-center gap-1 mt-1"
                >
                  View Full Product Details & Compatibility <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
