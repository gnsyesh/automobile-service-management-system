"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Truck, Headphones, RotateCcw } from "lucide-react";

const features = [
  {
    icon: <ShieldCheck className="h-8 w-8 text-[#D4A017]" />,
    title: "100% Genuine Guaranteed",
    description: "Sourced directly from authorized distributors (Mobil, Shell, Castrol, Bosch, Brembo, Varta) with batch serial validation."
  },
  {
    icon: <Truck className="h-8 w-8 text-[#D4A017]" />,
    title: "Fast Egypt Express Delivery",
    description: "Doorstep delivery within 24 to 48 hours across Cairo, Giza, Alexandria, Delta, and Upper Egypt governorates."
  },
  {
    icon: <Headphones className="h-8 w-8 text-[#D4A017]" />,
    title: "24/7 Expert Auto Support",
    description: "Dedicated mechanical engineers ready to assist you in selecting exact fitment parts via hotline 19888."
  },
  {
    icon: <RotateCcw className="h-8 w-8 text-[#D4A017]" />,
    title: "Hassle-Free 14-Day Returns",
    description: "Easy 14-day replacement or full refund policy on all sealed unopened auto parts and accessories."
  }
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-slate-100 dark:bg-[#111111] border-t border-slate-200 dark:border-[#2D2D2D] transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
            THE NEGM STORE DIFFERENCE
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
            Why Egyptian Car Owners Trust Us
          </h2>
          <p className="text-sm text-slate-600 dark:text-gray-400 mt-3">
            Combining authentic automotive engineering excellence with seamless modern e-commerce.
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
              className="rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B]/80 p-6 backdrop-blur-xl transition-all duration-300 hover:border-[#D4A017]/40 hover:-translate-y-1 shadow-sm"
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
