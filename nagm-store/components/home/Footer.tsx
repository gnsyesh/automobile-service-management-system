"use client";

import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, ShieldCheck, CreditCard } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#2D2D2D] bg-[#0A0A0A] text-gray-400 pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#2D2D2D]">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B3A2E] text-lg font-black text-white shadow-lg border border-[#D4A017]/30">
                N
              </div>
              <div>
                <h2 className="text-xl font-black text-white">
                  NEGM<span className="text-[#D4A017] ml-1">STORE</span>
                </h2>
                <p className="text-[10px] uppercase tracking-widest text-gray-400">LUXURY AUTO PARTS</p>
              </div>
            </Link>

            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Negm Store is Egypt's leading premier online destination for genuine automotive spare parts, synthetic engine lubricants, batteries, braking systems, and car care accessories.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="h-4 w-4" /> 100% Genuine Guaranteed
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-[#D4A017] pl-2.5">
              Categories
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/shop?category=engine-oils" className="hover:text-[#D4A017] transition">Engine Oils & Lubricants</Link></li>
              <li><Link href="/shop?category=brake-system" className="hover:text-[#D4A017] transition">Brake Pads & Discs</Link></li>
              <li><Link href="/shop?category=filters" className="hover:text-[#D4A017] transition">Filters (Air, Oil, Cabin)</Link></li>
              <li><Link href="/shop?category=ignition-electrical" className="hover:text-[#D4A017] transition">Spark Plugs & Batteries</Link></li>
              <li><Link href="/shop?category=tyres-wheels" className="hover:text-[#D4A017] transition">Car Tyres & Wheel Care</Link></li>
              <li><Link href="/shop?category=car-care" className="hover:text-[#D4A017] transition">Car Detailing & Shampoo</Link></li>
            </ul>
          </div>

          {/* Account & Navigation */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-[#D4A017] pl-2.5">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/shop" className="hover:text-[#D4A017] transition">Shop Parts Catalog</Link></li>
              <li><Link href="/cart" className="hover:text-[#D4A017] transition">Shopping Cart</Link></li>
              <li><Link href="/wishlist" className="hover:text-[#D4A017] transition">Saved Wishlist</Link></li>
              <li><Link href="/profile" className="hover:text-[#D4A017] transition">Customer Profile & Orders</Link></li>
              <li><Link href="/login" className="hover:text-[#D4A017] transition">Account Login</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-[#D4A017] pl-2.5">
              Contact & Hotline
            </h3>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#D4A017] shrink-0" />
                <span className="text-white font-bold">Hotline: 19888</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#D4A017] shrink-0" />
                <span>support@negmstore.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#D4A017] shrink-0 mt-0.5" />
                <span>New Cairo, Egypt</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Payment Methods */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 Negm Store. All Rights Reserved. Built for Automotive Excellence in Egypt.</p>

          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-medium">Payment Methods:</span>
            <div className="flex items-center gap-2 text-white font-bold bg-[#1B1B1B] px-3 py-1.5 rounded-lg border border-[#2D2D2D]">
              <span>Cash on Delivery</span>
            </div>
            <div className="flex items-center gap-2 text-[#D4A017] font-bold bg-[#1B1B1B] px-3 py-1.5 rounded-lg border border-[#2D2D2D]">
              <span>Visa / Mastercard</span>
            </div>
            <div className="flex items-center gap-2 text-red-400 font-bold bg-[#1B1B1B] px-3 py-1.5 rounded-lg border border-[#2D2D2D]">
              <span>Vodafone Cash</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
