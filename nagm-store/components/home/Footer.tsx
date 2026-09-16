"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-200 dark:border-[#2D2D2D] bg-slate-900 text-slate-300 dark:bg-[#0A0A0A] dark:text-gray-400 pt-16 pb-12 transition-colors duration-300 text-left rtl:text-right overflow-hidden w-full max-w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full min-w-0">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800 dark:border-[#2D2D2D]">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-11 w-11 shrink-0 rounded-xl bg-slate-800 dark:bg-[#1B1B1B] p-1 border border-slate-700 dark:border-[#D4A017]/40 shadow-md">
                <Image
                  src="/images/negm-store-logo.png"
                  alt="Negm Store Official Logo"
                  width={44}
                  height={44}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="leading-none">
                <span className="text-xl font-black tracking-tight text-white">
                  NEGM<span className="ml-1 text-[#D4A017]">STORE</span>
                </span>
                <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 mt-0.5 font-semibold">
                  Luxury Auto Parts
                </p>
              </div>
            </Link>

            <p className="text-xs text-slate-300 dark:text-gray-400 leading-relaxed max-w-sm">
              {t("footer.desc")}
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="h-4 w-4 shrink-0" /> {t("footer.genuine")}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 rtl:border-l-0 rtl:border-r-2 border-[#D4A017] pl-2.5 rtl:pl-0 rtl:pr-2.5">
              {t("footer.categories")}
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/shop?category=engine-oils" className="hover:text-[#D4A017] transition">{t("cat.engine-oils")}</Link></li>
              <li><Link href="/shop?category=brake-system" className="hover:text-[#D4A017] transition">{t("cat.brake-system")}</Link></li>
              <li><Link href="/shop?category=filters" className="hover:text-[#D4A017] transition">{t("cat.filters")}</Link></li>
              <li><Link href="/shop?category=ignition-electrical" className="hover:text-[#D4A017] transition">{t("cat.ignition-electrical")}</Link></li>
              <li><Link href="/shop?category=tyres-wheels" className="hover:text-[#D4A017] transition">{t("cat.tyres-wheels")}</Link></li>
              <li><Link href="/shop?category=car-care" className="hover:text-[#D4A017] transition">{t("cat.car-care")}</Link></li>
            </ul>
          </div>

          {/* Account & Navigation */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 rtl:border-l-0 rtl:border-r-2 border-[#D4A017] pl-2.5 rtl:pl-0 rtl:pr-2.5">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/shop" className="hover:text-[#D4A017] transition">{t("nav.shop")}</Link></li>
              <li><Link href="/cart" className="hover:text-[#D4A017] transition">{t("nav.cart")}</Link></li>
              <li><Link href="/wishlist" className="hover:text-[#D4A017] transition">{t("nav.wishlist")}</Link></li>
              <li><Link href="/profile" className="hover:text-[#D4A017] transition">{t("nav.profile")}</Link></li>
              <li><Link href="/login" className="hover:text-[#D4A017] transition">{t("nav.login")}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 rtl:border-l-0 rtl:border-r-2 border-[#D4A017] pl-2.5 rtl:pl-0 rtl:pr-2.5">
              {t("footer.contact")}
            </h3>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#D4A017] shrink-0" />
                <span className="text-white font-bold">19888</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#D4A017] shrink-0" />
                <span>support@negmstore.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#D4A017] shrink-0 mt-0.5" />
                <span>{t("contact.hqAddress")}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Payment Methods */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-center sm:text-left rtl:sm:text-right">{t("footer.copyright")}</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3">
            <span className="text-slate-400 dark:text-gray-500 font-medium">{t("footer.paymentMethods")}</span>
            <div className="flex items-center gap-2 text-white font-bold bg-slate-800 dark:bg-[#1B1B1B] px-3 py-1.5 rounded-lg border border-slate-700 dark:border-[#2D2D2D]">
              <span>Cash on Delivery</span>
            </div>
            <div className="flex items-center gap-2 text-[#D4A017] font-bold bg-slate-800 dark:bg-[#1B1B1B] px-3 py-1.5 rounded-lg border border-slate-700 dark:border-[#2D2D2D]">
              <span>Visa / Mastercard</span>
            </div>
            <div className="flex items-center gap-2 text-red-400 font-bold bg-slate-800 dark:bg-[#1B1B1B] px-3 py-1.5 rounded-lg border border-slate-700 dark:border-[#2D2D2D]">
              <span>Vodafone Cash</span>
            </div>
          </div>
        </div>

        {/* Dedicated Developer Credit & Contact */}
        <div className="mt-8 pt-6 border-t border-slate-800 dark:border-[#1F1F1F] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col text-center sm:text-left rtl:sm:text-right">
            <span className="text-[11px] font-medium tracking-wider uppercase text-slate-400 dark:text-gray-400">
              {t("footer.developedBy")}
            </span>
            <span className="text-sm sm:text-[15px] font-bold text-slate-100 dark:text-white hover:text-[#D4A017] dark:hover:text-[#D4A017] transition-colors tracking-tight mt-0.5 cursor-default">
              G Naga Sai Yeshwanth Ratna
            </span>
          </div>

          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=gnsyesh123@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700/80 hover:border-[#D4A017]/60 dark:border-[#2A2A2A] dark:hover:border-[#D4A017]/60 bg-slate-800/60 hover:bg-slate-800 dark:bg-[#141414] dark:hover:bg-[#1C1C1C] text-xs font-semibold text-slate-200 dark:text-gray-300 hover:text-[#D4A017] dark:hover:text-[#D4A017] transition-all duration-200 shadow-sm shrink-0"
          >
            <Mail className="h-3.5 w-3.5 text-[#D4A017] shrink-0" />
            <span>{t("footer.contactDev")}</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#D4A017] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180 transition-all shrink-0" />
          </a>
        </div>

      </div>
    </footer>
  );
}
