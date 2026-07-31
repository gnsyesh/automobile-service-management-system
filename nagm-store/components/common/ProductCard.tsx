"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, Eye, Star, CheckCircle, AlertTriangle } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useVehicle } from "@/context/VehicleContext";
import QuickViewModal from "./QuickViewModal";

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

export default function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { selectedVehicle, isCompatible } = useVehicle();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const isLiked = isInWishlist(product.id);
  const fitsVehicle = selectedVehicle ? isCompatible(product) : null;

  if (viewMode === "list") {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="group relative flex flex-col md:flex-row items-center gap-6 rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B]/80 p-5 backdrop-blur-xl transition-all duration-300 hover:border-[#D4A017]/50 hover:shadow-xl shadow-sm"
        >
          {/* Image */}
          <div className="relative h-48 w-full md:w-56 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-[#111111]">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            />
            {product.discount && (
              <span className="absolute top-3 left-3 rounded-full bg-[#8B3A2E] px-2.5 py-1 text-xs font-bold text-white shadow-md">
                -{product.discount}%
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-between w-full">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D4A017]">
                  {product.brand}
                </span>

                {selectedVehicle && fitsVehicle !== null && (
                  <div
                    className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${
                      fitsVehicle
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {fitsVehicle ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Fits Your {selectedVehicle.model}</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Check Fitment</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Link href={`/product/${product.id}`} className="block group-hover:text-[#D4A017] transition-colors">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                  {product.name}
                </h3>
              </Link>

              <p className="mt-2 text-sm text-slate-600 dark:text-gray-400 line-clamp-2">
                {product.shortDescription}
              </p>

              {/* Rating */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center text-[#D4A017]">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="ml-1 text-sm font-bold text-slate-900 dark:text-white">{product.rating}</span>
                </div>
                <span className="text-xs text-slate-500 dark:text-gray-500">({product.reviewsCount} reviews)</span>
                <span className="text-slate-400 dark:text-gray-600">•</span>
                <span className="text-xs text-slate-500 dark:text-gray-400">SKU: {product.sku}</span>
              </div>
            </div>

            {/* Price & Actions */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-[#2D2D2D]">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {product.price.toLocaleString()} <span className="text-sm font-semibold text-[#D4A017]">EGP</span>
                  </span>
                  {product.oldPrice && (
                    <span className="text-sm text-slate-400 dark:text-gray-500 line-through">
                      {product.oldPrice.toLocaleString()} EGP
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isLiked
                      ? "border-red-500/50 bg-red-500/10 text-red-500"
                      : "border-slate-200 dark:border-[#2D2D2D] bg-slate-100 dark:bg-[#111111] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                </button>

                <button
                  onClick={() => setIsQuickViewOpen(true)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-100 dark:bg-[#111111] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all"
                  aria-label="Quick View"
                >
                  <Eye className="h-5 w-5" />
                </button>

                <button
                  onClick={() => addToCart(product)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B3A2E] text-white font-semibold text-sm hover:bg-[#a34436] transition-all shadow-md"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <QuickViewModal
          product={product}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B]/80 p-4 backdrop-blur-xl transition-all duration-300 hover:border-[#D4A017]/50 hover:shadow-xl shadow-sm hover:-translate-y-1"
      >
        {/* Top Badges & Heart */}
        <div className="relative h-56 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-[#111111] p-4 flex items-center justify-center">
          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            {product.discount && (
              <span className="rounded-full bg-[#8B3A2E] px-2.5 py-1 text-xs font-extrabold text-white shadow-md">
                -{product.discount}%
              </span>
            )}
            {product.isBestSeller && (
              <span className="rounded-full bg-[#D4A017] px-2.5 py-0.5 text-[10px] font-black uppercase text-black">
                Best Seller
              </span>
            )}
          </div>

          {/* Quick Actions Hover overlay */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => toggleWishlist(product)}
              className={`p-2 rounded-full border backdrop-blur-md transition-all shadow-md ${
                isLiked
                  ? "border-red-500 bg-red-500/20 text-red-500"
                  : "border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#111111]/80 text-slate-600 dark:text-gray-300 hover:text-red-500"
              }`}
              aria-label="Toggle Wishlist"
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            </button>

            <button
              onClick={() => setIsQuickViewOpen(true)}
              className="p-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#111111]/80 text-slate-600 dark:text-gray-300 hover:text-[#D4A017] transition-all shadow-md"
              aria-label="Quick View"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>

          {/* Product Image */}
          <Link href={`/product/${product.id}`} className="relative h-full w-full block">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Content */}
        <div className="mt-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4A017]">
                {product.brand}
              </span>

              <div className="flex items-center text-[#D4A017] text-xs font-semibold">
                <Star className="h-3.5 w-3.5 fill-current mr-1" />
                <span>{product.rating}</span>
                <span className="text-slate-400 dark:text-gray-500 ml-1">({product.reviewsCount})</span>
              </div>
            </div>

            <Link href={`/product/${product.id}`} className="block group-hover:text-[#D4A017] transition-colors">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 h-10">
                {product.name}
              </h3>
            </Link>

            {/* Vehicle compatibility check banner */}
            {selectedVehicle && fitsVehicle !== null && (
              <div
                className={`mt-2.5 flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md border ${
                  fitsVehicle
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}
              >
                {fitsVehicle ? (
                  <>
                    <CheckCircle className="h-3 w-3 shrink-0" />
                    <span className="truncate">Fits {selectedVehicle.make} {selectedVehicle.model}</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    <span className="truncate">Does not fit active car</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Pricing & Add to Cart */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#2D2D2D] flex items-center justify-between gap-2">
            <div>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white leading-none">
                {product.price.toLocaleString()} <span className="text-xs text-[#D4A017] font-semibold">EGP</span>
              </div>
              {product.oldPrice && (
                <div className="text-xs text-slate-400 dark:text-gray-500 line-through mt-0.5">
                  {product.oldPrice.toLocaleString()} EGP
                </div>
              )}
            </div>

            <button
              onClick={() => addToCart(product)}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#8B3A2E] px-3.5 py-2 text-xs font-bold text-white transition-all hover:bg-[#a34436]"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </motion.div>

      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}
