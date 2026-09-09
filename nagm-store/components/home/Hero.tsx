"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, ShieldCheck, Truck, Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-slate-900 text-white dark:bg-[#0A0A0A] pt-32 pb-20 lg:pt-36 lg:pb-28 transition-colors duration-300 w-full max-w-full">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 sm:h-[450px] sm:w-[450px] max-w-full rounded-full bg-[#8B3A2E]/20 blur-[100px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 sm:right-10 h-48 w-48 sm:h-[300px] sm:w-[300px] max-w-full rounded-full bg-[#D4A017]/15 blur-[80px] sm:blur-[130px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Hero Text Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 text-center lg:text-left rtl:lg:text-right min-w-0"
          >
            {/* Top Subtitle Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4A017]/40 bg-slate-800/80 dark:bg-[#1B1B1B]/80 px-4 py-1.5 text-xs font-bold text-[#D4A017] mb-6 backdrop-blur-md">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>{t("hero.badge")}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] break-words">
              {t("hero.title1")}{" "}
              <span className="bg-gradient-to-r from-[#D4A017] via-[#f7d774] to-[#D4A017] bg-clip-text text-transparent">
                {t("hero.title2")}
              </span>
            </h1>

            <p className="mt-4 sm:mt-6 max-w-2xl mx-auto lg:mx-0 text-sm sm:text-base md:text-lg text-slate-300 dark:text-gray-300 leading-relaxed font-normal">
              {t("hero.desc")}
            </p>

            {/* CTA Button */}
            <div className="mt-6 sm:mt-8 flex items-center justify-center lg:justify-start rtl:lg:justify-start">
              <Link
                href="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#8B3A2E] px-8 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white shadow-xl transition-all duration-300 hover:bg-[#a34436] hover:shadow-[0_10px_30px_rgba(139,58,46,0.4)] hover:-translate-y-0.5"
              >
                <ShoppingBag className="h-5 w-5 shrink-0" />
                <span>{t("hero.shopBtn")}</span>
              </Link>
            </div>

            {/* Feature Badges */}
            <div className="mt-10 sm:mt-12 grid grid-cols-3 gap-2 sm:gap-4 border-t border-slate-800 dark:border-[#2D2D2D] pt-6 sm:pt-8">
              <div className="text-center lg:text-left rtl:lg:text-right">
                <h4 className="text-xl sm:text-2xl md:text-3xl font-black text-[#D4A017]">{t("hero.stat1Val")}</h4>
                <p className="text-[10px] sm:text-xs text-slate-400 dark:text-gray-400 mt-1 font-semibold uppercase leading-tight">{t("hero.stat1Label")}</p>
              </div>
              <div className="text-center lg:text-left rtl:lg:text-right">
                <h4 className="text-xl sm:text-2xl md:text-3xl font-black text-[#D4A017]">{t("hero.stat2Val")}</h4>
                <p className="text-[10px] sm:text-xs text-slate-400 dark:text-gray-400 mt-1 font-semibold uppercase leading-tight">{t("hero.stat2Label")}</p>
              </div>
              <div className="text-center lg:text-left rtl:lg:text-right">
                <h4 className="text-xl sm:text-2xl md:text-3xl font-black text-[#D4A017]">{t("hero.stat3Val")}</h4>
                <p className="text-[10px] sm:text-xs text-slate-400 dark:text-gray-400 mt-1 font-semibold uppercase leading-tight">{t("hero.stat3Label")}</p>
              </div>
            </div>
          </motion.div>

          {/* Right Visual Image - Hero uses /images/negm-store-logo.png as required by Section 3 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="lg:col-span-5 relative flex items-center justify-center w-full min-w-0"
          >
            <div className="relative w-full max-w-[320px] sm:max-w-md lg:max-w-lg aspect-square">
              <div className="absolute inset-0 rounded-3xl border border-[#D4A017]/30 bg-gradient-to-b from-slate-800/90 to-slate-900 dark:from-[#1B1B1B]/95 dark:to-[#111111] backdrop-blur-2xl shadow-2xl" />

              <div className="relative z-10 h-full w-full p-6 sm:p-8 flex items-center justify-center">
                <Image
                  src="/images/negm-store-logo.png"
                  alt="Negm Store Official Branding"
                  width={450}
                  height={450}
                  priority
                  className="object-contain p-4 sm:p-6 drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-3xl"
                />
              </div>

              {/* Floating Glass Pill 1 */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 rtl:right-auto rtl:left-2 rtl:sm:left-3 z-20 flex items-center gap-2 sm:gap-3 rounded-2xl border border-[#D4A017]/30 bg-slate-900/95 dark:bg-[#1B1B1B]/95 p-2 sm:p-3 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#8B3A2E] text-white shrink-0">
                  <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D4A017]" />
                </div>
                <div className="text-left rtl:text-right">
                  <div className="text-[10px] sm:text-xs font-bold text-white whitespace-nowrap">{t("hero.deliveryPillTitle")}</div>
                  <div className="text-[9px] sm:text-[10px] text-[#D4A017] whitespace-nowrap">{t("hero.deliveryPillSub")}</div>
                </div>
              </motion.div>

              {/* Floating Glass Pill 2 */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 rtl:left-auto rtl:right-2 rtl:sm:right-3 z-20 flex items-center gap-2 sm:gap-3 rounded-2xl border border-[#D4A017]/30 bg-slate-900/95 dark:bg-[#1B1B1B]/95 p-2 sm:p-3 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#D4A017] text-black shrink-0">
                  <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" />
                </div>
                <div className="text-left rtl:text-right">
                  <div className="text-[10px] sm:text-xs font-bold text-white leading-tight whitespace-nowrap">{t("hero.brandPillTitle")}</div>
                  <div className="text-[9px] sm:text-[10px] text-emerald-400 whitespace-nowrap">{t("hero.brandPillSub")}</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}