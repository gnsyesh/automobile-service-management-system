"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      showToast("Password reset link sent to your email!", "success");
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 h-96 w-96 rounded-full bg-[#8B3A2E]/20 blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-[#D4A017]/30 bg-[#1B1B1B]/90 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8B3A2E] text-xl font-black text-white shadow-lg border border-[#D4A017]/30">
              N
            </div>
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-gray-400 mt-1">Enter your registered email to receive reset instructions</p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-white">Reset Link Sent!</h3>
            <p className="text-xs text-gray-300">
              We have dispatched password recovery instructions to <strong className="text-[#D4A017]">{email}</strong>.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#8B3A2E] px-6 py-3 text-xs font-bold text-white hover:bg-[#a34436] transition"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Registered Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#2D2D2D] bg-[#111111] py-3 pl-10 pr-4 text-xs text-white focus:border-[#D4A017] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#8B3A2E] font-black text-white text-sm hover:bg-[#a34436] transition shadow-xl mt-2"
            >
              Send Reset Link
            </button>

            <div className="text-center pt-4">
              <Link href="/login" className="text-xs font-semibold text-gray-400 hover:text-white flex items-center justify-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </main>
  );
}
