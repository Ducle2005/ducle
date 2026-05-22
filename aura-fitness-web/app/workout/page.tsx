"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Archive,
  Calendar,
  ChevronRight,
  Clock,
  Copy,
  Dumbbell,
  Edit3,
  ExternalLink,
  Flame,
  Play,
  PlayCircle,
  Plus,
  Trash2,
  Trophy,
  Zap,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { AuthPage } from "@/components/AuthPage";
import { AppLoading } from "@/components/AppLoading";
import { WorkoutSkeleton } from "@/components/LoadingSkeleton";
import { PersonalRecords } from "@/components/PersonalRecords";
import { WorkoutExport } from "@/components/WorkoutExport";
import { WorkoutTemplates } from "@/components/WorkoutTemplates";
import { WorkoutInsights } from "@/components/WorkoutInsights";
import { WorkoutGuidance } from "@/components/WorkoutGuidance";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { gamificationApi } from "@/lib/gamificationApi";
import { getDayLabel } from "@/lib/localizedLabels";
import { workoutApi } from "@/lib/workoutApi";
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/video";
import type { GamificationSummary, WorkoutHistoryItem, WorkoutPlan } from "@/lib/types";

const WorkoutLogger = dynamic(
  () => import("@/components/WorkoutLogger").then((mod) => mod.WorkoutLogger),
  { ssr: false }
);
const CreatePlanModal = dynamic(
  () => import("@/components/CreatePlanModal").then((mod) => mod.CreatePlanModal),
  { ssr: false }
);

function getPlanVideoExercises(plan: WorkoutPlan) {
  return (plan.workoutExercises || [])
    .map((entry) => ({
      id: entry.id,
      name: entry.exercise.name,
      videoUrl: entry.exercise.videoUrl,
      embedUrl: getYouTubeEmbedUrl(entry.exercise.videoUrl),
      thumbnailUrl: getYouTubeThumbnailUrl(entry.exercise.videoUrl),
    }))
    .filter((entry) => entry.embedUrl)
    .slice(0, 3);
}

