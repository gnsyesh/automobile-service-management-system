"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { updateDoc, doc } from "firebase/firestore";
import { reload } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Order } from "@/types";

import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

import {
  ShieldCheck,
  CreditCard,
  Banknote,
  Smartphone,
  ArrowLeft,
  ShoppingBag,
  RefreshCw,
} from "lucide-react";

const governorates = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Qalyubia",
  "Sharqia",
  "Dakahlia",
  "Gharbia",
  "Monufia",
  "Beheira",
  "Ismailia",
  "Suez",
  "Port Said",
  "Fayoum",
  "Beni Suef",
  "Minya",
  "Asyut",
  "Sohag",
  "Qena",
  "Luxor",
  "Aswan",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user, userProfile, loading: authLoading } = useAuth();
  const {
    cart,
    subtotal,
    discountAmount,
    shipping,
    vat,
    total,
    clearCart,
    coupon,
    removeCoupon,
  } = useCart();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    governorate: "Cairo",
    city: "",
    street: "",
    building: "",
    notes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card" | "wallet">("cod");

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  // Pre-fill user data from Firebase Auth and Firestore UserProfile
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || userProfile?.name || user.displayName || "",
        phone: prev.phone || userProfile?.phone || "",
        email: prev.email || user.email || "",
        governorate: prev.governorate !== "Cairo" ? prev.governorate : (userProfile?.shippingAddress?.governorate || "Cairo"),
        city: prev.city || userProfile?.shippingAddress?.city || "",
        street: prev.street || userProfile?.shippingAddress?.street || "",
        building: prev.building || userProfile?.shippingAddress?.building || "",
      }));
    }
  }, [user, userProfile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      // 1. Check Firebase Auth
      const currentUser = auth.currentUser;
      if (!currentUser) {
        showToast(
          language === "ar"
            ? "يرجى تسجيل الدخول أولاً لإتمام طلب الشراء."
            : "Please login before placing an order.",
          "error"
        );
        router.push("/login");
        return;
      }

      // 2. Refresh User & Verify Email (Google accounts are pre-verified)
      await reload(currentUser);
      const isGoogleUser =
        currentUser.providerData.some((p) => p.providerId === "google.com") ||
        userProfile?.provider === "google";

      if (!currentUser.emailVerified && !isGoogleUser) {
        showToast(
          language === "ar"
            ? "يرجى تأكيد بريدك الإلكتروني قبل تقديم الطلب."
            : "Please verify your email before placing an order.",
          "error"
        );
        return;
      }

      // 3. Check Required Shipping Fields
      if (
        !formData.fullName.trim() ||
        !formData.phone.trim() ||
        !formData.governorate.trim() ||
        !formData.city.trim() ||
        !formData.street.trim() ||
        !formData.building.trim()
      ) {
        showToast(
          language === "ar"
            ? "يرجى استكمال كافة بيانات الشحن الإلزامية (الاسم، الهاتف، المحافظة، المدينة، الشارع، العمارة)."
            : "Please fill in all required shipping fields (Full name, phone, governorate, city, street, building).",
          "error"
        );
        return;
      }

      // 4. Get authenticated ID token for server-side verification
      const idToken = await currentUser.getIdToken();

      // 5. Send trusted order preparation request to server
      const prepareResponse = await fetch("/api/orders/prepare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          couponCode: coupon?.code || null,
          shippingAddress: {
            fullName: formData.fullName.trim(),
            phone: formData.phone.trim(),
            governorate: formData.governorate.trim(),
            city: formData.city.trim(),
            street: formData.street.trim(),
            building: formData.building.trim(),
            apartment: formData.notes?.trim() || undefined,
          },
          paymentMethod,
          notes: formData.notes?.trim() || undefined,
        }),
      });

      const prepareData = await prepareResponse.json();

      if (!prepareResponse.ok) {
        console.error("Order preparation failed:", prepareData);

        if (prepareData.code === "COUPON_NEW_CUSTOMERS_ONLY") {
          removeCoupon();
        }

        showToast(
          prepareData.error ||
            (language === "ar"
              ? "تعذر إعداد الطلب، يرجى مراجعة محتويات السلة والمحاولة مجدداً."
              : "Unable to prepare order. Please check your cart and try again."),
          "error"
        );
        return;
      }

      const { orderId } = prepareData;

      // 6. Update user's shipping address in Firestore `users/{uid}` for quick reordering
      try {
        await updateDoc(doc(db, "users", currentUser.uid), {
          phone: formData.phone,
          shippingAddress: {
            fullName: formData.fullName,
            phone: formData.phone,
            governorate: formData.governorate,
            city: formData.city,
            street: formData.street,
            building: formData.building,
          },
          updatedAt: new Date().toISOString(),
        });
      } catch (upErr) {
        console.warn("Could not update user shipping address:", upErr);
      }

      // 7. Save Order Reference to LocalStorage partitioned strictly by user UID
      try {
        const orderSummary = {
          id: orderId,
          orderDate: new Date().toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          userId: currentUser.uid,
          userEmail: currentUser.email || formData.email,
          items: cart,
          total: prepareData.pricing?.total ?? total,
          paymentMethod,
          paymentStatus: prepareData.paymentStatus ?? "pending",
          status: prepareData.orderStatus ?? (paymentMethod === "cod" ? "Processing" : "Pending"),
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem(`negm_latest_order_${currentUser.uid}`, JSON.stringify(orderSummary));
        const historyKey = `negm_orders_history_${currentUser.uid}`;
        const history: Order[] = JSON.parse(localStorage.getItem(historyKey) || "[]");
        const filteredHistory = history.filter((o) => o && o.userId === currentUser.uid);
        localStorage.setItem(historyKey, JSON.stringify([orderSummary, ...filteredHistory]));
      } catch (lsErr) {
        console.error("Local history save error:", lsErr);
      }

      // 8. Handle payment flow by method
      if (paymentMethod === "cod") {
        // Cash on Delivery: Order confirmed immediately
        clearCart();
        showToast(
          language === "ar"
            ? `تم تأكيد طلبك بنجاح! رقم الطلب: ${orderId}`
            : `Order ${orderId} placed successfully!`,
          "success"
        );
        router.push(`/order-success?orderId=${encodeURIComponent(orderId)}`);
        return;
      }

      // Online payment (Card or Wallet) via Paymob Intention + Unified Checkout
      const paymobResponse = await fetch("/api/payments/paymob/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          orderId,
          paymentMethod,
        }),
      });

      const paymobData = await paymobResponse.json();

      if (!paymobResponse.ok) {
        console.warn("Paymob creation response:", paymobData);

        if (paymobData.code === "PAYMOB_NOT_CONFIGURED" || paymobResponse.status === 503) {
          showToast(
            language === "ar"
              ? "بوابة الدفع الإلكتروني قيد الإعداد حالياً. يرجى اختيار الدفع عند الاستلام (COD) لإتمام طلبك."
              : "Online payment is currently being configured. Please choose Cash on Delivery (COD) to place your order.",
            "info"
          );
        } else {
          showToast(
            paymobData.error ||
              (language === "ar"
                ? "تعذر بدء الدفع الإلكتروني، يرجى المحاولة مرة أخرى."
                : "Unable to initialize online payment. Please try again."),
            "error"
          );
        }
        return;
      }

      // Clear local cart and redirect to Paymob Unified Checkout
      clearCart();
      if (paymobData.checkoutUrl) {
        window.location.href = paymobData.checkoutUrl;
      } else {
        router.push(`/order-success?orderId=${encodeURIComponent(orderId)}&status=pending`);
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      showToast(
        language === "ar"
          ? "تعذر إتمام الطلب، يرجى التحقق من اتصالك والمحاولة مجدداً."
          : "Unable to place order. Please check your connection and try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <main className="min-h-screen bg-slate-50 text-[#0F172A] dark:bg-[#111111] dark:text-gray-100 flex flex-col pt-24 sm:pt-32 pb-20 transition-colors duration-300">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex-1">
          {/* Header Skeleton */}
          <div className="border-b border-slate-200 dark:border-[#2D2D2D] pb-6 mb-8 space-y-2">
            <div className="h-4 w-32 bg-slate-200 dark:bg-[#1B1B1B] rounded animate-pulse" />
            <div className="h-8 w-64 bg-slate-200 dark:bg-[#1B1B1B] rounded animate-pulse" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Form Skeleton */}
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-3xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B]/80 p-6 sm:p-8 space-y-4 animate-pulse">
                <div className="h-6 w-48 bg-slate-200 dark:bg-[#252525] rounded" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-12 bg-slate-200 dark:bg-[#252525] rounded-xl" />
                  <div className="h-12 bg-slate-200 dark:bg-[#252525] rounded-xl" />
                </div>
                <div className="h-12 bg-slate-200 dark:bg-[#252525] rounded-xl" />
                <div className="h-12 bg-slate-200 dark:bg-[#252525] rounded-xl" />
              </div>
            </div>

            {/* Right Summary Skeleton */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B]/80 p-6 space-y-4 animate-pulse">
                <div className="h-6 w-36 bg-slate-200 dark:bg-[#252525] rounded" />
                <div className="h-16 bg-slate-200 dark:bg-[#252525] rounded-xl" />
                <div className="h-20 bg-slate-200 dark:bg-[#252525] rounded-xl" />
                <div className="h-12 w-full bg-slate-200 dark:bg-[#252525] rounded-xl" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 text-[#0F172A] dark:bg-[#111111] dark:text-gray-100 flex flex-col pt-24 sm:pt-32 pb-20 transition-colors duration-300">
        <Navbar />
        <div className="mx-auto max-w-xl px-4 text-center my-auto py-16">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-60" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("checkout.orderEmpty")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-2">
            {language === "ar"
              ? "سلة مشترياتك فارغة حالياً. تصفح المتجر وأضف قطع الغيار التي تحتاجها."
              : "Your shopping cart is currently empty. Browse our catalog to add auto parts."}
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#8B3A2E] px-6 py-3 text-xs font-bold text-white hover:bg-[#a34436] transition shadow-md"
          >
            {t("checkout.returnShop")}
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-[#0F172A] dark:bg-[#111111] dark:text-gray-100 flex flex-col pt-24 sm:pt-32 pb-20 transition-colors duration-300 text-left rtl:text-right">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex-1">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2D2D2D] pb-6 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
              {t("checkout.finalStep")}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {t("checkout.orderCheckout")}
            </h1>
          </div>

          <Link
            href="/cart"
            className="text-xs font-bold text-[#D4A017] hover:underline flex items-center gap-1 rtl:flex-row-reverse"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t("checkout.backToCart")}
          </Link>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Customer info, address, payment */}
          <div className="lg:col-span-8 space-y-8">
            {/* Step 1: Customer Details */}
            <div className="rounded-3xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B]/90 p-6 backdrop-blur-xl shadow-sm dark:shadow-xl space-y-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2D2D2D] pb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8B3A2E] text-xs font-bold text-white">
                  1
                </span>
                {t("checkout.customerInfo")}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                    {t("checkout.fullName")}
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder={language === "ar" ? "الاسم ثلاثي" : "e.g. John Doe"}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] px-4 py-3 text-xs text-slate-900 dark:text-white focus:border-[#D4A017] focus:bg-white dark:focus:bg-[#111111] focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                    {t("checkout.phoneRequired")}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+20 100 000 0000"
                    className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] px-4 py-3 text-xs text-slate-900 dark:text-white focus:border-[#D4A017] focus:bg-white dark:focus:bg-[#111111] focus:outline-none transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                    {t("checkout.emailInvoice")}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] px-4 py-3 text-xs text-slate-900 dark:text-white focus:border-[#D4A017] focus:bg-white dark:focus:bg-[#111111] focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Address */}
            <div className="rounded-3xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B]/90 p-6 backdrop-blur-xl shadow-sm dark:shadow-xl space-y-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2D2D2D] pb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8B3A2E] text-xs font-bold text-white">
                  2
                </span>
                {language === "ar" ? "عنوان التوصيل والشحن (مصر)" : "Shipping Address (Egypt)"}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                    {t("checkout.governorate")} *
                  </label>
                  <select
                    name="governorate"
                    value={formData.governorate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] px-4 py-3 text-xs text-slate-900 dark:text-white focus:border-[#D4A017] focus:bg-white dark:focus:bg-[#111111] focus:outline-none transition"
                  >
                    {governorates.map((gov) => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                    {t("checkout.city")}
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder={language === "ar" ? "مثال: التجمع الخامس / المعادي" : "e.g. 5th Settlement, New Cairo"}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] px-4 py-3 text-xs text-slate-900 dark:text-white focus:border-[#D4A017] focus:bg-white dark:focus:bg-[#111111] focus:outline-none transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                    {t("checkout.street")}
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    required
                    placeholder={language === "ar" ? "اسم الشارع والحي" : "Street name and district"}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] px-4 py-3 text-xs text-slate-900 dark:text-white focus:border-[#D4A017] focus:bg-white dark:focus:bg-[#111111] focus:outline-none transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                    {t("checkout.building")}
                  </label>
                  <input
                    type="text"
                    name="building"
                    value={formData.building}
                    onChange={handleChange}
                    placeholder={language === "ar" ? "رقم العمارة، الدور، الشقة" : "Building number, floor, apartment"}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] px-4 py-3 text-xs text-slate-900 dark:text-white focus:border-[#D4A017] focus:bg-white dark:focus:bg-[#111111] focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="rounded-3xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B]/90 p-6 backdrop-blur-xl shadow-sm dark:shadow-xl space-y-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2D2D2D] pb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8B3A2E] text-xs font-bold text-white">
                  3
                </span>
                {t("checkout.payment")}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* COD */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition ${
                    paymentMethod === "cod"
                      ? "border-[#D4A017] bg-[#8B3A2E]/10 dark:bg-[#8B3A2E]/20 text-slate-900 dark:text-white shadow-sm ring-1 ring-[#D4A017]"
                      : "border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Banknote className="h-6 w-6 text-[#D4A017] mb-2" />
                  <span className="text-xs font-bold">{t("checkout.cod")}</span>
                  <span className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                    {t("checkout.payCourier")}
                  </span>
                </button>

                {/* CARD */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition ${
                    paymentMethod === "card"
                      ? "border-[#D4A017] bg-[#8B3A2E]/10 dark:bg-[#8B3A2E]/20 text-slate-900 dark:text-white shadow-sm ring-1 ring-[#D4A017]"
                      : "border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <CreditCard className="h-6 w-6 text-[#D4A017] mb-2" />
                  <span className="text-xs font-bold">{t("checkout.card")}</span>
                  <span className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                    {t("checkout.cardSub")}
                  </span>
                </button>

                {/* WALLET */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("wallet")}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition ${
                    paymentMethod === "wallet"
                      ? "border-[#D4A017] bg-[#8B3A2E]/10 dark:bg-[#8B3A2E]/20 text-slate-900 dark:text-white shadow-sm ring-1 ring-[#D4A017]"
                      : "border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Smartphone className="h-6 w-6 text-[#D4A017] mb-2" />
                  <span className="text-xs font-bold">
                    {language === "ar" ? "محفظة إلكترونية / إنستاباي" : "E-Wallet / InstaPay"}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                    {t("checkout.walletSub")}
                  </span>
                </button>
              </div>

              {/* Card Payment Notice */}
              {paymentMethod === "card" && (
                <div className="mt-4 p-4 rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#D4A017] uppercase">
                    <CreditCard className="h-4 w-4" />
                    <span>{language === "ar" ? "الدفع الإلكتروني الآمن عبر البطاقة البنكية" : "Secure Credit / Debit Card Checkout"}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                    {language === "ar"
                      ? "سيتم تحويلك مباشرة إلى بوابة Paymob المشفرة للدفع بأمان بواسطة بطاقتك (Visa أو MasterCard أو ميزة). متجر نجم لا يطلب ولا يخزن أرقام بطاقتك أو رمز CVV."
                      : "You will be securely redirected to Paymob's encrypted checkout to complete your payment (Visa, Mastercard, Meeza). We never store or process your card number or CVV."}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-500 dark:text-gray-400 font-semibold">
                    <span>🔒 256-bit SSL Encrypted</span>
                    <span>•</span>
                    <span>PCI-DSS Level 1 Gateway</span>
                  </div>
                </div>
              )}

              {/* Wallet Payment Notice */}
              {paymentMethod === "wallet" && (
                <div className="mt-4 p-4 rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#D4A017] uppercase">
                    <Smartphone className="h-4 w-4" />
                    <span>{language === "ar" ? "المحافظ الإلكترونية وإنستاباي في مصر" : "Mobile Wallets & Smart Payments in Egypt"}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                    {language === "ar"
                      ? "سيتم تحويلك إلى بوابة الدفع المعتمدة لإتمام المعاملة فوراً عبر محفظتك الإلكترونية (فودافون كاش، أورنج كاش، اتصالات كاش، وي باي، أو محفظة ميزة الذكية)."
                      : "You will be redirected to Paymob to confirm payment via your mobile wallet (Vodafone Cash, Orange Money, Etisalat Cash, WE Pay, or Meeza Wallet)."}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-500 dark:text-gray-400 font-semibold">
                    <span>⚡ Instant Order Confirmation</span>
                    <span>•</span>
                    <span>Direct Wallet Approval</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-[#D4A017]/30 bg-white dark:bg-[#1B1B1B] p-6 backdrop-blur-xl shadow-md dark:shadow-2xl space-y-5">
              <h2 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2D2D2D] pb-3">
                {t("checkout.orderSummary")} ({cart.length})
              </h2>

              {/* Cart Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="relative h-10 w-10 shrink-0 bg-slate-100 dark:bg-[#111111] rounded-lg overflow-hidden border border-slate-200 dark:border-[#2D2D2D]">
                        <Image
                          src={item.product.images[0]}
                          alt=""
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {item.product.name}
                        </div>
                        <div className="text-slate-500 dark:text-gray-400 text-[11px]">
                          {language === "ar" ? "الكمية:" : "Qty:"} {item.quantity}
                        </div>
                      </div>
                    </div>

                    <div className="font-bold text-slate-900 dark:text-white shrink-0">
                      {(item.product.price * item.quantity).toLocaleString()} EGP
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-[#2D2D2D] text-xs text-slate-600 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>{t("cart.subtotal")}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {subtotal.toLocaleString()} EGP
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>{t("cart.discount")}</span>
                    <span>-{discountAmount.toLocaleString()} EGP</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>{t("cart.delivery")}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {shipping === 0 ? t("cart.free") : `${shipping} EGP`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>{t("cart.vat")}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {vat.toLocaleString()} EGP
                  </span>
                </div>

                <div className="flex justify-between text-lg font-black text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-[#2D2D2D]">
                  <span>{t("cart.total")}</span>
                  <span className="text-[#8B3A2E] dark:text-[#D4A017]">
                    {total.toLocaleString()} EGP
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#8B3A2E] font-black text-white text-sm hover:bg-[#a34436] transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <ShieldCheck className="h-5 w-5" />
                )}
                <span>{loading ? (language === "ar" ? "جاري التأكيد..." : "Checking...") : t("checkout.placeOrderNow")}</span>
              </button>

              <p className="text-[10px] text-center text-slate-500 dark:text-gray-400">
                {language === "ar"
                  ? "يجب تسجيل الدخول وتفعيل البريد الإلكتروني لإتمام الطلب."
                  : "You must be logged in and have a verified email address to place an order."}
              </p>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </main>
  );
}