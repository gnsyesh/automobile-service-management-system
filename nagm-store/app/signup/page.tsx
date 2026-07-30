"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      showToast("Please accept terms & conditions.", "error");
      return;
    }
    showToast("Account created successfully! Welcome to Negm Store.", "success");
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 h-96 w-96 rounded-full bg-[#8B3A2E]/20 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full bg-[#D4A017]/15 blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-[#D4A017]/30 bg-[#1B1B1B]/90 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8B3A2E] text-xl font-black text-white shadow-lg border border-[#D4A017]/30">
              N
            </div>
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Create VIP Account
          </h1>
          <p className="text-xs text-gray-400 mt-1">Join Egypt's premier automotive spare parts community</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Ahmed Mahmoud"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="w-full rounded-xl border border-[#2D2D2D] bg-[#111111] py-3 pl-10 pr-4 text-xs text-white focus:border-[#D4A017] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-gray-500" />
              <input
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full rounded-xl border border-[#2D2D2D] bg-[#111111] py-3 pl-10 pr-4 text-xs text-white focus:border-[#D4A017] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Mobile Phone Number</label>
            <div className="relative flex items-center">
              <Phone className="absolute left-3.5 h-4 w-4 text-gray-500" />
              <input
                type="tel"
                placeholder="+20 100 000 0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                placeholder="Create password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

          <div className="flex items-center gap-2 text-xs pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="rounded accent-[#8B3A2E]"
            />
            <label htmlFor="terms" className="text-gray-300 cursor-pointer">
              I agree to the <span className="text-[#D4A017]">Terms of Service</span> & <span className="text-[#D4A017]">Privacy Policy</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#8B3A2E] font-black text-white text-sm hover:bg-[#a34436] transition shadow-xl mt-4"
          >
            <span>Create Account</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-[#D4A017] font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
