"use client";

import React from "react";
import { Truck, ShieldCheck, PhoneCall } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AnnouncementBar() {
  const { t } = useLanguage();

  return (
    <div className="bg-[#8B3A2E] text-white text-xs font-semibold py-2 border-b border-[#D4A017]/30">
      <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-6 mx-auto sm:mx-0">
          <div className="flex items-center gap-1.5">
            <Truck className="h-4 w-4 text-[#D4A017] shrink-0" />
            <span>{t("announcement.freeShipping")}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#D4A017] shrink-0" />
            <span>{t("announcement.guarantee")}</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-gray-200">
          <div className="flex items-center gap-1.5">
            <PhoneCall className="h-3.5 w-3.5 text-[#D4A017] shrink-0" />
            <span>{t("announcement.hotline")}: <strong className="text-white">19888</strong></span>
          </div>
          <span className="text-white/40">|</span>
          <span className="text-[#D4A017] font-bold">{t("announcement.promoCode")}</span>
        </div>
      </div>
    </div>
  );
}
