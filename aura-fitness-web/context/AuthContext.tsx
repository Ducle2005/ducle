"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import type { AuthUser } from "@/lib/types";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const syncAuthenticatedUser = async () => {
      const savedToken = localStorage.getItem("auth-token");
      if (!savedToken) {
        if (isMounted) {
          setToken(null);
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      setToken(savedToken);
      try {
        const currentUser = await apiFetch<AuthUser>("/auth/me");
        if (isMounted) {
          setUser(currentUser);
        }
      } catch {
        localStorage.removeItem("auth-token");
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const handleUnauthorized = () => {
      if (isMounted) {
        setToken(null);
        setUser(null);
      }
    };

    syncAuthenticatedUser();
    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  const login = async (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("auth-token", newToken);
    const currentUser = await apiFetch<AuthUser>("/auth/me");
    setUser(currentUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth-token");
  };

  const refreshUser = async () => {
    try {
      const currentUser = await apiFetch<AuthUser>("/auth/me");
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
