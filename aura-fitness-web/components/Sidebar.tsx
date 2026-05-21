"use client";

import { AnimatePresence, motion } from "framer-motion";
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
    { icon: BrainCircuit, label: "VIP Intelligence", href: "/vip-intelligence" },
  ];

  const primaryMobileNavItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Dumbbell, label: "Workout", href: "/workout" },
    { icon: Utensils, label: "Food", href: "/nutrition" },
    { icon: Activity, label: "Stats", href: "/progress" },
  ];

  const secondaryMobileNavItems = [
    { icon: BookOpen, label: "Exercises", href: "/exercises" },
    { icon: MessageCircle, label: "AI Coach", href: "/ai-coach" },
    { icon: BrainCircuit, label: "VIP", href: "/vip-intelligence" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];
  const isSecondaryActive = secondaryMobileNavItems.some((item) => pathname === item.href);

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
  };

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
              className="group relative flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-300 shadow-lg shadow-orange-500/10 transition-all hover:bg-orange-500 hover:text-slate-950"
            >
              <Crown size={22} className="animate-pulse" />
              <div className="pointer-events-none absolute left-16 z-50 whitespace-nowrap rounded-lg border border-amber-500/20 bg-slate-900 px-3 py-1.5 text-xs font-black uppercase text-amber-500 opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                Upgrade VIP
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
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="group relative flex h-12 w-12 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-orange-400/10 hover:text-orange-200"
          >
            <HelpCircle size={22} />
            <div className="pointer-events-none absolute left-16 z-50 whitespace-nowrap rounded-lg border border-border bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
              Help
            </div>
          </button>
          <button
            type="button"
            onClick={logout}
            className="flex h-12 w-12 items-center justify-center rounded-xl text-orange-300 transition-all hover:bg-orange-400/10"
          >
            <LogOut size={22} />
          </button>
        </div>
      </aside>

      <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
      <HelpCenter isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Mobile More Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 28, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="fixed inset-x-3 bottom-24 z-50 rounded-3xl border border-orange-200/10 bg-[#080b16]/95 p-4 shadow-2xl shadow-black/60 backdrop-blur-2xl lg:hidden"
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">Aura menu</p>
                  <h3 className="mt-1 text-base font-black">Quick access</h3>
                </div>
                {!isPremium && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsUpgradeOpen(true);
                    }}
                    className="flex items-center gap-2 rounded-2xl bg-primary px-3 py-2 text-xs font-black text-background"
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
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex min-h-[72px] items-center gap-3 rounded-2xl border p-3 transition-all",
                        isActive
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-orange-300/30 hover:text-orange-100"
                      )}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5">
                        <item.icon size={21} />
                      </div>
                      <span className="text-sm font-black leading-tight">{item.label}</span>
                    </Link>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsHelpOpen(true);
                  }}
                  className="flex min-h-[72px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left text-muted-foreground transition-all hover:border-orange-300/30 hover:text-orange-100"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5">
                    <HelpCircle size={21} />
                  </div>
                  <span className="text-sm font-black leading-tight">Help</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex min-h-[72px] items-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-left text-rose-300 transition-all hover:bg-rose-500/15"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/10">
                    <LogOut size={21} />
                  </div>
                  <span className="text-sm font-black leading-tight">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 gap-1 border-t border-orange-200/10 bg-[#070a15]/96 px-3 py-2 shadow-2xl shadow-black/40 backdrop-blur-xl mobile-nav-safe lg:hidden">
        {primaryMobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl px-1 transition-all",
                isActive ? "bg-orange-500/10 text-orange-300" : "text-muted-foreground"
              )}
            >
              <item.icon size={21} />
              <span className="max-w-full truncate text-[10px] font-black leading-none">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="mobile-active"
                  className="absolute -top-2 h-1 w-8 rounded-full bg-gradient-to-r from-orange-300 to-orange-600"
                />
              )}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          className={cn(
            "relative flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl px-1 transition-all",
            isMobileMenuOpen || isSecondaryActive ? "bg-orange-500/10 text-orange-300" : "text-muted-foreground"
          )}
        >
          <MoreHorizontal size={22} />
          <span className="max-w-full truncate text-[10px] font-black leading-none">More</span>
          {(isMobileMenuOpen || isSecondaryActive) && (
            <motion.div className="absolute -top-2 h-1 w-8 rounded-full bg-gradient-to-r from-orange-300 to-orange-600" />
          )}
        </button>
      </nav>
    </>
  );
}
