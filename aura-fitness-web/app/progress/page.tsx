"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Activity, Target, ArrowUpRight, Sparkles,
  BarChart3, Calendar, Scale, Flame, Dumbbell, Zap
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from "recharts";
import { Sidebar } from "@/components/Sidebar";
import { AuthPage } from "@/components/AuthPage";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { analyticsApi } from "@/lib/analyticsApi";
import type { Profile, StagnationInsight, VolumeProgressionItem, WeeklyComparison, WeightTrends } from "@/lib/types";

/* ───── custom tooltip ───── */
function CustomTooltip({ active, payload, label, unit }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string; unit?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString("vi-VN") : entry.value} {unit || ""}
        </p>
      ))}
    </div>
  );
}

/* ───── empty state ───── */
function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}>
        <BarChart3 size={48} className="text-primary/30" />
      </motion.div>
      <p className="max-w-xs text-center text-sm font-medium italic">{message}</p>
    </div>
  );
}

export default function ProgressPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [weightData, setWeightData] = useState<WeightTrends | null>(null);
  const [volumeData, setVolumeData] = useState<VolumeProgressionItem[]>([]);
  const [weeklyComp, setWeeklyComp] = useState<WeeklyComparison | null>(null);
  const [stagnation, setStagnation] = useState<StagnationInsight | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { if (!user) return; void loadProgressData(); }, [user]);

  const loadProgressData = async () => {
    try {
      const [weight, volume, weekly, stagnationInsight, profileData] = await Promise.all([
        analyticsApi.getWeightTrends(), analyticsApi.getVolumeProgression(), analyticsApi.getWeeklyComparison(), analyticsApi.getStagnation(), apiFetch<Profile>("/profile"),
      ]);
      setWeightData(weight); setVolumeData(volume || []); setWeeklyComp(weekly); setStagnation(stagnationInsight); setProfile(profileData);
    } catch (error) { console.error("Failed to load progress data:", error); }
    finally { setIsLoading(false); }
  };

  const latestWeight = useMemo(() => { const history = weightData?.history || []; return history.length > 0 ? history[history.length - 1].weight : 0; }, [weightData]);

  // Weight chart data formatted
  const weightChartData = useMemo(() => {
    if (!weightData?.history) return [];
    return weightData.history.map(item => ({
      date: new Date(item.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
      weight: item.weight,
    }));
  }, [weightData]);

  // Volume chart data formatted
  const volumeChartData = useMemo(() => {
    return volumeData.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
    }));
  }, [volumeData]);

  // Weekly comparison bar data
  const weeklyBarData = useMemo(() => {
    if (!weeklyComp) return [];
    return [
      { name: "Tuần trước", volume: weeklyComp.lastWeekVolume, fill: "hsl(215, 70%, 50%)" },
      { name: "Tuần này", volume: weeklyComp.currentWeekVolume, fill: "hsl(160, 84%, 39%)" },
    ];
  }, [weeklyComp]);

  if (authLoading || (user && isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }} className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!user) return <AuthPage />;

  const delta = weeklyComp?.deltaPercentage || 0;
  const isPositiveGrowth = delta >= 0;
  const coachTip = stagnation?.advice || "Hãy tiếp tục ghi log cả buổi tập lẫn chỉ số cơ thể để thấy xu hướng rõ ràng hơn.";

  const totalSessions = volumeData.length;
  const totalVolume = volumeData.reduce((acc, v) => acc + v.volume, 0);

  return (
    <div className="flex min-h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <main className="custom-scrollbar ml-20 h-screen flex-1 overflow-y-auto px-8 py-8 lg:px-12">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl font-black uppercase tracking-tight">Phân tích hiệu suất</h1>
            <p className="mt-1 font-medium italic text-muted-foreground">Số liệu không nói dối. Sự bền bỉ của bạn, được trực quan hóa.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
            <div className={`glass flex items-center gap-2 rounded-2xl border-primary/30 px-4 py-2 ${isPositiveGrowth ? "bg-emerald-500/5" : "bg-rose-500/5"}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isPositiveGrowth ? "bg-emerald-500 text-background" : "bg-rose-500 text-background"}`}>
                {isPositiveGrowth ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tăng trưởng tuần</div>
                <div className={`text-sm font-black ${isPositiveGrowth ? "text-emerald-400" : "text-rose-400"}`}>{isPositiveGrowth ? "+" : ""}{delta.toFixed(1)}%</div>
              </div>
            </div>
            <button className="glass rounded-xl p-2.5 transition-colors hover:text-primary"><Calendar size={20} /></button>
          </motion.div>
        </header>

        {/* ───── Summary Cards ───── */}
        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          <SummaryCard icon={Scale} label="Cân nặng" value={latestWeight > 0 ? `${latestWeight.toFixed(1)}` : "—"} unit="kg" color="text-blue-400" bgColor="bg-blue-500/10" delay={0} />
          <SummaryCard icon={Flame} label="Buổi tập" value={`${totalSessions}`} unit="sessions" color="text-orange-400" bgColor="bg-orange-500/10" delay={0.1} />
          <SummaryCard icon={Dumbbell} label="Tổng khối lượng" value={totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : `${totalVolume.toFixed(0)}`} unit="kg" color="text-emerald-400" bgColor="bg-emerald-500/10" delay={0.2} />
          <SummaryCard icon={Zap} label="Tỉ lệ mỡ" value={profile?.bodyFat != null ? `${profile.bodyFat.toFixed(1)}` : "—"} unit="%" color="text-amber-400" bgColor="bg-amber-500/10" delay={0.3} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* ───── Main Charts Column ───── */}
          <div className="space-y-8 lg:col-span-8">

            {/* Volume Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-3 text-lg font-black uppercase tracking-widest">
                  <BarChart3 className="text-primary" size={20} />Khối lượng tập luyện
                </h2>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Khối lượng (kg)</span>
                </div>
              </div>
              <div className="h-[320px] w-full">
                {volumeChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={volumeChartData}>
                      <defs>
                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value: number) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`} />
                      <Tooltip content={<CustomTooltip unit="kg" />} />
                      <Area type="monotone" dataKey="volume" name="Khối lượng" stroke="hsl(160, 84%, 39%)" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" dot={{ r: 4, fill: "hsl(160, 84%, 39%)", stroke: "#0f172a", strokeWidth: 2 }} activeDot={{ r: 6, stroke: "hsl(160, 84%, 39%)", strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="Chưa có dữ liệu buổi tập. Hoàn thành buổi tập đầu tiên để xem biểu đồ tiến độ!" />
                )}
              </div>
            </motion.div>

            {/* Weight Trend Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-3 text-lg font-black uppercase tracking-widest">
                  <Scale className="text-blue-400" size={20} />Xu hướng cân nặng
                </h2>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cân nặng (kg)</span>
                </div>
              </div>
              <div className="h-[280px] w-full">
                {weightChartData.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightChartData}>
                      <defs>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(215, 70%, 50%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(215, 70%, 50%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} domain={["dataMin - 1", "dataMax + 1"]} tickFormatter={(v: number) => `${v}kg`} />
                      <Tooltip content={<CustomTooltip unit="kg" />} />
                      <Line type="monotone" dataKey="weight" name="Cân nặng" stroke="hsl(215, 70%, 60%)" strokeWidth={3} dot={{ r: 5, fill: "hsl(215, 70%, 60%)", stroke: "#0f172a", strokeWidth: 2 }} activeDot={{ r: 7, fill: "hsl(215, 70%, 60%)", stroke: "#fff", strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="Chưa đủ dữ liệu cân nặng. Ghi nhận cân nặng thường xuyên để theo dõi xu hướng!" />
                )}
              </div>
            </motion.div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <MetricCard label="Thay đổi cân nặng 7 ngày" value={weightData?.change7d != null ? (weightData.change7d).toFixed(1) : "—"} unit="kg" change={weightData?.change7d ?? 0} icon={Activity} changeLabel="so với 7 ngày trước" delay={0.3} />
              <MetricCard label="Thay đổi cân nặng 30 ngày" value={weightData?.change30d != null ? (weightData.change30d).toFixed(1) : "—"} unit="kg" change={weightData?.change30d ?? 0} icon={Target} color="text-amber-400" changeLabel="so với 30 ngày trước" delay={0.4} />
            </div>
          </div>

          {/* ───── Sidebar Panel ───── */}
          <div className="space-y-6 lg:col-span-4">

            {/* Weekly Comparison Bar Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
              <h3 className="mb-4 flex items-center justify-between text-xs font-black uppercase tracking-widest text-muted-foreground">
                <span>So sánh theo tuần</span><Sparkles className="text-primary" size={14} />
              </h3>
              <div className="h-[200px] w-full">
                {weeklyBarData.some(d => d.volume > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyBarData} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
                      <Tooltip content={<CustomTooltip unit="kg" />} />
                      <Bar dataKey="volume" name="Khối lượng" radius={[8, 8, 0, 0]}>
                        {weeklyBarData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="Hoàn thành buổi tập để so sánh cường độ giữa các tuần." />
                )}
              </div>
              {weeklyComp && (weeklyComp.currentWeekVolume > 0 || weeklyComp.lastWeekVolume > 0) && (
                <div className="mt-4 space-y-3">
                  <WeekDelta label="Tuần trước" value={weeklyComp.lastWeekVolume} unit="kg" />
                  <WeekDelta label="Tuần này" value={weeklyComp.currentWeekVolume} unit="kg" isActive />
                </div>
              )}
            </motion.div>

            {/* Coach Tip */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card border-primary/20 bg-primary/5 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                  <ArrowUpRight size={20} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-primary">Mẹo từ AI Coach</span>
              </div>
              <p className="text-sm italic leading-relaxed text-muted-foreground">{coachTip}</p>
            </motion.div>

            {/* Progress Focus */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
              <h3 className="mb-6 text-xs font-black uppercase tracking-widest">Trọng tâm tiến bộ</h3>
              <div className="space-y-5">
                <ProgressBar label="Khối lượng tập luyện" progress={Math.min(Math.abs(delta) * 5, 100)} color="bg-emerald-400" />
                <ProgressBar label="Thành phần cơ thể" progress={profile?.bodyFat != null ? Math.max(100 - profile.bodyFat * 4, 0) : 48} color="bg-amber-400" />
                <ProgressBar label="Tính đều đặn" progress={volumeData.length > 0 ? Math.min(volumeData.length * 12, 100) : 20} color="bg-blue-400" />
                <ProgressBar label="Sức bền" progress={totalSessions > 0 ? Math.min(totalSessions * 10, 100) : 0} color="bg-rose-400" />
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ───── Sub-components ───── */

function SummaryCard({ icon: Icon, label, value, unit, color, bgColor, delay }: {
  icon: typeof Activity; label: string; value: string; unit: string; color: string; bgColor: string; delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="glass-card group relative overflow-hidden p-5">
      <div className="absolute -right-3 -top-3 opacity-[0.04] transition-opacity group-hover:opacity-[0.08]"><Icon size={64} /></div>
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${bgColor} ${color}`}>
        <Icon size={20} />
      </div>
      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-2xl font-black">{value}</span>
        <span className="text-xs font-bold text-muted-foreground">{unit}</span>
      </div>
    </motion.div>
  );
}

function MetricCard({ label, value, unit, change, icon: Icon, color = "text-primary", inverseTrend, changeLabel = "so với kỳ trước", delay = 0 }: {
  label: string; value: string; unit: string; change: number; icon: typeof Activity; color?: string; inverseTrend?: boolean; changeLabel?: string; delay?: number;
}) {
  const isPositive = change >= 0;
  const trendIsGood = inverseTrend ? !isPositive : isPositive;
  const textColor = trendIsGood ? "text-emerald-400" : "text-rose-400";
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="glass-card group relative overflow-hidden p-6">
      <div className="absolute right-0 top-0 p-4 opacity-5 transition-opacity group-hover:opacity-10"><Icon size={48} /></div>
      <div className="mb-4 flex items-center gap-3">
        <div className={`glass flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon size={20} /></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black">{value}</span>
        <span className="text-sm font-bold uppercase text-muted-foreground">{unit}</span>
      </div>
      <div className={`mt-2 flex items-center gap-1 text-xs font-bold ${textColor}`}>
        {change !== 0 && (isPositive ? "+" : "")}{change !== 0 ? change.toFixed(1) : "—"}
        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{changeLabel}</span>
      </div>
    </motion.div>
  );
}

function WeekDelta({ label, value, unit, isActive }: { label: string; value: number; unit: string; isActive?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 transition-all ${isActive ? "border-primary/50 bg-white/5 ring-1 ring-primary/20" : "border-white/5 bg-transparent"}`}>
      <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className={`text-xl font-black ${isActive ? "text-primary" : "text-foreground"}`}>
          {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(0)}
        </span>
        <span className="text-[10px] font-bold uppercase text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

function ProgressBar({ label, progress, color = "bg-primary" }: { label: string; progress: number; color?: string }) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  return (
    <div>
      <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
        <span>{label}</span><span>{Math.round(clampedProgress)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
          style={{ boxShadow: `0 0 12px ${color === "bg-primary" ? "hsl(var(--primary) / 0.3)" : "currentColor"}` }}
        />
      </div>
    </div>
  );
}
