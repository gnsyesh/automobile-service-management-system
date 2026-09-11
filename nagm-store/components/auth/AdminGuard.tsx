"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ShieldAlert, Loader2, LogOut, Store } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { user, role, isAdmin, loading, logOut } = useAuth();
  const { language } = useLanguage();

  useEffect(() => {
    if (!loading) {
      console.log(`[AdminGuard] Access evaluation: UID=${user?.uid}, email=${user?.email}, role=${role}, isAdmin=${isAdmin}`);
    }
    if (!loading && !user) {
      router.replace("/admin/login");
    }
  }, [user, role, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0E0E0E] flex flex-col items-center justify-center p-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8B3A2E] text-white shadow-xl mb-4 border border-[#D4A017]/40">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4A017]" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {language === "ar" ? "جارٍ التحقق من صلاحيات المسؤول..." : "Authenticating Administrator Access..."}
        </h3>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
          {language === "ar" ? "يرجى الانتظار للحظات" : "Connecting to Negm Store Admin Services"}
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isAdmin || role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0E0E0E] flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#151515] p-6 sm:p-8 shadow-xl flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/30 mb-4">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {language === "ar" ? "تم رفض الوصول" : "Access Denied"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">
            {language === "ar"
              ? "مطلوب صلاحيات مسؤول النظام للوصول إلى هذه اللوحة. الحساب الحالي لا يملك صلاحيات الإدارة."
              : "You must be logged in as an authorized administrator. Your current account does not have management access."}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full">
            <Link
              href="/"
              className="flex-1 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#202020] text-xs font-bold text-slate-700 dark:text-gray-300 hover:border-[#D4A017] transition"
            >
              <Store className="h-4 w-4 text-[#D4A017]" />
              <span>{language === "ar" ? "العودة للمتجر" : "Return to Store"}</span>
            </Link>

            <button
              onClick={async () => {
                await logOut();
                router.replace("/admin/login");
              }}
              className="flex-1 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B3A2E] text-white text-xs font-bold hover:bg-[#a34436] transition shadow-md"
            >
              <LogOut className="h-4 w-4" />
              <span>{language === "ar" ? "تبديل الحساب" : "Switch Account"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
