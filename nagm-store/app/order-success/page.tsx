"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { CheckCircle2, Printer, ArrowRight, Truck, ShieldCheck, Package, ShoppingBag } from "lucide-react";
import { Order } from "@/types";

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("negm_latest_order");
      if (saved) setOrder(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-[#111111] text-gray-100 flex flex-col pt-32 pb-20">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 w-full flex-1">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="rounded-3xl border border-[#D4A017]/40 bg-[#1B1B1B] p-8 sm:p-12 backdrop-blur-2xl shadow-2xl text-center space-y-8"
        >
          
          {/* Animated Victory Icon */}
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="h-12 w-12" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
              ORDER CONFIRMED & IN PROCESS
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
              Thank You For Your Order!
            </h1>
            <p className="text-sm text-gray-300 mt-2 max-w-md mx-auto">
              Your order has been received and is being prepared by our central warehouse team in New Cairo.
            </p>
          </div>

          {/* Order Details Card */}
          {order && (
            <div className="rounded-2xl border border-[#2D2D2D] bg-[#111111] p-6 text-left space-y-6">
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-[#2D2D2D] pb-4 text-xs">
                <div>
                  <span className="text-gray-400">Order Number:</span>
                  <div className="font-extrabold text-[#D4A017] text-sm">{order.id}</div>
                </div>
                <div>
                  <span className="text-gray-400">Order Date:</span>
                  <div className="font-bold text-white">{order.orderDate}</div>
                </div>
                <div>
                  <span className="text-gray-400">Estimated Delivery:</span>
                  <div className="font-bold text-emerald-400">{order.estimatedDelivery}</div>
                </div>
                <div>
                  <span className="text-gray-400">Tracking Code:</span>
                  <div className="font-mono text-gray-300">{order.trackingNumber}</div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-gray-400">Ordered Spare Parts & Fluids</h4>
                {order.items?.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between gap-3 text-xs border-b border-[#2D2D2D]/60 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 bg-[#1B1B1B] rounded-xl overflow-hidden p-1">
                        <Image src={item.product.images[0]} alt="" fill className="object-contain" />
                      </div>
                      <div>
                        <div className="font-bold text-white">{item.product.name}</div>
                        <div className="text-gray-400">Brand: {item.product.brand} • Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <div className="font-bold text-white">
                      {(item.product.price * item.quantity).toLocaleString()} EGP
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Totals */}
              <div className="pt-2 text-xs space-y-1.5 text-right">
                <div className="text-gray-400">Subtotal: <span className="text-white font-bold">{order.subtotal?.toLocaleString()} EGP</span></div>
                <div className="text-gray-400">VAT (14%): <span className="text-white font-bold">{order.vat?.toLocaleString()} EGP</span></div>
                <div className="text-sm font-black text-white pt-2 border-t border-[#2D2D2D]">
                  Grand Total Paid: <span className="text-[#D4A017]">{order.total?.toLocaleString()} EGP</span>
                </div>
              </div>

            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handlePrint}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#D4A017]/40 bg-[#1B1B1B] px-6 py-3.5 text-xs font-bold text-white hover:border-[#D4A017] transition shadow-lg"
            >
              <Printer className="h-4 w-4 text-[#D4A017]" />
              <span>Print / Save Receipt PDF</span>
            </button>

            <Link
              href="/profile"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#2D2D2D] bg-[#111111] px-6 py-3.5 text-xs font-bold text-gray-300 hover:text-white transition"
            >
              <Package className="h-4 w-4" />
              <span>View Order History</span>
            </Link>

            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#8B3A2E] px-8 py-3.5 text-xs font-bold text-white hover:bg-[#a34436] transition shadow-xl"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>

        </motion.div>

      </div>

      <Footer />
    </main>
  );
}
