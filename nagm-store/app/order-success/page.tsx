"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import {
  CheckCircle2,
  Download,
  Package,
  ShoppingBag,
  RefreshCw,
  Clock,
  AlertTriangle,
  CreditCard,
  Truck,
  FileText,
} from "lucide-react";
import { Order } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
    if (!user) return;

    let isMounted = true;

    // Load authoritative order strictly from Firestore
    const fetchAuthoritativeOrder = async () => {
      setLoading(true);
      try {
        const queryOrderId = searchParams.get("orderId");

        // 1. If explicit orderId query param provided, fetch and verify ownership
        if (queryOrderId) {
          const docRef = doc(db, "orders", queryOrderId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists() && isMounted) {
            const data = { id: docSnap.id, ...(docSnap.data() as any) } as Order;
            // Security: verify customer identity/ownership
            if (data.userId === user.uid) {
              setOrder(data);
              setLoading(false);
              return;
            } else {
              console.warn("Unauthorized order access attempt on order-success");
            }
          }
        }

        // 2. Query user's latest order from Firestore
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid)
        );
        const snap = await getDocs(q);
        if (!snap.empty && isMounted) {
          const list: Order[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
          list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

          if (list.length > 0) {
            setOrder(list[0]);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Authoritative order fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAuthoritativeOrder();

    return () => {
      isMounted = false;
    };
  }, [authLoading, user, router, searchParams]);

  // Handle on-demand dynamic invoice generation and download
  const handleDownloadInvoice = async () => {
    if (!order || !user) return;
    setDownloadingInvoice(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/orders/${order.id}/invoice`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        showToast(
          errorData.error || (language === "ar" ? "تعذر تنزيل الفاتورة" : "Failed to download invoice"),
          "error"
        );
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${order.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast(
        language === "ar" ? "تم تنزيل الفاتورة بنجاح" : "Invoice downloaded successfully",
        "success"
      );
    } catch (err) {
      console.error("Download invoice error:", err);
      showToast(
        language === "ar" ? "حدث خطأ أثناء تنزيل الفاتورة" : "Error generating invoice PDF",
        "error"
      );
    } finally {
      setDownloadingInvoice(false);
    }
  };

  if (authLoading || (loading && !order)) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#111111] flex flex-col justify-center items-center">
        <RefreshCw className="w-8 h-8 animate-spin text-[#D4A017] mb-3" />
        <p className="text-sm font-semibold text-slate-600 dark:text-gray-400">
          {language === "ar" ? "جاري جلب تفاصيل الطلب المعتمدة..." : "Retrieving verified order details..."}
        </p>
      </main>
    );
  }

  // Authoritative status mapping
  const paymentStatus = order?.paymentStatus || "pending";
  const paymentMethod = order?.paymentMethod || "cod";
  const orderStatus = order?.status || order?.orderStatus || "Processing";
  const isPaid = paymentStatus === "paid";
  const isCodPending = paymentMethod === "cod" && !isPaid;
  const isCardPending = paymentMethod === "card" && !isPaid;
  const isFailed = paymentStatus === "failed";
  const isCancelled = orderStatus === "Cancelled";

  // Dynamic Header Content
  const getHeaderContent = () => {
    if (isCancelled) {
      return {
        badge: language === "ar" ? "الطلب ملغي" : "ORDER CANCELLED",
        title: language === "ar" ? "تم إلغاء هذا الطلب" : "Order Cancelled",
        desc: language === "ar" ? "تم إلغاء هذا الطلب ولا يتم تجهيزه حالياً." : "This order has been cancelled and is not active.",
        icon: <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-slate-500 dark:text-gray-400" />,
        iconBox: "bg-slate-500/20 text-slate-500 border-slate-500/40 shadow-[0_0_50px_rgba(100,116,139,0.2)]",
      };
    }
    if (isFailed) {
      return {
        badge: language === "ar" ? "فشلت عملية الدفع" : "PAYMENT FAILED",
        title: language === "ar" ? "لم تكتمل عملية الدفع" : "Payment Not Completed",
        desc: language === "ar" ? "لم يتم خصم المبلغ ولم يتم تأكيد الطلب. يمكنك إعادة المحاولة في أي وقت." : "Your card payment was not completed. You can try again or place a new order.",
        icon: <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 dark:text-red-400" />,
        iconBox: "bg-red-500/20 text-red-500 border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.2)]",
      };
    }
    if (isCardPending) {
      return {
        badge: language === "ar" ? "قيد انتظار السداد الإلكتروني" : "PAYMENT PENDING",
        title: language === "ar" ? "في انتظار تأكيد الدفع" : "Awaiting Payment Confirmation",
        desc: language === "ar" ? "تم تسجيل طلبك ونحن في انتظار تأكيد السداد للبدء في التجهيز." : "Your order is placed and awaiting card payment confirmation to begin processing.",
        icon: <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-[#D4A017]" />,
        iconBox: "bg-[#D4A017]/20 text-[#D4A017] border-[#D4A017]/40 shadow-[0_0_50px_rgba(212,160,23,0.2)]",
      };
    }
    if (orderStatus === "Delivered") {
      return {
        badge: language === "ar" ? "تم التوصيل بنجاح" : "ORDER DELIVERED",
        title: language === "ar" ? "تم تسليم طلبك بنجاح!" : "Order Delivered Successfully!",
        desc: language === "ar" ? "شكراً لاختيارك نجم ستور. نتمنى لك تجربة قيادة ممتازة." : "Thank you for choosing Negm Store. We hope you enjoy our quality auto parts.",
        icon: <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-500 dark:text-emerald-400" />,
        iconBox: "bg-emerald-500/20 text-emerald-500 border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.3)]",
      };
    }
    if (orderStatus === "Shipped") {
      return {
        badge: language === "ar" ? "الطلب في الطريق إليك" : "ORDER IN TRANSIT",
        title: language === "ar" ? "طلبك في طريقه إليك!" : "Your Order Is On Its Way!",
        desc: language === "ar" ? "تم شحن طلبك وهو الآن مع مندوب الشحن في الطريق إلى عنوانك." : "Your order has been dispatched and is currently in transit to your address.",
        icon: <Truck className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500 dark:text-blue-400" />,
        iconBox: "bg-blue-500/20 text-blue-500 border-blue-500/40 shadow-[0_0_50px_rgba(59,130,246,0.2)]",
      };
    }
    return {
      badge: language === "ar" ? "تم تأكيد طلبك وجاري التجهيز" : "ORDER CONFIRMED & IN PROCESS",
      title: language === "ar" ? "شكراً لاختيارك نجم ستور!" : "Thank You For Your Order!",
      desc: language === "ar" ? "تم استلام وتأكيد طلبك بنجاح وجاري تجهيز المنتجات للشحن والتوصيل." : "Your order has been confirmed and is being prepared for dispatch and delivery.",
      icon: <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-500 dark:text-emerald-400" />,
      iconBox: "bg-emerald-500/20 text-emerald-500 border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.3)]",
    };
  };

  const headerContent = getHeaderContent();

  // Dynamic Total Label
  const getTotalLabel = () => {
    if (isCancelled) return language === "ar" ? "إجمالي الطلب (ملغي):" : "Order Total (Cancelled):";
    if (isFailed) return language === "ar" ? "إجمالي الطلب (فشل الدفع):" : "Order Total (Payment Failed):";
    if (isPaid) return language === "ar" ? "الإجمالي المدفوع:" : "Grand Total Paid:";
    if (isCodPending) return language === "ar" ? "المبلغ المستحق عند الاستلام:" : "Total Due on Delivery:";
    return language === "ar" ? "إجمالي الطلب:" : "Grand Total:";
  };

  // Dynamic Payment Status Badge
  const getPaymentStatusBadge = () => {
    if (isCancelled) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-600 dark:text-gray-400 text-xs font-bold border border-slate-500/20">
          {language === "ar" ? "ملغي" : "Cancelled"}
        </span>
      );
    }
    if (isFailed) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold border border-red-500/20">
          {language === "ar" ? "فشلت عملية الدفع" : "Payment Failed"}
        </span>
      );
    }
    if (isPaid) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
          <CheckCircle2 className="h-3 w-3" />
          {language === "ar" ? "تم الدفع بنجاح" : "Paid"}
        </span>
      );
    }
    if (isCodPending) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-[#D4A017] text-xs font-bold border border-amber-500/30">
          <Clock className="h-3 w-3" />
          {language === "ar" ? "مستحق عند الاستلام" : "Due on Delivery"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/20">
        <Clock className="h-3 w-3" />
        {language === "ar" ? "قيد انتظار الدفع" : "Payment Pending"}
      </span>
    );
  };

  const getPaymentMethodDisplay = () => {
    if (paymentMethod === "cod") return language === "ar" ? "الدفع عند الاستلام (COD)" : "Cash on Delivery (COD)";
    if (paymentMethod === "card") return language === "ar" ? "بطاقة دفع إلكتروني" : "Credit / Debit Card";
    return paymentMethod;
  };

  return (
    <main className="min-h-screen bg-slate-50 text-[#0F172A] dark:bg-[#111111] dark:text-gray-100 flex flex-col pt-24 sm:pt-32 pb-20 transition-colors duration-300">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 w-full flex-1">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="rounded-3xl border border-slate-200 dark:border-[#D4A017]/40 bg-white dark:bg-[#1B1B1B] p-6 sm:p-12 backdrop-blur-2xl shadow-xl dark:shadow-2xl text-center space-y-6 sm:space-y-8"
        >
          {/* Status Icon */}
          <div className={`relative mx-auto flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border ${headerContent.iconBox}`}>
            {headerContent.icon}
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
              {headerContent.badge}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
              {headerContent.title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-gray-300 mt-2 max-w-md mx-auto">
              {headerContent.desc}
            </p>
          </div>

          {/* Authoritative Order Details Card */}
          {order && (
            <div className="rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] p-4 sm:p-6 text-left rtl:text-right space-y-6">
              
              {/* Order Metadata Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-200 dark:border-[#2D2D2D] pb-4 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-gray-400 block mb-0.5">
                    {language === "ar" ? "رقم الطلب:" : "Order Number:"}
                  </span>
                  <div className="font-extrabold text-[#D4A017] text-sm font-mono">{order.id}</div>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-gray-400 block mb-0.5">
                    {language === "ar" ? "تاريخ الطلب:" : "Order Date:"}
                  </span>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {order.orderDate || new Date().toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-gray-400 block mb-0.5">
                    {language === "ar" ? "موعد التوصيل المتوقع:" : "Estimated Delivery:"}
                  </span>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">
                    {order.estimatedDelivery || (language === "ar" ? "يحدد لاحقاً" : "To be confirmed")}
                  </div>
                </div>
              </div>

              {/* Payment & Order Status Split Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-[#2D2D2D] text-xs">
                <div className="flex items-center justify-between sm:justify-start sm:gap-3">
                  <span className="text-slate-500 dark:text-gray-400">
                    {language === "ar" ? "طريقة الدفع:" : "Payment Method:"}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {getPaymentMethodDisplay()}
                  </span>
                </div>

                <div className="flex items-center justify-between sm:justify-end sm:gap-3">
                  <span className="text-slate-500 dark:text-gray-400">
                    {language === "ar" ? "حالة الدفع:" : "Payment Status:"}
                  </span>
                  {getPaymentStatusBadge()}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-gray-400 tracking-wider">
                  {language === "ar" ? "قطع الغيار والزيوت المطلوبة" : "Ordered Spare Parts & Fluids"}
                </h4>
                {order.items?.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between gap-3 text-xs border-b border-slate-200/80 dark:border-[#2D2D2D]/60 pb-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 bg-white dark:bg-[#1B1B1B] rounded-xl overflow-hidden p-1 border border-slate-200 dark:border-transparent">
                        <Image
                          src={item.product.images?.[0] || "/images/negm-store-logo.png"}
                          alt={item.product.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                          {item.product.name}
                        </div>
                        <div className="text-slate-500 dark:text-gray-400 text-[11px] mt-0.5">
                          {language === "ar" ? "الماركة:" : "Brand:"} {item.product.brand || "OEM"} •{" "}
                          {language === "ar" ? "الكمية:" : "Qty:"} {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white text-right rtl:text-left shrink-0">
                      {((item.product.price || 0) * item.quantity).toLocaleString()} EGP
                    </div>
                  </div>
                ))}
              </div>

              {/* Authoritative Financial Breakdown */}
              <div className="pt-2 text-xs space-y-2 text-right rtl:text-left">
                {/* Subtotal */}
                <div className="flex justify-between sm:justify-end sm:gap-8 text-slate-600 dark:text-gray-400">
                  <span>{t("cart.subtotal")}:</span>
                  <span className="font-bold text-slate-900 dark:text-white min-w-[90px]">
                    {(order.subtotal ?? 0).toLocaleString()} EGP
                  </span>
                </div>

                {/* Discount */}
                {Boolean(order.discount && order.discount > 0) && (
                  <div className="flex justify-between sm:justify-end sm:gap-8 text-emerald-600 dark:text-emerald-400">
                    <span>{t("cart.discount")}:</span>
                    <span className="font-bold min-w-[90px]">
                      -{(order.discount ?? 0).toLocaleString()} EGP
                    </span>
                  </div>
                )}

                {/* Shipping */}
                <div className="flex justify-between sm:justify-end sm:gap-8 text-slate-600 dark:text-gray-400">
                  <span>{language === "ar" ? "الشحن والتوصيل:" : "Shipping & Delivery:"}</span>
                  <span className="font-bold text-slate-900 dark:text-white min-w-[90px]">
                    {order.shipping === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {language === "ar" ? "مجاني" : "FREE"}
                      </span>
                    ) : (
                      `${(order.shipping ?? 0).toLocaleString()} EGP`
                    )}
                  </span>
                </div>

                {/* VAT (14%) */}
                <div className="flex justify-between sm:justify-end sm:gap-8 text-slate-600 dark:text-gray-400">
                  <span>{language === "ar" ? "ضريبة القيمة المضافة (14%):" : "Egyptian VAT (14%):"}</span>
                  <span className="font-bold text-slate-900 dark:text-white min-w-[90px]">
                    {(order.vat ?? 0).toLocaleString()} EGP
                  </span>
                </div>

                {/* Dynamic Grand Total */}
                <div className="flex justify-between sm:justify-end sm:gap-8 text-sm font-black text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-[#2D2D2D]">
                  <span>{getTotalLabel()}</span>
                  <span className="text-[#D4A017] text-base min-w-[90px]">
                    {(order.total ?? 0).toLocaleString()} EGP
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* Action Buttons: Download Invoice, Orders, Continue Shopping */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice || !order}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/40 dark:border-[#D4A017]/50 bg-white dark:bg-[#1B1B1B] px-6 py-3.5 text-xs font-bold text-slate-800 dark:text-white hover:border-[#D4A017] transition shadow-md"
            >
              {downloadingInvoice ? (
                <RefreshCw className="h-4 w-4 animate-spin text-[#D4A017]" />
              ) : (
                <Download className="h-4 w-4 text-[#D4A017]" />
              )}
              <span>
                {downloadingInvoice
                  ? (language === "ar" ? "جاري إنشاء الفاتورة..." : "Generating PDF...")
                  : (language === "ar" ? "تنزيل الفاتورة الرسمية (PDF)" : "Download Invoice (PDF)")}
              </span>
            </button>

            <Link
              href="/profile"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#111111] px-6 py-3.5 text-xs font-bold text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition shadow-xs"
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
