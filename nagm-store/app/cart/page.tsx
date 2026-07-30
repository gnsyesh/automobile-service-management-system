"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag, ShieldCheck, ArrowLeft } from "lucide-react";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    coupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discountAmount,
    shipping,
    vat,
    total,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    if (couponInput) {
      const res = applyCoupon(couponInput);
      if (!res.success) {
        setCouponError(res.message);
      } else {
        setCouponInput("");
      }
    }
  };

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#111111] text-gray-100 flex flex-col pt-32 pb-20">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 text-center my-auto py-16">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#1B1B1B] text-[#D4A017] mx-auto mb-6 border border-[#2D2D2D]">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-black text-white">Your Shopping Cart is Empty</h1>
          <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
            Looks like you haven't added any spare parts, fluids, or car care products to your cart yet.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#8B3A2E] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#a34436] transition shadow-xl"
          >
            <ArrowLeft className="h-4 w-4" /> Explore Catalog
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
        
        <div className="flex items-center justify-between border-b border-[#2D2D2D] pb-6 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
              CHECKOUT PREPARATION
            </span>
            <h1 className="text-3xl font-black text-white mt-1">Shopping Cart</h1>
          </div>

          <button
            onClick={clearCart}
            className="text-xs font-bold text-gray-400 hover:text-red-400 flex items-center gap-1 transition"
          >
            <Trash2 className="h-4 w-4" /> Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => {
              const itemTotal = item.product.price * item.quantity;
              return (
                <div
                  key={item.product.id}
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-[#2D2D2D] bg-[#1B1B1B]/80 p-4 backdrop-blur-xl transition hover:border-[#D4A017]/30"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative h-20 w-20 shrink-0 bg-[#111111] rounded-xl overflow-hidden p-2">
                      <Image src={item.product.images[0]} alt="" fill className="object-contain p-1" />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#D4A017]">
                        {item.product.brand} • {item.product.sku}
                      </span>
                      <Link href={`/product/${item.product.id}`} className="block hover:text-[#D4A017] transition">
                        <h3 className="text-sm font-bold text-white line-clamp-2">{item.product.name}</h3>
                      </Link>
                      <div className="text-xs text-gray-400 mt-1">
                        {item.product.price.toLocaleString()} EGP / unit
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls & Price */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#2D2D2D]">
                    <div className="flex items-center rounded-xl border border-[#2D2D2D] bg-[#111111]">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-2 text-gray-300 hover:text-white transition"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-2 text-gray-300 hover:text-white transition"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-extrabold text-white">
                        {itemTotal.toLocaleString()} <span className="text-xs text-[#D4A017]">EGP</span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="pt-4 flex items-center justify-between">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#D4A017] hover:underline"
              >
                <ArrowLeft className="h-4 w-4" /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-[#D4A017]/30 bg-[#1B1B1B] p-6 backdrop-blur-xl shadow-2xl space-y-5">
              <h2 className="text-lg font-black text-white border-b border-[#2D2D2D] pb-3">
                Order Summary
              </h2>

              {/* Coupon Box */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-[#D4A017]" /> Promo Code
                </label>
                {coupon ? (
                  <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 font-bold">
                    <span>Applied: {coupon.code} ({coupon.description})</span>
                    <button onClick={removeCoupon} className="text-red-400 hover:underline">Remove</button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="e.g. NEGM10"
                      className="w-full rounded-xl border border-[#2D2D2D] bg-[#111111] px-3.5 py-2.5 text-xs text-white uppercase focus:border-[#D4A017] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-[#8B3A2E] text-xs font-bold text-white hover:bg-[#a34436] transition shrink-0"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-red-400 mt-1">{couponError}</p>}
              </div>

              {/* Breakdown */}
              <div className="space-y-2.5 pt-3 border-t border-[#2D2D2D] text-xs text-gray-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">{subtotal.toLocaleString()} EGP</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Discount</span>
                    <span>-{discountAmount.toLocaleString()} EGP</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery (Egypt)</span>
                  <span className="font-bold text-white">
                    {shipping === 0 ? <span className="text-emerald-400">FREE</span> : `${shipping} EGP`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>VAT (14%)</span>
                  <span className="font-bold text-white">{vat.toLocaleString()} EGP</span>
                </div>

                <div className="flex justify-between text-base font-black text-white pt-3 border-t border-[#2D2D2D]">
                  <span>Total Amount</span>
                  <span className="text-[#D4A017]">{total.toLocaleString()} EGP</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#8B3A2E] font-bold text-white text-sm hover:bg-[#a34436] transition shadow-xl hover:shadow-[0_10px_25px_rgba(139,58,46,0.4)]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>

      </div>

      <Footer />
    </main>
  );
}
