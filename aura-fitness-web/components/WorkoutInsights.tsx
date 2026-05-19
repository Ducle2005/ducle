"use client";

import { useMemo } from "react";
import { Activity, BarChart3, CalendarCheck, Gauge } from "lucide-react";
import { getMuscleGroupLabel } from "@/lib/localizedLabels";
import type { WorkoutHistoryItem, WorkoutPlan } from "@/lib/types";

interface WorkoutInsightsProps {
  history: WorkoutHistoryItem[];
  plans: WorkoutPlan[];
}

export function WorkoutInsights({ history, plans }: WorkoutInsightsProps) {
  const insights = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const thisWeek = history.filter((item) => item.startTime && new Date(item.startTime) >= sevenDaysAgo);
    const weeklyVolume = thisWeek.reduce((sum, item) => sum + (item.totalVolume || 0), 0);
    const plannedThisWeek = plans.filter((plan) => Boolean(plan.scheduledDay)).length || plans.length || 1;
    const adherence = Math.min((thisWeek.length / plannedThisWeek) * 100, 100);

    const muscleCounts = new Map<string, number>();
    plans.forEach((plan) => {
      plan.workoutExercises?.forEach((entry) => {
        const label = getMuscleGroupLabel(entry.exercise.muscleGroup || "OTHER");
        muscleCounts.set(label, (muscleCounts.get(label) || 0) + 1);
      });
    });

    const muscleBalance = [...muscleCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const lastWorkout = history[0];
    const previousWorkout = history[1];
    const volumeDelta =
      lastWorkout && previousWorkout && previousWorkout.totalVolume
        ? ((lastWorkout.totalVolume - previousWorkout.totalVolume) / previousWorkout.totalVolume) * 100
        : null;

    const recoveryHint =
      thisWeek.length >= 5
        ? "Tan suat cao: nen chen 1 ngay nhe hoac deload neu RPE trung binh cao."
        : thisWeek.length <= 1
          ? "Tan suat thap: them mot buoi full-body nhe de giu nhip."
          : "Tan suat on dinh: tiep tuc uu tien form va tang tai nho.";

    return { weeklyVolume, adherence, muscleBalance, volumeDelta, recoveryHint };
  }, [history, plans]);

  return (
    <section className="rounded-3xl border border-orange-200/10 bg-gradient-to-br from-white/[0.055] via-white/[0.028] to-orange-500/[0.025] p-5 shadow-2xl shadow-black/20 ring-1 ring-white/[0.025] lg:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight text-orange-50 lg:text-xl">Phan tich tap luyen</h2>
          <p className="mt-1 text-xs text-orange-100/52">Tong hop nhanh nhu mot dashboard coach.</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-400/10 text-orange-300 ring-1 ring-orange-400/20">
          <BarChart3 size={22} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InsightCard
          icon={CalendarCheck}
          label="Adherence 7 ngay"
          value={`${Math.round(insights.adherence)}%`}
          detail="So buoi da tap / so buoi da len lich"
        />
        <InsightCard
          icon={Activity}
          label="Volume 7 ngay"
          value={`${(insights.weeklyVolume / 1000).toFixed(1)}k kg`}
          detail={insights.volumeDelta == null ? "Can them lich su de so sanh" : `${insights.volumeDelta >= 0 ? "+" : ""}${insights.volumeDelta.toFixed(0)}% so voi buoi truoc`}
        />
        <InsightCard icon={Gauge} label="Hoi phuc" value="Coach hint" detail={insights.recoveryHint} />
      </div>

      {insights.muscleBalance.length > 0 && (
        <div className="mt-5">
          <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Can bang nhom co theo giao an
          </div>
          <div className="space-y-2">
            {insights.muscleBalance.map(([muscle, count]) => {
              const max = Math.max(...insights.muscleBalance.map((item) => item[1]), 1);
              return (
                <div key={muscle} className="grid grid-cols-[8rem_minmax(0,1fr)_2rem] items-center gap-3 text-xs">
                  <span className="truncate font-bold">{muscle}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-300 shadow-[0_0_14px_rgba(251,146,60,0.55)]"
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </div>
                  <span className="text-right font-black text-orange-300">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function InsightCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-orange-200/10 bg-[#111827]/70 p-4 shadow-lg shadow-black/10 transition-all hover:border-orange-400/25">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-400/10 text-orange-300">
        <Icon size={18} />
      </div>
      <div className="mt-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-black text-orange-50">{value}</div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}
