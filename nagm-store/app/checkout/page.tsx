"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { ShieldCheck, CreditCard, Banknote, Smartphone, CheckCircle, Truck, ArrowLeft } from "lucide-react";

const governorates = [
  "Cairo", "Giza", "Alexandria", "Qalyubia", "Sharqia", "Dakahlia", 
  "Gharbia", "Monufia", "Beheira", "Ismailia", "Suez", "Port Said", 
  "Fayoum", "Beni Suef", "Minya", "Asyut", "Sohag", "Qena", "Luxor", "Aswan"
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, discountAmount, shipping, vat, total, clearCart } = useCart();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "Ahmed Mahmoud El-Sayed",
    phone: "+20 100 123 4567",
    email: "ahmed.m@example.com",
    governorate: "Cairo",
    city: "5th Settlement, New Cairo",
    street: "Road 90 North",
    building: "Building 42, Apt 3B",
    notes: "Please call before delivery.",
  });

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card" | "wallet">("cod");
  const [cardDetails, setCardDetails] = useState({
    number: "4111 2222 3333 4444",
    name: "AHMED MAHMOUD",
    expiry: "12/28",
    cvv: "888",
  });
  const [walletPhone, setWalletPhone] = useState("01001234567");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.street) {
      showToast("Please fill in all required shipping fields.", "error");
      return;
    }

    const orderId = `NS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder = {
      id: orderId,
      orderDate: new Date().toLocaleDateString("en-EG", { year: "numeric", month: "long", day: "numeric" }),
      items: cart,
      subtotal,
      shipping,
      vat,
      discount: discountAmount,
      total,
      shippingAddress: formData,
      paymentMethod,
      status: "Processing",
      estimatedDelivery: "3-5 Business Days",
      trackingNumber: `EG-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    localStorage.setItem("negm_latest_order", JSON.stringify(newOrder));
    
    // Save to orders history array
    try {
      const history = JSON.parse(localStorage.getItem("negm_orders_history") || "[]");
      localStorage.setItem("negm_orders_history", JSON.stringify([newOrder, ...history]));
    } catch (err) {
      console.error(err);
    }

    clearCart();
    showToast(`Order ${orderId} placed successfully!`, "success");
    router.push("/order-success");
  };

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#111111] text-gray-100 flex flex-col pt-32 pb-20">
        <Navbar />
        <div className="mx-auto max-w-xl px-4 text-center my-auto py-16">
          <h1 className="text-2xl font-bold text-white">No items in cart to checkout</h1>
          <Link href="/shop" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#8B3A2E] px-6 py-3 text-xs font-bold text-white">
            Return to Shop
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#111111] text-gray-100 flex flex-col pt-32 pb-20">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex-1">
        
        <div className="flex items-center justify-between border-b border-[#2D2D2D] pb-6 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
              FINAL STEP
            </span>
            <h1 className="text-3xl font-black text-white mt-1">Order Checkout</h1>
          </div>
          <Link href="/cart" className="text-xs font-bold text-[#D4A017] hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Cart
          </Link>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Checkout Form Column */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Step 1: Customer Details */}
            <div className="rounded-3xl border border-[#2D2D2D] bg-[#1B1B1B]/90 p-6 backdrop-blur-xl shadow-xl space-y-4">
              <h2 className="text-lg font-black text-white border-b border-[#2D2D2D] pb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8B3A2E] text-xs font-bold text-white">1</span>
                Customer Contact Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-[#2D2D2D] bg-[#111111] px-4 py-3 text-xs text-white focus:border-[#D4A017] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Mobile Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-[#2D2D2D] bg-[#111111] px-4 py-3 text-xs text-white focus:border-[#D4A017] focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address (For Invoice PDF)</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#2D2D2D] bg-[#111111] px-4 py-3 text-xs text-white focus:border-[#D4A017] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Address */}
            <div className="rounded-3xl border border-[#2D2D2D] bg-[#1B1B1B]/90 p-6 backdrop-blur-xl shadow-xl space-y-4">
              <h2 className="text-lg font-black text-white border-b border-[#2D2D2D] pb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8B3A2E] text-xs font-bold text-white">2</span>
                Shipping Address (Egypt)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Governorate *</label>
                  <select
                    name="governorate"
                    value={formData.governorate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#2D2D2D] bg-[#111111] px-4 py-3 text-xs text-white focus:border-[#D4A017] focus:outline-none"
                  >
                    {governorates.map((gov) => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">City / District *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-[#2D2D2D] bg-[#111111] px-4 py-3 text-xs text-white focus:border-[#D4A017] focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Street Address *</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-[#2D2D2D] bg-[#111111] px-4 py-3 text-xs text-white focus:border-[#D4A017] focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Building, Floor, Apartment</label>
                  <input
                    type="text"
                    name="building"
                    value={formData.building}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#2D2D2D] bg-[#111111] px-4 py-3 text-xs text-white focus:border-[#D4A017] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="rounded-3xl border border-[#2D2D2D] bg-[#1B1B1B]/90 p-6 backdrop-blur-xl shadow-xl space-y-4">
              <h2 className="text-lg font-black text-white border-b border-[#2D2D2D] pb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8B3A2E] text-xs font-bold text-white">3</span>
                Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition ${
                    paymentMethod === "cod"
                      ? "border-[#D4A017] bg-[#8B3A2E]/20 text-white"
                      : "border-[#2D2D2D] bg-[#111111] text-gray-400 hover:text-white"
                  }`}
                >
                  <Banknote className="h-6 w-6 text-[#D4A017] mb-2" />
                  <span className="text-xs font-bold">Cash on Delivery</span>
                  <span className="text-[10px] text-gray-400 mt-1">Pay when courier arrives</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition ${
                    paymentMethod === "card"
                      ? "border-[#D4A017] bg-[#8B3A2E]/20 text-white"
                      : "border-[#2D2D2D] bg-[#111111] text-gray-400 hover:text-white"
                  }`}
                >
                  <CreditCard className="h-6 w-6 text-[#D4A017] mb-2" />
                  <span className="text-xs font-bold">Credit / Debit Card</span>
                  <span className="text-[10px] text-gray-400 mt-1">Visa / Mastercard</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("wallet")}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition ${
                    paymentMethod === "wallet"
                      ? "border-[#D4A017] bg-[#8B3A2E]/20 text-white"
                      : "border-[#2D2D2D] bg-[#111111] text-gray-400 hover:text-white"
                  }`}
                >
                  <Smartphone className="h-6 w-6 text-[#D4A017] mb-2" />
                  <span className="text-xs font-bold">E-Wallet / InstaPay</span>
                  <span className="text-[10px] text-gray-400 mt-1">Vodafone Cash</span>
                </button>
              </div>

              {/* Card Preview Details */}
              {paymentMethod === "card" && (
                <div className="mt-4 p-4 rounded-2xl border border-[#2D2D2D] bg-[#111111] space-y-3">
                  <div className="text-xs font-bold text-[#D4A017] uppercase">Interactive Card Mockup</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-gray-400">Card Number</label>
                      <input
                        type="text"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        className="w-full rounded-xl border border-[#2D2D2D] bg-[#1B1B1B] px-3 py-2 text-white mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                        className="w-full rounded-xl border border-[#2D2D2D] bg-[#1B1B1B] px-3 py-2 text-white mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Summary Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-[#D4A017]/30 bg-[#1B1B1B] p-6 backdrop-blur-xl shadow-2xl space-y-5">
              <h2 className="text-lg font-black text-white border-b border-[#2D2D2D] pb-3">
                Order Summary ({cart.length} Items)
              </h2>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="relative h-10 w-10 shrink-0 bg-[#111111] rounded-lg overflow-hidden">
                        <Image src={item.product.images[0]} alt="" fill className="object-contain p-1" />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-white truncate">{item.product.name}</div>
                        <div className="text-gray-400 text-[11px]">Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <div className="font-bold text-white shrink-0">
                      {(item.product.price * item.quantity).toLocaleString()} EGP
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-3 border-t border-[#2D2D2D] text-xs text-gray-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">{subtotal.toLocaleString()} EGP</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>-{discountAmount.toLocaleString()} EGP</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-bold text-white">{shipping === 0 ? "FREE" : `${shipping} EGP`}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (14%)</span>
                  <span className="font-bold text-white">{vat.toLocaleString()} EGP</span>
                </div>
                <div className="flex justify-between text-lg font-black text-white pt-3 border-t border-[#2D2D2D]">
                  <span>Total Amount</span>
                  <span className="text-[#D4A017]">{total.toLocaleString()} EGP</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#8B3A2E] font-black text-white text-sm hover:bg-[#a34436] transition shadow-2xl"
              >
                <ShieldCheck className="h-5 w-5" />
                <span>Place Order Now</span>
              </button>
            </div>
          </div>

        </form>

      </div>

      <Footer />
    </main>
  );
}
