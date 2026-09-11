"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { CheckCircle2, Printer, Package, ShoppingBag, RefreshCw } from "lucide-react";
import { Order } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function OrderSuccessPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
    try {
      const saved = localStorage.getItem("negm_latest_order");
      if (saved) {
        const parsedOrder: Order = JSON.parse(saved);
        if (user && parsedOrder.userId === user.uid) {
          setOrder(parsedOrder);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [authLoading, user, router]);

  const handlePrint = () => {
    window.print();
  };

  if (authLoading || !user) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#111111] flex flex-col justify-center items-center">
        <RefreshCw className="w-8 h-8 animate-spin text-[#D4A017] mb-3" />
        <p className="text-sm font-semibold text-slate-600 dark:text-gray-400">
          {language === "ar" ? "جاري التحقق من الحساب..." : "Verifying account..."}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-[#0F172A] dark:bg-[#111111] dark:text-gray-100 flex flex-col pt-24 sm:pt-32 pb-20 transition-colors duration-300">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 w-full flex-1">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="rounded-3xl border border-slate-200 dark:border-[#D4A017]/40 bg-white dark:bg-[#1B1B1B] p-6 sm:p-12 backdrop-blur-2xl shadow-xl dark:shadow-2xl text-center space-y-6 sm:space-y-8"
        >
          {/* Animated Victory Icon */}
          <div className="relative mx-auto flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
              {language === "ar" ? "تم تأكيد طلبك وجاري التجهيز" : "ORDER CONFIRMED & IN PROCESS"}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
              {language === "ar" ? "شكراً لاختيارك نجم ستور!" : "Thank You For Your Order!"}
            </h1>
            <p className="text-sm text-slate-600 dark:text-gray-300 mt-2 max-w-md mx-auto">
              {language === "ar"
                ? "تم استلام طلبك بنجاح ويقوم فريق مستودعنا الرئيسي بالتجهيز للشحن والتوصيل."
                : "Your order has been received and is being prepared by our central warehouse team in New Cairo."}
            </p>
          </div>

          {/* Order Details Card */}
          {order && (
            <div className="rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] p-4 sm:p-6 text-left rtl:text-right space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-slate-200 dark:border-[#2D2D2D] pb-4 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-gray-400">
                    {language === "ar" ? "رقم الطلب:" : "Order Number:"}
                  </span>
                  <div className="font-extrabold text-[#D4A017] text-sm">{order.id}</div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-gray-400">
                    {language === "ar" ? "تاريخ الطلب:" : "Order Date:"}
                  </span>
                  <div className="font-bold text-slate-900 dark:text-white">{order.orderDate}</div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-gray-400">
                    {language === "ar" ? "موعد التوصيل المتوقع:" : "Estimated Delivery:"}
                  </span>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">
                    {order.estimatedDelivery}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-gray-400">
                    {language === "ar" ? "رمز التتبع:" : "Tracking Code:"}
                  </span>
                  <div className="font-mono text-slate-700 dark:text-gray-300">
                    {order.trackingNumber}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-gray-400">
                  {language === "ar" ? "قطع الغيار والزيوت المطلوبة" : "Ordered Spare Parts & Fluids"}
                </h4>
                {order.items?.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between gap-3 text-xs border-b border-slate-200/80 dark:border-[#2D2D2D]/60 pb-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 bg-white dark:bg-[#1B1B1B] rounded-xl overflow-hidden p-1 border border-slate-200 dark:border-transparent">
                        <Image
                          src={item.product.images[0]}
                          alt=""
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {item.product.name}
                        </div>
                        <div className="text-slate-500 dark:text-gray-400">
                          {language === "ar" ? "الماركة:" : "Brand:"} {item.product.brand} •{" "}
                          {language === "ar" ? "الكمية:" : "Qty:"} {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {(item.product.price * item.quantity).toLocaleString()} EGP
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Totals */}
              <div className="pt-2 text-xs space-y-1.5 text-right rtl:text-left">
                <div className="text-slate-500 dark:text-gray-400">
                  {t("cart.subtotal")}:{" "}
                  <span className="text-slate-900 dark:text-white font-bold">
                    {order.subtotal?.toLocaleString()} EGP
                  </span>
                </div>
                <div className="text-slate-500 dark:text-gray-400">
                  {t("cart.vat")}:{" "}
                  <span className="text-slate-900 dark:text-white font-bold">
                    {order.vat?.toLocaleString()} EGP
                  </span>
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-[#2D2D2D]">
                  {language === "ar" ? "الإجمالي المدفوع:" : "Grand Total Paid:"}{" "}
                  <span className="text-[#D4A017]">
                    {order.total?.toLocaleString()} EGP
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={handlePrint}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 dark:border-[#D4A017]/40 bg-white dark:bg-[#1B1B1B] px-6 py-3.5 text-xs font-bold text-slate-800 dark:text-white hover:border-[#D4A017] transition shadow-md"
            >
              <Printer className="h-4 w-4 text-[#D4A017]" />
              <span>{language === "ar" ? "طباعة الفاتورة / حفظ PDF" : "Print / Save Receipt PDF"}</span>
            </button>

            <Link
              href="/profile"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#111111] px-6 py-3.5 text-xs font-bold text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition shadow-sm"
            >
              <Package className="h-4 w-4" />
              <span>{t("profile.orders")}</span>
            </Link>

            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#8B3A2E] px-8 py-3.5 text-xs font-bold text-white hover:bg-[#a34436] transition shadow-xl"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>{language === "ar" ? "متابعة التسوق" : "Continue Shopping"}</span>
            </Link>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
