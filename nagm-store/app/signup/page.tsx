"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Lock, Phone, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(t("auth.signup") + " - Account Created!", "success");
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-slate-950 dark:bg-[#0A0A0A] text-slate-900 dark:text-gray-100 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-1/4 right-1/4 h-96 w-96 rounded-full bg-[#8B3A2E]/20 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full bg-[#D4A017]/15 blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 dark:border-[#D4A017]/30 bg-white dark:bg-[#1B1B1B]/90 p-8 sm:p-10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-left rtl:text-right"
      >
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
            {t("auth.signup")}
          </h1>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">{t("contact.fullName")}</label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 rtl:left-auto rtl:right-3.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ahmed Mahmoud"
                className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-100 dark:bg-[#111111] py-3 pl-10 pr-4 rtl:pl-4 rtl:pr-10 text-xs text-slate-900 dark:text-white focus:border-[#D4A017] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">{t("auth.email")}</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 rtl:left-auto rtl:right-3.5 h-4 w-4 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ahmed@example.com"
                className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-100 dark:bg-[#111111] py-3 pl-10 pr-4 rtl:pl-4 rtl:pr-10 text-xs text-slate-900 dark:text-white focus:border-[#D4A017] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">{t("contact.phone")}</label>
            <div className="relative flex items-center">
              <Phone className="absolute left-3.5 rtl:left-auto rtl:right-3.5 h-4 w-4 text-gray-500" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+20 100 000 0000"
                className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-100 dark:bg-[#111111] py-3 pl-10 pr-4 rtl:pl-4 rtl:pr-10 text-xs text-slate-900 dark:text-white focus:border-[#D4A017] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">{t("auth.password")}</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 rtl:left-auto rtl:right-3.5 h-4 w-4 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-100 dark:bg-[#111111] py-3 pl-10 pr-4 rtl:pl-4 rtl:pr-10 text-xs text-slate-900 dark:text-white focus:border-[#D4A017] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#8B3A2E] font-black text-white text-sm hover:bg-[#a34436] transition shadow-xl mt-4"
          >
            <span>{t("auth.signup")}</span>
            {language === "ar" ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500 dark:text-gray-400">
          <Link href="/login" className="text-[#D4A017] font-bold hover:underline">
            {t("auth.login")}
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
