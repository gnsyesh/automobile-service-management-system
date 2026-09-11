"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Store,
  AlertTriangle,
} from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      // 1. Authenticate with Firebase Email + Password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = userCredential.user;
      await user.reload();

      // Ensure fresh ID token is synchronized with Firestore transport
      await user.getIdToken(true);

      // 2. Check email verification
      if (!user.emailVerified) {
        showToast(
          language === "ar"
            ? "يرجى تفعيل بريدك الإلكتروني أولاً قبل تسجيل الدخول."
            : "Please verify your email before signing in.",
          "error"
        );
        await auth.signOut();
        setLoading(false);
        return;
      }

      // 3. Query admins/{uid} in Firestore
      let adminSnap;
      try {
        adminSnap = await getDoc(doc(db, "admins", user.uid));
      } catch (firstErr: any) {
        if (firstErr?.code === "permission-denied") {
          console.warn("[AdminLogin] Permission-denied on initial check. Retrying with refreshed token...");
          await user.getIdToken(true);
          try {
            adminSnap = await getDoc(doc(db, "admins", user.uid));
          } catch (retryErr) {
            console.error("Error checking admin credentials after retry:", retryErr);
            await auth.signOut();
            showToast(
              language === "ar"
                ? "تعذر التحقق من صلاحيات المشرف. يرجى المحاولة مرة أخرى."
                : "Unable to verify administrator permissions. Please try again.",
              "error"
            );
            setLoading(false);
            return;
          }
        } else {
          console.error("Error checking admin credentials:", firstErr);
          await auth.signOut();
          showToast(
            language === "ar"
              ? "تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى."
              : "Unable to connect to the server. Please check your internet connection and try again.",
            "error"
          );
          setLoading(false);
          return;
        }
      }

      const adminData = adminSnap.data();

      // 4. Verify role == "admin" AND active == true
      if (!adminSnap.exists() || adminData?.role !== "admin" || adminData?.active !== true) {
        await auth.signOut();
        showToast(
          language === "ar"
            ? "ليس لديك صلاحية للوصول إلى لوحة الإدارة."
            : "You do not have administrator access.",
          "error"
        );
        setLoading(false);
        return;
      }

      // 5. Grant access
      showToast(
        language === "ar"
          ? "مرحباً بك! تم التحقق من صلاحيات المسؤول."
          : "Welcome! Administrator access granted.",
        "success"
      );

      router.replace("/admin");
    } catch (error: any) {
      console.error("Admin login error:", error);

      switch (error.code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          showToast(
            language === "ar"
              ? "البريد الإلكتروني أو كلمة المرور غير صحيحة."
              : "Invalid email or password.",
            "error"
          );
          break;

        case "auth/invalid-email":
          showToast(
            language === "ar"
              ? "يرجى إدخال بريد إلكتروني صالح."
              : "Please enter a valid email address.",
            "error"
          );
          break;

        case "auth/too-many-requests":
          showToast(
            language === "ar"
              ? "محاولات كثيرة جداً. يرجى المحاولة لاحقاً."
              : "Too many login attempts. Please try again later.",
            "error"
          );
          break;

        case "auth/network-request-failed":
          showToast(
            language === "ar"
              ? "تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى."
              : "Unable to connect to the server. Please check your internet connection and try again.",
            "error"
          );
          break;

        default:
          showToast(
            language === "ar"
              ? "تعذر تسجيل الدخول. يرجى المحاولة مرة أخرى."
              : "Unable to sign in. Please try again.",
            "error"
          );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-[#070707] text-slate-900 dark:text-gray-100 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Admin Amber/Gold & Burgundy Security Glows */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-[#D4A017]/15 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-[#8B3A2E]/20 blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-slate-300 dark:border-[#D4A017]/40 bg-white dark:bg-[#151515]/95 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-left rtl:text-right"
      >
        {/* Admin Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-block mb-3 sm:mb-4">
            <div className="relative h-12 sm:h-14 w-44 sm:w-52 mx-auto">
              <Image
                src="/images/negm-store-logo.png"
                alt="Negm Store"
                fill
                priority
                className="object-contain"
              />
            </div>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[#D4A017] text-[11px] font-black uppercase tracking-wider mb-2">
            <Shield className="h-3.5 w-3.5" />
            <span>{t("auth.adminPortal")}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t("auth.adminLogin")}
          </h1>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            {language === "ar"
              ? "منطقة آمنة مخصصة لإدارة العمليات ومسؤولي النظام"
              : "Authorized administrator access and operations management only"}
          </p>
        </div>

        {/* Security Alert Badge */}
        <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 flex items-start gap-2.5 text-xs text-slate-700 dark:text-gray-300">
          <AlertTriangle className="h-4 w-4 text-[#D4A017] shrink-0 mt-0.5" />
          <span>{t("auth.adminVerified")}</span>
        </div>

        {/* Admin Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1">
              {t("auth.email")}
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 rtl:left-auto rtl:right-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@negmstore.com"
                required
                autoComplete="email"
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] py-3 pl-10 pr-4 rtl:pl-4 rtl:pr-10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#D4A017] focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1">
              {t("auth.password")}
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 rtl:left-auto rtl:right-3.5 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] py-3 pl-10 pr-10 rtl:pl-10 rtl:pr-10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#D4A017] focus:outline-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 rtl:right-auto rtl:left-3 text-slate-400 hover:text-[#D4A017] transition disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#8B3A2E] font-black text-white text-sm hover:bg-[#a34436] transition shadow-xl mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{loading ? (language === "ar" ? "جارٍ التحقق..." : "Verifying Access...") : (language === "ar" ? "تسجيل دخول المشرف" : "Sign In to Admin Portal")}</span>
            {!loading &&
              (language === "ar" ? (
                <ArrowLeft className="h-4 w-4" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              ))}
          </button>
        </form>

        {/* Back to Customer Store */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-[#2D2D2D] text-center text-xs text-slate-500 dark:text-gray-400">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-slate-700 dark:text-gray-300 hover:text-[#D4A017] font-semibold transition"
          >
            <Store className="h-3.5 w-3.5" />
            <span>{t("admin.switchToCustomer")}</span>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
