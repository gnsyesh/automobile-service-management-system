"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Truck, Headphones, RotateCcw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function WhyChooseUs() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <ShieldCheck className="h-8 w-8 text-[#D4A017]" />,
      title: t("why.f1Title"),
      description: t("why.f1Desc")
    },
    {
      icon: <Truck className="h-8 w-8 text-[#D4A017]" />,
      title: t("why.f2Title"),
      description: t("why.f2Desc")
    },
    {
      icon: <Headphones className="h-8 w-8 text-[#D4A017]" />,
      title: t("why.f3Title"),
      description: t("why.f3Desc")
    },
    {
      icon: <RotateCcw className="h-8 w-8 text-[#D4A017]" />,
      title: t("why.f4Title"),
      description: t("why.f4Desc")
    }
  ];

  return (
    <section className="py-20 bg-slate-100 dark:bg-[#111111] border-t border-slate-200 dark:border-[#2D2D2D] transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
            {t("why.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
            {t("why.title")}
          </h2>
          <p className="text-sm text-slate-600 dark:text-gray-400 mt-3">
            {t("why.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className="rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B]/80 p-6 backdrop-blur-xl transition-all duration-300 hover:border-[#D4A017]/40 hover:-translate-y-1 shadow-sm text-left rtl:text-right"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-[#111111] border border-slate-200 dark:border-[#2D2D2D] mb-5">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
