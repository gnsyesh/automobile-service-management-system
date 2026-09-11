"use client";

import React from "react";
import { usePathname } from "next/navigation";
import AdminGuard from "@/components/auth/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0C0C0C] text-slate-900 dark:text-gray-100 flex flex-col lg:flex-row transition-colors duration-300">
        <AdminSidebar />
        <div className="flex-1 lg:pl-64 rtl:lg:pl-0 rtl:lg:pr-64 pt-16 lg:pt-0 min-h-screen flex flex-col w-full min-w-0">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto min-w-0">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
