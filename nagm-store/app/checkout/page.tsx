"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { setDoc, doc, updateDoc } from "firebase/firestore";
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

  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  const [walletPhone, setWalletPhone] = useState("");

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

      if (userProfile?.name && !cardDetails.name) {
        setCardDetails((prev) => ({ ...prev, name: userProfile.name.toUpperCase() }));
      }
      if (userProfile?.phone && !walletPhone) {
        setWalletPhone(userProfile.phone);
      }
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

      // 2. Refresh User & Verify Email (Google accounts already verified)
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

      // 3. Check Required Fields
      if (!formData.fullName.trim() || !formData.phone.trim() || !formData.street.trim() || !formData.city.trim()) {
        showToast(
          language === "ar"
            ? "يرجى استكمال كافة بيانات الشحن الإلزامية."
            : "Please fill in all required shipping fields.",
          "error"
        );
        return;
      }

      // 4. Create Order Object
      const orderId = `NS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const orderDateStr = new Date().toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const newOrder: Order = {
        id: orderId,
        orderDate: orderDateStr,
        userId: currentUser.uid,
        userEmail: currentUser.email || formData.email,
        customerDetails: {
          fullName: formData.fullName,
          email: currentUser.email || formData.email,
          phone: formData.phone,
        },
        items: cart,
        subtotal,
        shipping,
        vat,
        discount: discountAmount,
        total,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          governorate: formData.governorate,
          city: formData.city,
          street: formData.street,
          building: formData.building,
          apartment: formData.notes,
        },
        paymentMethod,
        status: "Processing",
        orderStatus: "Processing",
        estimatedDelivery: language === "ar" ? "خلال 2 إلى 4 أيام عمل" : "3-5 Business Days",
        trackingNumber: `EG-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date().toISOString(),
      };

      // 5. Save Order to Firestore `orders/{orderId}`
      try {
        await setDoc(doc(db, "orders", orderId), newOrder);
      } catch (dbErr) {
        console.warn("Could not save order to Firestore directly (offline or permissions):", dbErr);
      }

      // 6. Update user's shipping address in Firestore `users/{uid}` for seamless reordering
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

      // 7. Save Order to LocalStorage for offline and instant profile view
      localStorage.setItem("negm_latest_order", JSON.stringify(newOrder));
      try {
        const history: Order[] = JSON.parse(localStorage.getItem("negm_orders_history") || "[]");
        const filteredHistory = history.filter((o) => o && o.userId === currentUser.uid);
        localStorage.setItem("negm_orders_history", JSON.stringify([newOrder, ...filteredHistory]));
      } catch (lsErr) {
        console.error("Local history error:", lsErr);
      }

      // 8. Clear Cart & Show Notification
      clearCart();
      showToast(
        language === "ar"
          ? `تم تأكيد طلبك بنجاح! رقم الطلب: ${orderId}`
          : `Order ${orderId} placed successfully!`,
        "success"
      );

      // 9. Navigate to order confirmation
      router.push("/order-success");
    } catch (error: any) {
      console.error("Checkout error:", error);
      showToast(
        language === "ar"
          ? "تعذر إتمام الطلب، يرجى المحاولة مرة أخرى."
          : "Unable to place order. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
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

              {/* Card Details Mockup */}
              {paymentMethod === "card" && (
                <div className="mt-4 p-4 rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] space-y-3">
                  <div className="text-xs font-bold text-[#D4A017] uppercase">
                    {language === "ar" ? "بيانات البطاقة البنكية" : "Credit Card Details"}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-600 dark:text-gray-400 block mb-1">
                        {language === "ar" ? "رقم البطاقة" : "Card Number"}
                      </label>
                      <input
                        type="text"
                        placeholder="•••• •••• •••• ••••"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B] px-3 py-2 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 dark:text-gray-400 block mb-1">
                        {language === "ar" ? "اسم صاحب البطاقة" : "Cardholder Name"}
                      </label>
                      <input
                        type="text"
                        placeholder="NAME ON CARD"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B] px-3 py-2 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet Phone */}
              {paymentMethod === "wallet" && (
                <div className="mt-4 p-4 rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] space-y-3">
                  <div className="text-xs font-bold text-[#D4A017] uppercase">
                    {language === "ar" ? "رقم المحفظة / عنوان إنستاباي" : "Wallet Mobile Number / IPA"}
                  </div>
                  <input
                    type="text"
                    placeholder="010XXXXXXXX or username@instapay"
                    value={walletPhone}
                    onChange={(e) => setWalletPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B] px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
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