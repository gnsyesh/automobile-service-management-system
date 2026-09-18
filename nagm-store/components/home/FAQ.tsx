"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function FAQ() {
  const { t, language } = useLanguage();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqsEn = [
    {
      q: "How do I check part compatibility with my vehicle?",
      a: "You can select your vehicle Make, Model, and Year using our vehicle selector, or review the compatibility list and specifications provided on each product page."
    },
    {
      q: "What automotive products and brands are available on Negm Store?",
      a: "We offer automotive maintenance essentials including engine oils, filters, brake parts, and car care accessories from recognized automotive brands."
    },
    {
      q: "How does shipping and delivery work across Egypt?",
      a: "Orders are shipped directly to your delivery address across Egyptian governorates. Shipping costs and estimated delivery timelines are calculated and displayed at checkout based on your location."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept Cash on Delivery (COD) and Credit/Debit Cards (Visa & Mastercard) through secure Paymob payment processing."
    },
    {
      q: "How can I check order status or get assistance?",
      a: "You can view your order status and download your invoice from your account profile, or reach out to our team for questions about your order or parts."
    }
  ];

  const faqsAr = [
    {
      q: "كيف يمكنني التحقق من توافق قطعة الغيار مع سيارتي؟",
      a: "يمكنك استخدام أداة تحديد نوع وموديل وسنة صنع سيارتك، أو مراجعة المواصفات وقائمة التوافق الموضحة في صفحة كل منتج."
    },
    {
      q: "ما هي المنتجات والعلامات التجارية المتوفرة في متجر نجم؟",
      a: "نوفر مستلزمات صيانة السيارات الأساسية مثل زيوت المحركات والفلاتر ومكونات الفرامل والإكسسوارات من علامات تجارية رائدة ومعروفة."
    },
    {
      q: "كيف يتم شحن وتوصيل الطلبات داخل مصر؟",
      a: "يتم توصيل الطلبات إلى عنوانك المسجل في مختلف محافظات مصر، وتظهر تكلفة الشحن وموعد التوصيل التقديري بوضوح عند إتمام الطلب بناءً على محافظتك."
    },
    {
      q: "ما هي طرق الدفع المتاحة؟",
      a: "ندعم الدفع نقداً عند الاستلام (COD) والدفع الإلكتروني الآمن بالبطاقات البنكية (فيزا وماستركارد) عبر بوابة Paymob."
    },
    {
      q: "كيف يمكنني متابعة حالة طلبي أو الحصول على مساعدة؟",
      a: "يمكنك متابعة حالة الطلب وتنزيل الفاتورة بصيغة PDF مباشرة من حسابك، أو التواصل معنا لأي استفسارات تتعلق بطلبك ومواصفات المنتجات."
    }
  ];

  const faqs = language === "ar" ? faqsAr : faqsEn;

  return (
    <section className="py-20 bg-slate-50 dark:bg-[#0A0A0A] border-t border-slate-200 dark:border-[#2D2D2D] transition-colors duration-300 overflow-hidden w-full max-w-full">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 w-full min-w-0">
        
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017] flex items-center justify-center gap-1.5">
            <HelpCircle className="h-4 w-4 shrink-0" /> {t("faq.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
            {t("faq.title")}
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B]/80 overflow-hidden backdrop-blur-xl transition-all shadow-sm text-left rtl:text-right"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left rtl:text-right font-bold text-slate-900 dark:text-white text-base hover:text-[#D4A017] transition"
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
