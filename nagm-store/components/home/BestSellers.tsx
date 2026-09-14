"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/common/ProductCard";
import { products as localProducts } from "@/data/products";
import { useLanguage } from "@/context/LanguageContext";
import { Product } from "@/types";
import { fetchTopSellingSales } from "@/lib/sales";

export default function BestSellers() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);

  // Fallback curated best sellers
  const fallbackBestSellers = localProducts.filter((p) => p.isBestSeller).slice(0, 4);
  const [bestSellers, setBestSellers] = useState<Product[]>(fallbackBestSellers);

  useEffect(() => {
    let isMounted = true;

    async function loadBestSellers() {
      try {
        // Concurrently fetch top-selling sales and live products catalogue
        const [salesList, prodsSnap] = await Promise.all([
          fetchTopSellingSales(10),
          getDocs(collection(db, "products")).catch(() => null),
        ]);

        if (!isMounted) return;

        // Build catalogue (Firestore products merged with static products)
        let catalogue = localProducts;
        if (prodsSnap && !prodsSnap.empty) {
          const firestoreProds: Product[] = [];
          prodsSnap.forEach((d) => firestoreProds.push({ id: d.id, ...(d.data() as any) }));
          catalogue = firestoreProds;
        }

        const productMap = new Map<string, Product>();
        catalogue.forEach((p) => productMap.set(p.id, p));

        // If real qualifying sales exist, rank by sales
        if (salesList.length > 0) {
          const matched: Product[] = [];
          const seenIds = new Set<string>();

          for (const sale of salesList) {
            const prod = productMap.get(sale.productId);
            // Safely skip deleted or unavailable products
            if (prod && !seenIds.has(prod.id)) {
              seenIds.add(prod.id);
              matched.push(prod);
              if (matched.length === 4) break;
            }
          }

          // If fewer than 4 items have sales, fill remaining slots with curated fallback
          if (matched.length < 4) {
            for (const fallbackProd of fallbackBestSellers) {
              if (!seenIds.has(fallbackProd.id)) {
                seenIds.add(fallbackProd.id);
                matched.push(fallbackProd);
                if (matched.length === 4) break;
              }
            }
          }

          if (matched.length > 0) {
            setBestSellers(matched);
            return;
          }
        }

        // Default to curated fallback if no sales exist or error
        setBestSellers(fallbackBestSellers);
      } catch (err) {
        console.warn("Could not load real sales for BestSellers, using fallback:", err);
        if (isMounted) {
          setBestSellers(fallbackBestSellers);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadBestSellers();

    return () => {
      isMounted = false;
    };
  }, []);

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

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B]/80 p-4 space-y-4 animate-pulse"
              >
                <div className="h-56 w-full rounded-xl bg-slate-200 dark:bg-[#111111]" />
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-slate-200 dark:bg-[#2D2D2D] rounded" />
                  <div className="h-4 w-4/5 bg-slate-200 dark:bg-[#2D2D2D] rounded" />
                  <div className="h-4 w-2/3 bg-slate-200 dark:bg-[#2D2D2D] rounded" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="h-6 w-24 bg-slate-200 dark:bg-[#2D2D2D] rounded" />
                  <div className="h-9 w-24 bg-slate-200 dark:bg-[#2D2D2D] rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

