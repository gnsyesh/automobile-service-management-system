"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-200 dark:border-[#2D2D2D] bg-slate-900 text-slate-300 dark:bg-[#0A0A0A] dark:text-gray-400 pt-16 pb-12 transition-colors duration-300 text-left rtl:text-right">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800 dark:border-[#2D2D2D]">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-12 w-48">
                <Image
                  src="/images/negm-store-logo.png"
                  alt="Negm Store Official Logo"
                  fill
                  className="object-contain object-left rtl:object-right"
                />
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
          <p>{t("footer.copyright")}</p>

          <div className="flex items-center gap-3">
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

      </div>
    </footer>
  );
}
