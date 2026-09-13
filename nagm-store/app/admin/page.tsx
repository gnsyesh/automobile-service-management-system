"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Eye,
  Calendar,
  Filter,
  AlertTriangle,
  Layers,
  Award,
  ChevronDown,
  BarChart3,
  Percent,
  DollarSign,
  UserCheck,
  ShieldCheck,
  Sparkles,
  Hash,
  ArrowUpRight,
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order, Product, DateFilterPreset, UserProfile } from "@/types";
import { products as localProducts } from "@/data/products";
import { useLanguage } from "@/context/LanguageContext";
import {
  getDateRangeForPreset,
  filterOrdersByRange,
  calculatePeriodMetrics,
  calculateComparison,
  aggregateMonthlyRevenue,
  aggregateYearlyRevenue,
  aggregateTopSellingProducts,
  aggregateOrderStatus,
  aggregateCategoryPerformance,
  getAvailableYears,
  getOrderDate,
  getPurchasedUnitsCount,
  getCustomerInsights,
  CustomerInsights,
} from "@/lib/analytics";

export default function AdminDashboardPage() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Core data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [customersCount, setCustomersCount] = useState<number>(0);
  const [productsList, setProductsList] = useState<Product[]>(localProducts);

  // Filter & Comparison State
  const [preset, setPreset] = useState<DateFilterPreset>("this_month");
  const [specificYear, setSpecificYear] = useState<number>(new Date().getFullYear());
  const [specificMonth, setSpecificMonth] = useState<number>(new Date().getMonth());
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const [compareEnabled, setCompareEnabled] = useState<boolean>(true);
  const [topLimit, setTopLimit] = useState<number>(5);
  const [chartYear, setChartYear] = useState<number>(new Date().getFullYear());

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch independent Firestore collections concurrently
      const [ordersSnapshot, usersSnapshot, prodsSnapshot] = await Promise.all([
        getDocs(collection(db, "orders")),
        getDocs(collection(db, "users")),
        getDocs(collection(db, "products")),
      ]);

      // 1. Orders
      const fetchedOrders: Order[] = [];
      ordersSnapshot.forEach((docSnap) => {
        fetchedOrders.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      // Sort newest first
      fetchedOrders.sort((a, b) => {
        const da = getOrderDate(a)?.getTime() || 0;
        const dbDate = getOrderDate(b)?.getTime() || 0;
        return dbDate - da;
      });
      setOrders(fetchedOrders);

      // 2. Customers / Users
      const userList: UserProfile[] = [];
      usersSnapshot.forEach((docSnap) => {
        userList.push({ uid: docSnap.id, ...(docSnap.data() as any) });
      });
      setCustomers(userList);
      setCustomersCount(userList.length);

      // 3. Products
      if (!prodsSnapshot.empty) {
        const firestoreProds: Product[] = [];
        prodsSnapshot.forEach((p) => {
          firestoreProds.push({ id: p.id, ...(p.data() as any) });
        });
        setProductsList(firestoreProds);
      } else {
        setProductsList(localProducts);
      }

      setLastUpdated(new Date());
    } catch (e) {
      console.error("Error fetching admin dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Available years from orders
  const availableYears = useMemo(() => getAvailableYears(orders), [orders]);

  // Current selected range and filtered orders
  const currentRange = useMemo(() => {
    return getDateRangeForPreset(preset, specificYear, specificMonth, customStart, customEnd);
  }, [preset, specificYear, specificMonth, customStart, customEnd]);

  const currentOrders = useMemo(() => {
    return filterOrdersByRange(orders, currentRange);
  }, [orders, currentRange]);

  // Previous period range for comparison
  const previousRange = useMemo(() => {
    if (!compareEnabled) return null;

    if (preset === "this_month") {
      return getDateRangeForPreset("last_month");
    }
    if (preset === "this_year") {
      return getDateRangeForPreset("last_year");
    }
    if (preset === "today") {
      return getDateRangeForPreset("yesterday");
    }
    if (preset === "this_week") {
      return getDateRangeForPreset("last_week");
    }
    if (preset === "specific_month") {
      const prevM = specificMonth === 0 ? 11 : specificMonth - 1;
      const prevY = specificMonth === 0 ? specificYear - 1 : specificYear;
      return getDateRangeForPreset("specific_month", prevY, prevM);
    }
    if (preset === "specific_year") {
      return getDateRangeForPreset("specific_year", specificYear - 1);
    }

    // Generic previous range calculation
    if (currentRange.startDate && currentRange.endDate) {
      const duration = currentRange.endDate.getTime() - currentRange.startDate.getTime();
      const prevEnd = new Date(currentRange.startDate.getTime() - 1);
      const prevStart = new Date(prevEnd.getTime() - duration);
      return { startDate: prevStart, endDate: prevEnd };
    }

    return null;
  }, [compareEnabled, preset, specificYear, specificMonth, currentRange]);

  const previousOrders = useMemo(() => {
    if (!previousRange) return [];
    return filterOrdersByRange(orders, previousRange);
  }, [orders, previousRange]);

  // Comparison metrics calculation
  const comparison = useMemo(() => {
    if (!compareEnabled || !previousRange) return null;
    return calculateComparison(currentOrders, previousOrders);
  }, [compareEnabled, previousRange, currentOrders, previousOrders]);

  // Core metrics for the current period
  const metrics = useMemo(() => {
    return calculatePeriodMetrics(currentOrders);
  }, [currentOrders]);

  // Customer insights & repeat purchase metrics
  const customerInsights = useMemo(() => {
    return getCustomerInsights(customers, currentOrders, currentRange);
  }, [customers, currentOrders, currentRange]);

  // Total physical part units sold in period
  const purchasedUnitsCount = useMemo(() => {
    return getPurchasedUnitsCount(currentOrders);
  }, [currentOrders]);

  // Operational counts
  const pendingOrdersCount = orders.filter(
    (o) => o.status === "Pending" || o.status === "Processing"
  ).length;
  const lowStockCount = productsList.filter((p) => p.stockCount <= 5).length;

  // Chart data aggregations
  const monthlyRevenueData = useMemo(() => {
    return aggregateMonthlyRevenue(orders, chartYear);
  }, [orders, chartYear]);

  const yearlyRevenueData = useMemo(() => {
    return aggregateYearlyRevenue(orders);
  }, [orders]);

  const topProductsData = useMemo(() => {
    const dataset = currentOrders.length > 0 ? currentOrders : orders;
    return aggregateTopSellingProducts(dataset, topLimit);
  }, [currentOrders, orders, topLimit]);

  const orderStatusData = useMemo(() => {
    const dataset = currentOrders.length > 0 ? currentOrders : orders;
    return aggregateOrderStatus(dataset);
  }, [currentOrders, orders]);

  const categoryData = useMemo(() => {
    const dataset = currentOrders.length > 0 ? currentOrders : orders;
    return aggregateCategoryPerformance(dataset);
  }, [currentOrders, orders]);

  // Max monthly revenue for chart scaling
  const maxMonthlyRevenue = useMemo(() => {
    const max = Math.max(...monthlyRevenueData.map((d) => d.revenue), 0);
    return max > 0 ? max : 10000;
  }, [monthlyRevenueData]);

  // Max yearly revenue for scaling
  const maxYearlyRevenue = useMemo(() => {
    const max = Math.max(...yearlyRevenueData.map((d) => d.revenue), 0);
    return max > 0 ? max : 10000;
  }, [yearlyRevenueData]);

  // Month Names
  const monthLabels = [
    { index: 0, en: "January", ar: "يناير" },
    { index: 1, en: "February", ar: "فبراير" },
    { index: 2, en: "March", ar: "مارس" },
    { index: 3, en: "April", ar: "أبريل" },
    { index: 4, en: "May", ar: "مايو" },
    { index: 5, en: "June", ar: "يونيو" },
    { index: 6, en: "July", ar: "يوليو" },
    { index: 7, en: "August", ar: "أغسطس" },
    { index: 8, en: "September", ar: "سبتمبر" },
    { index: 9, en: "October", ar: "أكتوبر" },
    { index: 10, en: "November", ar: "نوفمبر" },
    { index: 11, en: "December", ar: "ديسمبر" },
  ];

  // Friendly human-readable label for selected timeframe
  const periodLabel = useMemo(() => {
    switch (preset) {
      case "today":
        return language === "ar" ? "اليوم" : "Today";
      case "yesterday":
        return language === "ar" ? "أمس" : "Yesterday";
      case "this_week":
        return language === "ar" ? "هذا الأسبوع" : "This Week";
      case "last_week":
        return language === "ar" ? "الأسبوع الماضي" : "Last Week";
      case "this_month":
        return language === "ar" ? "هذا الشهر" : "This Month";
      case "last_month":
        return language === "ar" ? "الشهر الماضي" : "Last Month";
      case "this_year":
        return language === "ar" ? `عام ${new Date().getFullYear()}` : `Year ${new Date().getFullYear()}`;
      case "last_year":
        return language === "ar" ? `عام ${new Date().getFullYear() - 1}` : `Year ${new Date().getFullYear() - 1}`;
      case "specific_month":
        const mObj = monthLabels.find((m) => m.index === specificMonth);
        const mName = language === "ar" ? mObj?.ar : mObj?.en;
        return `${mName} ${specificYear}`;
      case "specific_year":
        return `${specificYear}`;
      case "custom":
        return customStart && customEnd ? `${customStart} → ${customEnd}` : (language === "ar" ? "فترة مخصصة" : "Custom Range");
      case "all_time":
        return language === "ar" ? "كامل الفترة (جميع السجلات)" : "All Time Records";
      default:
        return "";
    }
  }, [preset, specificMonth, specificYear, customStart, customEnd, language]);

  // Baseline comparison label
  const baselineLabel = useMemo(() => {
    if (!compareEnabled) return "";
    switch (preset) {
      case "this_month":
        return language === "ar" ? "الشهر الماضي" : "Last Month";
      case "this_year":
        return language === "ar" ? "العام الماضي" : "Last Year";
      case "today":
        return language === "ar" ? "أمس" : "Yesterday";
      case "this_week":
        return language === "ar" ? "الأسبوع الماضي" : "Last Week";
      case "specific_month":
        const prevM = specificMonth === 0 ? 11 : specificMonth - 1;
        const prevY = specificMonth === 0 ? specificYear - 1 : specificYear;
        const mObj = monthLabels.find((m) => m.index === prevM);
        return `${language === "ar" ? mObj?.ar : mObj?.en} ${prevY}`;
      case "specific_year":
        return `${specificYear - 1}`;
      default:
        return language === "ar" ? "الفترة السابقة المماثلة" : "Prior Equivalent Period";
    }
  }, [compareEnabled, preset, specificMonth, specificYear, language]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  return (
    <div className="space-y-8 text-left rtl:text-right pb-14 max-w-full overflow-hidden">
      {/* 1. Header with Executive Status & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2D2D2D] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#D4A017] text-[11px] font-black uppercase tracking-wider mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{language === "ar" ? "مركز قيادة المتجر والبيانات الحية" : "Store Executive Control Center"}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t("admin.dashboard")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">
            {language === "ar"
              ? "متابعة المبيعات الحقيقية، حجم الطلبات، تفاعل العملاء، وأداء المنتجات اللحظي"
              : "Live revenue analytics, customer order fulfillment, and real-time business performance"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Last Updated Badge */}
          {lastUpdated && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2D2D2D] text-[11px] text-slate-500 dark:text-gray-400 font-medium">
              <Clock className="h-3.5 w-3.5 text-[#D4A017]" />
              <span>
                {language === "ar" ? "آخر تحديث:" : "Updated:"}{" "}
                {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          )}

          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1A1A1A] text-xs font-bold text-slate-700 dark:text-gray-300 hover:border-[#D4A017] hover:text-slate-900 dark:hover:text-white transition shadow-sm disabled:opacity-50"
            title="Refresh Firestore Data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#D4A017]" : ""}`} />
            <span>{language === "ar" ? "تحديث البيانات" : "Refresh Data"}</span>
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

      {/* 2. Executive Timeframe & Baseline Comparison Command Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#151515] p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Timeframe Selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#D4A017]" />
              <span>{t("admin.selectPeriod")}:</span>
            </span>

            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as DateFilterPreset)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#333] bg-slate-50 dark:bg-[#202020] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017] transition cursor-pointer"
            >
              <option value="this_month">{t("admin.thisMonth")}</option>
              <option value="last_month">{t("admin.lastMonth")}</option>
              <option value="this_week">{t("admin.thisWeek")}</option>
              <option value="last_week">{t("admin.lastWeek")}</option>
              <option value="today">{t("admin.today")}</option>
              <option value="yesterday">{t("admin.yesterday")}</option>
              <option value="this_year">{t("admin.thisYear")}</option>
              <option value="last_year">{t("admin.lastYear")}</option>
              <option value="specific_month">{t("admin.specificMonth")}</option>
              <option value="specific_year">{t("admin.specificYear")}</option>
              <option value="custom">{t("admin.customRange")}</option>
              <option value="all_time">{t("admin.allTime")}</option>
            </select>

            {/* Specific Month & Year dropdowns */}
            {preset === "specific_month" && (
              <div className="flex items-center gap-2">
                <select
                  value={specificMonth}
                  onChange={(e) => setSpecificMonth(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-[#333] bg-slate-50 dark:bg-[#202020] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
                >
                  {monthLabels.map((m) => (
                    <option key={m.index} value={m.index}>
                      {language === "ar" ? m.ar : m.en}
                    </option>
                  ))}
                </select>

                <select
                  value={specificYear}
                  onChange={(e) => setSpecificYear(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-[#333] bg-slate-50 dark:bg-[#202020] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Specific Year dropdown */}
            {preset === "specific_year" && (
              <select
                value={specificYear}
                onChange={(e) => setSpecificYear(Number(e.target.value))}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-[#333] bg-slate-50 dark:bg-[#202020] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            )}

            {/* Custom Range Inputs */}
            {preset === "custom" && (
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-[#333] bg-slate-50 dark:bg-[#202020] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
                />
                <span className="text-xs text-slate-400 font-bold">—</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-[#333] bg-slate-50 dark:bg-[#202020] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
                />
              </div>
            )}
          </div>

          {/* Period Comparison Toggle */}
          <div className="flex items-center gap-3 self-end lg:self-center">
            <label className="relative inline-flex items-center cursor-pointer gap-2.5 select-none">
              <input
                type="checkbox"
                checked={compareEnabled}
                onChange={(e) => setCompareEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-[#333] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:left-auto rtl:after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D4A017]"></div>
              <span className="text-xs font-bold text-slate-700 dark:text-gray-300">
                {t("admin.comparePeriods")}
              </span>
            </label>
          </div>
        </div>

        {/* Active Timeframe Indicator & Comparison Ribbon */}
        <div className="pt-3 border-t border-slate-100 dark:border-[#202020] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-gray-400">
            <span className="font-semibold text-slate-900 dark:text-white">
              {language === "ar" ? "الفترة المعروضة:" : "Viewing Data For:"}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-[#D4A017]/10 text-[#D4A017] font-bold border border-[#D4A017]/20">
              {periodLabel}
            </span>
          </div>

          {compareEnabled && comparison && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <span className="text-slate-500 dark:text-gray-400 font-medium">
                {language === "ar" ? `مقارنة بـ (${baselineLabel}):` : `vs (${baselineLabel}):`}
              </span>

              {/* Revenue Diff */}
              <div
                className={`font-bold inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] ${
                  comparison.revenueDiff >= 0
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                }`}
              >
                {comparison.revenueDiff >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{comparison.revenueDiff >= 0 ? "+" : ""}{comparison.revenueDiff.toLocaleString()} EGP</span>
                <span>({comparison.revenuePct >= 0 ? "+" : ""}{comparison.revenuePct}%)</span>
              </div>

              {/* Orders Diff */}
              <div
                className={`font-bold inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] ${
                  comparison.ordersDiff >= 0
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                }`}
              >
                <span>{language === "ar" ? "الطلبات:" : "Orders:"}</span>
                <span>{comparison.ordersDiff >= 0 ? "+" : ""}{comparison.ordersDiff}</span>
                <span>({comparison.ordersPct >= 0 ? "+" : ""}{comparison.ordersPct}%)</span>
              </div>

              {/* AOV Diff */}
              <div
                className={`font-bold inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] ${
                  comparison.aovDiff >= 0
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                }`}
              >
                <span>{language === "ar" ? "متوسط السلة:" : "AOV:"}</span>
                <span>{comparison.aovDiff >= 0 ? "+" : ""}{comparison.aovDiff.toLocaleString()} EGP</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Tier 1: Primary Financial & Sales KPIs (3 Prominent Cards) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
            {language === "ar" ? "الأداء المالي وحركة المبيعات" : "Financial & Sales Performance"}
          </h2>
          <span className="text-[11px] text-slate-400">
            {language === "ar" ? "البيانات الفعلية من سجلات الطلبات" : "Real Firestore Orders Data"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Gross Revenue */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-white to-white dark:via-[#151515] dark:to-[#151515] p-6 shadow-sm dark:shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-600 dark:text-gray-400 uppercase tracking-wider">
                {t("admin.totalRevenue")}
              </span>
              <div className="p-3 rounded-2xl bg-[#D4A017]/15 text-[#D4A017] shadow-inner">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {loading ? "..." : `${metrics.revenue.toLocaleString()} EGP`}
              </div>

              {compareEnabled && comparison ? (
                <div className="mt-2.5 flex items-center gap-2 text-xs">
                  <span
                    className={`font-bold inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                      comparison.revenueDiff >= 0
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-red-500/10 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {comparison.revenueDiff >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    {comparison.revenuePct >= 0 ? "+" : ""}{comparison.revenuePct}%
                  </span>
                  <span className="text-slate-500 dark:text-gray-400 text-[11px]">
                    {language === "ar" ? `مقارنة بـ ${baselineLabel}` : `vs ${baselineLabel}`}
                  </span>
                </div>
              ) : (
                <p className="mt-2 text-[11px] text-slate-500 dark:text-gray-400">
                  {language === "ar" ? "باستثناء الطلبات الملغاة" : "Net revenue from non-cancelled orders"}
                </p>
              )}
            </div>
          </div>

          {/* Card 2: Total Orders */}
          <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-white to-white dark:via-[#151515] dark:to-[#151515] p-6 shadow-sm dark:shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-600 dark:text-gray-400 uppercase tracking-wider">
                {t("admin.totalOrders")}
              </span>
              <div className="p-3 rounded-2xl bg-blue-500/15 text-blue-500 shadow-inner">
                <ShoppingCart className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {loading ? "..." : metrics.ordersCount}
              </div>

              {compareEnabled && comparison ? (
                <div className="mt-2.5 flex items-center gap-2 text-xs">
                  <span
                    className={`font-bold inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                      comparison.ordersDiff >= 0
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-red-500/10 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {comparison.ordersDiff >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    {comparison.ordersPct >= 0 ? "+" : ""}{comparison.ordersPct}%
                  </span>
                  <span className="text-slate-500 dark:text-gray-400 text-[11px]">
                    {language === "ar" ? `مقارنة بـ ${baselineLabel}` : `vs ${baselineLabel}`}
                  </span>
                </div>
              ) : (
                <p className="mt-2 text-[11px] text-slate-500 dark:text-gray-400">
                  {language === "ar" ? "إجمالي الطلبات المؤكدة في الفترة" : "Qualifying orders received"}
                </p>
              )}
            </div>
          </div>

          {/* Card 3: Average Order Value */}
          <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-white to-white dark:via-[#151515] dark:to-[#151515] p-6 shadow-sm dark:shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-600 dark:text-gray-400 uppercase tracking-wider">
                {t("admin.avgOrderValue")}
              </span>
              <div className="p-3 rounded-2xl bg-purple-500/15 text-purple-500 shadow-inner">
                <Percent className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {loading ? "..." : `${metrics.averageOrderValue.toLocaleString()} EGP`}
              </div>

              {compareEnabled && comparison ? (
                <div className="mt-2.5 flex items-center gap-2 text-xs">
                  <span
                    className={`font-bold inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                      comparison.aovDiff >= 0
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-red-500/10 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {comparison.aovDiff >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    {comparison.aovPct >= 0 ? "+" : ""}{comparison.aovPct}%
                  </span>
                  <span className="text-slate-500 dark:text-gray-400 text-[11px]">
                    {language === "ar" ? `مقارنة بـ ${baselineLabel}` : `vs ${baselineLabel}`}
                  </span>
                </div>
              ) : (
                <p className="mt-2 text-[11px] text-slate-500 dark:text-gray-400">
                  {language === "ar" ? "متوسط قيمة سلة المشتريات للطلب" : "Average customer expenditure per order"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Tier 2: Store Operations & Health (4 High-Utility Cards) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
            {language === "ar" ? "حالة العمليات والمخزون والعملاء" : "Operations, Inventory & Customers"}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Op 1: Customer Accounts */}
          <div className="rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#151515] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-gray-400">
                {t("admin.totalCustomers")}
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
              {loading ? "..." : customersCount}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-gray-400 pt-2 border-t border-slate-100 dark:border-[#222]">
              <span>{language === "ar" ? "مشترين نشطين:" : "Active buyers:"}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {customerInsights.activeBuyersInPeriod}
              </span>
            </div>
          </div>

          {/* Op 2: Physical Units Sold */}
          <div className="rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#151515] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-gray-400">
                {language === "ar" ? "القطع المباعة بالفترة" : "Units Sold in Period"}
              </span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Package className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
              {loading ? "..." : purchasedUnitsCount}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-gray-400 pt-2 border-t border-slate-100 dark:border-[#222]">
              <span>{language === "ar" ? "قطع غيار مختلفة:" : "Distinct products:"}</span>
              <span className="font-bold text-slate-700 dark:text-gray-300">
                {topProductsData.length}
              </span>
            </div>
          </div>

          {/* Op 3: Pending Fulfillment */}
          <div className="rounded-2xl border border-orange-500/30 bg-white dark:bg-[#151515] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-gray-400">
                {t("admin.pendingOrders")}
              </span>
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-black text-orange-500">
              {loading ? "..." : pendingOrdersCount}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 dark:border-[#222]">
              <span className="text-slate-500 dark:text-gray-400">{language === "ar" ? "بحاجة للتجهيز" : "Needs dispatch"}</span>
              <Link
                href="/admin/orders"
                className="font-bold text-[#D4A017] hover:underline inline-flex items-center gap-0.5"
              >
                <span>{language === "ar" ? "متابعة" : "Fulfill"}</span>
                <ArrowRight className="w-3 h-3 rtl:rotate-180" />
              </Link>
            </div>
          </div>

          {/* Op 4: Low Stock Inventory */}
          <div className="rounded-2xl border border-rose-500/30 bg-white dark:bg-[#151515] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-gray-400">
                {t("admin.lowStock")}
              </span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-black text-rose-600 dark:text-rose-400">
              {loading ? "..." : lowStockCount}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 dark:border-[#222]">
              <span className="text-slate-500 dark:text-gray-400">{language === "ar" ? "المخزون ≤ 5 قطع" : "Stock ≤ 5 units"}</span>
              <Link
                href="/admin/products"
                className="font-bold text-[#D4A017] hover:underline inline-flex items-center gap-0.5"
              >
                <span>{language === "ar" ? "فحص القطع" : "Catalog"}</span>
                <ArrowRight className="w-3 h-3 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Customer Activity & Purchase Behavior Panel */}
      <div className="rounded-3xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#151515] p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#252525] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4A017]">
                {language === "ar" ? "رؤى العملاء وسلوك الشراء" : "Customer Insights & Behavior"}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {language === "ar" ? "تحليل قاعدة العملاء والطلبات الفعلية" : "Customer Base & Purchasing Activity"}
            </h3>
          </div>

          <Link
            href="/admin/customers"
            className="text-xs font-bold text-[#D4A017] hover:underline inline-flex items-center gap-1"
          >
            <span>{language === "ar" ? "إدارة جميع العملاء" : "View All Customers"}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </Link>
        </div>

        {/* Customer Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1C1C1C] border border-slate-100 dark:border-[#282828] space-y-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400">
              {language === "ar" ? "إجمالي الحسابات المسجلة" : "Total Registered Accounts"}
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {customerInsights.totalRegistered}
            </div>
            <p className="text-[10px] text-slate-400">
              {language === "ar" ? "المسجلين في قاعدة البيانات" : "In Firebase Users Collection"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1C1C1C] border border-slate-100 dark:border-[#282828] space-y-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400">
              {language === "ar" ? "مشترين نشطين بالفترة" : "Active Buyers in Period"}
            </span>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {customerInsights.activeBuyersInPeriod}
            </div>
            <p className="text-[10px] text-slate-400">
              {language === "ar" ? "قاموا بطلب واحد على الأقل" : "Placed at least 1 order"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1C1C1C] border border-slate-100 dark:border-[#282828] space-y-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400">
              {language === "ar" ? "معدل تكرار الشراء" : "Repeat Purchase Rate"}
            </span>
            <div className="text-xl font-black text-[#D4A017]">
              {customerInsights.repeatCustomerRate}%
            </div>
            <p className="text-[10px] text-slate-400">
              {customerInsights.repeatCustomersCount}{" "}
              {language === "ar" ? "عملاء كرروا الشراء" : "repeat buyers in period"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1C1C1C] border border-slate-100 dark:border-[#282828] space-y-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400">
              {language === "ar" ? "تسجيلات جديدة بالفترة" : "New Signups in Period"}
            </span>
            <div className="text-xl font-black text-blue-600 dark:text-blue-400">
              {customerInsights.newCustomersInPeriod}
            </div>
            <p className="text-[10px] text-slate-400">
              {language === "ar" ? "انضموا للمتجر خلال التاريخ المحدد" : "Registered within selected range"}
            </p>
          </div>
        </div>

        {/* Top Spending Customers Leaderboard */}
        {customerInsights.topCustomers.length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-3">
              {language === "ar" ? "أعلى العملاء شراءً في هذه الفترة" : "Top Purchasing Customers in Selected Timeframe"}
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left rtl:text-right">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[#282828] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-2.5 pr-4 rtl:pr-0 rtl:pl-4">Customer Name</th>
                    <th className="pb-2.5 pr-4 rtl:pr-0 rtl:pl-4">Contact</th>
                    <th className="pb-2.5 pr-4 rtl:pr-0 rtl:pl-4 text-center">Orders</th>
                    <th className="pb-2.5 text-right rtl:text-left">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#252525]">
                  {customerInsights.topCustomers.map((cust, idx) => (
                    <tr key={cust.uid || idx} className="hover:bg-slate-50 dark:hover:bg-[#1C1C1C] transition">
                      <td className="py-3 pr-4 rtl:pr-0 rtl:pl-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#D4A017]/10 text-[#D4A017] flex items-center justify-center font-bold text-[10px]">
                          #{idx + 1}
                        </div>
                        <span>{cust.name}</span>
                      </td>
                      <td className="py-3 pr-4 rtl:pr-0 rtl:pl-4 text-slate-500 dark:text-gray-400">
                        {cust.email || cust.phone || "—"}
                      </td>
                      <td className="py-3 pr-4 rtl:pr-0 rtl:pl-4 text-center font-bold text-slate-900 dark:text-white">
                        {cust.ordersCount}
                      </td>
                      <td className="py-3 text-right rtl:text-left font-black text-[#D4A017]">
                        {cust.totalSpent.toLocaleString()} EGP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 6. Charts Row 1: Sales Distribution & Multi-Year Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Monthly Revenue Trend (12-Month Calendar Bar Chart) */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#151515] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#252525] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4A017]">
                {t("admin.revenueByMonth")}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {language === "ar"
                  ? `توزيع الإيرادات الشهرية لعام ${chartYear}`
                  : `Monthly Revenue Distribution for ${chartYear}`}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Year:</span>
              <select
                value={chartYear}
                onChange={(e) => setChartYear(Number(e.target.value))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#333] bg-slate-50 dark:bg-[#202020] text-xs font-bold text-slate-800 dark:text-gray-200 focus:outline-none focus:border-[#D4A017]"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SVG 12-Month Bar Chart */}
          <div className="pt-6 pb-2">
            <div className="h-56 flex items-end justify-between gap-1 sm:gap-2 px-1">
              {monthlyRevenueData.map((d) => {
                const heightPct =
                  maxMonthlyRevenue > 0
                    ? Math.max(Math.round((d.revenue / maxMonthlyRevenue) * 100), 4)
                    : 4;

                const isPeak = d.revenue > 0 && d.revenue === maxMonthlyRevenue;

                return (
                  <div
                    key={d.monthIndex}
                    className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
                  >
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 bg-slate-900 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg pointer-events-none whitespace-nowrap shadow-xl border border-slate-700">
                      {d.revenue.toLocaleString()} EGP • {d.ordersCount} orders
                    </div>

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        isPeak
                          ? "bg-[#D4A017] shadow-[0_0_12px_rgba(212,160,23,0.5)]"
                          : d.revenue > 0
                          ? "bg-[#8B3A2E] group-hover:bg-[#a34436]"
                          : "bg-slate-100 dark:bg-[#252525]"
                      }`}
                    />

                    {/* Month Label */}
                    <span
                      className={`text-[10px] font-semibold mt-1 ${
                        isPeak
                          ? "text-[#D4A017] font-bold"
                          : "text-slate-500 dark:text-gray-400"
                      }`}
                    >
                      {d.monthName}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#202020] flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
              <span>{language === "ar" ? "أعلى شهر:" : "Peak month:"} <strong className="text-[#D4A017]">{maxMonthlyRevenue.toLocaleString()} EGP</strong></span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#D4A017]"></span>
                <span>{language === "ar" ? "مبيعات مؤكدة" : "Qualifying Orders Revenue"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Chart 2: Multi-Year Revenue Progression */}
        <div className="rounded-3xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#151515] p-6 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 dark:border-[#252525] pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D4A017]">
              {t("admin.revenueByYear")}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {language === "ar" ? "النمو السنوي للمبيعات" : "Annual Sales Progress"}
            </h3>
          </div>

          <div className="py-6 space-y-4 flex-1 flex flex-col justify-center">
            {yearlyRevenueData.map((y) => {
              const pct = maxYearlyRevenue > 0 ? Math.round((y.revenue / maxYearlyRevenue) * 100) : 0;
              return (
                <div key={y.year} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800 dark:text-gray-200">{y.year}</span>
                    <span className="text-[#D4A017] font-black">{y.revenue.toLocaleString()} EGP</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-[#252525] rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-gradient-to-r from-amber-500 to-[#D4A017] rounded-full transition-all duration-700"
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-gray-500 text-right rtl:text-left">
                    {y.ordersCount} {language === "ar" ? "طلب مؤكد" : "qualifying orders"}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-[#202020] text-xs text-slate-500 dark:text-gray-400 flex items-center justify-between">
            <span>{yearlyRevenueData.length} {language === "ar" ? "سنوات مسجلة" : "recorded years"}</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {yearlyRevenueData.reduce((s, y) => s + y.revenue, 0).toLocaleString()} EGP
            </span>
          </div>
        </div>
      </div>

      {/* 7. Charts Row 2: Top Selling Parts & Order Lifecycle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 3: Top-Selling Automotive Parts (Top 5 / Top 10 Switcher) */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#151515] p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#252525] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4A017]">
                {t("admin.topProducts")}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {language === "ar"
                  ? `أفضل القطع والمنتجات مبيعاً (${topLimit})`
                  : `Top-Selling Automotive Parts (Top ${topLimit})`}
              </h3>
            </div>

            {/* Switch between Top 5 and Top 10 */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#222] p-1 rounded-xl">
              <button
                onClick={() => setTopLimit(5)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  topLimit === 5
                    ? "bg-[#D4A017] text-slate-950 shadow-sm"
                    : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Top 5
              </button>
              <button
                onClick={() => setTopLimit(10)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  topLimit === 10
                    ? "bg-[#D4A017] text-slate-950 shadow-sm"
                    : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Top 10
              </button>
            </div>
          </div>

          {topProductsData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left rtl:text-right">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#252525] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 pr-4 rtl:pr-0 rtl:pl-4">#</th>
                    <th className="pb-3 pr-4 rtl:pr-0 rtl:pl-4">Part / Product</th>
                    <th className="pb-3 pr-4 rtl:pr-0 rtl:pl-4">Brand</th>
                    <th className="pb-3 pr-4 rtl:pr-0 rtl:pl-4 text-center">{t("admin.unitsSold")}</th>
                    <th className="pb-3 text-right rtl:text-left">{t("admin.revenueGenerated")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#252525]">
                  {topProductsData.map((prod, idx) => (
                    <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-[#1C1C1C] transition">
                      <td className="py-3 pr-4 rtl:pr-0 rtl:pl-4 font-mono font-bold text-[#D4A017]">
                        #{idx + 1}
                      </td>
                      <td className="py-3 pr-4 rtl:pr-0 rtl:pl-4 font-bold text-slate-900 dark:text-white">
                        <Link
                          href={`/product/${prod.id}`}
                          className="hover:text-[#D4A017] transition hover:underline"
                        >
                          {prod.name}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 rtl:pr-0 rtl:pl-4 text-slate-500 dark:text-gray-400">
                        {prod.brand}
                      </td>
                      <td className="py-3 pr-4 rtl:pr-0 rtl:pl-4 text-center font-bold text-slate-900 dark:text-white">
                        {prod.quantity}
                      </td>
                      <td className="py-3 text-right rtl:text-left font-black text-[#D4A017]">
                        {prod.revenue.toLocaleString()} EGP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Award className="w-10 h-10 mx-auto mb-2 text-[#D4A017] opacity-40" />
              <p className="font-semibold text-sm">{t("admin.noDataPeriod")}</p>
            </div>
          )}
        </div>

        {/* Chart 4: Order Status Breakdown */}
        <div className="rounded-3xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#151515] p-6 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 dark:border-[#252525] pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D4A017]">
              {t("admin.orderStatusBreakdown")}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {language === "ar" ? "حالة تدفق الطلبات" : "Order Lifecycle Status"}
            </h3>
          </div>

          <div className="py-6 space-y-4 flex-1 flex flex-col justify-center">
            {orderStatusData.map((st) => (
              <div key={st.status} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2 text-slate-800 dark:text-gray-200">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: st.color }}
                    />
                    {st.label}
                  </span>
                  <span className="text-slate-900 dark:text-white">
                    {st.count} ({st.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-[#252525] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${st.percentage}%`, backgroundColor: st.color }}
                    className="h-full rounded-full transition-all duration-700"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-[#202020] text-xs text-slate-500 dark:text-gray-400 flex items-center justify-between">
            <span>{language === "ar" ? "إجمالي الطلبات المسجلة:" : "Total Registered Orders:"}</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {orderStatusData.reduce((s, d) => s + d.count, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* 8. Part Category Performance Breakdown */}
      {categoryData.length > 0 && (
        <div className="rounded-3xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#151515] p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-[#252525] pb-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4A017]">
                {t("admin.categoryPerformance")}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {language === "ar" ? "أداء الأقسام وقطع الغيار" : "Revenue by Part Category"}
              </h3>
            </div>
            <Layers className="w-5 h-5 text-[#D4A017]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {categoryData.map((cat) => (
              <div
                key={cat.category}
                className="p-4 rounded-2xl border border-slate-100 dark:border-[#252525] bg-slate-50/50 dark:bg-[#1A1A1A] space-y-2"
              >
                <span className="text-xs uppercase font-black text-[#D4A017] tracking-wider">
                  {cat.category}
                </span>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  {cat.revenue.toLocaleString()} EGP
                </div>
                <div className="text-xs text-slate-500 dark:text-gray-400">
                  {cat.unitsSold} {language === "ar" ? "قطعة مباعة" : "units sold"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. Recent Customer Orders Section */}
      <div className="rounded-3xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#151515] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2D2D2D] pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-[#D4A017]" />
              <span>{language === "ar" ? "أحدث الطلبات الواردة" : "Recent Customer Orders"}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              {language === "ar" ? "آخر الطلبات المسجلة من العملاء في المتجر" : "Latest customer purchases placed through the store"}
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="text-xs font-bold text-[#D4A017] hover:underline flex items-center gap-1"
          >
            <span>{language === "ar" ? "عرض جميع الطلبات" : "View All Orders"}</span>
            {language === "ar" ? (
              <ArrowLeft className="h-3.5 w-3.5" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5" />
            )}
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
                  <th className="pb-3 pr-4 rtl:pr-0 rtl:pl-4">Items</th>
                  <th className="pb-3 pr-4 rtl:pr-0 rtl:pl-4">Total</th>
                  <th className="pb-3 pr-4 rtl:pr-0 rtl:pl-4">Status</th>
                  <th className="pb-3 text-right rtl:text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#2D2D2D]">
                {recentOrders.map((ord) => {
                  const itemsCount = Array.isArray(ord.items)
                    ? ord.items.reduce((s, i) => s + (i.quantity || 1), 0)
                    : 1;

                  return (
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
                        {ord.orderDate || ord.createdAt?.slice(0, 10)}
                      </td>
                      <td className="py-4 pr-4 rtl:pr-0 rtl:pl-4 text-slate-600 dark:text-gray-300">
                        <span className="font-bold text-slate-800 dark:text-gray-200">{itemsCount}</span>{" "}
                        {language === "ar" ? "قطع" : "parts"}
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
                          <span>{language === "ar" ? "إدارة" : "Manage"}</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
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
