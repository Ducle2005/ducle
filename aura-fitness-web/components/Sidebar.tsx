"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { 
  Home, 
  Activity, 
  Utensils, 
  MessageCircle, 
  Settings, 
  LogOut,
  Dumbbell,
  BookOpen,
  Crown,
  BrainCircuit
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { UpgradeModal } from "./UpgradeModal";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const isPremium = user?.roles?.includes("ROLE_PREMIUM");

  const navItems = [
    { icon: Home, label: t("overview"), href: "/" },
    { icon: Dumbbell, label: t("workout"), href: "/workout" },
    { icon: BookOpen, label: t("exercises"), href: "/exercises" },
    { icon: Utensils, label: t("nutrition"), href: "/nutrition" },
    { icon: Activity, label: t("progress"), href: "/progress" },
    { icon: MessageCircle, label: t("ai_coach_nav"), href: "/ai-coach" },
    { icon: BrainCircuit, label: "Trí tuệ VIP", href: "/vip-intelligence" },
  ];

  // Keep AI entry points visible on mobile as well as desktop.
  const mobileNavItems = [
    { icon: Home, label: "Tổng quan", href: "/" },
    { icon: Dumbbell, label: "Tập luyện", href: "/workout" },
    { icon: Utensils, label: "Dinh dưỡng", href: "/nutrition" },
    { icon: Activity, label: "Tiến độ", href: "/progress" },
    { icon: Settings, label: "Cài đặt", href: "/settings" },
    { icon: MessageCircle, label: "AI", href: "/ai-coach" },
    { icon: BrainCircuit, label: "VIP", href: "/vip-intelligence" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-50 hidden h-full w-20 flex-col items-center justify-between border-r border-orange-200/10 bg-[#070a15]/88 py-8 shadow-2xl shadow-black/30 backdrop-blur-2xl lg:flex">
        <div className="flex flex-col items-center gap-12">
          <Link href="/" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600 text-slate-950 shadow-[0_0_34px_rgba(249,115,22,0.34)] ring-1 ring-orange-200/30">
            <Activity size={24} />
          </Link>
          
          <nav className="flex flex-col items-center gap-8">
            {navItems.map((item, idx) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className={cn(
                    "group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all hover:bg-orange-400/10 hover:text-orange-200",
                    isActive
                      ? "bg-gradient-to-br from-orange-500/18 to-amber-500/8 text-orange-300 shadow-[0_0_24px_rgba(249,115,22,0.18)] ring-1 ring-orange-400/20"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon size={22} />
                  
                  {/* Tooltip */}
                  <div className="absolute left-16 z-50 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 shadow-xl border border-border whitespace-nowrap pointer-events-none">
                    {item.label}
                  </div>
                  
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute -left-1 h-3 w-1 rounded-full bg-gradient-to-b from-orange-300 to-orange-600 shadow-[0_0_16px_rgba(249,115,22,0.8)]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col items-center gap-6">
          {!isPremium && (
            <button 
              onClick={() => setIsUpgradeOpen(true)}
              className="group relative flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-300 shadow-lg shadow-orange-500/10 transition-all hover:bg-orange-500 hover:text-slate-950"
            >
              <Crown size={22} className="animate-pulse" />
              <div className="absolute left-16 z-50 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-black uppercase text-amber-500 opacity-0 transition-opacity group-hover:opacity-100 shadow-xl border border-amber-500/20 whitespace-nowrap pointer-events-none">
                Lên VIP
              </div>
            </button>
          )}
          <Link 
            href="/settings"
            className="flex h-12 w-12 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-orange-400/10 hover:text-orange-200"
          >
            <Settings size={22} />
          </Link>
          <button 
            onClick={logout}
            className="flex h-12 w-12 items-center justify-center rounded-xl text-orange-300 transition-all hover:bg-orange-400/10"
          >
            <LogOut size={22} />
          </button>
        </div>
      </aside>

      <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-0.5 overflow-x-auto border-t border-orange-200/10 bg-[#070a15]/95 px-2 py-2 shadow-2xl shadow-black/40 backdrop-blur-xl mobile-nav-safe lg:hidden">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-w-[44px] flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 transition-all",
                isActive ? "bg-orange-500/10 text-orange-300" : "text-muted-foreground"
              )}
            >
              <item.icon size={20} />
              <span className="max-w-[52px] truncate text-[9px] font-bold">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="mobile-active"
                  className="absolute -top-1 h-0.5 w-8 rounded-full bg-gradient-to-r from-orange-300 to-orange-600"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
