"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";
import ProductCard from "@/components/common/ProductCard";
import { products } from "@/data/products";
import { useLanguage } from "@/context/LanguageContext";

export default function BestSellers() {
  const { t } = useLanguage();
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);

  return (
    <section className="py-20 bg-slate-50 dark:bg-[#0A0A0A] border-t border-slate-200 dark:border-[#2D2D2D] transition-colors duration-300 overflow-hidden w-full max-w-full text-left rtl:text-right">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full min-w-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017] flex items-center gap-1.5">
              <Award className="h-4 w-4" /> {t("bestsellers.badge")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
              {t("bestsellers.title")}
            </h2>
          </div>
          <Link
            href="/shop?sort=popular"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#D4A017] hover:underline rtl:flex-row-reverse"
          >
            <span>{t("bestsellers.viewAll")}</span>
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
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
