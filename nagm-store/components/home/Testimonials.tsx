"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, CheckCircle2 } from "lucide-react";

const testimonials = [
  {
    name: "Eng. Ahmed El-Sayed",
    car: "2021 Toyota Corolla 1.6L",
    location: "New Cairo",
    rating: 5,
    comment: "Ordered Mobil 1 ESP 5W-30 and Mann oil filter. Delivered to my doorstep in Tagamoa within 24 hours. The QR serial code verified 100% original. Exceptional service!"
  },
  {
    name: "Mahmoud Hassan",
    car: "2019 Hyundai Elantra AD",
    location: "Giza / Sheikh Zayed",
    rating: 5,
    comment: "Brembo ceramic front brake pads completely eliminated the squeaking noise I had for months. Best auto spare parts platform in Egypt."
  },
  {
    name: "Dr. Tarek Mansour",
    car: "2022 BMW 320i (G20)",
    location: "Alexandria",
    rating: 5,
    comment: "Varta Silver Dynamic AGM battery was delivered directly to my garage and installed smoothly. Negm Store pricing is unbeatable compared to dealer markups."
  }
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-slate-100 dark:bg-[#111111] border-t border-slate-200 dark:border-[#2D2D2D] transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
            VERIFIED REVIEWS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
            What Egyptian Drivers Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="relative rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B]/80 p-6 backdrop-blur-xl flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center gap-1 text-[#D4A017] mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>

                <p className="text-sm text-slate-700 dark:text-gray-300 italic leading-relaxed">
                  "{t.comment}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#2D2D2D] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    {t.name} <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  </h4>
                  <p className="text-xs text-[#D4A017] font-medium">{t.car}</p>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-gray-500">{t.location}</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
