"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { auth } from "@/lib/firebase";
import { ShieldAlert, Loader2 } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { user, role, loading } = useAuth();
  const { language } = useLanguage();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/admin/login");
      } else if (role !== "admin") {
        auth.signOut().finally(() => {
          router.replace("/admin/login");
        });
      }
    }
  }, [user, role, loading, router]);

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

  if (!user || role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0E0E0E] flex flex-col items-center justify-center p-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500 border border-red-500/30 mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          {language === "ar" ? "تم رفض الوصول" : "Access Denied"}
        </h2>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-2 max-w-sm">
          {language === "ar"
            ? "مطلوب صلاحيات مسؤول النظام للوصول إلى هذه اللوحة."
            : "You must be logged in as an authorized administrator to access this area."}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
