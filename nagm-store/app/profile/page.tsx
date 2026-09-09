"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ProductCard from "@/components/common/ProductCard";
import { useVehicle } from "@/context/VehicleContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
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
  CheckCircle2,
  Clock,
  Truck,
  Plus,
  Trash2,
  ChevronRight
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { selectedVehicle, setSelectedVehicle, clearVehicle } = useVehicle();
  const { wishlist } = useWishlist();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"orders" | "garage" | "addresses" | "wishlist" | "settings">("orders");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem("negm_orders_history") || "[]");
      if (history.length > 0) {
        setOrders(history);
      } else {
        // Fallback realistic dummy orders
        setOrders([
          {
            id: "NS-2026-89412",
            orderDate: "July 24, 2026",
            items: [],
            subtotal: 3500,
            shipping: 0,
            vat: 490,
            discount: 350,
            total: 3640,
            shippingAddress: {
              fullName: "Ahmed Mahmoud",
              phone: "+20 100 123 4567",
              governorate: "Cairo",
              city: "5th Settlement",
              street: "Road 90 North",
              building: "Bldg 42"
            },
            paymentMethod: "cod",
            status: "Delivered",
            estimatedDelivery: "Delivered on July 26, 2026",
            trackingNumber: "EG-TRK-981240"
          },
          {
            id: "NS-2026-90114",
            orderDate: "July 29, 2026",
            items: [],
            subtotal: 1850,
            shipping: 50,
            vat: 259,
            discount: 0,
            total: 2159,
            shippingAddress: {
              fullName: "Ahmed Mahmoud",
              phone: "+20 100 123 4567",
              governorate: "Cairo",
              city: "5th Settlement",
              street: "Road 90 North",
              building: "Bldg 42"
            },
            paymentMethod: "card",
            status: "Processing",
            estimatedDelivery: "August 1, 2026",
            trackingNumber: "EG-TRK-741920"
          }
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleLogout = () => {
    showToast("Logged out successfully.", "info");
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-slate-50 text-[#0F172A] dark:bg-[#111111] dark:text-gray-100 flex flex-col pt-24 sm:pt-32 pb-20 transition-colors duration-300">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex-1">
        
        {/* User Header Profile Banner */}
        <div className="rounded-3xl border border-slate-200 dark:border-[#D4A017]/30 bg-gradient-to-r from-white via-slate-50 to-rose-50/40 dark:from-[#1B1B1B] dark:via-[#241a18] dark:to-[#8B3A2E]/30 p-6 sm:p-8 backdrop-blur-2xl shadow-md dark:shadow-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B3A2E] to-[#5c271e] text-3xl font-black text-white shadow-xl border-2 border-[#D4A017]">
              AM
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Ahmed Mahmoud</h1>
                <span className="rounded-full bg-[#D4A017] px-2.5 py-0.5 text-[10px] font-black uppercase text-black">
                  VIP Gold Member
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">ahmed.m@example.com • +20 100 123 4567</p>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center justify-center sm:justify-start gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Customer Account
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#111111] text-xs font-bold text-slate-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 hover:border-red-500/40 transition shadow-sm"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>

        {/* Profile Tabs Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3 space-y-2">
            <div className="rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B] p-2 sm:p-3 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 backdrop-blur-xl shadow-sm dark:shadow-xl">
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex shrink-0 lg:w-full items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition whitespace-nowrap lg:whitespace-normal ${
                  activeTab === "orders" ? "bg-[#8B3A2E] text-white shadow-md" : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#252525]"
                }`}
              >
                <Package className="h-4 w-4" /> My Orders ({orders.length})
              </button>

              <button
                onClick={() => setActiveTab("garage")}
                className={`flex shrink-0 lg:w-full items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition whitespace-nowrap lg:whitespace-normal ${
                  activeTab === "garage" ? "bg-[#8B3A2E] text-white shadow-md" : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#252525]"
                }`}
              >
                <Car className="h-4 w-4" /> My Saved Garage
              </button>

              <button
                onClick={() => setActiveTab("addresses")}
                className={`flex shrink-0 lg:w-full items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition whitespace-nowrap lg:whitespace-normal ${
                  activeTab === "addresses" ? "bg-[#8B3A2E] text-white shadow-md" : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#252525]"
                }`}
              >
                <MapPin className="h-4 w-4" /> Saved Addresses
              </button>

              <button
                onClick={() => setActiveTab("wishlist")}
                className={`flex shrink-0 lg:w-full items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition whitespace-nowrap lg:whitespace-normal ${
                  activeTab === "wishlist" ? "bg-[#8B3A2E] text-white shadow-md" : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#252525]"
                }`}
              >
                <Heart className="h-4 w-4" /> Saved Wishlist ({wishlist.length})
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`flex shrink-0 lg:w-full items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition whitespace-nowrap lg:whitespace-normal ${
                  activeTab === "settings" ? "bg-[#8B3A2E] text-white shadow-md" : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#252525]"
                }`}
              >
                <Settings className="h-4 w-4" /> Account Settings
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9">
            
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">Order History</h2>
                {orders.map((ord) => (
                  <div key={ord.id} className="rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B]/90 p-5 space-y-4 shadow-sm dark:shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-[#2D2D2D] pb-3 text-xs">
                      <div>
                        <span className="font-extrabold text-[#D4A017] text-sm">{ord.id}</span>
                        <span className="text-slate-500 dark:text-gray-400 ml-3">Placed on {ord.orderDate}</span>
                      </div>

                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        ord.status === "Delivered"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      }`}>
                        {ord.status === "Delivered" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                        {ord.status}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700 dark:text-gray-300">
                      <div>
                        <div>Recipient: {ord.shippingAddress?.fullName || "Ahmed Mahmoud"}</div>
                        <div className="text-slate-500 dark:text-gray-400 mt-0.5">Tracking: {ord.trackingNumber}</div>
                      </div>
                      <div className="sm:text-right">
                        <div className="text-slate-500 dark:text-gray-400">Total Paid:</div>
                        <div className="text-lg font-black text-slate-900 dark:text-white">{ord.total.toLocaleString()} <span className="text-xs text-[#D4A017]">EGP</span></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Garage Tab */}
            {activeTab === "garage" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">My Vehicle Garage</h2>
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
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Engine: {selectedVehicle.engine}</p>
                        <span className="inline-block mt-2 text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          Active Search Filter
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
                    <p className="text-sm text-slate-600 dark:text-gray-300">No vehicles saved in your garage yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Saved Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">Saved Shipping Addresses</h2>

                <div className="rounded-2xl border border-amber-500/30 dark:border-[#D4A017]/40 bg-white dark:bg-[#1B1B1B] p-6 space-y-2 shadow-sm dark:shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#D4A017] uppercase">Primary Address (Egypt)</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Default</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Ahmed Mahmoud El-Sayed</h4>
                  <p className="text-xs text-slate-600 dark:text-gray-300">Building 42, Apt 3B, Road 90 North, 5th Settlement, New Cairo, Cairo Governorate</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400">Phone: +20 100 123 4567</p>
                </div>
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">Saved Wishlist</h2>
                {wishlist.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlist.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-gray-400">No items saved in wishlist.</p>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B] p-6 space-y-4 shadow-sm dark:shadow-xl">
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">Account Settings</h2>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-600 dark:text-gray-400 font-semibold">Display Name</label>
                    <input type="text" defaultValue="Ahmed Mahmoud" className="w-full mt-1 p-3 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]" />
                  </div>
                  <div>
                    <label className="text-slate-600 dark:text-gray-400 font-semibold">Email Address</label>
                    <input type="email" defaultValue="ahmed.m@example.com" className="w-full mt-1 p-3 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]" />
                  </div>
                  <button
                    onClick={() => showToast("Account settings updated!", "success")}
                    className="px-6 py-3 rounded-xl bg-[#8B3A2E] text-xs font-bold text-white hover:bg-[#a34436] transition shadow-lg mt-2"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            )}

          </main>

        </div>

      </div>

      <Footer />
    </main>
  );
}
