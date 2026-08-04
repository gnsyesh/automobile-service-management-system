"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { en, TranslationKey } from "@/locales/en";
import { ar } from "@/locales/ar";

export type LanguageMode = "en" | "ar";

export interface LanguageConfig {
  code: LanguageMode;
  name: string;
  nativeName: string;
  flag: string;
  dir: "ltr" | "rtl";
}

export const languages: LanguageConfig[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    dir: "ltr"
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇪🇬",
    dir: "rtl"
  }
];

interface LanguageContextType {
  language: LanguageMode;
  setLanguage: (lang: LanguageMode) => void;
  currentLanguageConfig: LanguageConfig;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageMode>("en");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("negm_language") as LanguageMode;
      if (saved && (saved === "en" || saved === "ar")) {
        setLanguageState(saved);
      } else if (navigator.language && navigator.language.startsWith("ar")) {
        setLanguageState("ar");
      }
    } catch (e) {
      console.error(e);
    }
    setIsInitialized(true);
  }, []);

  const setLanguage = (lang: LanguageMode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("negm_language", lang);
    } catch (e) {
      console.error(e);
    }
  };

  const currentLanguageConfig = languages.find((l) => l.code === language) || languages[0];

  const t = (key: TranslationKey): string => {
    const dict = language === "ar" ? ar : en;
    return dict[key] || en[key] || key;
  };

  useEffect(() => {
    if (isInitialized) {
      document.documentElement.lang = language;
      document.documentElement.dir = currentLanguageConfig.dir;
      if (language === "ar") {
        document.documentElement.classList.add("rtl");
      } else {
        document.documentElement.classList.remove("rtl");
      }
    }
  }, [language, currentLanguageConfig, isInitialized]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        currentLanguageConfig,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
