"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Profile } from "@/lib/types";

type ThemeMode = "DARK" | "LIGHT";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "aura-theme";

function applyThemeToDocument(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "LIGHT") {
    root.classList.remove("dark");
  } else {
    root.classList.add("dark");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("DARK");

  useEffect(() => {
    let cancelled = false;

    const initTheme = async () => {
      // 1. Ưu tiên localStorage (nhanh, không cần call API)
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
        if (stored === "LIGHT" || stored === "DARK") {
          if (!cancelled) {
            setThemeState(stored);
            applyThemeToDocument(stored);
          }
          return;
        }
      }

      // 2. Nếu chưa có, cố gắng đọc từ profile
      try {
        const profile = await apiFetch<Profile>("/profile");
        const profileTheme = (profile.theme as ThemeMode | undefined) || "DARK";
        if (!cancelled) {
          setThemeState(profileTheme);
          applyThemeToDocument(profileTheme);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(STORAGE_KEY, profileTheme);
          }
        }
      } catch {
        // fallback: DARK
        if (!cancelled) {
          applyThemeToDocument("DARK");
        }
      }
    };

    void initTheme();

    return () => {
      cancelled = true;
    };
  }, []);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    applyThemeToDocument(mode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, mode);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

