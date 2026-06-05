"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  ExternalLink,
  Filter,
  Flame,
  Layers,
  PlayCircle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
  Video,
  X,
} from "lucide-react";
import { AppLoading } from "@/components/AppLoading";
import { AuthPage } from "@/components/AuthPage";
import { ExerciseCard } from "@/components/ExerciseCard";
import { ExerciseImage } from "@/components/ExerciseImage";
import { Sidebar } from "@/components/Sidebar";
import { SimilarExercises } from "@/components/SimilarExercises";
import { useAuth } from "@/context/AuthContext";
import { Exercise, ExercisePageResponse, exerciseApi } from "@/lib/exerciseApi";
import {
  getDifficultyLabel,
  getEquipmentLabel,
  getMuscleGroupLabel,
} from "@/lib/localizedLabels";
import { getYouTubeEmbedUrl, getYouTubeSearchUrl } from "@/lib/video";

const MUSCLE_OPTIONS = [
  "CHEST",
  "BACK",
  "LEGS",
  "SHOULDERS",
  "ARMS",
  "CORE",
  "GLUTES",
  "FULL_BODY",
  "CARDIO",
];

const LEVEL_OPTIONS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
const EQUIPMENT_OPTIONS = [
  "DUMBBELL",
  "BARBELL",
  "BODYWEIGHT",
  "MACHINE",
  "CABLE",
  "KETTLEBELL",
  "RESISTANCE_BAND",
  "MEDICINE_BALL",
];

type FilterKey = "muscle" | "level" | "equipment" | "search";

