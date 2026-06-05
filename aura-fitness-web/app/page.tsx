"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Scale,
  Droplets,
  Zap,
  User,
  ChevronRight,
  TrendingUp,
  Bell,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { MetricCard } from "@/components/MetricCard";
import { CalorieRing } from "@/components/CalorieRing";
import { PublicLanding } from "@/components/PublicLanding";
import { AppLoading } from "@/components/AppLoading";
import { DashboardSkeleton } from "@/components/LoadingSkeleton";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { aiCoachApi } from "@/lib/aiCoachApi";
import { gamificationApi } from "@/lib/gamificationApi";
import { getDayLabel } from "@/lib/localizedLabels";
import { nutritionApi } from "@/lib/nutritionApi";
import { workoutApi } from "@/lib/workoutApi";
import type { DailyNutritionSummary, GamificationSummary, Profile, WorkoutPlan } from "@/lib/types";

const UpdateStatsModal = dynamic(
  () => import("@/components/UpdateStatsModal").then((mod) => mod.UpdateStatsModal),
  { ssr: false }
);
const WorkoutLogger = dynamic(
  () => import("@/components/WorkoutLogger").then((mod) => mod.WorkoutLogger),
  { ssr: false }
);

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [gamification, setGamification] = useState<GamificationSummary | null>(null);
  const [nutrition, setNutrition] = useState<DailyNutritionSummary | null>(null);
  const [todaysPlan, setTodaysPlan] = useState<WorkoutPlan | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    void loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [profileData, gamificationData, nutritionData, adviceData, todaysPlanData] = await Promise.all([
        apiFetch<Profile>("/profile"),
        gamificationApi.getSummary(),
        nutritionApi.getDaily(),
        aiCoachApi.getAdvice(),
        workoutApi.getTodaysWorkout(),
      ]);
      setProfile(profileData);
      setGamification(gamificationData);
      setNutrition(nutritionData);
      setAiAdvice(adviceData || []);
      setTodaysPlan(todaysPlanData);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calorieTarget = profile?.calorieTarget || nutrition?.target || 2000;
  const calorieConsumed = nutrition?.totals.calories || 0;
  const caloriesRemaining = Math.max(calorieTarget - calorieConsumed, 0);
  const calorieProgress = calorieTarget > 0 ? Math.min(calorieConsumed / calorieTarget, 1) : 0;
  const xpPercentage = gamification ? (gamification.experience / gamification.nextLevelExp) * 100 : 0;

  const coachMessage = useMemo(() => {
    if (aiAdvice[0]) {
      return aiAdvice[0];
    }

    return "Hệ thống đang học từ dữ liệu tập luyện và bữa ăn gần đây. Hãy tiếp tục ghi log để mở khóa gợi ý tốt hơn.";
  }, [aiAdvice]);

  const todayExercises = useMemo(
    () => todaysPlan?.workoutExercises ?? [],
    [todaysPlan]
  );

  const openWorkout = () => {
    if (todaysPlan?.id) {
      setIsLoggerOpen(true);
      return;
    }

    router.push("/workout");
  };

  if (authLoading) return <AppLoading />;
  if (!user) return <PublicLanding />;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />

      <main className="lg:ml-20 flex-1 px-4 py-6 pb-24 lg:px-12 lg:py-8 lg:pb-8">
        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="page-enter">
            <header className="mb-8 flex flex-col gap-4 lg:mb-12 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight lg:text-3xl">{t("dashboard")}</h1>
                <p className="mt-1 font-medium text-muted-foreground">
                  {t("welcome")},{" "}
                  <span className="text-primary">{user.name || user.email.split("@")[0]}</span>
                </p>
              </div>

              <div className="flex items-center gap-3 lg:gap-6">
                <div className="glass flex items-center gap-3 rounded-2xl border-primary/30 bg-primary/5 px-3 py-2 lg:px-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-lg font-black text-background shadow-lg shadow-primary/20 lg:h-10 lg:w-10 lg:text-xl">
                    {gamification?.level || 1}
                  </div>
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-primary lg:text-[10px]">{t("level")}</div>
                    <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-white/10 lg:w-24">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${xpPercentage}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-background shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 lg:px-4 lg:text-sm"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Cập nhật chỉ số</span>
                </button>



                <button className="glass hidden rounded-xl p-2.5 text-muted-foreground transition-colors hover:text-primary lg:block">
                  <Bell size={20} />
                </button>
              </div>
            </header>

            <div className="mb-8 grid grid-cols-1 gap-6 lg:mb-12 lg:grid-cols-12 lg:gap-8">
              <div className="glass-card relative flex min-h-[280px] flex-col items-center justify-center overflow-hidden lg:col-span-4 lg:min-h-[320px]">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  {t("daily_calories")}
                </h3>
                <CalorieRing
                  progress={calorieProgress}
                  remaining={caloriesRemaining}
                  label={t("kcal_left")}
                />
                <div className="mt-4 flex gap-8">
                  <div className="text-center">
                    <p className="text-xs font-bold uppercase text-muted-foreground">{t("burned")}</p>
                    <p className="text-lg font-black text-emerald-400">{calorieConsumed}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold uppercase text-muted-foreground">{t("target")}</p>
                    <p className="text-lg font-black text-foreground">{calorieTarget}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:col-span-8 lg:gap-4">
                <MetricCard
                  title={t("body_weight")}
                  value={profile?.weight != null ? profile.weight.toString() : "0"}
                  unit="kg"
                  icon={Scale}
                />
                <MetricCard
                  title={t("muscle_mass")}
                  value={profile?.muscleMass != null ? profile.muscleMass.toString() : "0"}
                  unit="kg"
                  icon={Zap}
                  className="border-primary/20"
                />
                <MetricCard
                  title={t("body_fat")}
                  value={profile?.bodyFat != null ? profile.bodyFat.toString() : "0"}
                  unit="%"
                  icon={TrendingUp}
                />
                <MetricCard
                  title={t("water_intake")}
                  value={profile?.waterIntake != null ? profile.waterIntake.toString() : "0"}
                  unit="L"
                  icon={Droplets}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative min-h-[280px] border-none bg-gradient-to-br from-emerald-500/10 to-transparent glass-card lg:col-span-7 lg:min-h-[300px]"
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-background shadow-lg shadow-primary/20">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{t("ai_coach")}</h3>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-glow" />
                      {t("analyzing")}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="inline-block max-w-[85%] rounded-2xl rounded-tl-none border-primary/10 p-4 glass">
                    <p className="text-sm leading-relaxed">{coachMessage}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => router.push("/ai-coach")}
                      className="rounded-full px-4 py-2 text-xs font-bold transition-all hover:bg-primary hover:text-background glass"
                    >
                      Mở huấn luyện AI
                    </button>
                    <button
                      onClick={() => router.push("/nutrition")}
                      className="rounded-full px-4 py-2 text-xs font-bold transition-all hover:bg-white/5 glass"
                    >
                      Xem dinh dưỡng
                    </button>
                  </div>
                </div>

                <div className="absolute right-4 top-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {t("premium_ai")}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col justify-between glass-card lg:col-span-5"
              >
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-bold">{t("today_session")}</h3>
                    <span className="text-xs font-bold text-primary">
                      {todaysPlan?.scheduledDay ? getDayLabel(todaysPlan.scheduledDay) : t("leg_day")}
                    </span>
                  </div>
                  <div className="max-h-[22rem] space-y-4 overflow-y-auto pr-1">
                    {todayExercises.length > 0 ? (
                      todayExercises.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3"
                        >
                          <p className="font-bold text-sm">{entry.exercise.name}</p>
                          <p className="text-xs font-black uppercase text-muted-foreground">
                            {entry.targetSets || 0} hiệp • {entry.targetReps || 0} lần
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-muted-foreground">
                        Hôm nay chưa có giáo án. Hãy tạo một lịch tập để bắt đầu ghi log.
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={openWorkout}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-black text-background shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  {todaysPlan ? t("start_workout") : "MỞ BÀI TẬP"}
                  <ChevronRight size={20} />
                </button>
              </motion.div>
            </div>
          </div>
        )}

        <UpdateStatsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={profile}
          onUpdate={(newData) => setProfile(newData)}
        />

        <WorkoutLogger
          isOpen={isLoggerOpen}
          onClose={() => setIsLoggerOpen(false)}
          planId={todaysPlan?.id}
          onComplete={loadDashboardData}
        />
      </main>
    </div>
  );
}
