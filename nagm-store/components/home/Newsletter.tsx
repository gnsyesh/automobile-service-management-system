"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      showToast("Thank you for subscribing! Check your inbox for exclusive VIP auto discounts.", "success");
      setEmail("");
    }
  };

  return (
    <section className="py-16 bg-[#111111] border-t border-[#2D2D2D]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-[#D4A017]/40 bg-gradient-to-r from-[#1B1B1B] via-[#261d19] to-[#8B3A2E]/40 p-8 sm:p-12 backdrop-blur-2xl shadow-2xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017] flex items-center gap-1.5">
                <Mail className="h-4 w-4" /> VIP CLUB DISCOUNTS
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">
                Subscribe For Exclusive Deals
              </h2>
              <p className="text-sm text-gray-300 mt-2">
                Receive secret discount coupons, maintenance guides, and new product launch notifications directly in your inbox.
              </p>
            </div>

            <div className="lg:col-span-5">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  required
                  className="w-full rounded-xl border border-[#2D2D2D] bg-[#111111] px-4 py-3.5 text-sm text-white placeholder-gray-400 focus:border-[#D4A017] focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#8B3A2E] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#a34436] transition shrink-0 shadow-lg"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
