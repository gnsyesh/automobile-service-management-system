"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Car, Search } from "lucide-react";
import { vehicleMakes } from "@/data/vehicles";
import { useVehicle } from "@/context/VehicleContext";

export default function VehicleSearch() {
  const router = useRouter();
  const { setSelectedVehicle } = useVehicle();

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number | "">("");

  const currentMakeObj = vehicleMakes.find((m) => m.name === make);
  const currentModelObj = currentMakeObj?.models.find((m) => m.name === model);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (make && model && year) {
      setSelectedVehicle({
        make,
        model,
        year: Number(year),
        engine: currentModelObj?.engines[0] || "Standard Engine",
      });
      router.push(`/shop?compatible=true`);
    }
  };

  return (
    <section className="relative z-20 -mt-10 mx-auto max-w-6xl px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-3xl border border-slate-200 dark:border-[#D4A017]/40 bg-white dark:bg-[#1B1B1B]/95 p-6 sm:p-8 backdrop-blur-2xl shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-colors duration-300"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-[#2D2D2D]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8B3A2E] text-white shadow-lg">
              <Car className="h-6 w-6 text-[#D4A017]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Find Exact Fit Spare Parts</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">Select your car specifications to filter compatible products</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Make Dropdown */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#D4A017] mb-2">
              1. Car Make
            </label>
            <select
              value={make}
              onChange={(e) => {
                setMake(e.target.value);
                setModel("");
                setYear("");
              }}
              className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-100 dark:bg-[#111111] px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-[#D4A017] focus:outline-none"
            >
              <option value="">-- Choose Make --</option>
              {vehicleMakes.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Model Dropdown */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#D4A017] mb-2">
              2. Model
            </label>
            <select
              value={model}
              disabled={!make}
              onChange={(e) => {
                setModel(e.target.value);
                setYear("");
              }}
              className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-100 dark:bg-[#111111] px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-[#D4A017] focus:outline-none disabled:opacity-40"
            >
              <option value="">-- Choose Model --</option>
              {currentMakeObj?.models.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year Dropdown */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#D4A017] mb-2">
              3. Year
            </label>
            <select
              value={year}
              disabled={!model}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-100 dark:bg-[#111111] px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-[#D4A017] focus:outline-none disabled:opacity-40"
            >
              <option value="">-- Choose Year --</option>
              {currentModelObj?.years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={!make || !model || !year}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#8B3A2E] py-3.5 px-6 font-bold text-sm text-white hover:bg-[#a34436] transition shadow-lg disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              <span>Search Parts</span>
            </button>
          </div>
        </form>
      </motion.div>
    </section>
  );
}
