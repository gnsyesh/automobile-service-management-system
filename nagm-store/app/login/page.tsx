"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  if (loading) return;

  setLoading(true);

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // Check email verification
    if (!user.emailVerified) {
      showToast(
        "Please verify your email before signing in.",
        "error"
      );

      await auth.signOut();
      setLoading(false);
      return;
    }

    // Email is verified
    showToast("Login successful!", "success");

    router.push("/");
  } catch (error: any) {
    console.error("Firebase login error:", error);

    switch (error.code) {
      case "auth/invalid-credential":
        showToast("Invalid email or password.", "error");
        break;

      case "auth/invalid-email":
        showToast("Please enter a valid email address.", "error");
        break;

      case "auth/user-disabled":
        showToast("This account has been disabled.", "error");
        break;

      case "auth/too-many-requests":
        showToast(
          "Too many login attempts. Please try again later.",
          "error"
        );
        break;

      case "auth/network-request-failed":
        showToast(
          "Network error. Please check your internet connection.",
          "error"
        );
        break;

      default:
        showToast(
          "Unable to login. Please try again.",
          "error"
        );
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-gray-100 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-[#8B3A2E]/20 blur-[140px] pointer-events-none" />

      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-[#D4A017]/15 blur-[140px] pointer-events-none" />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 dark:border-[#D4A017]/30 bg-white dark:bg-[#1B1B1B]/90 p-8 sm:p-10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-left rtl:text-right"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <div className="relative h-14 w-52 mx-auto">
              <Image
                src="/images/negm-store-logo.png"
                alt="Negm Store Official Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
          </Link>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t("auth.login")}
          </h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
              {t("auth.email")}
            </label>

            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 rtl:left-auto rtl:right-3.5 h-4 w-4 text-gray-500" />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                autoComplete="email"
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-100 dark:bg-[#111111] py-3 pl-10 pr-4 rtl:pl-4 rtl:pr-10 text-xs text-slate-900 dark:text-white placeholder:text-gray-500 focus:border-[#D4A017] focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
              {t("auth.password")}
            </label>

            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 rtl:left-auto rtl:right-3.5 h-4 w-4 text-gray-500" />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-100 dark:bg-[#111111] py-3 pl-10 pr-10 rtl:pl-10 rtl:pr-10 text-xs text-slate-900 dark:text-white placeholder:text-gray-500 focus:border-[#D4A017] focus:outline-none disabled:opacity-50"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                className="absolute right-3 rtl:right-auto rtl:left-3 text-gray-500 hover:text-[#D4A017] transition disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded accent-[#8B3A2E]"
              />

              <span>{t("auth.remember")}</span>
            </label>

            <Link
              href="/forgot-password"
              className="text-[#D4A017] font-semibold hover:underline"
            >
              {t("auth.forgot")}
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#8B3A2E] font-black text-white text-sm hover:bg-[#a34436] transition shadow-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>
              {loading ? "Signing In..." : t("auth.login")}
            </span>

            {!loading &&
              (language === "ar" ? (
                <ArrowLeft className="h-4 w-4" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              ))}
          </button>
        </form>

        {/* Signup */}
        <div className="mt-8 text-center text-xs text-slate-500 dark:text-gray-400">
          <Link
            href="/signup"
            className="text-[#D4A017] font-bold hover:underline"
          >
            {t("auth.signup")}
          </Link>
        </div>
      </motion.div>
    </main>
  );
}