export default function WorkoutPage() {
  const { user, isLoading: authLoading } = useAuth();
  const toast = useToast();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [todaysPlan, setTodaysPlan] = useState<WorkoutPlan | null>(null);
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [gamification, setGamification] = useState<GamificationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | undefined>();
  const [deletingPlanId, setDeletingPlanId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    void loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [plansData, todaysPlanData, historyData, gamificationData] = await Promise.all([
        workoutApi.getPlans(),
        workoutApi.getTodaysWorkout(),
        workoutApi.getHistory(),
        gamificationApi.getSummary(),
      ]);

      setPlans(plansData ?? []);
      setTodaysPlan(todaysPlanData);
      setHistory(historyData ?? []);
      setGamification(gamificationData);
    } catch (error) {
      console.error("Failed to fetch workout data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startWorkout = (planId: number) => {
    setSelectedPlanId(planId);
    setIsLoggerOpen(true);
  };

  const startRecommendedWorkout = () => {
    if (todaysPlan?.id) {
      startWorkout(todaysPlan.id);
      return;
    }

    if (plans[0]?.id) {
      startWorkout(plans[0].id);
      return;
    }

    setEditingPlan(null);
    setIsCreatePlanOpen(true);
  };

  const handleDeletePlan = async (planId: number) => {
    try {
      await workoutApi.deletePlan(planId);
      setPlans((current) => current.filter((p) => p.id !== planId));
      if (todaysPlan?.id === planId) setTodaysPlan(null);
      toast.success("Đã xóa giáo án thành công!");
    } catch (error) {
      console.error("Failed to delete plan:", error);
      toast.error("Không thể xóa giáo án. Vui lòng thử lại.");
    } finally {
      setDeletingPlanId(null);
    }
  };

  const handleDuplicatePlan = async (planId: number) => {
    try {
      const duplicated = await workoutApi.duplicatePlan(planId);
      setPlans((current) => [...current, duplicated]);
      toast.success("Da nhan ban giao an.");
    } catch (error) {
      console.error("Failed to duplicate plan:", error);
      toast.error("Khong the nhan ban giao an.");
    }
  };

  const handleArchivePlan = async (planId: number) => {
    try {
      await workoutApi.archivePlan(planId);
      setPlans((current) => current.filter((p) => p.id !== planId));
      if (todaysPlan?.id === planId) setTodaysPlan(null);
      toast.success("Da luu tru giao an.");
    } catch (error) {
      console.error("Failed to archive plan:", error);
      toast.error("Khong the luu tru giao an.");
    }
  };

  const recentHistory = history.slice(0, 5);
  const weeklyVolume = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return history.reduce((total, item) => {
      const startedAt = item.startTime ? new Date(item.startTime) : null;
      if (!startedAt || startedAt < sevenDaysAgo) {
        return total;
      }
      return total + (item.totalVolume || 0);
    }, 0);
  }, [history]);

  const totalCompletedSets = useMemo(
    () => history.reduce((total, item) => total + (item.completedSets || 0), 0),
    [history]
  );

  const coachAdvice = useMemo(() => {
    if (history.length === 0) {
      return "Tạo giáo án đầu tiên và hoàn thành một buổi tập để mở khóa gợi ý AI thông minh hơn.";
    }

    if (weeklyVolume >= 12000) {
      return "Khối lượng tập tuần này đang cao. Hãy ưu tiên giấc ngủ, bổ sung nước và một bữa tối giàu protein.";
    }

    return "Nhịp độ đang rất ổn định. Cố gắng hoàn thành thêm một buổi tập chất lượng trong tuần này để giữ đà tiến bộ.";
  }, [history.length, weeklyVolume]);

  if (authLoading) return <AppLoading />;
  if (!user) return <AuthPage />;

  const xpPercentage = gamification ? (gamification.experience / gamification.nextLevelExp) * 100 : 0;

  const formatHistoryDate = (startTime: string) =>
    new Intl.DateTimeFormat("vi-VN", {
      day: "numeric",
      month: "short",
    }).format(new Date(startTime));

  return (
    <div className="flex min-h-screen bg-[#050713] text-foreground">
      <Sidebar />

      <main className="relative flex-1 overflow-x-hidden px-4 py-6 pb-24 lg:ml-20 lg:px-12 lg:py-8 lg:pb-8">
        <div className="pointer-events-none absolute -right-40 -top-44 h-96 w-96 rounded-full bg-orange-500/10 blur-[110px]" />
        <div className="pointer-events-none absolute left-1/4 top-32 h-72 w-72 rounded-full bg-amber-500/5 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-20 right-1/4 h-80 w-80 rounded-full bg-orange-900/10 blur-[120px]" />
        {isLoading ? (
          <WorkoutSkeleton />
        ) : (
          <div className="page-enter relative z-10">
            <header className="mb-8 flex flex-col gap-4 lg:mb-12 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="bg-gradient-to-r from-orange-100 via-white to-orange-200 bg-clip-text text-2xl font-black uppercase tracking-tight text-transparent lg:text-3xl">
                  Trung tâm rèn luyện
                </h1>
                <p className="mt-2 font-medium italic text-orange-100/58">
                  Mồ hôi là nước mắt của mỡ thừa.
                </p>
              </div>

              <div className="flex items-center gap-3 lg:gap-6">
                <div className="glass flex items-center gap-3 rounded-2xl border-orange-400/25 bg-orange-500/[0.07] px-3 py-2 shadow-[0_0_35px_rgba(249,115,22,0.08)] lg:px-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-600 text-lg font-black text-slate-950 shadow-lg shadow-orange-500/25 lg:h-10 lg:w-10 lg:text-xl">
                    {gamification?.level || 1}
                  </div>
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-orange-300 lg:text-[10px]">
                      Cấp độ
                    </div>
                    <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/5 lg:w-24">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${xpPercentage}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-300 shadow-[0_0_14px_rgba(251,146,60,0.65)]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingPlan(null);
                    setIsCreatePlanOpen(true);
                  }}
                  className="glass flex items-center gap-2 rounded-xl border-orange-200/10 px-3 py-2.5 text-xs font-bold transition-all hover:border-orange-400/30 hover:text-orange-200 lg:px-4 lg:text-sm"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Tạo giáo án</span>
                </button>
                <button
                  onClick={startRecommendedWorkout}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-400 via-orange-500 to-amber-600 px-4 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] hover:shadow-orange-500/35 active:scale-95 lg:px-6 lg:text-sm"
                >
                  <Play size={16} fill="currentColor" />
                  <span className="hidden sm:inline">
                    {plans.length > 0 ? "Bắt đầu tập" : "Tạo giáo án"}
                  </span>
                </button>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
              <div className="space-y-6 lg:col-span-8 lg:space-y-8">
                <div className="grid grid-cols-3 gap-3 lg:gap-4">
                  <StatsCard
                    label="Tổng buổi tập"
                    value={history.length}
                    icon={Calendar}
                    color="text-primary"
                  />
                  <StatsCard
                    label="Khối lượng 7 ngày"
                    value={(weeklyVolume / 1000).toFixed(1)}
                    unit="kg"
                    icon={Zap}
                    color="text-amber-400"
                  />
                  <StatsCard
                    label="Hiệp hoàn thành"
                    value={totalCompletedSets}
                    icon={Trophy}
                    color="text-orange-200"
                  />
                </div>

                <WorkoutInsights history={history} plans={plans} />

                <WorkoutGuidance todaysPlan={todaysPlan} plans={plans} />

                <section>
                  <div className="mb-4 flex items-center justify-between lg:mb-6">
                    <h2 className="text-lg font-black uppercase tracking-tight lg:text-xl">
                      Giáo án của tôi
                    </h2>
                    <span className="text-xs font-bold uppercase text-muted-foreground">
                      {plans.length} giáo án
                    </span>
                  </div>

                  {todaysPlan && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 rounded-3xl bg-gradient-to-r from-orange-500/45 via-amber-500/14 to-transparent p-px shadow-[0_0_50px_rgba(249,115,22,0.14)] lg:mb-8"
                    >
                      <div className="glass-card flex flex-col items-start gap-4 bg-[#0b1020]/82 p-4 backdrop-blur-3xl lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:p-6">
                        <div className="flex items-center gap-4 lg:gap-6">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-600 text-slate-950 shadow-xl shadow-orange-500/25 lg:h-16 lg:w-16">
                            <Zap size={24} />
                          </div>
                          <div>
                            <div className="mb-1 text-[9px] font-black uppercase tracking-widest text-primary lg:text-[10px]">
                              Trọng tâm hôm nay •{" "}
                              {getDayLabel(todaysPlan.scheduledDay)}
                            </div>
                            <h3 className="text-xl font-black lg:text-2xl">{todaysPlan.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {todaysPlan.description ||
                                "Được thiết kế riêng để tối ưu hiệu suất tập luyện của bạn."}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => startWorkout(todaysPlan.id)}
                          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-400 via-orange-500 to-amber-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-950 shadow-xl shadow-orange-500/25 transition-all hover:scale-105 hover:shadow-orange-500/35 lg:w-auto lg:px-8 lg:py-4 lg:text-sm"
                        >
                          <Play size={16} fill="currentColor" />
                          Bắt đầu tập
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {plans.length === 0 ? (
                    <div className="glass-card flex flex-col items-center justify-center py-12 text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-muted-foreground">
                        <Dumbbell size={32} />
                      </div>
                      <h3 className="text-lg font-bold">Chưa có giáo án</h3>
                      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                        Hãy tạo giáo án đầu tiên để bắt đầu theo dõi quá trình tập luyện.
                      </p>
                      <button
                        onClick={() => {
                          setEditingPlan(null);
                          setIsCreatePlanOpen(true);
                        }}
                        className="mt-6 flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                      >
                        <Plus size={16} />
                        Tạo ngay
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:gap-4">
                      {plans.map((plan) => {
                        const videoExercises = getPlanVideoExercises(plan);
                        const featuredVideo = videoExercises[0];

                        return (
                        <div
                          key={plan.id}
                          className="glass-card group relative cursor-pointer bg-gradient-to-br from-white/[0.055] to-white/[0.02] p-5 text-left transition-all hover:-translate-y-0.5 hover:border-orange-400/45 hover:shadow-[0_24px_70px_rgba(249,115,22,0.12)] lg:p-6"
                        >
                          <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-all group-hover:opacity-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPlan(plan);
                                setIsCreatePlanOpen(true);
                              }}
                              className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-orange-400/10 hover:text-orange-200"
                              title="Edit plan"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleDuplicatePlan(plan.id);
                              }}
                              className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-white/10 hover:text-foreground"
                              title="Duplicate plan"
                            >
                              <Copy size={15} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleArchivePlan(plan.id);
                              }}
                              className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-amber-500/10 hover:text-amber-300"
                              title="Archive plan"
                            >
                              <Archive size={15} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingPlanId(plan.id);
                              }}
                              className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-rose-500/10 hover:text-rose-400"
                              title="Delete plan"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <div onClick={() => startWorkout(plan.id)}>
                            <div className="mb-4 flex items-start justify-between">
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-400/10 text-orange-300 transition-all group-hover:bg-gradient-to-br group-hover:from-orange-400 group-hover:to-amber-600 group-hover:text-slate-950 group-hover:shadow-lg group-hover:shadow-orange-500/25">
                                <Dumbbell size={24} />
                              </div>
                              <span className="rounded bg-white/5 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                {getDayLabel(plan.scheduledDay)}
                              </span>
                            </div>
                            <h3 className="mb-1 text-lg font-bold transition-colors group-hover:text-orange-200">
                              {plan.name}
                            </h3>
                            <p className="mb-4 line-clamp-1 text-xs text-muted-foreground">
                              {plan.description || "Chưa có mô tả."}
                            </p>
                            <div className="mb-3 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
                              {plan.goal && <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">{plan.goal}</span>}
                              {plan.programWeek && <span className="rounded-full bg-white/5 px-2 py-1 text-muted-foreground">Week {plan.programWeek}</span>}
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              <span>
                                {plan.workoutExercises?.length || 0} bài tập
                              </span>
                              <ChevronRight size={14} />
                            </div>
                          </div>

                          {featuredVideo && (
                            <div
                              className="mt-4 border-t border-white/10 pt-4"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                                  <PlayCircle size={14} />
                                  Video hướng dẫn
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                  {videoExercises.length} bài
                                </span>
                              </div>

                              <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
                                <div className="aspect-video w-full">
                                  <a
                                    href={featuredVideo.videoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group relative block h-full w-full overflow-hidden bg-slate-950"
                                    aria-label={`Mở video hướng dẫn ${featuredVideo.name}`}
                                  >
                                    <Image
                                      src={featuredVideo.thumbnailUrl || "/onboarding/goal-cut.svg"}
                                      alt={`Video hướng dẫn ${featuredVideo.name}`}
                                      fill
                                      sizes="(max-width: 768px) 100vw, 50vw"
                                      unoptimized
                                      className="object-cover opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                                      loading="lazy"
                                      onError={(event) => {
                                        event.currentTarget.src = "/onboarding/goal-cut.svg";
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-background shadow-lg shadow-primary/30 transition-transform group-hover:scale-110">
                                        <PlayCircle size={28} />
                                      </span>
                                    </div>
                                  </a>
                                  <iframe
                                    className="hidden"
                                    src={featuredVideo.embedUrl}
                                    title={`Video hướng dẫn ${featuredVideo.name}`}
                                    loading="lazy"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                  />
                                </div>
                                <div className="flex items-center justify-between gap-3 p-3">
                                  <span className="min-w-0 truncate text-xs font-black">
                                    {featuredVideo.name}
                                  </span>
                                  <a
                                    href={featuredVideo.videoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex shrink-0 items-center gap-1 rounded-lg border border-white/10 px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                                  >
                                    Mở
                                    <ExternalLink size={12} />
                                  </a>
                                </div>
                              </div>

                              {videoExercises.length > 1 && (
                                <div className="mt-2 space-y-1.5">
                                  {videoExercises.slice(1).map((exercise) => (
                                    <a
                                      key={exercise.id}
                                      href={exercise.videoUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-[10px] font-bold text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                                    >
                                      <span className="truncate">{exercise.name}</span>
                                      <ExternalLink size={11} className="shrink-0" />
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                <WorkoutTemplates
                  onTemplateUsed={(plan) => {
                    setPlans((current) => [...current, plan]);
                    if (plan.scheduledDay === new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase()) {
                      setTodaysPlan(plan);
                    }
                    void loadData();
                  }}
                />
              </div>

              <div className="space-y-6 lg:col-span-4 lg:space-y-8">
                <div className="glass-card relative overflow-hidden border-orange-400/20 bg-gradient-to-br from-orange-500/[0.08] via-[#0b1020]/80 to-transparent shadow-[0_18px_70px_rgba(249,115,22,0.08)]">
                  <div className="absolute right-0 top-0 p-3">
                    <Flame size={40} className="text-orange-300/10" />
                  </div>
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest">
                    <Activity size={16} className="text-primary" />
                    Gợi ý huấn luyện
                  </h3>
                  <p className="mb-6 text-sm leading-relaxed">{coachAdvice}</p>
                  <button
                    onClick={startRecommendedWorkout}
                    className="w-full rounded-xl bg-gradient-to-r from-orange-100 to-white py-3 text-xs font-black uppercase tracking-widest text-slate-950 shadow-lg shadow-orange-500/10 transition-all hover:from-orange-400 hover:to-amber-500"
                  >
                    Bắt đầu buổi tập gợi ý
                  </button>
                </div>

                <PersonalRecords history={history} />

                <WorkoutExport history={history} />

                <section>
                  <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-muted-foreground lg:mb-6">
                    Lịch sử gần đây
                  </h2>
                  {recentHistory.length === 0 ? (
                    <div className="rounded-2xl border border-white/5 bg-white/5 p-6 text-sm text-muted-foreground">
                      Các buổi tập đã hoàn thành sẽ hiển thị ở đây.
                    </div>
                  ) : (
                    <div className="space-y-3 lg:space-y-4">
                      {recentHistory.map((item) => (
                        <div
                          key={item.sessionId}
                          className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 transition-all hover:bg-white/10 lg:gap-4 lg:p-4"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-muted-foreground">
                            <Clock size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="truncate text-sm font-bold">{item.planName}</h4>
                            <p className="text-[10px] font-medium text-muted-foreground">
                              {formatHistoryDate(item.startTime)} • {item.durationMinutes || 0}{" "}
                              phút •{" "}
                              {Math.round(item.totalVolume || 0).toLocaleString()}kg
                            </p>
                          </div>
                          <ChevronRight size={16} className="flex-shrink-0 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deletingPlanId !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xl"
              onClick={() => setDeletingPlanId(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card w-full max-w-sm border-white/10 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
                  <Trash2 size={24} />
                </div>
                <h3 className="text-lg font-bold">Xóa giáo án?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Giáo án và tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setDeletingPlanId(null)}
                    className="flex-1 rounded-xl bg-white/5 py-3 text-sm font-bold transition-all hover:bg-white/10"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => handleDeletePlan(deletingPlanId)}
                    className="flex-1 rounded-xl bg-rose-500 py-3 text-sm font-bold text-white transition-all hover:bg-rose-600"
                  >
                    Xóa
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <WorkoutLogger
          isOpen={isLoggerOpen}
          onClose={() => setIsLoggerOpen(false)}
          planId={selectedPlanId}
          onComplete={loadData}
        />

        <CreatePlanModal
          isOpen={isCreatePlanOpen}
          initialPlan={editingPlan}
          onClose={() => {
            setIsCreatePlanOpen(false);
            setEditingPlan(null);
          }}
          onCreated={(plan) => {
            setPlans((current) => {
              const exists = current.some((item) => item.id === plan.id);
              return exists ? current.map((item) => (item.id === plan.id ? plan : item)) : [...current, plan];
            });
            setTodaysPlan((current) => current ?? (plan.scheduledDay === new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase() ? plan : current));
            void loadData();
          }}
        />
      </main>
    </div>
  );
}

function StatsCard({
  label,
  value,
  unit,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: typeof Calendar;
  color: string;
}) {
  return (
    <div className="glass-card group flex min-h-[136px] flex-col justify-between bg-gradient-to-br from-white/[0.06] to-white/[0.018] p-4 ring-1 ring-white/[0.02] transition-all hover:-translate-y-0.5 hover:border-orange-400/35 hover:shadow-[0_24px_70px_rgba(249,115,22,0.12)] lg:p-6">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-orange-400/10 ${color} transition-all group-hover:bg-orange-400/15`}>
        <Icon size={18} />
      </div>
      <div className="mt-3 lg:mt-4">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black tracking-tight text-orange-50 lg:text-2xl">{value}</span>
          {unit && <span className="text-[10px] font-bold uppercase text-muted-foreground">{unit}</span>}
        </div>
        <p className="mt-2 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground lg:text-[10px]">{label}</p>
      </div>
    </div>
  );
}
