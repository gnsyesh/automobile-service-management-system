"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { brands } from "@/data/brands";

export default function Brands() {
  return (
    <section className="py-16 bg-[#0A0A0A] border-t border-[#2D2D2D] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
            AUTHORIZED DISTRIBUTORS & BRANDS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Premium Global Manufacturers
          </h2>
        </div>

        <div className="flex items-center justify-around gap-6 flex-wrap opacity-90">
          {brands.slice(0, 12).map((brand) => (
            <Link
              key={brand.id}
              href={`/shop?brand=${brand.slug}`}
              className="group flex flex-col items-center justify-center p-4 rounded-xl border border-[#2D2D2D] bg-[#1B1B1B]/60 hover:border-[#D4A017] hover:bg-[#1B1B1B] transition-all duration-300 w-36"
            >
              <span className="text-sm font-extrabold text-gray-300 group-hover:text-[#D4A017] transition-colors tracking-tight">
                {brand.name}
              </span>
              <span className="text-[10px] text-gray-500 font-medium">{brand.country}</span>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
