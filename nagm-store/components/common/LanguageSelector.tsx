"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useLanguage, languages, LanguageMode } from "@/context/LanguageContext";

export default function LanguageSelector() {
  const { language, setLanguage, currentLanguageConfig } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: LanguageMode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Language"
        className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-[#D4A017]/40 bg-slate-100 dark:bg-[#1B1B1B]/90 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-white transition-all hover:border-[#D4A017] hover:bg-slate-200 dark:hover:bg-[#252525] shadow-sm"
      >
        <Globe className="h-4 w-4 text-[#D4A017]" />
        <span className="font-bold tracking-wider uppercase">{currentLanguageConfig.code}</span>
        <span className="hidden sm:inline text-[11px] text-slate-500 dark:text-gray-400 font-normal">
          ({currentLanguageConfig.nativeName})
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 dark:text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#D4A017]" : ""
          }`}
        />
      </button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 z-50 w-48 rounded-2xl border border-slate-200 dark:border-[#D4A017]/30 bg-white/95 dark:bg-[#1B1B1B]/95 p-1.5 backdrop-blur-2xl shadow-2xl overflow-hidden"
          >
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-400 border-b border-slate-100 dark:border-[#2D2D2D] mb-1">
              Select Language / اختر اللغة
            </div>

            <div className="space-y-1">
              {languages.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang.code)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-[#8B3A2E] text-white shadow-md"
                        : "text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-[#252525]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base leading-none">{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                      <span className="text-[10px] opacity-70 uppercase">({lang.code})</span>
                    </div>

                    {isSelected && <Check className="h-4 w-4 text-[#D4A017] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
