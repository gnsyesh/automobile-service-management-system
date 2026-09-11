"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Tag, ArrowRight, Copy } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";

export default function Offers() {
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(
      language === "ar"
        ? `تم نسخ كود الخصم "${code}" إلى الحافظة بنجاح!`
        : `Coupon code "${code}" copied to clipboard!`,
      "success"
    );
  };

  return (
    <section className="py-16 bg-slate-50 dark:bg-[#111111] transition-colors duration-300 overflow-hidden w-full max-w-full text-left rtl:text-right">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full min-w-0">
          {/* Offer Banner 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border border-[#D4A017]/40 bg-gradient-to-r from-[#1B1B1B] via-[#241a18] to-[#8B3A2E]/30 p-6 sm:p-8 shadow-2xl"
          >
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8B3A2E] px-3 py-1 text-xs font-extrabold text-white mb-3">
                <Tag className="h-3.5 w-3.5" /> {t("offers.specialOffer")}
              </span>

              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {language === "ar" ? "خصم 10% على كافة المشتريات" : "10% Off Your Entire Order"}
              </h3>
              <p className="text-sm text-gray-300 mt-2">
                {language === "ar" ? (
                  <>
                    استخدم كود <strong className="text-[#D4A017] font-mono">NEGM10</strong> عند الدفع للحصول على خصم فوري 10% على قطع الغيار والزيوت.
                  </>
                ) : (
                  <>
                    Use code <strong className="text-[#D4A017] font-mono">NEGM10</strong> at checkout for an instant 10% discount on all spare parts and fluids.
                  </>
                )}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => copyCode("NEGM10")}
                  className="flex items-center gap-2 rounded-xl bg-[#D4A017] px-4 py-2.5 text-xs font-black text-black hover:bg-yellow-400 transition shadow-md"
                >
                  <span>{language === "ar" ? "نسخ كود NEGM10" : "Copy Code NEGM10"}</span>
                  <Copy className="h-3.5 w-3.5" />
                </button>

                <Link
                  href="/shop"
                  className="text-xs font-bold text-white hover:text-[#D4A017] flex items-center gap-1 rtl:flex-row-reverse"
                >
                  <span>{t("offers.shopNow")}</span>
                  <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Offer Banner 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border border-[#D4A017]/40 bg-gradient-to-r from-[#1B1B1B] via-[#1f241a] to-[#D4A017]/20 p-6 sm:p-8 shadow-2xl"
          >
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4A017] px-3 py-1 text-xs font-extrabold text-black mb-3">
                <Tag className="h-3.5 w-3.5" /> {language === "ar" ? "عرض العملاء الجدد" : "NEW CUSTOMER"}
              </span>

              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {language === "ar" ? "خصم 15% للطلبات فوق 1000 جنيه" : "15% Off Orders Over 1000 EGP"}
              </h3>
              <p className="text-sm text-gray-300 mt-2">
                {language === "ar" ? (
                  <>
                    استخدم كود <strong className="text-[#D4A017] font-mono">WELCOME15</strong> للطلبات التي تتجاوز 1000 جنيه، مع شحن مجاني!
                  </>
                ) : (
                  <>
                    Use code <strong className="text-[#D4A017] font-mono">WELCOME15</strong> on orders over 1000 EGP. Free delivery included!
                  </>
                )}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => copyCode("WELCOME15")}
                  className="flex items-center gap-2 rounded-xl bg-[#8B3A2E] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#a34436] transition shadow-md"
                >
                  <span>{language === "ar" ? "نسخ كود WELCOME15" : "Copy Code WELCOME15"}</span>
                  <Copy className="h-3.5 w-3.5" />
                </button>

                <Link
                  href="/shop"
                  className="text-xs font-bold text-white hover:text-[#D4A017] flex items-center gap-1 rtl:flex-row-reverse"
                >
                  <span>{t("offers.shopNow")}</span>
                  <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
