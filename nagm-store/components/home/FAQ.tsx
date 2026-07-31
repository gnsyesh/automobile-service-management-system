"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "How do I ensure a spare part fits my specific car model?",
    a: "Use our 'Select My Vehicle' feature at the top of the store or homepage. By specifying your car Make, Model, Year, and Engine, our algorithm automatically filters products guaranteed to fit your exact vehicle."
  },
  {
    q: "Are all motor oils and parts on Negm Store 100% genuine?",
    a: "Yes. All lubricants (Mobil 1, Shell, Castrol, Liqui Moly) and spare parts (Bosch, Brembo, Mann-Filter) come directly from authorized Egyptian importers and feature original manufacturer security seals and batch QR codes."
  },
  {
    q: "What are your delivery times and shipping costs across Egypt?",
    a: "We offer express 24-48 hour delivery for Greater Cairo (Cairo, Giza, October 6) and 48-72 hours for Alexandria and other governorates. Orders over 2,000 EGP receive FREE express delivery!"
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Cash on Delivery (COD), Credit/Debit Card payments (Visa & Mastercard), as well as Mobile Wallets (Vodafone Cash, Orange Money, InstaPay)."
  },
  {
    q: "What is your return and exchange policy?",
    a: "We offer a 14-day hassle-free return or exchange window provided the product is in its original unopened packaging with invoice proof."
  }
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-20 bg-slate-50 dark:bg-[#0A0A0A] border-t border-slate-200 dark:border-[#2D2D2D] transition-colors duration-300">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017] flex items-center justify-center gap-1.5">
            <HelpCircle className="h-4 w-4" /> FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
            Got Questions? We Have Answers.
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B]/80 overflow-hidden backdrop-blur-xl transition-all shadow-sm"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-900 dark:text-white text-base hover:text-[#D4A017] transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-[#D4A017] transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-slate-600 dark:text-gray-300 leading-relaxed border-t border-slate-200 dark:border-[#2D2D2D] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
