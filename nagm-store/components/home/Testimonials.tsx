"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, CheckCircle2, MessageSquareHeart } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { PublicHomepageFeedback } from "@/lib/feedback";

export default function Testimonials() {
  const { t, language } = useLanguage();
  const [feedbackList, setFeedbackList] = useState<PublicHomepageFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadHomepageFeedback = async () => {
      try {
        const res = await fetch("/api/feedback/homepage");
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.feedback)) {
          setFeedbackList(data.feedback);
        }
      } catch (err) {
        console.error("Error loading homepage feedback:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadHomepageFeedback();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-20 bg-slate-100 dark:bg-[#111111] border-t border-slate-200 dark:border-[#2D2D2D] transition-colors duration-300 overflow-hidden w-full max-w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full min-w-0">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
            {language === "ar" ? "تجارب حقيقية موثقة" : "VERIFIED CUSTOMER EXPERIENCE"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
            {language === "ar" ? "ماذا يقول سائقو السيارات في مصر" : "What Egyptian Drivers Say"}
          </h2>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white/50 dark:bg-[#1B1B1B]/40 p-6 animate-pulse h-48"
              />
            ))}
          </div>
        ) : feedbackList.length === 0 ? (
          /* Honest Professional Empty State - No Fake Data */
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-[#2D2D2D] bg-white dark:bg-[#181818] p-10 sm:p-14 text-center max-w-2xl mx-auto shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-[#D4A017] mb-4">
              <MessageSquareHeart className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {language === "ar" ? "نعتز بثقة وتجارب عملائنا" : "Authentic Customer Experiences"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 mt-2 leading-relaxed">
              {language === "ar"
                ? "نحرص على عرض آراء وتجارب حقيقية فقط من عملائنا بعد استلام طلباتهم بنجاح. ستظهر هنا التقييمات المعتمدة فور تسجيلها وموافقة الإدارة على إبرازها."
                : "We exclusively feature genuine feedback from customers after completed deliveries. Authentic driver experiences will appear here as orders are received and reviewed."}
            </p>
          </div>
        ) : (
          /* Genuine Feedback Cards: Exactly 1, 2, or up to 3 */
          <div
            className={`grid gap-6 ${
              feedbackList.length === 1
                ? "grid-cols-1 max-w-xl mx-auto"
                : feedbackList.length === 2
                ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
                : "grid-cols-1 md:grid-cols-3"
            }`}
          >
            {feedbackList.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="relative rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B]/80 p-6 backdrop-blur-xl flex flex-col justify-between shadow-sm text-left rtl:text-right"
              >
                <div>
                  {/* Overall Satisfaction Rating */}
                  <div className="flex items-center gap-1 text-[#D4A017] mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < item.rating ? "fill-current" : "text-slate-200 dark:text-gray-700"
                        }`}
                      />
                    ))}
                    <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 ml-1.5">
                      {item.rating}.0
                    </span>
                  </div>

                  {/* Customer Comment */}
                  <p className="text-sm text-slate-700 dark:text-gray-300 italic leading-relaxed">
                    &ldquo;{item.comment}&rdquo;
                  </p>
                </div>

                {/* Customer Info (Public Only: Display Name + Date + Verified Badge) */}
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#2D2D2D] flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{item.customerName}</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    </h4>
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      {language === "ar" ? "طلب مؤكد ومستلم" : "Verified Delivered Order"}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-gray-500">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
                      month: "short",
                      year: "numeric",
                    }) : ""}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
