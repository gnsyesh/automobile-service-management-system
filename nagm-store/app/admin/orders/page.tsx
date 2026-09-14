"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ShoppingCart,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  RefreshCw,
  Eye,
  MapPin,
  Phone,
  Mail,
  Filter,
} from "lucide-react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order } from "@/types";
import { adjustSalesOnOrderCancellation } from "@/lib/sales";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";

export default function AdminOrdersPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "orders"));
      const list: Order[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      setOrders(list);
    } catch (e) {
      console.error("Error fetching orders:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      const targetOrder = orders.find((o) => o.id === orderId);
      const previousStatus = targetOrder ? (targetOrder.status || targetOrder.orderStatus || "Processing") : "Processing";

      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        orderStatus: newStatus,
        updatedAt: new Date().toISOString(),
      });

      if (targetOrder) {
        try {
          await adjustSalesOnOrderCancellation(targetOrder, previousStatus, newStatus);
        } catch (salesErr) {
          console.warn("Could not adjust sales for order cancellation:", salesErr);
        }
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, orderStatus: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus, orderStatus: newStatus });
      }

      showToast(
        language === "ar"
          ? `تم تحديث حالة الطلب إلى: ${newStatus}`
          : `Order status updated to: ${newStatus}`,
        "success"
      );
    } catch (e) {
      console.error("Error updating order status:", e);
      showToast(
        language === "ar"
          ? "تعذر تحديث حالة الطلب. يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً."
          : "Unable to update order status. Please check your network and try again.",
        "error"
      );
    }
  };

  const filtered = orders.filter((ord) => {
    if (statusFilter !== "all" && ord.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ord.id.toLowerCase().includes(q) ||
        ord.userEmail?.toLowerCase().includes(q) ||
        ord.shippingAddress?.fullName?.toLowerCase().includes(q) ||
        ord.shippingAddress?.phone?.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 text-left rtl:text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2D2D2D] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
            FULFILLMENT & LOGISTICS
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {t("admin.orders")} ({orders.length})
          </h1>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B] text-xs font-bold text-slate-700 dark:text-gray-300 hover:border-[#D4A017] transition shadow-sm disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#D4A017]" : ""}`} />
          <span>{language === "ar" ? "تحديث الطلبات" : "Refresh Orders"}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#D4A017]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === "ar" ? "ابحث برقم الطلب، البريد، أو الهاتف..." : "Search by order ID, email, or phone..."}
            className="w-full rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#151515] py-2.5 pl-10 pr-4 rtl:pl-4 rtl:pr-10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:border-[#D4A017] focus:outline-none"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {["all", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                statusFilter === st
                  ? "bg-[#8B3A2E] text-white shadow"
                  : "bg-white dark:bg-[#151515] border border-slate-200 dark:border-[#2D2D2D] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {st === "all" ? (language === "ar" ? "الكل" : "All") : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#151515] overflow-hidden shadow-sm dark:shadow-xl">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left rtl:text-right">
              <thead className="bg-slate-50 dark:bg-[#1C1C1C] border-b border-slate-200 dark:border-[#2D2D2D] text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#2D2D2D]">
                {[...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 w-20 bg-slate-200 dark:bg-[#252525] rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-32 bg-slate-200 dark:bg-[#252525] rounded mb-1" /><div className="h-3 w-24 bg-slate-100 dark:bg-[#202020] rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-24 bg-slate-200 dark:bg-[#252525] rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-14 bg-slate-200 dark:bg-[#252525] rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-16 bg-slate-200 dark:bg-[#252525] rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-14 bg-slate-200 dark:bg-[#252525] rounded" /></td>
                    <td className="py-4 px-4"><div className="h-6 w-20 bg-slate-200 dark:bg-[#252525] rounded-lg" /></td>
                    <td className="py-4 px-4 text-right rtl:text-left"><div className="h-7 w-16 bg-slate-200 dark:bg-[#252525] rounded-lg ml-auto rtl:ml-0 rtl:mr-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left rtl:text-right">
              <thead className="bg-slate-50 dark:bg-[#1C1C1C] border-b border-slate-200 dark:border-[#2D2D2D] text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#2D2D2D]">
                {filtered.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-[#181818] transition">
                    <td className="py-4 px-4 font-mono font-bold text-[#D4A017]">
                      {ord.id}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {ord.shippingAddress?.fullName || ord.userEmail || "Customer"}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-gray-400">
                        {ord.shippingAddress?.phone}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-gray-300">
                      {ord.orderDate}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700 dark:text-gray-300">
                      {ord.items?.length || 0} items
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                      {ord.total?.toLocaleString()} EGP
                    </td>
                    <td className="py-4 px-4 uppercase font-semibold text-[11px] text-slate-500 dark:text-gray-400">
                      {ord.paymentMethod}
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateStatus(ord.id, e.target.value as any)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold border focus:outline-none ${
                          ord.status === "Delivered"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : ord.status === "Shipped"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                            : ord.status === "Cancelled"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-right rtl:text-left">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2D2D2D] hover:border-[#D4A017] text-slate-700 dark:text-gray-300 font-semibold transition"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500 dark:text-gray-400 space-y-2">
            <ShoppingCart className="mx-auto h-12 w-12 text-[#D4A017] opacity-60" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t("admin.noData")}
            </h3>
            <p className="text-xs">
              {language === "ar"
                ? "لا توجد طلبات تطابق معايير البحث المحددة."
                : "No customer orders matching the criteria."}
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#151515] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2D2D2D] pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#D4A017]">{selectedOrder.id}</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">Order Breakdown</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-2xl border border-slate-200 dark:border-[#2D2D2D] p-4 bg-slate-50 dark:bg-[#0E0E0E] space-y-1.5">
                <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Customer</div>
                <div>Name: <strong>{selectedOrder.shippingAddress?.fullName}</strong></div>
                <div>Email: {selectedOrder.userEmail}</div>
                <div>Phone: {selectedOrder.shippingAddress?.phone}</div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-[#2D2D2D] p-4 bg-slate-50 dark:bg-[#0E0E0E] space-y-1.5">
                <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Shipping Address</div>
                <div>{selectedOrder.shippingAddress?.governorate}, {selectedOrder.shippingAddress?.city}</div>
                <div>{selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.building}</div>
                <div>Tracking: <span className="font-mono text-[#D4A017]">{selectedOrder.trackingNumber}</span></div>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-600 dark:text-gray-400 uppercase">Ordered Parts</h4>
              {selectedOrder.items?.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between gap-3 text-xs border-b border-slate-200 dark:border-[#2D2D2D] pb-2">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 rounded bg-slate-100 dark:bg-[#0A0A0A] overflow-hidden p-1">
                      <Image src={item.product.images[0]} alt="" fill className="object-contain" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{item.product.name}</div>
                      <div className="text-slate-500 dark:text-gray-400">Qty: {item.quantity} • {item.product.brand}</div>
                    </div>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {(item.product.price * item.quantity).toLocaleString()} EGP
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="text-right text-xs space-y-1 border-t border-slate-200 dark:border-[#2D2D2D] pt-3">
              <div>Subtotal: {selectedOrder.subtotal?.toLocaleString()} EGP</div>
              <div>Shipping: {selectedOrder.shipping === 0 ? "FREE" : `${selectedOrder.shipping} EGP`}</div>
              <div>VAT (14%): {selectedOrder.vat?.toLocaleString()} EGP</div>
              <div className="text-sm font-black text-[#D4A017] pt-1">
                Total: {selectedOrder.total?.toLocaleString()} EGP
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
