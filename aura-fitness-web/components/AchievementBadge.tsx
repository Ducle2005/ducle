"use client";

import { motion } from "framer-motion";
import { Trophy, Lock } from "lucide-react";
import type { Achievement } from "@/lib/types";

const BADGE_EMOJIS: Record<string, string> = {
  first_workout: "🏋️",
  streak_7: "🔥",
  streak_30: "💎",
  volume_king: "👑",
  early_bird: "🌅",
  night_owl: "🌙",
  macro_master: "🎯",
  consistency: "⚡",
  default: "🏅",
};

interface AchievementBadgeProps {
  achievement: Achievement;
  index?: number;
}

export function AchievementBadge({ achievement, index = 0 }: AchievementBadgeProps) {
  const emoji = BADGE_EMOJIS[achievement.badgeIcon] || BADGE_EMOJIS.default;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card group relative flex flex-col items-center justify-center py-6 text-center transition-all hover:border-primary/30"
    >
      <div className="mb-3 text-4xl">{emoji}</div>
      <h4 className="text-sm font-bold">{achievement.name}</h4>
      <p className="mt-1 text-[10px] text-muted-foreground">{achievement.description}</p>
      <div className="mt-3 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
        {new Date(achievement.dateEarned).toLocaleDateString("vi-VN", { day: "numeric", month: "short" })}
      </div>
    </motion.div>
  );
}

interface LockedBadgeProps {
  name: string;
  description: string;
  index?: number;
}

export function LockedBadge({ name, description, index = 0 }: LockedBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card relative flex flex-col items-center justify-center py-6 text-center opacity-40"
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
        <Lock size={20} className="text-muted-foreground" />
      </div>
      <h4 className="text-sm font-bold">{name}</h4>
      <p className="mt-1 text-[10px] text-muted-foreground">{description}</p>
      <div className="mt-3 rounded-full bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        Chưa đạt
      </div>
    </motion.div>
  );
}

// All available achievements with their requirements
export const AVAILABLE_ACHIEVEMENTS = [
  { id: "first_workout", name: "Chiến binh đầu tiên", description: "Hoàn thành buổi tập đầu tiên", icon: "first_workout" },
  { id: "streak_7", name: "7 ngày lửa", description: "Duy trì streak 7 ngày liên tiếp", icon: "streak_7" },
  { id: "streak_30", name: "Kim cương bền bỉ", description: "Duy trì streak 30 ngày", icon: "streak_30" },
  { id: "volume_king", name: "Vua khối lượng", description: "Đạt 50,000kg tổng volume", icon: "volume_king" },
  { id: "macro_master", name: "Bậc thầy dinh dưỡng", description: "Đạt mục tiêu dưỡng chất 7 ngày liên tiếp", icon: "macro_master" },
  { id: "consistency", name: "Sấm sét đều đặn", description: "Tập ít nhất 4 buổi/tuần trong 4 tuần", icon: "consistency" },
];
