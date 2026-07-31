"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import ProductCard from "@/components/common/ProductCard";
import { products } from "@/data/products";

const tabs = [
  { id: "all", name: "All Featured" },
  { id: "engine-oils", name: "Engine Oils" },
  { id: "brake-system", name: "Brake System" },
  { id: "filters", name: "Filters" },
  { id: "car-care", name: "Car Care" },
];

export default function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredProducts = activeTab === "all"
    ? products.filter((p) => p.isFeatured || p.isBestSeller).slice(0, 8)
    : products.filter((p) => p.category === activeTab).slice(0, 8);

  return (
    <section className="py-20 bg-slate-100 dark:bg-[#0A0A0A] border-t border-slate-200 dark:border-[#2D2D2D] transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017] flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> HANDPICKED PERFORMANCE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
              Featured Spare Parts & Fluids
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === tab.id
                    ? "bg-[#8B3A2E] text-white shadow-lg border border-[#D4A017]/50"
                    : "bg-white dark:bg-[#1B1B1B] text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#2D2D2D]"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-[#D4A017]/40 bg-white dark:bg-[#1B1B1B] px-8 py-3.5 text-sm font-bold text-slate-900 dark:text-white transition hover:border-[#D4A017] hover:bg-[#8B3A2E] hover:text-white shadow-md"
          >
            <span>Explore All 100+ Automotive Products</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
