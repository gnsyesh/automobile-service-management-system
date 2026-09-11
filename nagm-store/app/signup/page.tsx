"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const { signInWithGoogle } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || googleLoading) return;

    // Check password confirmation
    if (password !== confirmPassword) {
      showToast(
        language === "ar" ? "كلمات المرور غير متطابقة." : "Passwords do not match.",
        "error"
      );
      return;
    }

    // Firebase requires at least 6 characters
    if (password.length < 6) {
      showToast(
        language === "ar" ? "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل." : "Password must be at least 6 characters.",
        "error"
      );
      return;
    }

    setLoading(true);

    try {
      // Create Firebase account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // Save user's name in Firebase Authentication profile
      await updateProfile(userCredential.user, {
        displayName: name.trim(),
      });

      // Save initial customer record into Firestore users/{uid} strictly with role: "user"
      try {
        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          role: "user",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (firestoreError: any) {
        console.error("Firestore user profile save error:", firestoreError);
        if (firestoreError.message?.includes("offline")) {
          showToast(t("auth.firestoreOffline"), "error");
        }
      }

      // Send verification email
      try {
        await sendEmailVerification(userCredential.user);
      } catch (verificationError) {
        console.error("Verification email error:", verificationError);
      }

      showToast(
        language === "ar"
          ? "تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب."
          : "Account created! Please check your email to verify your account.",
        "success"
      );

      router.push("/login");
    } catch (error: any) {
      console.error("Firebase signup error:", error);

      switch (error.code) {
        case "auth/email-already-in-use":
          showToast(
            language === "ar" ? "البريد الإلكتروني مسجل مسبقاً بالفعل." : "An account already exists with this email.",
            "error"
          );
          break;

        case "auth/invalid-email":
          showToast(
            language === "ar" ? "يرجى إدخال بريد إلكتروني صحيح." : "Please enter a valid email address.",
            "error"
          );
          break;

        case "auth/weak-password":
          showToast(
            language === "ar" ? "كلمة المرور ضعيفة جداً." : "Password is too weak. Use at least 6 characters.",
            "error"
          );
          break;

        case "auth/network-request-failed":
          showToast(
            language === "ar" ? "خطأ في الشبكة. يرجى التحقق من اتصال الإنترنت." : "Network error. Please check your internet connection.",
            "error"
          );
          break;

        default:
          showToast(
            language === "ar" ? "تعذر إنشاء الحساب. يرجى المحاولة لاحقاً." : "Unable to create account. Please try again.",
            "error"
          );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (loading || googleLoading) return;
    setGoogleLoading(true);

    try {
      const user = await signInWithGoogle();
      if (user) {
        showToast(
          language === "ar" ? "تم تسجيل الحساب بنجاح عبر جوجل!" : "Signed in with Google successfully!",
          "success"
        );
        router.push("/");
      }
    } catch (error: any) {
      console.error("Google sign-up error:", error);

      switch (error.code) {
        case "auth/popup-closed-by-user":
          showToast(t("auth.googleCancelled"), "info");
          break;

        case "auth/popup-blocked":
          showToast(
            language === "ar" ? "تم حظر النافذة المنبثقة من المتصفح. جارٍ التحويل..." : "Popup was blocked. Redirecting...",
            "info"
          );
          break;

        case "auth/account-exists-with-different-credential":
          showToast(t("auth.googleAccountExists"), "error");
          break;

        case "auth/network-request-failed":
          showToast(
            language === "ar" ? "يرجى التحقق من اتصال الإنترنت." : "Please check your internet connection.",
            "error"
          );
          break;

        case "auth/unauthorized-domain":
          showToast(t("auth.googleDomainUnauthorized"), "error");
          break;

        case "auth/operation-not-allowed":
          showToast(t("auth.googleUnavailable"), "error");
          break;

        default:
          if (error.message?.includes("offline")) {
            showToast(t("auth.firestoreOffline"), "error");
          } else {
            showToast(t("auth.googleUnavailable"), "error");
          }
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-gray-100 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-[#8B3A2E]/20 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-[#D4A017]/15 blur-[140px] pointer-events-none" />

      {/* Signup Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 dark:border-[#D4A017]/30 bg-white dark:bg-[#1B1B1B]/90 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-left rtl:text-right"
      >
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-block mb-3 sm:mb-4">
            <div className="relative h-12 sm:h-14 w-44 sm:w-52 mx-auto">
              <Image
                src="/images/negm-store-logo.png"
                alt="Negm Store Official Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
          </Link>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t("auth.signup")}
          </h1>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            {language === "ar" ? "انضم إلى عملاء النخبة في متجر نجم" : "Join VIP customer network at Negm Store"}
          </p>
        </div>

        {/* Google Sign-up Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 dark:border-[#333] bg-white dark:bg-[#222] text-slate-700 dark:text-gray-100 font-bold text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-[#282828] transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mb-5"
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#D4A017]" />
          ) : (
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>{googleLoading ? t("auth.googleSigningIn") : t("auth.continueWithGoogle")}</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-slate-200 dark:border-[#2D2D2D] w-full" />
          <span className="bg-white dark:bg-[#1B1B1B] px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 whitespace-nowrap">
            {t("auth.orEmail")}
          </span>
          <div className="border-t border-slate-200 dark:border-[#2D2D2D] w-full" />
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
              {t("contact.fullName")}
            </label>

            <div className="relative flex items-center">
              <User className="absolute left-3.5 rtl:left-auto rtl:right-3.5 h-4 w-4 text-gray-400" />

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={language === "ar" ? "الاسم ثلاثي" : "Enter your full name"}
                autoComplete="name"
                disabled={loading || googleLoading}
                className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] py-3 pl-10 pr-4 rtl:pl-4 rtl:pr-10 text-xs text-slate-900 dark:text-white placeholder:text-gray-400 focus:border-[#D4A017] focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
              {t("auth.email")}
            </label>

            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 rtl:left-auto rtl:right-3.5 h-4 w-4 text-gray-400" />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                autoComplete="email"
                disabled={loading || googleLoading}
                className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] py-3 pl-10 pr-4 rtl:pl-4 rtl:pr-10 text-xs text-slate-900 dark:text-white placeholder:text-gray-400 focus:border-[#D4A017] focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
              {t("contact.phone")}
            </label>

            <div className="relative flex items-center">
              <Phone className="absolute left-3.5 rtl:left-auto rtl:right-3.5 h-4 w-4 text-gray-400" />

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+20 100 000 0000"
                autoComplete="tel"
                disabled={loading || googleLoading}
                className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] py-3 pl-10 pr-4 rtl:pl-4 rtl:pr-10 text-xs text-slate-900 dark:text-white placeholder:text-gray-400 focus:border-[#D4A017] focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
              {t("auth.password")}
            </label>

            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 rtl:left-auto rtl:right-3.5 h-4 w-4 text-gray-400" />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="At least 6 characters"
                autoComplete="new-password"
                disabled={loading || googleLoading}
                className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] py-3 pl-10 pr-10 rtl:pl-10 rtl:pr-10 text-xs text-slate-900 dark:text-white placeholder:text-gray-400 focus:border-[#D4A017] focus:outline-none disabled:opacity-50"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading || googleLoading}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 rtl:right-auto rtl:left-3 text-gray-400 hover:text-[#D4A017] transition disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
              {language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
            </label>

            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 rtl:left-auto rtl:right-3.5 h-4 w-4 text-gray-400" />

              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm password"
                autoComplete="new-password"
                disabled={loading || googleLoading}
                className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] py-3 pl-10 pr-10 rtl:pl-10 rtl:pr-10 text-xs text-slate-900 dark:text-white placeholder:text-gray-400 focus:border-[#D4A017] focus:outline-none disabled:opacity-50"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading || googleLoading}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="absolute right-3 rtl:right-auto rtl:left-3 text-gray-400 hover:text-[#D4A017] transition disabled:opacity-50"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#8B3A2E] font-black text-white text-sm hover:bg-[#a34436] transition shadow-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>
              {loading ? (language === "ar" ? "جارٍ إنشاء الحساب..." : "Creating Account...") : t("auth.signup")}
            </span>

            {!loading &&
              (language === "ar" ? (
                <ArrowLeft className="h-4 w-4" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              ))}
          </button>
        </form>

        {/* Existing Member Link */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-gray-400">
          <span>{language === "ar" ? "هل لديك حساب بالفعل؟" : "Already have an account?"} </span>
          <Link
            href="/login"
            className="text-[#D4A017] font-bold hover:underline ml-1"
          >
            {t("auth.login")}
          </Link>
        </div>
      </motion.div>
    </main>
  );
}