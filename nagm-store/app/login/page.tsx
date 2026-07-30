"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowRight } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState("ahmed.m@example.com");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Welcome back, Ahmed! Navigating to Home...", "success");
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-[#8B3A2E]/20 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-[#D4A017]/15 blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-[#D4A017]/30 bg-[#1B1B1B]/90 p-8 sm:p-10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8B3A2E] text-xl font-black text-white shadow-lg border border-[#D4A017]/30">
              N
            </div>
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Welcome To <span className="text-[#D4A017]">NEGM STORE</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Sign in to access your saved garage & orders</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-[#2D2D2D] bg-[#111111] py-3 pl-10 pr-4 text-xs text-white focus:border-[#D4A017] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-[#2D2D2D] bg-[#111111] py-3 pl-10 pr-10 text-xs text-white focus:border-[#D4A017] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-gray-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded accent-[#8B3A2E]"
              />
              <span>Remember Me</span>
            </label>

            <Link href="/forgot-password" className="text-[#D4A017] font-semibold hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#8B3A2E] font-black text-white text-sm hover:bg-[#a34436] transition shadow-xl mt-4"
          >
            <span>Sign In to Account</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Social Logins */}
        <div className="mt-8 pt-6 border-t border-[#2D2D2D] text-center">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Or Continue With
          </p>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={handleLogin}
              className="py-2.5 rounded-xl border border-[#2D2D2D] bg-[#111111] text-xs font-bold text-gray-300 hover:text-white hover:border-[#D4A017] transition"
            >
              Google
            </button>
            <button
              onClick={handleLogin}
              className="py-2.5 rounded-xl border border-[#2D2D2D] bg-[#111111] text-xs font-bold text-gray-300 hover:text-white hover:border-[#D4A017] transition"
            >
              Facebook
            </button>
            <button
              onClick={handleLogin}
              className="py-2.5 rounded-xl border border-[#2D2D2D] bg-[#111111] text-xs font-bold text-gray-300 hover:text-white hover:border-[#D4A017] transition"
            >
              Apple
            </button>
          </div>
        </div>

        {/* Footer Redirect */}
        <div className="mt-8 text-center text-xs text-gray-400">
          Don't have an account yet?{" "}
          <Link href="/signup" className="text-[#D4A017] font-bold hover:underline">
            Create Account
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
