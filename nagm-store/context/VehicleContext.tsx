"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Vehicle, Product } from "@/types";
import { useToast } from "./ToastContext";

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
  const [selectedVehicle, setSelectedVehicleState] = useState<Vehicle | null>(null);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("negm_selected_vehicle");
      if (saved) setSelectedVehicleState(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load vehicle state", e);
    }
    setIsInitialized(true);
  }, []);

  const setSelectedVehicle = (vehicle: Vehicle) => {
    setSelectedVehicleState(vehicle);
    localStorage.setItem("negm_selected_vehicle", JSON.stringify(vehicle));
    showToast(`Active Vehicle set to ${vehicle.year} ${vehicle.make} ${vehicle.model}!`, "success");
    setIsVehicleModalOpen(false);
  };

  const clearVehicle = () => {
    setSelectedVehicleState(null);
    localStorage.removeItem("negm_selected_vehicle");
    showToast("Vehicle filter cleared.", "info");
  };

  const isCompatible = (product: Product): boolean => {
    if (!selectedVehicle) return true;
    if (!product.compatibility || product.compatibility.length === 0) return true;

    return product.compatibility.some((comp) => {
      const makeMatch = comp.make.toLowerCase() === selectedVehicle.make.toLowerCase();
      const modelMatch = comp.model.toLowerCase().includes(selectedVehicle.model.toLowerCase()) || 
                         selectedVehicle.model.toLowerCase().includes(comp.model.toLowerCase());
      const yearMatch = selectedVehicle.year >= comp.yearStart && selectedVehicle.year <= comp.yearEnd;

      return makeMatch && modelMatch && yearMatch;
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
