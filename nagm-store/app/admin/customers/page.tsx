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
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/types";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminCustomersPage() {
  const { t, language } = useLanguage();
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const list: UserProfile[] = [];
      snap.forEach((d) => {
        list.push({ uid: d.id, ...(d.data() as any) });
      });
      setCustomers(list);
    } catch (e) {
      console.error("Error fetching customers:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter((cust) => {
    if (roleFilter !== "all" && cust.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        cust.name?.toLowerCase().includes(q) ||
        cust.email?.toLowerCase().includes(q) ||
        cust.phone?.includes(q)
      );
    }
    return true;
  });

  const totalUsers = customers.filter((c) => c.role === "user").length;
  const totalAdmins = customers.filter((c) => c.role === "admin").length;

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
              ? "استعراض حسابات العملاء والمسؤولين المسجلين في النظام عبر فايربيس"
              : "Review all registered customer and administrator accounts in Firestore"}
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-[#333] hover:bg-slate-100 dark:hover:bg-[#252525] text-slate-700 dark:text-gray-300 text-sm font-semibold transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
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
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#D4A017]" />
          <p>{language === "ar" ? "جاري تحميل حسابات العملاء..." : "Loading customer accounts..."}</p>
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
                  <th className="py-3.5 px-4">{language === "ar" ? "العنوان المسجل" : "Registered Address"}</th>
                  <th className="py-3.5 px-4">{language === "ar" ? "تاريخ التسجيل" : "Joined"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#252525]">
                {filtered.map((cust) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
