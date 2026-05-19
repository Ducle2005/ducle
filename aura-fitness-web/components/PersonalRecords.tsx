"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, Zap, TrendingUp } from "lucide-react";
import type { WorkoutHistoryItem } from "@/lib/types";

interface PersonalRecordsProps {
  history: WorkoutHistoryItem[];
}

export function PersonalRecords({ history }: PersonalRecordsProps) {
  const stats = useMemo(() => {
    if (history.length === 0) {
      return null;
    }

    const totalVolume = history.reduce((sum, h) => sum + (h.totalVolume || 0), 0);
    const totalSets = history.reduce((sum, h) => sum + (h.completedSets || 0), 0);
    const totalExercises = history.reduce((sum, h) => sum + (h.exerciseCount || 0), 0);
    const totalDuration = history.reduce((sum, h) => sum + (h.durationMinutes || 0), 0);

    // Find heaviest workout session
    const heaviestSession = history.reduce((prev, current) =>
      (current.totalVolume || 0) > (prev.totalVolume || 0) ? current : prev
    );

    // Calculate average metrics
    const avgVolume = totalVolume / history.length;
    const avgSets = totalSets / history.length;
    const avgDuration = totalDuration / history.length;

    return {
      totalVolume,
      totalSets,
      totalExercises,
      totalDuration,
      heaviestSession,
      avgVolume,
      avgSets,
      avgDuration,
    };
  }, [history]);

  if (!stats || history.length === 0) {
    return null;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <Trophy size={20} />
          </div>
          <h2 className="text-lg font-black uppercase tracking-tight lg:text-xl">
            Thành tích gần đây
          </h2>
        </div>
        <span className="text-xs font-bold uppercase text-muted-foreground">
          {history.length} buổi tập
        </span>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={item}
          className="glass-card group relative overflow-hidden border-white/5 p-5 transition-all hover:border-primary/40"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative z-10">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Tổng khối lượng
              </span>
              <Zap size={16} className="text-primary" />
            </div>
            <div className="text-2xl font-black text-primary">
              {(stats.totalVolume / 1000).toFixed(1)}k kg
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Trung bình: {(stats.avgVolume / 1000).toFixed(1)}k kg/buổi
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="glass-card group relative overflow-hidden border-white/5 p-5 transition-all hover:border-primary/40"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative z-10">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Tổng hiệp
              </span>
              <Trophy size={16} className="text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">{stats.totalSets}</div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Trung bình: {stats.avgSets.toFixed(0)} hiệp/buổi
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="glass-card group relative overflow-hidden border-white/5 p-5 transition-all hover:border-primary/40"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative z-10">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Tổng bài tập
              </span>
              <TrendingUp size={16} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{stats.totalExercises}</div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Tất cả các bài tập đã làm
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="glass-card group relative overflow-hidden border-white/5 p-5 transition-all hover:border-primary/40"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative z-10">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Thời gian tập
              </span>
              <Zap size={16} className="text-sky-400" />
            </div>
            <div className="text-2xl font-black text-sky-400">
              {Math.round(stats.totalDuration / 60)}h
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Trung bình: {stats.avgDuration.toFixed(0)} phút/buổi
            </p>
          </div>
        </motion.div>
      </motion.div>

      {stats.heaviestSession && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 glass-card border-primary/30 bg-gradient-to-r from-primary/10 to-transparent p-6"
        >
          <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary">
            <Trophy size={18} />
            Buổi tập nặng nhất
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Tổng khối lượng
              </p>
              <p className="mt-2 text-lg font-black text-primary">
                {((stats.heaviestSession.totalVolume || 0) / 1000).toFixed(1)}k kg
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Hiệp hoàn thành
              </p>
              <p className="mt-2 text-lg font-black text-amber-400">
                {stats.heaviestSession.completedSets}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Ngày
              </p>
              <p className="mt-2 text-lg font-black text-emerald-400">
                {new Date(stats.heaviestSession.startTime).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}
