"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Vehicle, Product } from "@/types";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";

interface VehicleContextType {
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (vehicle: Vehicle) => void;
  clearVehicle: () => void;
  isCompatible: (product: Product) => boolean;
  isVehicleModalOpen: boolean;
  setIsVehicleModalOpen: (open: boolean) => void;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const VehicleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const activeUid = user ? user.uid : "guest";

  const [selectedVehicle, setSelectedVehicleState] = useState<Vehicle | null>(null);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const isLoadedForUidRef = useRef<string | null>(null);
  const { showToast } = useToast();

  // Synchronize vehicle selection with current authenticated user (or guest)
  useEffect(() => {
    if (authLoading) return;

    const vehicleKey = `negm_selected_vehicle_${activeUid}`;

    try {
      // One-time legacy cleanup/migration for guest only
      if (activeUid === "guest" && !localStorage.getItem(vehicleKey) && localStorage.getItem("negm_selected_vehicle")) {
        const legacyVehicle = localStorage.getItem("negm_selected_vehicle");
        if (legacyVehicle) localStorage.setItem(vehicleKey, legacyVehicle);
      }
      if (localStorage.getItem("negm_selected_vehicle")) {
        localStorage.removeItem("negm_selected_vehicle");
      }

      const saved = localStorage.getItem(vehicleKey);
      setSelectedVehicleState(saved ? JSON.parse(saved) : null);
    } catch (e) {
      console.error("Failed to load vehicle state for", activeUid, e);
      setSelectedVehicleState(null);
    }

    isLoadedForUidRef.current = activeUid;
  }, [activeUid, authLoading]);

  const setSelectedVehicle = (vehicle: Vehicle) => {
    setSelectedVehicleState(vehicle);
    try {
      localStorage.setItem(`negm_selected_vehicle_${activeUid}`, JSON.stringify(vehicle));
    } catch (e) {
      console.error("Failed to save vehicle state", e);
    }
    showToast(`Active Vehicle set to ${vehicle.year} ${vehicle.make} ${vehicle.model}!`, "success");
    setIsVehicleModalOpen(false);
  };

  const clearVehicle = () => {
    setSelectedVehicleState(null);
    try {
      localStorage.removeItem(`negm_selected_vehicle_${activeUid}`);
    } catch (e) {
      console.error("Failed to remove vehicle state", e);
    }
    showToast("Vehicle filter cleared.", "info");
  };

  const isCompatible = (product: Product): boolean => {
    if (!selectedVehicle) return true;
    if (!product.compatibility || product.compatibility.length === 0) {
      // Products without matching compatibility must NOT be shown when exact-fit filtering is active
      return false;
    }

    return product.compatibility.some((comp) => {
      const makeMatch = comp.make.toLowerCase() === selectedVehicle.make.toLowerCase();
      const modelMatch =
        comp.model.toLowerCase() === "all" ||
        comp.model.toLowerCase() === "universal" ||
        comp.model.toLowerCase().includes(selectedVehicle.model.toLowerCase()) ||
        selectedVehicle.model.toLowerCase().includes(comp.model.toLowerCase());
      const yearMatch =
        selectedVehicle.year >= comp.yearStart && selectedVehicle.year <= comp.yearEnd;

      const engineMatch =
        !comp.engine ||
        !selectedVehicle.engine ||
        comp.engine.toLowerCase() === "all" ||
        comp.engine.toLowerCase() === "universal" ||
        comp.engine.toLowerCase().includes(selectedVehicle.engine.toLowerCase()) ||
        selectedVehicle.engine.toLowerCase().includes(comp.engine.toLowerCase());

      return makeMatch && modelMatch && yearMatch && engineMatch;
    });
  };

  return (
    <VehicleContext.Provider
      value={{
        selectedVehicle,
        setSelectedVehicle,
        clearVehicle,
        isCompatible,
        isVehicleModalOpen,
        setIsVehicleModalOpen,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicle = () => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error("useVehicle must be used within a VehicleProvider");
  }
  return context;
};
