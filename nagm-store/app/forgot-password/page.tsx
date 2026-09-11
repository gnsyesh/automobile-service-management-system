"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();
  const { t, language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());

      setSubmitted(true);

      showToast(
        language === "ar"
          ? "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني!"
          : "Password reset link sent to your email!",
        "success"
      );
    } catch (error: any) {
      console.error("Firebase password reset error:", error);

      switch (error.code) {
        case "auth/invalid-email":
          showToast(
            language === "ar" ? "يرجى إدخال بريد إلكتروني صالح." : "Please enter a valid email address.",
            "error"
          );
          break;

        case "auth/user-not-found":
          showToast(
            language === "ar" ? "لا يوجد حساب مسجل بهذا البريد الإلكتروني." : "No account was found with this email address.",
            "error"
          );
          break;

        case "auth/too-many-requests":
          showToast(
            language === "ar" ? "محاولات كثيرة جداً. يرجى المحاولة لاحقاً." : "Too many requests. Please try again later.",
            "error"
          );
          break;

        case "auth/network-request-failed":
          showToast(
            language === "ar" ? "خطأ في الاتصال بالشبكة. يرجى التحقق من اتصالك." : "Network error. Please check your internet connection.",
            "error"
          );
          break;

        default:
          showToast(
            language === "ar" ? "تعذر إرسال بريد إعادة التعيين. يرجى المحاولة لاحقاً." : "Unable to send password reset email. Please try again.",
            "error"
          );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-[#0F172A] dark:bg-[#0A0A0A] dark:text-gray-100 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">

      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/3 h-96 w-96 rounded-full bg-[#8B3A2E]/10 dark:bg-[#8B3A2E]/20 blur-[140px] pointer-events-none" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 dark:border-[#D4A017]/30 bg-white/95 dark:bg-[#1B1B1B]/90 p-6 sm:p-10 backdrop-blur-2xl shadow-xl dark:shadow-2xl"
      >

        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">

          <Link
            href="/"
            className="inline-flex flex-col items-center gap-2 mb-4 group"
          >
            <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-white p-1 border border-[#D4A017]/30 shadow-md">
              <Image
                src="/images/negm-store-logo.png"
                alt="Negm Store"
                fill
                priority
                className="object-contain"
              />
            </div>

            <div className="flex flex-col items-center text-center">
              <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                NEGM{" "}
                <span className="text-[#D4A017]">
                  STORE
                </span>
              </span>

              <span className="text-[9px] font-bold tracking-widest text-slate-500 dark:text-gray-400 uppercase">
                Luxury Auto Parts
              </span>
            </div>
          </Link>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t("forgot.title")}
          </h1>

          <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
            {t("forgot.subtitle")}
          </p>
        </div>

        {/* Success State */}
        {submitted ? (
          <div className="text-center space-y-4 py-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t("forgot.linkSent")}
            </h3>

            <p className="text-xs text-slate-600 dark:text-gray-300">
              {language === "ar" ? "أرسلنا تعليمات استعادة كلمة المرور إلى " : "We have sent password recovery instructions to "}
              <strong className="text-[#D4A017]">
                {email}
              </strong>
              .
            </p>

            <p className="text-[11px] text-slate-500 dark:text-gray-400">
              {t("forgot.checkInbox")}
            </p>

            <Link
              href="/login"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#8B3A2E] px-6 py-3 text-xs font-bold text-white hover:bg-[#a34436] transition shadow-md"
            >
              {language === "ar" ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
              <span>{t("forgot.backLogin")}</span>
            </Link>

          </div>
        ) : (

          /* Form */
          <form
            onSubmit={handleSubmit}
            className="space-y-4 text-left rtl:text-right"
          >

            {/* Email */}
            <div>

              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                {t("auth.email")}
              </label>

              <div className="relative flex items-center">

                <Mail className="absolute left-3.5 rtl:left-auto rtl:right-3.5 h-4 w-4 text-slate-400 dark:text-gray-500" />

                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                  autoComplete="email"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] py-3 pl-10 pr-4 rtl:pl-4 rtl:pr-10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:border-[#D4A017] focus:outline-none disabled:opacity-50"
                />

              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#8B3A2E] font-black text-white text-sm hover:bg-[#a34436] transition shadow-xl mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >

              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("forgot.sending")}
                </>
              ) : (
                t("forgot.sendBtn")
              )}

            </button>

            {/* Back */}
            <div className="text-center pt-4">

              <Link
                href="/login"
                className="text-xs font-semibold text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1"
              >
                {language === "ar" ? <ArrowRight className="h-3.5 w-3.5" /> : <ArrowLeft className="h-3.5 w-3.5" />}
                <span>{t("forgot.backLogin")}</span>
              </Link>

            </div>

          </form>
        )}

      </motion.div>
    </main>
  );
}