"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ExternalLink,
  LogOut,
  Sun,
  Moon,
  Globe,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, logOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { showToast } = useToast();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isDarkMode = theme === "dark" || resolvedTheme === "dark";

  const handleAdminLogout = async () => {
    try {
      await logOut();
      showToast(
        language === "ar" ? "تم تسجيل خروج المسؤول بنجاح." : "Admin logged out successfully.",
        "info"
      );
      router.replace("/admin/login");
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    {
      name: t("admin.dashboard"),
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: t("admin.orders"),
      href: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      name: t("admin.products"),
      href: "/admin/products",
      icon: Package,
    },
    {
      name: t("admin.customers"),
      href: "/admin/customers",
      icon: Users,
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4 sm:p-5 text-left rtl:text-right">
      <div>
        {/* Branding */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-[#2D2D2D] mb-6">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white p-1 border border-[#D4A017]/40 shadow-md">
              <Image
                src="/images/negm-store-logo.png"
                alt="Negm Store"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <div className="text-base font-black text-slate-900 dark:text-white leading-none">
                NEGM<span className="text-[#D4A017]"> ADMIN</span>
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400 tracking-wider mt-1">
                Luxury Auto Parts
              </div>
            </div>
          </Link>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Admin Badge */}
        <div className="mb-6 rounded-2xl bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/20 p-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4A017]">
            <ShieldCheck className="h-4 w-4" />
            <span>{language === "ar" ? "مسؤول معتمد" : "Verified Administrator"}</span>
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white mt-1 truncate">
            {userProfile?.name || user?.displayName || "Admin Manager"}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-gray-400 truncate">
            {user?.email}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#8B3A2E] text-white shadow-md"
                    : "text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#202020] hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-[#D4A017]" : "text-slate-500 dark:text-gray-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls: Storefront, Theme, Language, Logout */}
      <div className="pt-6 border-t border-slate-200 dark:border-[#2D2D2D] space-y-3">
        {/* Storefront Link */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] text-xs font-semibold text-slate-700 dark:text-gray-300 hover:text-[#D4A017] transition"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="h-3.5 w-3.5 text-[#D4A017]" />
            <span>{t("admin.switchToCustomer")}</span>
          </span>
        </Link>

        {/* Language & Theme row */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] text-xs font-bold text-slate-700 dark:text-gray-300 hover:border-[#D4A017] transition"
          >
            <Globe className="h-3.5 w-3.5 text-[#D4A017]" />
            <span>{language === "en" ? "العربية" : "English"}</span>
          </button>

          <button
            onClick={() => setTheme(isDarkMode ? "light" : "dark")}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] text-xs font-bold text-slate-700 dark:text-gray-300 hover:border-[#D4A017] transition"
          >
            {isDarkMode ? <Sun className="h-3.5 w-3.5 text-[#D4A017]" /> : <Moon className="h-3.5 w-3.5 text-indigo-600" />}
            <span>{isDarkMode ? "Light" : "Dark"}</span>
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleAdminLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-500 hover:text-white transition"
        >
          <LogOut className="h-4 w-4" />
          <span>{language === "ar" ? "تسجيل خروج المسؤول" : "Logout Administrator"}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-16 bg-white/95 dark:bg-[#151515]/95 backdrop-blur-xl border-b border-slate-200 dark:border-[#2D2D2D]">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-white p-0.5 border border-[#D4A017]/40">
            <Image
              src="/images/negm-store-logo.png"
              alt="Negm Store"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-sm font-black text-slate-900 dark:text-white">
            NEGM<span className="text-[#D4A017]"> ADMIN</span>
          </span>
        </Link>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-100 dark:bg-[#202020] text-slate-700 dark:text-gray-200"
          aria-label="Open Admin Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Backdrop & Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative z-10 w-72 max-w-[80vw] h-full bg-white dark:bg-[#151515] border-r rtl:border-r-0 rtl:border-l border-slate-200 dark:border-[#2D2D2D] shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block fixed top-0 bottom-0 left-0 rtl:left-auto rtl:right-0 z-30 w-64 bg-white dark:bg-[#151515] border-r rtl:border-r-0 rtl:border-l border-slate-200 dark:border-[#2D2D2D] shadow-sm">
        {sidebarContent}
      </aside>
    </>
  );
}
