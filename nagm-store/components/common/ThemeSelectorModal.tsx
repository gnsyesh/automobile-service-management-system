"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Palette, CheckCircle, Sparkles } from "lucide-react";
import { useTheme, themes, ThemeMode } from "@/context/ThemeContext";

export default function ThemeSelectorModal() {
  const { theme, setTheme, isThemeModalOpen, setIsThemeModalOpen } = useTheme();

  if (!isThemeModalOpen) return null;

  const handleSelect = (mode: ThemeMode) => {
    setTheme(mode);
    setIsThemeModalOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsThemeModalOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Dialog Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-xl rounded-3xl border border-[#D4A017]/40 bg-[#1B1B1B] p-6 sm:p-8 shadow-2xl overflow-hidden text-white"
        >
          <div className="flex items-center justify-between border-b border-[#2D2D2D] pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8B3A2E] text-white shadow-lg">
                <Palette className="h-6 w-6 text-[#D4A017]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Choose Application Theme</h3>
                <p className="text-xs text-gray-400">Select your preferred automotive visual aesthetic</p>
              </div>
            </div>

            <button
              onClick={() => setIsThemeModalOpen(false)}
              className="p-2 rounded-full bg-[#111111] text-gray-400 hover:text-white hover:bg-[#8B3A2E] transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Theme Presets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {themes.map((t) => {
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelect(t.id)}
                  className={`group relative flex flex-col justify-between text-left p-4 rounded-2xl border transition-all duration-300 ${
                    isSelected
                      ? "border-[#D4A017] bg-[#8B3A2E]/20 shadow-[0_0_20px_rgba(212,160,23,0.2)] scale-[1.02]"
                      : "border-[#2D2D2D] bg-[#111111] hover:border-gray-500 hover:bg-[#1B1B1B]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-sm font-bold text-white group-hover:text-[#D4A017] transition-colors">
                        {t.name}
                      </span>
                      {isSelected && <CheckCircle className="h-4 w-4 text-[#D4A017] shrink-0" />}
                    </div>

                    <p className="text-[11px] text-gray-400 leading-snug line-clamp-2">
                      {t.description}
                    </p>
                  </div>

                  {/* Color Swatch Preview */}
                  <div className="mt-4 pt-3 border-t border-[#2D2D2D] flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Colors:</span>
                    <div className="flex items-center gap-1.5">
                      <div className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: t.bgDark }} title="Background" />
                      <div className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: t.cardBg }} title="Card Background" />
                      <div className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: t.accentColor }} title="Accent Highlight" />
                      <div className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: t.brandColor }} title="Brand Primary" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="mt-6 pt-4 border-t border-[#2D2D2D] text-center text-xs text-gray-400">
            Selected theme updates instantly across all pages and persists in your browser.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
