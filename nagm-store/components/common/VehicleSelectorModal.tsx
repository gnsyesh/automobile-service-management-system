"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Car, CheckCircle, RefreshCw, ChevronRight } from "lucide-react";
import { vehicleMakes } from "@/data/vehicles";
import { useVehicle } from "@/context/VehicleContext";

export default function VehicleSelectorModal() {
  const { selectedVehicle, setSelectedVehicle, clearVehicle, isVehicleModalOpen, setIsVehicleModalOpen } = useVehicle();

  const [selectedMake, setSelectedMake] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number | "">("");
  const [selectedEngine, setSelectedEngine] = useState<string>("");

  if (!isVehicleModalOpen) return null;

  const currentMakeObj = vehicleMakes.find((m) => m.name === selectedMake);
  const currentModelObj = currentMakeObj?.models.find((m) => m.name === selectedModel);

  const handleApply = () => {
    if (selectedMake && selectedModel && selectedYear) {
      setSelectedVehicle({
        make: selectedMake,
        model: selectedModel,
        year: Number(selectedYear),
        engine: selectedEngine || currentModelObj?.engines[0] || "Standard Engine",
      });
    }
  };

  const handleReset = () => {
    setSelectedMake("");
    setSelectedModel("");
    setSelectedYear("");
    setSelectedEngine("");
    clearVehicle();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsVehicleModalOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Dialog Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-lg rounded-2xl border border-[#D4A017]/40 bg-[#1B1B1B] p-6 shadow-2xl overflow-hidden text-white"
        >
          <div className="flex items-center justify-between border-b border-[#2D2D2D] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B3A2E] text-white">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-none">
                  Select Your Vehicle
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Ensure 100% part compatibility for your car
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsVehicleModalOpen(false)}
              className="p-2 rounded-full bg-[#111111] text-gray-400 hover:text-white hover:bg-[#8B3A2E] transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Active vehicle preview banner if exists */}
          {selectedVehicle && (
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                <span className="text-sm font-semibold text-emerald-300">
                  Active: {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.engine})
                </span>
              </div>
              <button
                onClick={handleReset}
                className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
              >
                Clear <RefreshCw className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Dropdown Form */}
          <div className="mt-5 space-y-4">
            {/* Step 1: Make */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                1. Select Make
              </label>
              <select
                value={selectedMake}
                onChange={(e) => {
                  setSelectedMake(e.target.value);
                  setSelectedModel("");
                  setSelectedYear("");
                  setSelectedEngine("");
                }}
                className="w-full rounded-xl border border-[#2D2D2D] bg-[#111111] px-4 py-3 text-sm text-white focus:border-[#D4A017] focus:outline-none"
              >
                <option value="">-- Choose Car Make --</option>
                {vehicleMakes.map((make) => (
                  <option key={make.name} value={make.name}>
                    {make.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Model */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                2. Select Model
              </label>
              <select
                value={selectedModel}
                disabled={!selectedMake}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  setSelectedYear("");
                  setSelectedEngine("");
                }}
                className="w-full rounded-xl border border-[#2D2D2D] bg-[#111111] px-4 py-3 text-sm text-white focus:border-[#D4A017] focus:outline-none disabled:opacity-40"
              >
                <option value="">-- Choose Model --</option>
                {currentMakeObj?.models.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Year */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                3. Production Year
              </label>
              <select
                value={selectedYear}
                disabled={!selectedModel}
                onChange={(e) => {
                  setSelectedYear(Number(e.target.value));
                  setSelectedEngine("");
                }}
                className="w-full rounded-xl border border-[#2D2D2D] bg-[#111111] px-4 py-3 text-sm text-white focus:border-[#D4A017] focus:outline-none disabled:opacity-40"
              >
                <option value="">-- Choose Year --</option>
                {currentModelObj?.years.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 4: Engine */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                4. Engine Specification
              </label>
              <select
                value={selectedEngine}
                disabled={!selectedYear}
                onChange={(e) => setSelectedEngine(e.target.value)}
                className="w-full rounded-xl border border-[#2D2D2D] bg-[#111111] px-4 py-3 text-sm text-white focus:border-[#D4A017] focus:outline-none disabled:opacity-40"
              >
                <option value="">-- Choose Engine Variant --</option>
                {currentModelObj?.engines.map((eng) => (
                  <option key={eng} value={eng}>
                    {eng}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-[#2D2D2D] flex items-center justify-between gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl border border-[#2D2D2D] bg-[#111111] text-xs font-semibold text-gray-400 hover:text-white hover:border-gray-500 transition"
            >
              Reset Filter
            </button>

            <button
              onClick={handleApply}
              disabled={!selectedMake || !selectedModel || !selectedYear}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#8B3A2E] text-white font-bold text-sm hover:bg-[#a34436] transition disabled:opacity-50 shadow-lg"
            >
              <span>Save & Filter Parts</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
