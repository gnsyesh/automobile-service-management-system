"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeMode = "luxury-gold" | "racing-red" | "midnight-cyan" | "cyber-emerald" | "light-executive";

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  accentColor: string;
  brandColor: string;
  bgDark: string;
  cardBg: string;
  description: string;
}

export const themes: ThemeConfig[] = [
  {
    id: "luxury-gold",
    name: "Luxury Gold & Black",
    accentColor: "#D4A017",
    brandColor: "#8B3A2E",
    bgDark: "#111111",
    cardBg: "#1B1B1B",
    description: "The original iconic Negm Store luxury automotive styling"
  },
  {
    id: "racing-red",
    name: "Crimson Motorsport",
    accentColor: "#EF4444",
    brandColor: "#991B1B",
    bgDark: "#0F0F12",
    cardBg: "#18181F",
    description: "High-octane aggressive red racing performance look"
  },
  {
    id: "midnight-cyan",
    name: "Midnight Neon Cyan",
    accentColor: "#00F0FF",
    brandColor: "#2563EB",
    bgDark: "#0B0F17",
    cardBg: "#131B2A",
    description: "Futuristic night drive theme with cyan illuminations"
  },
  {
    id: "cyber-emerald",
    name: "Obsidian Emerald",
    accentColor: "#10B981",
    brandColor: "#065F46",
    bgDark: "#06140E",
    cardBg: "#0E241B",
    description: "Deep luxury emerald green & black automotive theme"
  },
  {
    id: "light-executive",
    name: "Executive Platinum (Light)",
    accentColor: "#B45309",
    brandColor: "#1E3A8A",
    bgDark: "#F8FAFC",
    cardBg: "#FFFFFF",
    description: "Clean bright executive light mode for day browsing"
  }
];

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  currentThemeConfig: ThemeConfig;
  isThemeModalOpen: boolean;
  setIsThemeModalOpen: (open: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>("luxury-gold");
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("negm_theme") as ThemeMode;
      if (saved && themes.some((t) => t.id === saved)) {
        setThemeState(saved);
      } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
        setThemeState("light-executive");
      }
    } catch (e) {
      console.error(e);
    }
    setIsInitialized(true);
  }, []);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    try {
      localStorage.setItem("negm_theme", mode);
    } catch (e) {
      console.error(e);
    }
  };

  const currentThemeConfig = themes.find((t) => t.id === theme) || themes[0];

  useEffect(() => {
    if (isInitialized) {
      document.documentElement.setAttribute("data-theme", theme);
      if (theme === "light-executive") {
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
      }
    }
  }, [theme, isInitialized]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        currentThemeConfig,
        isThemeModalOpen,
        setIsThemeModalOpen,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
