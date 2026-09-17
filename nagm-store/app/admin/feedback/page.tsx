"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  MessageSquareQuote,
  Star,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
  Award,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { OrderFeedback } from "@/lib/feedback";

export default function AdminFeedbackPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();

  const [feedbackList, setFeedbackList] = useState<OrderFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "selected" | "unselected">("all");

  const fetchFeedback = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/admin/feedback", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.feedback)) {
        setFeedbackList(data.feedback);
      } else {
        showToast(data.error || "Failed to load feedback", "error");
      }
    } catch (err) {
      console.error("Fetch feedback error:", err);
      showToast("Error connecting to server", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [user]);

  const selectedEntries = useMemo(
    () => feedbackList.filter((f) => f.selectedForHomepage),
    [feedbackList]
  );
  const selectedCount = selectedEntries.length;

  const filteredList = useMemo(() => {
    if (filterMode === "selected") return feedbackList.filter((f) => f.selectedForHomepage);
    if (filterMode === "unselected") return feedbackList.filter((f) => !f.selectedForHomepage);
    return feedbackList;
  }, [feedbackList, filterMode]);

  const handleToggleHomepage = async (orderId: string, currentSelected: boolean) => {
    if (!user) return;

    if (!currentSelected && selectedCount >= 3) {
      showToast(
        language === "ar"
          ? "الحد الأقصى هو 3 آراء فقط للصفحة الرئيسية. يرجى إزالة رأي حالي قبل إضافة رأي جديد."
          : "Maximum of 3 feedback entries can be displayed on the homepage. Please remove an existing entry first.",
        "info"
      );
      return;
    }

    setActionInProgress(orderId);
    try {
      const idToken = await user.getIdToken();
      const action = currentSelected ? "remove" : "select";
      const res = await fetch("/api/admin/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ orderId, action }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFeedbackList((prev) =>
          prev.map((item) =>
            item.orderId === orderId
              ? { ...item, selectedForHomepage: !currentSelected }
              : item
          )
        );
        showToast(
          currentSelected
            ? (language === "ar" ? "تمت إزالة الرأي من الصفحة الرئيسية" : "Removed from homepage display")
            : (language === "ar" ? "تم تحديد الرأي للعرض في الصفحة الرئيسية" : "Selected for homepage display"),
          "success"
        );
      } else {
        showToast(data.error || "Action failed", "error");
      }
    } catch (err) {
      console.error("Toggle feedback error:", err);
      showToast("Failed to update feedback selection", "error");
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
            {language === "ar" ? "إدارة آراء العملاء الحقيقية" : "AUTHENTIC CUSTOMER FEEDBACK"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {language === "ar" ? "آراء العملاء وتخصيص الصفحة الرئيسية" : "Customer Feedback & Homepage Display"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">
            {language === "ar"
              ? "مراجعة آراء العملاء الحقيقية بعد استلام الطلبات، واختيار 3 آراء كحد أقصى لقسم 'ماذا يقول سائقو السيارات في مصر'."
              : "Manage authentic customer experience feedback and select up to 3 entries for 'What Egyptian Drivers Say'."}
          </p>
        </div>

        <button
          onClick={fetchFeedback}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B] text-xs font-bold text-slate-700 dark:text-gray-300 hover:border-[#D4A017] transition shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 text-[#D4A017] ${loading ? "animate-spin" : ""}`} />
          <span>{language === "ar" ? "تحديث" : "Refresh"}</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Homepage Selection Quota */}
        <div className="rounded-2xl border border-amber-500/30 dark:border-[#D4A017]/40 bg-white dark:bg-[#1B1B1B] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-gray-400">
              {language === "ar" ? "المحدد للصفحة الرئيسية" : "Homepage Display"}
            </span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              selectedCount === 3
                ? "bg-amber-500/20 text-amber-700 dark:text-[#D4A017]"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}>
              {selectedCount} / 3 {language === "ar" ? "مختارة" : "Active"}
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {selectedCount} <span className="text-sm font-semibold text-slate-400">/ 3</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1">
            {selectedCount === 3
              ? (language === "ar" ? "تم الوصول للحد الأقصى (3). استبدل أحد الآراء لتغيير الظهور." : "Limit reached (3). Replace an entry to swap display.")
              : (language === "ar" ? `يمكنك اختيار ${3 - selectedCount} إضافية.` : `You can select ${3 - selectedCount} more.`)}
          </p>
        </div>

        {/* Total Feedback Count */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B] p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 dark:text-gray-400">
            {language === "ar" ? "إجمالي الآراء الحقيقية" : "Total Submissions"}
          </span>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {feedbackList.length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1">
            {language === "ar" ? "من عملاء استلموا طلباتهم فعلياً" : "From customers with delivered orders"}
          </p>
        </div>

        {/* Average Satisfaction */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B] p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 dark:text-gray-400">
            {language === "ar" ? "متوسط رضا العملاء" : "Average Satisfaction"}
          </span>
          <div className="text-3xl font-black text-[#D4A017] mt-2 flex items-center gap-1.5">
            {feedbackList.length > 0
              ? (feedbackList.reduce((acc, f) => acc + f.rating, 0) / feedbackList.length).toFixed(1)
              : "5.0"}
            <Star className="h-6 w-6 fill-current text-[#D4A017]" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1">
            {language === "ar" ? "تقييم تجربة الاستلام والتسليم" : "Overall order & delivery rating"}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#2D2D2D] pb-3 text-xs">
        <button
          onClick={() => setFilterMode("all")}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition ${
            filterMode === "all"
              ? "bg-[#8B3A2E] text-white shadow-xs"
              : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          {language === "ar" ? "جميع الآراء" : "All Feedback"} ({feedbackList.length})
        </button>
        <button
          onClick={() => setFilterMode("selected")}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition ${
            filterMode === "selected"
              ? "bg-[#8B3A2E] text-white shadow-xs"
              : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          {language === "ar" ? "المعروض بالرئيسية" : "Selected for Homepage"} ({selectedCount}/3)
        </button>
        <button
          onClick={() => setFilterMode("unselected")}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition ${
            filterMode === "unselected"
              ? "bg-[#8B3A2E] text-white shadow-xs"
              : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          {language === "ar" ? "غير معروض" : "Not Displayed"} ({feedbackList.length - selectedCount})
        </button>
      </div>

      {/* Feedback Items List */}
      {loading ? (
        <div className="py-16 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-[#D4A017] mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500 dark:text-gray-400">
            {language === "ar" ? "جاري تحميل آراء العملاء..." : "Loading customer feedback..."}
          </p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-[#2D2D2D] p-12 text-center bg-white dark:bg-[#151515]">
          <MessageSquareQuote className="h-10 w-10 text-slate-400 dark:text-gray-500 mx-auto mb-3 opacity-60" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            {language === "ar" ? "لا توجد آراء مطابقة" : "No feedback entries found"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            {filterMode === "selected"
              ? (language === "ar"
                  ? "لم يتم تحديد أي آراء لعرضها بالصفحة الرئيسية بعد. اختر حتى 3 آراء من القائمة."
                  : "No feedback entries have been selected for the homepage yet. Select up to 3 from the list.")
              : (language === "ar"
                  ? "ستظهر هنا الآراء الحقيقية بمجرد قيام العملاء بتقييم طلباتهم المستلمة."
                  : "Genuine feedback will appear here as customers complete and review delivered orders.")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item) => {
            const isSelected = Boolean(item.selectedForHomepage);
            const isBusy = actionInProgress === item.orderId;

            return (
              <div
                key={item.orderId}
                className={`rounded-2xl border p-5 transition flex flex-col justify-between shadow-xs ${
                  isSelected
                    ? "border-amber-500/50 dark:border-[#D4A017]/60 bg-amber-500/5 dark:bg-[#1E1E1E]"
                    : "border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B]"
                }`}
              >
                <div>
                  {/* Top Bar: Stars + Homepage Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-[#D4A017]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < item.rating ? "fill-current" : "text-slate-300 dark:text-gray-600"
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-slate-700 dark:text-gray-300 ml-1.5">
                        {item.rating} / 5
                      </span>
                    </div>

                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[#D4A017] text-[11px] font-bold border border-amber-500/30">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{language === "ar" ? "معروض بالرئيسية" : "On Homepage"}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400 dark:text-gray-500">
                        {language === "ar" ? "غير معروض" : "Not displayed"}
                      </span>
                    )}
                  </div>

                  {/* Comment Text */}
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-gray-200 leading-relaxed italic">
                    &ldquo;{item.comment || (language === "ar" ? "تقييم ممتاز بدون تعليق إضافي" : "5-star rating without written comment.")}&rdquo;
                  </p>
                </div>

                {/* Customer Info & Toggle Action */}
                <div className="mt-5 pt-3 border-t border-slate-200/80 dark:border-[#2D2D2D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {item.customerName}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5 flex items-center gap-2">
                      <span>Order: {item.orderId}</span>
                      <span>•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleHomepage(item.orderId, isSelected)}
                    disabled={isBusy || (!isSelected && selectedCount >= 3)}
                    className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                      isSelected
                        ? "border border-red-500/40 text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white"
                        : selectedCount >= 3
                        ? "border border-slate-200 dark:border-[#2D2D2D] text-slate-400 bg-slate-100 dark:bg-[#151515] cursor-not-allowed opacity-60"
                        : "border border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-600 hover:text-white"
                    }`}
                  >
                    {isBusy ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : isSelected ? (
                      <>
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>{language === "ar" ? "إزالة من الرئيسية" : "Remove"}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        <span>{language === "ar" ? "عرض بالرئيسية" : "Display on Homepage"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
