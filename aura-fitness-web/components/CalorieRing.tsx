"use client";

import { motion } from "framer-motion";

interface CalorieRingProps {
  progress: number; // 0 to 1
  remaining: number;
  label: string;
}

export function CalorieRing({ progress, remaining, label }: CalorieRingProps) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="relative flex items-center justify-center p-4">
      <svg className="h-40 w-40 transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-slate-800"
        />
        {/* Progress circle */}
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          fill="transparent"
          strokeLinecap="round"
          className="text-primary shadow-2xl drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute flex flex-col items-center text-center">
        <span className="text-3xl font-black text-foreground">{remaining}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      
      {/* Glow effect */}
      <div className="absolute -z-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
    </div>
  );
}
