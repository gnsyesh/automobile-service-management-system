"use client";

import React from "react";
import Link from "next/link";
import { brands } from "@/data/brands";
import { useLanguage } from "@/context/LanguageContext";

export default function Brands() {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-slate-50 dark:bg-[#0A0A0A] border-t border-slate-200 dark:border-[#2D2D2D] overflow-hidden transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
            {t("brands.badge")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {t("brands.title")}
          </h2>
        </div>

        <div className="flex items-center justify-around gap-6 flex-wrap opacity-90">
          {brands.slice(0, 12).map((brand) => (
            <Link
              key={brand.id}
              href={`/shop?brand=${brand.slug}`}
              className="group flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B]/60 hover:border-[#D4A017] dark:hover:bg-[#1B1B1B] transition-all duration-300 w-36 shadow-sm"
            >
              <span className="text-sm font-extrabold text-slate-700 dark:text-gray-300 group-hover:text-[#D4A017] transition-colors tracking-tight">
                {brand.name}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-gray-500 font-medium">{brand.country}</span>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
