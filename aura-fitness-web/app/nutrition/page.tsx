"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Utensils, Coffee, Sunrise, Sun, Moon } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { AuthPage } from "@/components/AuthPage";
import { MealLogModal } from "@/components/MealLogModal";
import { NutritionWeeklyChart } from "@/components/NutritionWeeklyChart";
import { useAuth } from "@/context/AuthContext";
import { getMealTypeLabel } from "@/lib/localizedLabels";
import { nutritionApi } from "@/lib/nutritionApi";
import type { DailyNutritionSummary, MealType } from "@/lib/types";

const mealSections: Array<{ type: MealType; icon: typeof Sunrise; color: string }> = [
  { type: "BREAKFAST", icon: Sunrise, color: "text-amber-400" },
  { type: "LUNCH", icon: Sun, color: "text-orange-400" },
  { type: "DINNER", icon: Moon, color: "text-indigo-400" },
  { type: "SNACK", icon: Coffee, color: "text-emerald-400" },
];

export default function NutritionPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [nutritionData, setNutritionData] = useState<DailyNutritionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<MealType>("BREAKFAST");

  useEffect(() => { if (!user) return; void loadNutrition(); }, [user]);

  const loadNutrition = async () => {
    try { const data = await nutritionApi.getDaily(); setNutritionData(data); }
    catch (error) { console.error("Failed to load nutrition:", error); }
    finally { setIsLoading(false); }
  };

  const openMealModal = (mealType: MealType) => { setActiveMealType(mealType); setIsLogModalOpen(true); };

  const totals = nutritionData?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const target = nutritionData?.target || 2000;
  const macroTargets = nutritionData?.macroTargets || { protein: 150, carbs: 200, fat: 60 };
  const calPercent = Math.min((totals.calories / target) * 100, 100);
  const meals = useMemo(() => mealSections.map((meal) => ({ ...meal, label: getMealTypeLabel(meal.type) })), []);

  if (authLoading || (user && isLoading)) return null;
  if (!user) return <AuthPage />;

  return (
    <div className="flex min-h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <main className="custom-scrollbar ml-20 h-screen flex-1 overflow-y-auto px-8 py-8 lg:px-12">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Trạm dinh dưỡng</h1>
            <p className="mt-1 font-medium italic text-muted-foreground">Nạp nhiên liệu cho mục tiêu của bạn.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={loadNutrition} className="glass flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all hover:text-primary">
              <Plus size={18} /><span>Tải lại dữ liệu</span>
            </button>
            <button onClick={() => openMealModal(activeMealType)} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-black text-background shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
              <Utensils size={18} /><span>Thêm bữa ăn</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-12 xl:col-span-4">
            <div className="glass-card relative flex min-h-[400px] flex-col items-center justify-center p-8">
              <svg className="h-64 w-64 -rotate-90 transform">
                <circle cx="128" cy="128" r="110" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                <motion.circle cx="128" cy="128" r="110" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="691" initial={{ strokeDashoffset: 691 }} animate={{ strokeDashoffset: 691 - (691 * calPercent) / 100 }} className="text-primary" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-5xl font-black tracking-tight">{Math.max(target - totals.calories, 0)}</span>
                <span className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Calo còn lại</span>
              </div>
              <div className="mt-12 grid w-full grid-cols-3 gap-4">
                <MacroMini label="Đạm" current={totals.protein} target={macroTargets.protein} color="bg-rose-500" />
                <MacroMini label="Carb" current={totals.carbs} target={macroTargets.carbs} color="bg-amber-500" />
                <MacroMini label="Béo" current={totals.fat} target={macroTargets.fat} color="bg-emerald-500" />
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-12 xl:col-span-8">
            {meals.map((meal) => {
              const mealLogs = nutritionData?.logs?.filter((log) => log.mealType === meal.type) || [];
              const mealCalories = mealLogs.reduce((total, log) => total + log.calories, 0);
              return (
                <div key={meal.type} className="glass-card group p-6 transition-all hover:border-white/20">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 ${meal.color}`}><meal.icon size={24} /></div>
                      <div>
                        <h3 className="text-lg font-bold">{meal.label}</h3>
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{mealCalories} kcal</p>
                      </div>
                    </div>
                    <button onClick={() => openMealModal(meal.type)} className="glass flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-primary hover:text-background"><Plus size={20} /></button>
                  </div>
                  <div className="space-y-2">
                    {mealLogs.length === 0 ? (
                      <p className="py-2 text-xs italic text-muted-foreground/50">Chưa có món nào được ghi log.</p>
                    ) : (
                      mealLogs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between rounded-lg border-b border-white/5 px-2 py-2 text-sm transition-colors last:border-0 hover:bg-white/5">
                          <div>
                            <span className="font-medium">{log.foodName}</span>
                            <p className="text-[11px] text-muted-foreground">{Math.round(log.protein)}P • {Math.round(log.carbs)}C • {Math.round(log.fat)}F</p>
                          </div>
                          <span className="font-black opacity-60">{log.calories} kcal</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <NutritionWeeklyChart />

        <MealLogModal isOpen={isLogModalOpen} defaultMealType={activeMealType} onClose={() => setIsLogModalOpen(false)} onLogged={() => { void loadNutrition(); }} />
      </main>
    </div>
  );
}

function MacroMini({ label, current, target, color }: { label: string; current: number; target: number; color: string }) {
  const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 flex h-16 w-1 flex-col justify-end overflow-hidden rounded-full bg-white/5">
        <motion.div initial={{ height: 0 }} animate={{ height: `${percent}%` }} className={`w-full ${color}`} />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="mt-1 text-[10px] font-bold text-primary">{Math.round(current)}g</span>
    </div>
  );
}
