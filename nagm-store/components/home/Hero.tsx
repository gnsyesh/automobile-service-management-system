"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Car, ShieldCheck, Truck, Star } from "lucide-react";
import { useVehicle } from "@/context/VehicleContext";

export default function Hero() {
  const { setIsVehicleModalOpen } = useVehicle();

  return (
    <section className="relative overflow-hidden bg-slate-950 dark:bg-[#0A0A0A] pt-32 pb-20 lg:pt-36 lg:pb-28 text-white transition-colors duration-300">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#8B3A2E]/20 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 h-[350px] w-[350px] rounded-full bg-[#D4A017]/15 blur-[130px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Hero Text Column */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 text-center lg:text-left"
          >
            {/* Top Subtitle Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4A017]/40 bg-[#1B1B1B]/80 px-4 py-1.5 text-xs font-bold text-[#D4A017] mb-6 backdrop-blur-md">
              <ShieldCheck className="h-4 w-4" />
              <span>Egypt's #1 Luxury Automotive Spare Parts Hub</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Engineered For <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#D4A017] via-[#f7d774] to-[#D4A017] bg-clip-text text-transparent">
                Peak Performance.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg text-slate-300 dark:text-gray-300 leading-relaxed font-normal">
              100% Genuine motor oils, ceramic brake pads, OEM filters, batteries, tyres, and car detailing products delivered fast across Cairo, Giza, and all Egyptian Governorates.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#8B3A2E] px-8 py-4 text-base font-bold text-white shadow-xl transition-all duration-300 hover:bg-[#a34436] hover:shadow-[0_10px_30px_rgba(139,58,46,0.4)] hover:-translate-y-0.5"
              >
                <ShoppingBag className="h-5 w-5" />
                <span>Shop Catalog</span>
              </Link>

              <button
                onClick={() => setIsVehicleModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#D4A017]/40 bg-[#1B1B1B]/90 px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:border-[#D4A017] hover:bg-[#D4A017]/10 hover:-translate-y-0.5"
              >
                <Car className="h-5 w-5 text-[#D4A017]" />
                <span>Find Parts For My Car</span>
              </button>
            </div>

            {/* Feature Badges */}
            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-slate-800 dark:border-[#2D2D2D] pt-8">
              <div className="text-center lg:text-left">
                <h4 className="text-2xl sm:text-3xl font-black text-[#D4A017]">100%</h4>
                <p className="text-xs text-slate-400 dark:text-gray-400 mt-1 font-semibold uppercase">Genuine OEM</p>
              </div>
              <div className="text-center lg:text-left">
                <h4 className="text-2xl sm:text-3xl font-black text-[#D4A017]">24/48h</h4>
                <p className="text-xs text-slate-400 dark:text-gray-400 mt-1 font-semibold uppercase">Egypt Delivery</p>
              </div>
              <div className="text-center lg:text-left">
                <h4 className="text-2xl sm:text-3xl font-black text-[#D4A017]">4.9 ★</h4>
                <p className="text-xs text-slate-400 dark:text-gray-400 mt-1 font-semibold uppercase">Customer Rating</p>
              </div>
            </div>
          </motion.div>

          {/* Right Visual Image & Floating Badges */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="lg:col-span-5 relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg aspect-square">
              <div className="absolute inset-0 rounded-3xl border border-[#D4A017]/20 bg-gradient-to-b from-[#1B1B1B]/80 to-[#111111] backdrop-blur-2xl shadow-2xl" />

              <div className="relative z-10 h-full w-full p-6 flex items-center justify-center">
                <Image
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUCZVTkeH4VLa_iCCvsRZrWL_wLImu4IUx42a62Myt3l57YqIyw8pJXc-J&s=10"
                  alt="Negm Store Automotive Parts"
                  width={600}
                  height={600}
                  priority
                  className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-2xl"
                />
              </div>

              {/* Floating Glass Pill 1 */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 z-20 flex items-center gap-3 rounded-2xl border border-[#D4A017]/30 bg-[#1B1B1B]/95 p-3.5 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B3A2E] text-white">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Fast Egypt Delivery</div>
                  <div className="text-[11px] text-[#D4A017]">Free Over 2000 EGP</div>
                </div>
              </motion.div>

              {/* Floating Glass Pill 2 */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-4 z-20 flex items-center gap-3 rounded-2xl border border-[#D4A017]/30 bg-[#1B1B1B]/95 p-3.5 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4A017] text-black">
                  <Star className="h-5 w-5 fill-current" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Mobil 1 & Shell</div>
                  <div className="text-[11px] text-emerald-400">Authorized Stockist</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}