"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

import { useLanguage } from "@/context/LanguageContext";

export function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  className,
}: MetricCardProps) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={cn("glass-card group relative overflow-hidden", className)}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <h3 className="text-2xl font-bold text-foreground">{value}</h3>
            {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
          </div>
          {trend && (
            <p
              className={cn(
                "mt-1 text-xs font-semibold",
                trend.isPositive ? "text-emerald-400" : "text-amber-400"
              )}
            >
              {trend.isPositive ? "+" : "-"}{trend.value} {t("from_last_week")}
            </p>
          )}
        </div>
        <div className="rounded-xl bg-primary/10 p-3 text-primary transition-transform group-hover:scale-110">
          <Icon size={20} />
        </div>
      </div>
      
      {/* Decorative background element */}
      <div className="absolute -right-4 -bottom-4 h-16 w-16 rounded-full bg-primary/5 blur-2xl transition-opacity group-hover:opacity-100 opacity-0" />
    </motion.div>
  );
}
