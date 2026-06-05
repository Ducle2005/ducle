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
  BrainCircuit,
  HelpCircle,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { UpgradeModal } from "./UpgradeModal";
import { HelpCenter } from "./HelpCenter";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Sidebar() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const primaryMobileNavItems = [
    { icon: Home, label: "Tổng quan", href: "/" },
    { icon: Dumbbell, label: "Tập luyện", href: "/workout" },
    { icon: BookOpen, label: "Bài tập", href: "/exercises" },
    { icon: Utensils, label: "Ăn uống", href: "/nutrition" },
  ];

  const secondaryMobileNavItems = [
    { icon: Activity, label: "Tiến độ", href: "/progress" },
    { icon: MessageCircle, label: "Huấn luyện AI", href: "/ai-coach" },
    { icon: BrainCircuit, label: "VIP", href: "/vip-intelligence" },
    { icon: Settings, label: "Cài đặt", href: "/settings" },
  ];

  const isPrimaryActive = primaryMobileNavItems.some((item) => pathname === item.href);
  const isSecondaryActive = !isPrimaryActive && secondaryMobileNavItems.some((item) => pathname === item.href);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    closeMobileMenu();
    logout();
  };

  return (
    <>
      <aside className="fixed left-0 top-0 z-50 hidden h-full w-20 flex-col items-center justify-between border-r border-orange-200/10 bg-[#070a15]/88 py-8 shadow-2xl shadow-black/30 backdrop-blur-2xl lg:flex">
        <div className="flex flex-col items-center gap-12">
          <Link href="/" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600 text-slate-950 shadow-[0_0_34px_rgba(249,115,22,0.34)] ring-1 ring-orange-200/30">
            <Activity size={24} />
          </Link>

          <nav className="flex flex-col items-center gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex h-12 w-12 items-center justify-center rounded-xl transition-colors hover:bg-orange-400/10 hover:text-orange-200",
                    isActive
                      ? "bg-gradient-to-br from-orange-500/18 to-amber-500/8 text-orange-300 shadow-[0_0_24px_rgba(249,115,22,0.18)] ring-1 ring-orange-400/20"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon size={22} />
                  <div className="pointer-events-none absolute left-16 z-50 whitespace-nowrap rounded-lg border border-border bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
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
              type="button"
              onClick={() => setIsUpgradeOpen(true)}
              className="group relative flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-300 shadow-lg shadow-orange-500/10 transition-colors hover:bg-orange-500 hover:text-slate-950"
            >
              <Crown size={22} className="animate-pulse" />
              <div className="pointer-events-none absolute left-16 z-50 whitespace-nowrap rounded-lg border border-amber-500/20 bg-slate-900 px-3 py-1.5 text-xs font-black uppercase text-amber-500 opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                Nâng cấp VIP
              </div>
            </button>
          )}
          <Link
            href="/settings"
            className="flex h-12 w-12 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-orange-400/10 hover:text-orange-200"
          >
            <Settings size={22} />
          </Link>
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="group relative flex h-12 w-12 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-orange-400/10 hover:text-orange-200"
          >
            <HelpCircle size={22} />
            <div className="pointer-events-none absolute left-16 z-50 whitespace-nowrap rounded-lg border border-border bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
              Trợ giúp
            </div>
          </button>
          <button
            type="button"
            onClick={logout}
            className="flex h-12 w-12 items-center justify-center rounded-xl text-orange-300 transition-colors hover:bg-orange-400/10"
          >
            <LogOut size={22} />
          </button>
        </div>
      </aside>

      <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
      <HelpCenter isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {isMobileMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={closeMobileMenu}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-all"
          />
          <div className="fixed inset-x-4 bottom-28 z-50 rounded-3xl border border-white/10 bg-[#080b16]/90 p-4 shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-xl lg:hidden">
            <div className="mb-3 flex items-center justify-between px-1">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Menu Aura</p>
                <h3 className="mt-1 text-sm font-black">Truy cập nhanh</h3>
              </div>
              {!isPremium && (
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    setIsUpgradeOpen(true);
                  }}
                  className="flex min-h-10 items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-black text-background"
                >
                  <Crown size={15} />
                  VIP
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {secondaryMobileNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      "flex min-h-[64px] items-center gap-3 rounded-xl border p-3 transition-colors",
                      isActive
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-orange-300/30 hover:text-orange-100"
                    )}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
                      <item.icon size={21} />
                    </div>
                    <span className="text-xs font-black leading-tight sm:text-sm">{item.label}</span>
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  setIsHelpOpen(true);
                }}
                className="flex min-h-[64px] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left text-muted-foreground transition-colors hover:border-orange-300/30 hover:text-orange-100"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
                  <HelpCircle size={21} />
                </div>
                <span className="text-xs font-black leading-tight sm:text-sm">Trợ giúp</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-[64px] items-center gap-3 rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-left text-rose-300 transition-colors hover:bg-rose-500/15"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10">
                  <LogOut size={21} />
                </div>
                <span className="text-xs font-black leading-tight sm:text-sm">Đăng xuất</span>
              </button>
            </div>
          </div>
        </>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 gap-1 border-t border-orange-200/10 bg-[#070a15] px-2 py-2 shadow-2xl shadow-black/40 mobile-nav-safe lg:hidden">
        {primaryMobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileMenu}
              className={cn(
                "relative flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-xl px-1 transition-colors",
                isActive ? "bg-orange-500/10 text-orange-300" : "text-muted-foreground"
              )}
            >
              <item.icon size={20} />
              <span className="max-w-full truncate text-[10px] font-black leading-none">{item.label}</span>
              {isActive && (
                <span className="absolute -top-2 h-1 w-8 rounded-full bg-gradient-to-r from-orange-300 to-orange-600" />
              )}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          className={cn(
            "relative flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-xl px-1 transition-colors",
            isMobileMenuOpen || isSecondaryActive ? "bg-orange-500/10 text-orange-300" : "text-muted-foreground"
          )}
        >
          <MoreHorizontal size={20} />
          <span className="max-w-full truncate text-[10px] font-black leading-none">Thêm</span>
          {(isMobileMenuOpen || isSecondaryActive) && (
            <span className="absolute -top-2 h-1 w-8 rounded-full bg-gradient-to-r from-orange-300 to-orange-600" />
          )}
        </button>
      </nav>
    </>
  );
}