function SelectFilter({
  label,
  value,
  options,
  getLabel,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  getLabel: (value: string) => string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm font-bold text-orange-50 outline-none transition-all focus:border-primary/60 focus:bg-slate-950 [&>option]:bg-slate-950 [&>option]:text-white"
      >
        <option value="">Tất cả</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {getLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function ExercisesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [filters, setFilters] = useState({
    muscle: "",
    level: "",
    equipment: "",
    search: "",
  });
  const [page, setPage] = useState(0);
  const [exercisePage, setExercisePage] = useState<ExercisePageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const selectedExerciseEmbedUrl = selectedExercise ? getYouTubeEmbedUrl(selectedExercise.videoUrl, selectedExercise.name) : "";
  const selectedExerciseGuideUrl = selectedExercise ? getYouTubeSearchUrl(selectedExercise.name) : "";

  const activeFilters = useMemo(
    () => [filters.muscle, filters.level, filters.equipment, filters.search.trim()].filter(Boolean).length,
    [filters.equipment, filters.level, filters.muscle, filters.search],
  );

  const loadExercises = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await exerciseApi.getExercises({
        page,
        size: 12,
        muscle: filters.muscle || undefined,
        level: filters.level || undefined,
        equipment: filters.equipment || undefined,
        search: filters.search.trim() || undefined,
      });
      setExercisePage(data);
    } catch (error) {
      console.error("Failed to load exercises:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters.equipment, filters.level, filters.muscle, filters.search, page]);

  useEffect(() => {
    if (user) {
      void loadExercises();
    }
  }, [loadExercises, user]);

  const updateFilter = (key: FilterKey, value: string) => {
    setPage(0);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => {
    setPage(0);
    setFilters({ muscle: "", level: "", equipment: "", search: "" });
  };

  if (authLoading || (user && isLoading && !exercisePage)) return <AppLoading />;
  if (!user) return <AuthPage mode="login-only" />;

  const visibleCount = exercisePage?.content.length ?? 0;
  const totalCount = exercisePage?.totalElements ?? 0;
  const totalPages = Math.max(exercisePage?.totalPages ?? 1, 1);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />

      <main className="relative flex-1 overflow-x-hidden px-4 py-6 pb-24 sm:px-8 lg:ml-20 lg:px-12 lg:py-8 lg:pb-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_24%_0%,rgba(249,115,22,0.22),transparent_36%),radial-gradient(circle_at_78%_12%,rgba(251,146,60,0.13),transparent_32%)]" />

        <div className="relative mx-auto max-w-7xl">
          <section className="mb-8 overflow-hidden rounded-[2rem] border border-orange-500/15 bg-slate-950/70 shadow-[0_24px_90px_rgba(0,0,0,0.38)]">
            <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[1.15fr_0.85fr] xl:p-10">
              <div className="flex flex-col justify-between gap-8">
                <div>
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-primary shadow-[0_0_32px_rgba(249,115,22,0.12)]">
                    <Dumbbell size={14} />
                    Thư viện động tác
                  </div>
                  <h1 className="max-w-3xl text-4xl font-black tracking-tight text-orange-50 sm:text-5xl">
                    Chọn bài tập chuẩn form, đúng nhóm cơ, đúng mục tiêu.
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                    Kho bài tập được phân loại theo nhóm cơ, dụng cụ và cấp độ để bạn xây giáo án nhanh hơn,
                    theo dõi hướng dẫn rõ hơn và giữ trải nghiệm tập luyện nhất quán.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Layers size={18} />
                    </div>
                    <div className="text-2xl font-black">{totalCount}</div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                      Bài tập
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-400/15 text-orange-300">
                      <Target size={18} />
                    </div>
                    <div className="text-2xl font-black">{MUSCLE_OPTIONS.length}</div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                      Nhóm cơ
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
                      <Filter size={18} />
                    </div>
                    <div className="text-2xl font-black">{activeFilters}</div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                      Bộ lọc bật
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative hidden min-h-[360px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(145deg,#171b28,#070a13_58%,#2a1207)] p-6 shadow-inner xl:block">
                <div className="absolute right-8 top-8 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                      Chế độ huấn luyện
                    </span>
                    <Sparkles className="text-primary" size={20} />
                  </div>
                  <div className="space-y-4">
                    {["Vai", "Lưng", "Chân"].map((label, index) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-white/10 bg-slate-950/62 p-4 shadow-[0_14px_40px_rgba(0,0,0,0.24)]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black">{label}</span>
                          <span className="text-xs font-black text-primary">{index + 3} bài</span>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-orange-300 shadow-[0_0_20px_rgba(249,115,22,0.35)]"
                            style={{ width: `${88 - index * 18}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Gợi ý</div>
                    <p className="mt-2 text-sm font-bold text-orange-50">
                      Lọc theo dụng cụ bạn có, sau đó mở hướng dẫn để kiểm tra biên độ và nhịp tập.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-7 rounded-3xl border border-white/10 bg-slate-950/72 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:p-5">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-background shadow-lg shadow-primary/20">
                  <SlidersHorizontal size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight">Bộ lọc thông minh</h2>
                  <p className="text-sm text-muted-foreground">
                    Đang hiển thị <span className="font-bold text-orange-50">{visibleCount}</span> trên{" "}
                    <span className="font-bold text-orange-50">{totalCount}</span> bài tập.
                  </p>
                </div>
              </div>
              <button
                onClick={clearFilters}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              >
                <RefreshCw size={14} />
                Đặt lại
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_0.85fr_0.85fr]">
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                  Tìm kiếm
                </span>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                  <input
                    value={filters.search}
                    onChange={(event) => updateFilter("search", event.target.value)}
                    placeholder="Tìm theo tên bài, nhóm cơ hoặc mô tả"
                    className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 pl-12 pr-4 text-sm font-bold text-orange-50 outline-none transition-all placeholder:text-muted-foreground focus:border-primary/60 focus:bg-slate-950"
                  />
                </div>
              </label>

              <SelectFilter
                label="Cấp độ"
                value={filters.level}
                options={LEVEL_OPTIONS}
                getLabel={getDifficultyLabel}
                onChange={(value) => updateFilter("level", value)}
              />

              <SelectFilter
                label="Dụng cụ"
                value={filters.equipment}
                options={EQUIPMENT_OPTIONS}
                getLabel={getEquipmentLabel}
                onChange={(value) => updateFilter("equipment", value)}
              />
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => updateFilter("muscle", "")}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition-all ${
                  filters.muscle
                    ? "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-primary/30 hover:text-primary"
                    : "border-primary/50 bg-primary text-background shadow-lg shadow-primary/20"
                }`}
              >
                Tất cả
              </button>
              {MUSCLE_OPTIONS.map((muscle) => (
                <button
                  key={muscle}
                  onClick={() => updateFilter("muscle", muscle)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition-all ${
                    filters.muscle === muscle
                      ? "border-primary/50 bg-primary text-background shadow-lg shadow-primary/20"
                      : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-primary/30 hover:text-primary"
                  }`}
                >
                  {getMuscleGroupLabel(muscle)}
                </button>
              ))}
            </div>
          </section>

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-orange-50">Danh sách bài tập</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Trang {(exercisePage?.page ?? 0) + 1} / {totalPages}
              </p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
              <Flame size={14} />
              Sẵn sàng tập
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_unused, index) => (
                <div key={index} className="h-[390px] rounded-3xl border border-white/10 bg-white/[0.04] skeleton" />
              ))}
            </div>
          ) : visibleCount === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-950/72 p-8 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BookOpen size={28} />
              </div>
              <h2 className="text-2xl font-black">Không tìm thấy bài tập</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                Hãy thử bỏ bớt bộ lọc hoặc dùng từ khóa rộng hơn để tìm thêm động tác phù hợp.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {exercisePage?.content.map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} onSelect={setSelectedExercise} />
              ))}
            </div>
          )}

          <div className="mt-9 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((current) => Math.max(current - 1, 0))}
              disabled={!exercisePage?.hasPrevious}
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 px-5 text-sm font-black uppercase tracking-[0.18em] text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Trước
            </button>
            <button
              onClick={() => setPage((current) => current + 1)}
              disabled={!exercisePage?.hasNext}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-orange-400 px-5 text-sm font-black uppercase tracking-[0.18em] text-background shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Tiếp
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {selectedExercise && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-950/82 p-4 backdrop-blur-xl sm:p-6"
            >
              <motion.div
                initial={{ y: 24, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 24, opacity: 0, scale: 0.98 }}
                className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-orange-500/20 bg-[#090d18] shadow-[0_28px_120px_rgba(0,0,0,0.62)]"
              >
                <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="relative min-h-[320px] overflow-hidden bg-slate-950 lg:min-h-[620px]">
                    <ExerciseImage
                      exercise={selectedExercise}
                      alt={selectedExercise.name}
                      sizes="(max-width: 1024px) 100vw, 46vw"
                      priority
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090d18] via-[#090d18]/30 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="mb-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-background">
                          {getMuscleGroupLabel(selectedExercise.muscleGroup)}
                        </span>
                        <span className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-orange-50">
                          {getDifficultyLabel(selectedExercise.difficulty)}
                        </span>
                      </div>
                      <h2 className="text-3xl font-black tracking-tight text-orange-50 sm:text-4xl">
                        {selectedExercise.name}
                      </h2>
                    </div>
                    <button
                      onClick={() => setSelectedExercise(null)}
                      aria-label="Đóng chi tiết bài tập"
                      className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-950/82 text-white transition-all hover:border-primary/50 hover:bg-primary hover:text-background"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-7 p-6 sm:p-8">
                    <div>
                      <div className="mb-4 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          <Dumbbell size={13} />
                          {getEquipmentLabel(selectedExercise.equipment)}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          <BookOpen size={13} />
                          {selectedExercise.instructions.length} bước
                        </span>
                      </div>
                      <p className="text-sm leading-7 text-muted-foreground">{selectedExercise.description}</p>
                    </div>

                    {selectedExercise && (
                      <div className="overflow-hidden rounded-3xl border border-primary/20 bg-slate-950/70 shadow-[0_16px_55px_rgba(0,0,0,0.3)]">
                        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-primary">
                            <Video size={16} />
                            Video hướng dẫn
                          </div>
                          <a
                            href={selectedExerciseEmbedUrl ? selectedExercise.videoUrl : selectedExerciseGuideUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                          >
                            {selectedExerciseEmbedUrl ? "Mở YouTube" : "Tìm YouTube"}
                            <ExternalLink size={12} />
                          </a>
                        </div>
                        {selectedExerciseEmbedUrl ? (
                          <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                            <iframe
                              key={`${selectedExercise.id}-${selectedExerciseEmbedUrl}`}
                              src={`${selectedExerciseEmbedUrl}?rel=0&modestbranding=1&playsinline=1`}
                              title={`Video hướng dẫn ${selectedExercise.name}`}
                              className="absolute inset-0 h-full w-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              referrerPolicy="strict-origin-when-cross-origin"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <a
                            href={selectedExerciseGuideUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Tìm video hướng dẫn ${selectedExercise.name}`}
                            className="group relative block aspect-video w-full overflow-hidden bg-slate-950"
                          >
                            <ExerciseImage
                              exercise={selectedExercise}
                              alt={`Video hướng dẫn ${selectedExercise.name}`}
                              sizes="(max-width: 1024px) 100vw, 50vw"
                              className="object-cover opacity-72 transition duration-500 group-hover:scale-105 group-hover:opacity-95"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
                              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-primary to-orange-300 text-background shadow-lg shadow-primary/30 transition-transform group-hover:scale-110">
                                <PlayCircle size={30} fill="currentColor" />
                              </span>
                              <span className="px-6 text-xs font-black uppercase tracking-[0.2em] text-orange-100">
                                Tìm video hướng dẫn phù hợp
                              </span>
                            </div>
                          </a>
                        )}
                      </div>
                    )}

                    <div>
                      <h3 className="mb-4 text-sm font-black uppercase tracking-[0.24em] text-primary">
                        Hướng dẫn thực hiện
                      </h3>
                      <ol className="space-y-3">
                        {selectedExercise.instructions.map((step, index) => (
                          <li
                            key={`${selectedExercise.id}-${index}`}
                            className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-muted-foreground"
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-black text-background">
                              {index + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {selectedExercise && (
                      <a
                        href={selectedExerciseEmbedUrl ? selectedExercise.videoUrl : selectedExerciseGuideUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-orange-400 px-5 text-sm font-black uppercase tracking-[0.18em] text-background shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
                      >
                        <PlayCircle size={16} />
                        {selectedExerciseEmbedUrl ? "Mở trên YouTube" : "Tìm video hướng dẫn"}
                      </a>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/10 p-6 sm:p-8">
                  <SimilarExercises exercise={selectedExercise} onSelect={setSelectedExercise} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
