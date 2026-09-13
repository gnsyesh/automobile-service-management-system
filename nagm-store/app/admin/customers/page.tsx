"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Shield,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  MapPin,
  RefreshCw,
  Filter,
  ShoppingBag,
  Eye,
  X,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile, Order } from "@/types";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminCustomersPage() {
  const { t, language } = useLanguage();
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<UserProfile | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users
      const usersSnap = await getDocs(collection(db, "users"));
      const userList: UserProfile[] = [];
      usersSnap.forEach((d) => {
        userList.push({ uid: d.id, ...(d.data() as any) });
      });
      setCustomers(userList);

      // 2. Fetch Orders for customer stats
      const ordersSnap = await getDocs(collection(db, "orders"));
      const orderList: Order[] = [];
      ordersSnap.forEach((d) => {
        orderList.push({ id: d.id, ...(d.data() as any) });
      });
      setOrders(orderList);
    } catch (e) {
      console.error("Error fetching customers or orders:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCustomerOrders = (customer: UserProfile): Order[] => {
    return orders.filter(
      (o) =>
        o.userId === customer.uid ||
        (customer.email && o.userEmail && o.userEmail.toLowerCase() === customer.email.toLowerCase())
    );
  };

  const getCustomerSpend = (custOrders: Order[]): number => {
    return custOrders
      .filter((o) => o.status !== "Cancelled")
      .reduce((sum, o) => sum + (o.total || 0), 0);
  };

  const filtered = customers.filter((cust) => {
    if (roleFilter !== "all" && cust.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        cust.name?.toLowerCase().includes(q) ||
        cust.email?.toLowerCase().includes(q) ||
        cust.phone?.includes(q) ||
        cust.uid.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalUsers = customers.filter((c) => c.role === "user").length;
  const totalAdmins = customers.filter((c) => c.role === "admin").length;

  // Selected customer history
  const activeCustomerOrders = selectedCustomerForHistory
    ? getCustomerOrders(selectedCustomerForHistory)
    : [];
  const activeCustomerTotalSpend = selectedCustomerForHistory
    ? getCustomerSpend(activeCustomerOrders)
    : 0;

  return (
    <div className="space-y-8 text-left rtl:text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2D2D2D] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
            {language === "ar" ? "إدارة المستخدمين والعملاء" : "USER ACCOUNTS & CRM"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {t("admin.customers")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">
            {language === "ar"
              ? "استعراض حسابات العملاء، إجمالي طلباتهم، وقيمة مشترياتهم وسجل طلباتهم"
              : "Review customer accounts, total order counts, lifetime spending, and purchase history"}
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-[#333] hover:bg-slate-100 dark:hover:bg-[#252525] text-slate-700 dark:text-gray-300 text-sm font-semibold transition shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#D4A017]" : ""}`} />
          {language === "ar" ? "تحديث" : "Refresh"}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1B1B1B] p-5 rounded-2xl border border-slate-200 dark:border-[#2D2D2D] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
              {t("admin.totalCustomers")}
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {customers.length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1B1B1B] p-5 rounded-2xl border border-slate-200 dark:border-[#2D2D2D] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
              {language === "ar" ? "العملاء العاديين" : "Standard Users"}
            </p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {totalUsers}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1B1B1B] p-5 rounded-2xl border border-slate-200 dark:border-[#2D2D2D] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
              {language === "ar" ? "المسؤولون والمشرفون" : "System Admins"}
            </p>
            <p className="text-2xl font-black text-amber-600 dark:text-[#D4A017] mt-1">
              {totalAdmins}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-[#D4A017] flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-[#1B1B1B] p-4 rounded-2xl border border-slate-200 dark:border-[#2D2D2D] shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              language === "ar"
                ? "البحث بالاسم، البريد، أو رقم الهاتف..."
                : "Search by name, email, or phone..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-[#252525] border border-slate-200 dark:border-[#333] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 dark:bg-[#252525] border border-slate-200 dark:border-[#333] text-slate-900 dark:text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-[#D4A017]"
          >
            <option value="all">{language === "ar" ? "جميع الأدوار" : "All Roles"}</option>
            <option value="user">{language === "ar" ? "عملاء فقط (User)" : "Customers Only (User)"}</option>
            <option value="admin">{language === "ar" ? "مسؤولون فقط (Admin)" : "Admins Only (Admin)"}</option>
          </select>
        </div>
      </div>

      {/* Customers List */}
      {loading ? (
        <div className="bg-white dark:bg-[#1B1B1B] rounded-2xl border border-slate-200 dark:border-[#2D2D2D] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#222] text-xs uppercase font-bold text-slate-500 dark:text-gray-400">
                  <th className="py-3.5 px-4">{language === "ar" ? "العميل" : "Customer"}</th>
                  <th className="py-3.5 px-4">{language === "ar" ? "الدور والصلاحية" : "Role"}</th>
                  <th className="py-3.5 px-4">{language === "ar" ? "الاتصال" : "Contact"}</th>
                  <th className="py-3.5 px-4">{language === "ar" ? "الطلبات والمشتريات" : "Orders & Spend"}</th>
                  <th className="py-3.5 px-4">{language === "ar" ? "العنوان المسجل" : "Registered Address"}</th>
                  <th className="py-3.5 px-4">{language === "ar" ? "تاريخ التسجيل" : "Joined"}</th>
                  <th className="py-3.5 px-4 text-right rtl:text-left">{language === "ar" ? "الإجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#252525]">
                {[...Array(6)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-neutral-800" />
                        <div className="space-y-1">
                          <div className="h-4 w-28 bg-slate-200 dark:bg-neutral-800 rounded" />
                          <div className="h-3 w-36 bg-slate-100 dark:bg-neutral-900 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4"><div className="h-5 w-16 bg-slate-200 dark:bg-neutral-800 rounded-full" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-24 bg-slate-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-20 bg-slate-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-32 bg-slate-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-20 bg-slate-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="py-4 px-4 text-right rtl:text-left"><div className="h-7 w-16 bg-slate-200 dark:bg-neutral-800 rounded-lg ml-auto rtl:ml-0 rtl:mr-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#1B1B1B] p-12 text-center rounded-2xl border border-slate-200 dark:border-[#2D2D2D] shadow-sm">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
          <p className="text-slate-600 dark:text-gray-400 font-medium">
            {language === "ar" ? "لم يتم العثور على أي حسابات مطابقة" : "No matching accounts found"}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1B1B1B] rounded-2xl border border-slate-200 dark:border-[#2D2D2D] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#222] text-xs uppercase font-bold text-slate-500 dark:text-gray-400">
                  <th className="py-3.5 px-4">{language === "ar" ? "العميل" : "Customer"}</th>
                  <th className="py-3.5 px-4">{language === "ar" ? "الدور والصلاحية" : "Role"}</th>
                  <th className="py-3.5 px-4">{language === "ar" ? "الاتصال" : "Contact"}</th>
                  <th className="py-3.5 px-4">{language === "ar" ? "الطلبات والمشتريات" : "Orders & Spend"}</th>
                  <th className="py-3.5 px-4">{language === "ar" ? "العنوان المسجل" : "Registered Address"}</th>
                  <th className="py-3.5 px-4">{language === "ar" ? "تاريخ التسجيل" : "Joined"}</th>
                  <th className="py-3.5 px-4 text-right rtl:text-left">{language === "ar" ? "الإجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#252525]">
                {filtered.map((cust) => {
                  const custOrders = getCustomerOrders(cust);
                  const custSpend = getCustomerSpend(custOrders);

                  return (
                    <tr
                      key={cust.uid}
                      className="hover:bg-slate-50 dark:hover:bg-[#222]/50 transition"
                    >
                      {/* Name & UID */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#2A2A2A] border border-slate-200 dark:border-[#333] flex items-center justify-center font-bold text-slate-700 dark:text-white shrink-0">
                            {cust.name ? cust.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {cust.name || (language === "ar" ? "مستخدم بدون اسم" : "Unnamed User")}
                            </p>
                            <p className="text-[11px] font-mono text-slate-400 dark:text-gray-500">
                              UID: {cust.uid.slice(0, 10)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4">
                        {cust.role === "admin" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-[#D4A017] border border-amber-500/20">
                            <Shield className="w-3.5 h-3.5" />
                            Administrator
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            <UserCheck className="w-3.5 h-3.5" />
                            Customer
                          </span>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-gray-300">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{cust.email || "—"}</span>
                          </div>
                          {cust.phone && (
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{cust.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Orders & Spending */}
                      <td className="py-4 px-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                            <ShoppingBag className="w-3.5 h-3.5 text-[#D4A017]" />
                            <span>
                              {custOrders.length}{" "}
                              {language === "ar"
                                ? custOrders.length === 1 ? "طلب" : "طلبات"
                                : custOrders.length === 1 ? "order" : "orders"}
                            </span>
                          </div>
                          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {custSpend.toLocaleString()} EGP
                          </div>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="py-4 px-4 text-xs text-slate-600 dark:text-gray-400">
                        {cust.shippingAddress ? (
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>
                              {cust.shippingAddress.governorate}, {cust.shippingAddress.city}
                              {cust.shippingAddress.street ? ` - ${cust.shippingAddress.street}` : ""}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">
                            {language === "ar" ? "لم يُحدد بعد" : "Not specified"}
                          </span>
                        )}
                      </td>

                      {/* Joined */}
                      <td className="py-4 px-4 text-xs text-slate-500 dark:text-gray-400 font-mono">
                        {cust.createdAt ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{new Date(cust.createdAt).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right rtl:text-left">
                        <button
                          onClick={() => setSelectedCustomerForHistory(cust)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#333] hover:border-[#D4A017] hover:text-[#D4A017] text-slate-700 dark:text-gray-300 text-xs font-semibold transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{language === "ar" ? "سجل الطلبات" : "History"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Order History Modal */}
      {selectedCustomerForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-[#2D2D2D] rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-[#2D2D2D] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
                  {language === "ar" ? "سجل طلبات العميل" : "Customer Purchase History"}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {selectedCustomerForHistory.name || "Customer"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  {selectedCustomerForHistory.email} • {activeCustomerOrders.length}{" "}
                  {language === "ar" ? "طلب إجمالي" : "total orders"} •{" "}
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {activeCustomerTotalSpend.toLocaleString()} EGP
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomerForHistory(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#252525] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {activeCustomerOrders.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-gray-400">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-[#D4A017] opacity-50" />
                  <p className="font-semibold text-sm">
                    {language === "ar"
                      ? "لم يقم هذا العميل بتقديم أي طلبات بعد."
                      : "This customer has not placed any orders yet."}
                  </p>
                </div>
              ) : (
                activeCustomerOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50/50 dark:bg-[#1C1C1C] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono font-bold text-[#D4A017]">
                          {ord.id}
                        </span>
                        <div className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{ord.orderDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
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
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {ord.total?.toLocaleString()} EGP
                        </span>
                      </div>
                    </div>

                    {/* Order Items List */}
                    {ord.items && ord.items.length > 0 && (
                      <div className="pt-2 border-t border-slate-200 dark:border-[#2D2D2D] space-y-1.5">
                        {ord.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs text-slate-600 dark:text-gray-300"
                          >
                            <span className="truncate max-w-[280px]">
                              {item.product?.name || "Item"} × {item.quantity}
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-white shrink-0">
                              {((item.product?.price || 0) * item.quantity).toLocaleString()} EGP
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-[#2D2D2D] flex justify-end">
              <button
                onClick={() => setSelectedCustomerForHistory(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#252525] hover:bg-slate-200 dark:hover:bg-[#333] text-xs font-bold text-slate-700 dark:text-gray-300 transition"
              >
                {language === "ar" ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
