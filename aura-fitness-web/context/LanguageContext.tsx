"use client";

import React, { createContext, useContext, useMemo } from "react";
import { translations, TranslationKey } from "@/lib/translations";

interface LanguageContextType {
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(
    () => ({
      t: (key: TranslationKey) => translations[key] || key,
    }),
    []
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
