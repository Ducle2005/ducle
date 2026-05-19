"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calendar } from "lucide-react";
import { nutritionApi, WeeklyNutritionDay } from "@/lib/nutritionApi";

export function NutritionWeeklyChart() {
  const [weeklyData, setWeeklyData] = useState<WeeklyNutritionDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWeeklyData = async () => {
      try {
        const data = await nutritionApi.getWeekly();
        setWeeklyData(data);
      } catch (error) {
        console.error("Failed to load weekly nutrition data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadWeeklyData();
  }, []);

  if (isLoading) return null;
  if (weeklyData.length === 0) return null;

  const maxCalories = Math.max(...weeklyData.map((d) => d.target ?? d.calories), 2500);
  const avgCalories = weeklyData.reduce((sum, d) => sum + d.calories, 0) / weeklyData.length;

  return (
    <section className="glass-card border-white/5 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <TrendingUp size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight">Xu hướng tuần</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Trung bình: {avgCalories.toFixed(0)} kcal/ngày
            </p>
          </div>
        </div>
        <span className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
          <Calendar size={14} />7 ngày
        </span>
      </div>

      <div className="space-y-4">
        {weeklyData.map((day, index) => {
          const target = day.target ?? avgCalories;
          const percentage = Math.min((day.calories / target) * 100, 100);
          const isOverTarget = day.calories > target;

          return (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-bold text-foreground">{day.dayLabel}</span>
                <div className="flex items-center gap-4">
                  <span className={`font-black ${isOverTarget ? "text-amber-400" : "text-primary"}`}>
                    {day.calories} kcal
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="relative h-3 overflow-hidden rounded-full bg-white/5 transition-all group-hover:bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full transition-all ${
                    isOverTarget
                      ? "bg-gradient-to-r from-amber-500 to-orange-500"
                      : "bg-gradient-to-r from-primary to-blue-500"
                  }`}
                />
              </div>

              <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <div>🥩 {day.protein.toFixed(0)}g</div>
                <div>🌾 {day.carbs.toFixed(0)}g</div>
                <div>🥑 {day.fat.toFixed(0)}g</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 border-t border-white/5 pt-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Mục tiêu trung bình
            </p>
            <p className="mt-2 text-xl font-black text-primary">
              {weeklyData[0]?.target?.toFixed(0) || avgCalories.toFixed(0)} kcal
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Vượt quá mục tiêu
            </p>
            <p className="mt-2 text-xl font-black text-amber-400">
              {weeklyData.filter((d) => d.calories > (d.target ?? avgCalories)).length}d
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Tuần này
            </p>
            <p className="mt-2 text-xl font-black text-emerald-400">
              {(
                weeklyData.reduce((sum, d) => sum + d.calories, 0) / weeklyData.length /
                (weeklyData[0]?.target ?? avgCalories)
              )
                .toFixed(2)
                .split(".")
                .join("%")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
