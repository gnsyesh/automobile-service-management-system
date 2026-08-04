"use client";

import React from "react";
import { Phone, Mail, MapPin, Headphones } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Contact() {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-slate-100 dark:bg-[#0A0A0A] border-t border-slate-200 dark:border-[#2D2D2D] transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 text-left rtl:text-right">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017] flex items-center gap-1.5">
              <Headphones className="h-4 w-4 shrink-0" /> {t("contact.badge")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
              {t("contact.title")}
            </h2>
            <p className="text-sm text-slate-600 dark:text-gray-300 mt-3 leading-relaxed">
              {t("contact.desc")}
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B] p-4 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B3A2E] text-white shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-gray-400">{t("contact.hotline")}</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">19888 / +20 100 123 4567</div>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B] p-4 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4A017] text-black shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-gray-400">{t("contact.email")}</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">support@negmstore.com</div>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B] p-4 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B3A2E] text-white shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-gray-400">{t("contact.hq")}</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{t("contact.hqAddress")}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-slate-200 dark:border-[#D4A017]/30 bg-white dark:bg-[#1B1B1B] p-8 shadow-xl text-left rtl:text-right">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t("contact.formTitle")}</h3>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">{t("contact.fullName")}</label>
                  <input
                    type="text"
                    placeholder="e.g. Ahmed Mahmoud"
                    className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-100 dark:bg-[#111111] px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-[#D4A017] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">{t("contact.phone")}</label>
                  <input
                    type="tel"
                    placeholder="+20 100 000 0000"
                    className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-100 dark:bg-[#111111] px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-[#D4A017] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">{t("contact.inquiry")}</label>
                  <textarea
                    rows={4}
                    placeholder="..."
                    className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-100 dark:bg-[#111111] px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-[#D4A017] focus:outline-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#8B3A2E] font-bold text-white text-sm hover:bg-[#a34436] transition shadow-lg"
                >
                  {t("contact.sendBtn")}
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
