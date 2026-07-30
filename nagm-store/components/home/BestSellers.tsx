"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";
import ProductCard from "@/components/common/ProductCard";
import { products } from "@/data/products";

export default function BestSellers() {
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);

  return (
    <section className="py-20 bg-[#0A0A0A] border-t border-[#2D2D2D]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017] flex items-center gap-1.5">
              <Award className="h-4 w-4" /> MOST POPULAR IN EGYPT
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">
              Top Selling Products
            </h2>
          </div>
          <Link
            href="/shop?sort=popular"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#D4A017] hover:underline"
          >
            <span>View All Best Sellers</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
}
