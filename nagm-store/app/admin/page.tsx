"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  Users,
  Package,
  TrendingUp,
  Plus,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Eye,
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order, Product, UserProfile } from "@/types";
import { products as localProducts } from "@/data/products";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminDashboardPage() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customersCount, setCustomersCount] = useState<number>(0);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch orders from Firestore
      const ordersSnapshot = await getDocs(collection(db, "orders"));
      const fetchedOrders: Order[] = [];
      ordersSnapshot.forEach((docSnap) => {
        fetchedOrders.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      setOrders(fetchedOrders);

      // 2. Fetch users count from Firestore
      const usersSnapshot = await getDocs(collection(db, "users"));
      setCustomersCount(usersSnapshot.size);
    } catch (e) {
      console.error("Error fetching admin dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute metrics from real Firestore data
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "Pending" || o.status === "Processing").length;
  const completedOrders = orders.filter((o) => o.status === "Delivered").length;
  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + (o.total || 0), 0);
  const totalProducts = localProducts.length;

  const statCards = [
    {
      label: t("admin.totalRevenue"),
      value: `${totalRevenue.toLocaleString()} EGP`,
      icon: TrendingUp,
      color: "from-amber-500/20 to-amber-600/10 text-[#D4A017] border-amber-500/30",
    },
    {
      label: t("admin.totalOrders"),
      value: totalOrders,
      icon: ShoppingCart,
      color: "from-blue-500/20 to-blue-600/10 text-blue-500 border-blue-500/30",
    },
    {
      label: t("admin.pendingOrders"),
      value: pendingOrders,
      icon: Clock,
      color: "from-orange-500/20 to-orange-600/10 text-orange-500 border-orange-500/30",
    },
    {
      label: t("admin.completedOrders"),
      value: completedOrders,
      icon: CheckCircle2,
      color: "from-emerald-500/20 to-emerald-600/10 text-emerald-500 border-emerald-500/30",
    },
    {
      label: t("admin.totalCustomers"),
      value: customersCount,
      icon: Users,
      color: "from-purple-500/20 to-purple-600/10 text-purple-500 border-purple-500/30",
    },
    {
      label: t("admin.totalProducts"),
      value: totalProducts,
      icon: Package,
      color: "from-rose-500/20 to-rose-600/10 text-rose-500 border-rose-500/30",
    },
  ];

  const recentOrders = [...orders].slice(0, 5);

  return (
    <div className="space-y-8 text-left rtl:text-right">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2D2D2D] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
            {t("admin.overview")}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {t("admin.dashboard")}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B] text-xs font-bold text-slate-700 dark:text-gray-300 hover:border-[#D4A017] transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#D4A017]" : ""}`} />
            <span>{language === "ar" ? "تحديث البيانات" : "Refresh"}</span>
          </button>

          <Link
            href="/admin/products"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B3A2E] text-white text-xs font-bold hover:bg-[#a34436] transition shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>{t("admin.addProduct")}</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`rounded-2xl border bg-gradient-to-br p-5 sm:p-6 backdrop-blur-xl shadow-sm dark:shadow-xl bg-white dark:bg-[#151515] ${card.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider">
                  {card.label}
                </span>
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-black/40 shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {loading ? "..." : card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Section */}
      <div className="rounded-3xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#151515] p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2D2D2D] pb-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-[#D4A017]" />
            <span>{language === "ar" ? "أحدث الطلبات" : "Recent Customer Orders"}</span>
          </h2>

          <Link
            href="/admin/orders"
            className="text-xs font-bold text-[#D4A017] hover:underline flex items-center gap-1"
          >
            <span>{language === "ar" ? "عرض جميع الطلبات" : "View All Orders"}</span>
            {language === "ar" ? <ArrowLeft className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left rtl:text-right">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#2D2D2D] text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 pr-4 rtl:pr-0 rtl:pl-4">Order ID</th>
                  <th className="pb-3 pr-4 rtl:pr-0 rtl:pl-4">Customer</th>
                  <th className="pb-3 pr-4 rtl:pr-0 rtl:pl-4">Date</th>
                  <th className="pb-3 pr-4 rtl:pr-0 rtl:pl-4">Total</th>
                  <th className="pb-3 pr-4 rtl:pr-0 rtl:pl-4">Status</th>
                  <th className="pb-3 text-right rtl:text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#2D2D2D]">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-[#1C1C1C] transition">
                    <td className="py-4 pr-4 rtl:pr-0 rtl:pl-4 font-mono font-bold text-[#D4A017]">
                      {ord.id}
                    </td>
                    <td className="py-4 pr-4 rtl:pr-0 rtl:pl-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {ord.shippingAddress?.fullName || ord.userEmail || "Customer"}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-gray-400">
                        {ord.shippingAddress?.phone || ord.userEmail}
                      </div>
                    </td>
                    <td className="py-4 pr-4 rtl:pr-0 rtl:pl-4 text-slate-600 dark:text-gray-300">
                      {ord.orderDate}
                    </td>
                    <td className="py-4 pr-4 rtl:pr-0 rtl:pl-4 font-bold text-slate-900 dark:text-white">
                      {ord.total?.toLocaleString()} EGP
                    </td>
                    <td className="py-4 pr-4 rtl:pr-0 rtl:pl-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          ord.status === "Delivered"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : ord.status === "Shipped"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                            : ord.status === "Cancelled"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-4 text-right rtl:text-left">
                      <Link
                        href="/admin/orders"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2D2D2D] hover:border-[#D4A017] text-slate-700 dark:text-gray-300 font-semibold transition"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Manage</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 dark:text-gray-400 space-y-2">
            <ShoppingCart className="mx-auto h-10 w-10 text-[#D4A017] opacity-60" />
            <p className="text-sm font-semibold">{t("admin.noData")}</p>
            <p className="text-xs">
              {language === "ar"
                ? "عندما يقوم العملاء بتقديم طلبات جديدة، ستظهر هنا في الحال."
                : "When customers place orders, they will appear here in real-time."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
