"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ProductCard from "@/components/common/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { useVehicle } from "@/context/VehicleContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";
import { Order } from "@/types";
import {
  User,
  Package,
  Car,
  MapPin,
  Heart,
  Settings,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Truck,
  Trash2,
  RefreshCw,
  ShoppingBag,
  MessageSquare,
  Download,
} from "lucide-react";
import OrderFeedbackModal from "@/components/feedback/OrderFeedbackModal";

const governorates = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Qalyubia",
  "Sharqia",
  "Dakahlia",
  "Gharbia",
  "Monufia",
  "Beheira",
  "Ismailia",
  "Suez",
  "Port Said",
  "Fayoum",
  "Beni Suef",
  "Minya",
  "Asyut",
  "Sohag",
  "Qena",
  "Luxor",
  "Aswan",
];

export default function ProfilePage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user, userProfile, isAdmin, loading: authLoading, logOut, refreshProfile } = useAuth();
  const { selectedVehicle, clearVehicle } = useVehicle();
  const { wishlist } = useWishlist();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"orders" | "garage" | "addresses" | "wishlist" | "settings">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Post-delivery feedback modal state
  const [feedbackOrder, setFeedbackOrder] = useState<Order | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Settings form state
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);

  // Address editing state
  const [editingAddress, setEditingAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    governorate: "Cairo",
    city: "",
    street: "",
    building: "",
    apartment: "",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  // Sync settings inputs when userProfile loads
  useEffect(() => {
    if (userProfile) {
      setEditName(userProfile.name || user?.displayName || "");
      setEditPhone(userProfile.phone || "");

      if (userProfile.shippingAddress) {
        setAddressForm({
          fullName: userProfile.shippingAddress.fullName || userProfile.name || "",
          phone: userProfile.shippingAddress.phone || userProfile.phone || "",
          governorate: userProfile.shippingAddress.governorate || "Cairo",
          city: userProfile.shippingAddress.city || "",
          street: userProfile.shippingAddress.street || "",
          building: userProfile.shippingAddress.building || "",
          apartment: userProfile.shippingAddress.apartment || "",
        });
      } else {
        setAddressForm({
          fullName: userProfile.name || user?.displayName || "",
          phone: userProfile.phone || "",
          governorate: "Cairo",
          city: "",
          street: "",
          building: "",
          apartment: "",
        });
      }
    } else {
      setEditName("");
      setEditPhone("");
      setAddressForm({
        fullName: "",
        phone: "",
        governorate: "Cairo",
        city: "",
        street: "",
        building: "",
        apartment: "",
      });
    }
  }, [userProfile, user]);

  // Fetch real user orders from Firestore
  useEffect(() => {
    if (!user) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }

    const fetchUserOrders = async () => {
      setOrdersLoading(true);
      try {
        const q = query(collection(db, "orders"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        const list: Order[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) });
        });

        // Sort orders descending by createdAt (canonical), fallback to legacy orderDate
        list.sort((a, b) => {
          const timeA = new Date(a.createdAt || a.orderDate || 0).getTime();
          const timeB = new Date(b.createdAt || b.orderDate || 0).getTime();
          return timeB - timeA;
        });

        setOrders(list);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchUserOrders();
  }, [user]);

  // Check for delivered order eligible for feedback prompt
  useEffect(() => {
    if (ordersLoading || orders.length === 0) return;
    const eligibleOrder = orders.find(
      (o) => (o.status === "Delivered" || o.orderStatus === "Delivered") && !o.feedbackSubmitted
    );
    if (eligibleOrder) {
      try {
        const dismissed =
          typeof window !== "undefined" &&
          sessionStorage.getItem(`negm_feedback_dismissed_${eligibleOrder.id}`);
        if (!dismissed) {
          setFeedbackOrder(eligibleOrder);
          setIsFeedbackModalOpen(true);
        }
      } catch {}
    }
  }, [orders, ordersLoading]);

  const handleCloseFeedback = () => {
    if (feedbackOrder) {
      try {
        sessionStorage.setItem(`negm_feedback_dismissed_${feedbackOrder.id}`, "true");
      } catch {}
    }
    setIsFeedbackModalOpen(false);
  };

  const handleFeedbackSubmitted = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, feedbackSubmitted: true } : o
      )
    );
    showToast(
      language === "ar" ? "شكراً لك! تم استلام تقييمك بنجاح." : "Thank you! Your feedback has been received.",
      "success"
    );
  };

  const handleDownloadInvoice = async (orderId: string) => {
    if (!user) return;
    setDownloadingOrderId(orderId);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/orders/${orderId}/invoice`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!res.ok) {
        showToast(
          language === "ar" ? "تعذر تنزيل الفاتورة" : "Failed to download invoice",
          "error"
        );
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast(
        language === "ar" ? "تم تنزيل الفاتورة بنجاح" : "Invoice downloaded successfully",
        "success"
      );
    } catch (err) {
      console.error("Invoice download error:", err);
      showToast(
        language === "ar" ? "حدث خطأ أثناء تنزيل الفاتورة" : "Error generating invoice PDF",
        "error"
      );
    } finally {
      setDownloadingOrderId(null);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingAddress(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        shippingAddress: {
          fullName: addressForm.fullName.trim(),
          phone: addressForm.phone.trim(),
          governorate: addressForm.governorate,
          city: addressForm.city.trim(),
          street: addressForm.street.trim(),
          building: addressForm.building.trim(),
          apartment: addressForm.apartment.trim(),
        },
        phone: addressForm.phone.trim(),
        updatedAt: new Date().toISOString(),
      });

      await refreshProfile();
      setEditingAddress(false);
      showToast(language === "ar" ? "تم حفظ العنوان بنجاح" : "Address saved successfully!", "success");
    } catch (err) {
      console.error("Error updating address:", err);
      showToast(language === "ar" ? "تعذر حفظ العنوان" : "Failed to save address", "error");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      showToast(language === "ar" ? "تم تسجيل الخروج بنجاح" : "Logged out successfully.", "info");
      router.push("/login");
    } catch (err) {
      console.error(err);
      showToast(language === "ar" ? "حدث خطأ أثناء تسجيل الخروج" : "Error signing out", "error");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingSettings(true);
    try {
      if (auth.currentUser && editName.trim()) {
        await updateProfile(auth.currentUser, { displayName: editName.trim() });
      }

      await updateDoc(doc(db, "users", user.uid), {
        name: editName.trim(),
        phone: editPhone.trim(),
        updatedAt: new Date().toISOString(),
      });

      await refreshProfile();
      showToast(language === "ar" ? "تم حفظ البيانات بنجاح" : "Account settings updated!", "success");
    } catch (err) {
      console.error("Error updating profile:", err);
      showToast(language === "ar" ? "تعذر حفظ التغييرات" : "Failed to update profile", "error");
    } finally {
      setSavingSettings(false);
    }
  };

  if (authLoading || !user) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#111111] flex flex-col justify-center items-center">
        <RefreshCw className="w-8 h-8 animate-spin text-[#D4A017] mb-3" />
        <p className="text-sm font-semibold text-slate-600 dark:text-gray-400">
          {language === "ar" ? "جاري التحقق من الحساب..." : "Verifying account..."}
        </p>
      </main>
    );
  }

  // Calculate initials
  const displayName = userProfile?.name || user.displayName || user.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-screen bg-slate-50 text-[#0F172A] dark:bg-[#111111] dark:text-gray-100 flex flex-col pt-24 sm:pt-32 pb-20 transition-colors duration-300">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex-1">
        {/* User Header Profile Banner */}
        <div className="rounded-3xl border border-slate-200 dark:border-[#D4A017]/30 bg-gradient-to-r from-white via-slate-50 to-rose-50/40 dark:from-[#1B1B1B] dark:via-[#241a18] dark:to-[#8B3A2E]/30 p-6 sm:p-8 backdrop-blur-2xl shadow-md dark:shadow-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left rtl:sm:text-right">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B3A2E] to-[#5c271e] text-3xl font-black text-white shadow-xl border-2 border-[#D4A017]">
              {initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start rtl:sm:justify-start gap-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">{displayName}</h1>
                {isAdmin ? (
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-700 dark:text-[#D4A017]">
                    System Administrator
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-200 dark:bg-[#252525] border border-slate-300 dark:border-[#333333] px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-700 dark:text-gray-300">
                    {language === "ar" ? "حساب عميل" : "Member Account"}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">
                {user.email} {userProfile?.phone ? `• ${userProfile.phone}` : ""}
              </p>
              <div className="text-[11px] font-semibold mt-1 flex items-center justify-center sm:justify-start rtl:sm:justify-start gap-1">
                {user.emailVerified ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {t("profile.verifiedAccount")}
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    {language === "ar" ? "البريد الإلكتروني بانتظار التأكيد" : "Email pending verification"}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="px-4 py-2.5 rounded-xl bg-[#D4A017] text-black text-xs font-bold hover:bg-[#b58813] transition shadow-sm"
              >
                {t("admin.dashboard")}
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#111111] text-xs font-bold text-slate-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 hover:border-red-500/40 transition shadow-sm"
            >
              <LogOut className="h-4 w-4" /> {t("profile.logout")}
            </button>
          </div>
        </div>

        {/* Profile Tabs Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3 space-y-2">
            <div className="rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B] p-2 sm:p-3 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 backdrop-blur-xl shadow-sm dark:shadow-xl">
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex shrink-0 lg:w-full items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition whitespace-nowrap lg:whitespace-normal ${
                  activeTab === "orders"
                    ? "bg-[#8B3A2E] text-white shadow-md"
                    : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#252525]"
                }`}
              >
                <Package className="h-4 w-4" /> {t("profile.orders")} ({orders.length})
              </button>

              <button
                onClick={() => setActiveTab("garage")}
                className={`flex shrink-0 lg:w-full items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition whitespace-nowrap lg:whitespace-normal ${
                  activeTab === "garage"
                    ? "bg-[#8B3A2E] text-white shadow-md"
                    : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#252525]"
                }`}
              >
                <Car className="h-4 w-4" /> {t("profile.garage")}
              </button>

              <button
                onClick={() => setActiveTab("addresses")}
                className={`flex shrink-0 lg:w-full items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition whitespace-nowrap lg:whitespace-normal ${
                  activeTab === "addresses"
                    ? "bg-[#8B3A2E] text-white shadow-md"
                    : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#252525]"
                }`}
              >
                <MapPin className="h-4 w-4" /> {t("profile.addresses")}
              </button>

              <button
                onClick={() => setActiveTab("wishlist")}
                className={`flex shrink-0 lg:w-full items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition whitespace-nowrap lg:whitespace-normal ${
                  activeTab === "wishlist"
                    ? "bg-[#8B3A2E] text-white shadow-md"
                    : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#252525]"
                }`}
              >
                <Heart className="h-4 w-4" /> {t("nav.wishlist")} ({wishlist.length})
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`flex shrink-0 lg:w-full items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition whitespace-nowrap lg:whitespace-normal ${
                  activeTab === "settings"
                    ? "bg-[#8B3A2E] text-white shadow-md"
                    : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#252525]"
                }`}
              >
                <Settings className="h-4 w-4" /> {t("profile.settings")}
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9">
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">
                  {t("profile.orderHistory")}
                </h2>

                {ordersLoading ? (
                  <div className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#D4A017]" />
                    <p className="text-xs">{language === "ar" ? "جاري جلب سجل الطلبات..." : "Fetching orders..."}</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B] p-8 text-center shadow-sm dark:shadow-xl">
                    <ShoppingBag className="mx-auto h-12 w-12 text-slate-400 mb-3 opacity-60" />
                    <p className="text-sm font-semibold text-slate-600 dark:text-gray-300">
                      {t("profile.noOrders")}
                    </p>
                    <Link
                      href="/shop"
                      className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-[#8B3A2E] text-white text-xs font-bold hover:bg-[#a34436] transition shadow-md"
                    >
                      {language === "ar" ? "تسوق قطع الغيار الآن" : "Shop Parts Now"}
                    </Link>
                  </div>
                ) : (
                  orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B]/90 p-5 space-y-4 shadow-sm dark:shadow-xl"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-[#2D2D2D] pb-3 text-xs">
                        <div>
                          <span className="font-extrabold text-[#D4A017] text-sm">{ord.id}</span>
                          <span className="text-slate-500 dark:text-gray-400 mx-3">
                            {ord.orderDate}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                              (ord.status || ord.orderStatus) === "Delivered"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                : (ord.status || ord.orderStatus) === "Cancelled"
                                ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30"
                                : (ord.status || ord.orderStatus) === "Shipped"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {(ord.status || ord.orderStatus) === "Delivered" ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <Clock className="h-3.5 w-3.5" />
                            )}
                            {t(`status.${((ord.status || ord.orderStatus) || "processing").toLowerCase()}` as any) || ord.status || ord.orderStatus}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                              ord.paymentStatus === "paid"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                : ord.paymentStatus === "failed"
                                ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30"
                                : ord.paymentMethod === "cod"
                                ? "bg-amber-500/10 text-amber-700 dark:text-[#D4A017] border border-amber-500/30"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                            }`}
                          >
                            {ord.paymentStatus === "paid"
                              ? (language === "ar" ? "تم الدفع" : "Paid")
                              : ord.paymentStatus === "failed"
                              ? (language === "ar" ? "فشل الدفع" : "Payment Failed")
                              : ord.paymentMethod === "cod"
                              ? (language === "ar" ? "عند الاستلام" : "Due on Delivery")
                              : (language === "ar" ? "بانتظار الدفع" : "Payment Pending")}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700 dark:text-gray-300">
                        <div>
                          <div>
                            {t("profile.recipient")} {ord.shippingAddress?.fullName || displayName}
                          </div>
                          {ord.items && ord.items.length > 0 && (
                            <div className="text-slate-500 dark:text-gray-400 mt-1">
                              {ord.items.map((i) => `${i.product.name} (x${i.quantity})`).join(", ")}
                            </div>
                          )}
                        </div>
                        <div className="sm:text-right rtl:sm:text-left flex flex-col sm:items-end gap-2">
                          <div>
                            <div className="text-slate-500 dark:text-gray-400">
                              {ord.paymentStatus === "paid"
                                ? (language === "ar" ? "المبلغ المدفوع" : "Total Paid")
                                : (ord.status || ord.orderStatus) === "Cancelled"
                                ? (language === "ar" ? "إجمالي الطلب (ملغي)" : "Order Total (Cancelled)")
                                : (language === "ar" ? "إجمالي الطلب" : "Total Amount")}
                            </div>
                            <div className="text-lg font-black text-slate-900 dark:text-white">
                              {ord.total.toLocaleString()}{" "}
                              <span className="text-xs text-[#D4A017]">EGP</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownloadInvoice(ord.id)}
                            disabled={downloadingOrderId === ord.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B] hover:border-[#D4A017] text-slate-700 dark:text-gray-300 text-xs font-bold transition shadow-xs self-start sm:self-auto"
                          >
                            {downloadingOrderId === ord.id ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#D4A017]" />
                            ) : (
                              <Download className="h-3.5 w-3.5 text-[#D4A017]" />
                            )}
                            <span>{language === "ar" ? "تنزيل الفاتورة (PDF)" : "Download Invoice"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Post-delivery Feedback Row */}
                      {(ord.status === "Delivered" || ord.orderStatus === "Delivered") && (
                        <div className="pt-3 border-t border-slate-100 dark:border-[#2D2D2D] flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-gray-400">
                            {language === "ar" ? "تجربة استلام الطلب" : "Overall Order & Delivery Experience"}
                          </span>
                          {ord.feedbackSubmitted ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>{language === "ar" ? "تم استلام تقييمك ✓" : "Feedback Submitted ✓"}</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setFeedbackOrder(ord);
                                setIsFeedbackModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#D4A017]/10 hover:bg-[#D4A017]/20 text-[#D4A017] text-xs font-bold border border-[#D4A017]/30 transition shadow-xs"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>{language === "ar" ? "تقديم تقييم للطلب" : "Give Order Feedback"}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Garage Tab */}
            {activeTab === "garage" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {t("profile.garage")}
                  </h2>
                </div>

                {selectedVehicle ? (
                  <div className="rounded-2xl border border-amber-500/30 dark:border-[#D4A017]/40 bg-white dark:bg-[#1B1B1B] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm dark:shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#8B3A2E] text-white">
                        <Car className="h-6 w-6 text-[#D4A017]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                          Engine: {selectedVehicle.engine}
                        </p>
                        <span className="inline-block mt-2 text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          {t("profile.activeFilter")}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={clearVehicle}
                      className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition self-end sm:self-center"
                      aria-label="Remove vehicle"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B] p-8 text-center shadow-sm dark:shadow-xl">
                    <Car className="mx-auto h-10 w-10 text-[#D4A017] mb-2 opacity-80" />
                    <p className="text-sm text-slate-600 dark:text-gray-300">
                      {t("profile.noGarage")}
                    </p>
                    <Link
                      href="/shop"
                      className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-[#8B3A2E] text-white text-xs font-bold hover:bg-[#a34436] transition shadow-md"
                    >
                      {t("vehicle.exactFit")}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Saved Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {t("profile.addresses")}
                  </h2>
                  <button
                    onClick={() => setEditingAddress(!editingAddress)}
                    className="px-4 py-2 rounded-xl bg-[#8B3A2E] text-white text-xs font-bold hover:bg-[#a34436] transition shadow-sm"
                  >
                    {editingAddress
                      ? (language === "ar" ? "إلغاء" : "Cancel")
                      : (userProfile?.shippingAddress
                          ? (language === "ar" ? "تعديل العنوان" : "Edit Address")
                          : (language === "ar" ? "إضافة عنوان جديد" : "Add Address"))}
                  </button>
                </div>

                {editingAddress ? (
                  <form onSubmit={handleSaveAddress} className="rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B] p-6 space-y-4 shadow-sm dark:shadow-xl text-xs">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {userProfile?.shippingAddress
                        ? (language === "ar" ? "تعديل عنوان التوصيل" : "Edit Delivery Address")
                        : (language === "ar" ? "إضافة عنوان توصيل جديد" : "Add Delivery Address")}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-slate-700 dark:text-gray-300 font-semibold block mb-1">
                          {t("checkout.fullName")}
                        </label>
                        <input
                          type="text"
                          value={addressForm.fullName}
                          onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                          required
                          className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
                        />
                      </div>
                      <div>
                        <label className="text-slate-700 dark:text-gray-300 font-semibold block mb-1">
                          {t("checkout.phoneRequired")}
                        </label>
                        <input
                          type="tel"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          required
                          placeholder="+20 100 000 0000"
                          className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
                        />
                      </div>
                      <div>
                        <label className="text-slate-700 dark:text-gray-300 font-semibold block mb-1">
                          {t("checkout.governorate")}
                        </label>
                        <select
                          value={addressForm.governorate}
                          onChange={(e) => setAddressForm({ ...addressForm, governorate: e.target.value })}
                          className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
                        >
                          {governorates.map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-700 dark:text-gray-300 font-semibold block mb-1">
                          {t("checkout.city")}
                        </label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          required
                          className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
                        />
                      </div>
                      <div>
                        <label className="text-slate-700 dark:text-gray-300 font-semibold block mb-1">
                          {t("checkout.street")}
                        </label>
                        <input
                          type="text"
                          value={addressForm.street}
                          onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                          required
                          className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
                        />
                      </div>
                      <div>
                        <label className="text-slate-700 dark:text-gray-300 font-semibold block mb-1">
                          {t("checkout.building")}
                        </label>
                        <input
                          type="text"
                          value={addressForm.building}
                          onChange={(e) => setAddressForm({ ...addressForm, building: e.target.value })}
                          required
                          className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
                        />
                      </div>
                      <div>
                        <label className="text-slate-700 dark:text-gray-300 font-semibold block mb-1">
                          {language === "ar" ? "الشقة / الطابق" : "Apartment / Floor"}
                        </label>
                        <input
                          type="text"
                          value={addressForm.apartment}
                          onChange={(e) => setAddressForm({ ...addressForm, apartment: e.target.value })}
                          placeholder={language === "ar" ? "شقة 4، الدور 2 (اختياري)" : "Apt 4, 2nd floor (optional)"}
                          className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="px-6 py-3 rounded-xl bg-[#8B3A2E] text-xs font-bold text-white hover:bg-[#a34436] transition shadow-lg inline-flex items-center gap-2"
                    >
                      {savingAddress && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      {language === "ar" ? "حفظ عنوان التوصيل" : "Save Address"}
                    </button>
                  </form>
                ) : userProfile?.shippingAddress ? (
                  <div className="rounded-2xl border border-amber-500/30 dark:border-[#D4A017]/40 bg-white dark:bg-[#1B1B1B] p-6 space-y-2 shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#D4A017] uppercase">
                        {t("profile.primaryAddress")}
                      </span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                        Default
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {userProfile.shippingAddress.fullName || displayName}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-gray-300">
                      {userProfile.shippingAddress.building}
                      {userProfile.shippingAddress.apartment ? `, ${userProfile.shippingAddress.apartment}` : ""},{" "}
                      {userProfile.shippingAddress.street},{" "}
                      {userProfile.shippingAddress.city},{" "}
                      {userProfile.shippingAddress.governorate}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                      Phone: {userProfile.shippingAddress.phone || userProfile.phone || "—"}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B] p-8 text-center shadow-sm dark:shadow-xl">
                    <MapPin className="mx-auto h-10 w-10 text-[#D4A017] mb-2 opacity-80" />
                    <p className="text-sm text-slate-600 dark:text-gray-300">
                      {t("profile.noAddress")}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {language === "ar"
                        ? "سيتم حفظ عنوانك المسجل تلقائياً عند إتمام أول طلب شراء أو يمكنك إضافته الآن."
                        : "Your address will be automatically saved here when you complete your first checkout, or add it now."}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">
                  {t("nav.wishlist")}
                </h2>
                {wishlist.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlist.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-gray-400">
                    {t("wishlist.empty")}
                  </p>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B] p-6 space-y-4 shadow-sm dark:shadow-xl">
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">
                  {t("profile.accountSettings")}
                </h2>

                <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                  <div>
                    <label className="text-slate-700 dark:text-gray-300 font-semibold block mb-1">
                      {t("profile.displayName")}
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 dark:text-gray-300 font-semibold block mb-1">
                      {t("auth.email")}
                    </label>
                    <input
                      type="email"
                      value={user.email || ""}
                      disabled
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-100 dark:bg-[#181818] text-slate-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 dark:text-gray-300 font-semibold block mb-1">
                      {t("checkout.phone")}
                    </label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+20 100 000 0000"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-6 py-3 rounded-xl bg-[#8B3A2E] text-xs font-bold text-white hover:bg-[#a34436] transition shadow-lg inline-flex items-center gap-2"
                  >
                    {savingSettings && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    {t("profile.saveSettings")}
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      <OrderFeedbackModal
        order={feedbackOrder}
        isOpen={isFeedbackModalOpen}
        onClose={handleCloseFeedback}
        onSubmitted={handleFeedbackSubmitted}
      />

      <Footer />
    </main>
  );
}
