"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  AlertTriangle,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  ExternalLink,
  Minus,
  Pause,
  Play,
  Plus,
  Save,
  Sparkles,
  Target,
  Timer,
  Trophy,
  Video,
  X,
} from "lucide-react";
import { workoutApi } from "@/lib/workoutApi";
import { gamificationApi } from "@/lib/gamificationApi";
import { getErrorMessage } from "@/lib/errors";
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl, getYouTubeVideoId } from "@/lib/video";
import { RestTimer } from "./RestTimer";
import { ProgressiveOverloadAlert } from "./ProgressiveOverloadAlert";
import type {
  GamificationSummary,
  WorkoutExercise,
  WorkoutExercisePerformance,
  WorkoutSession,
  WorkoutSetLogInput,
} from "@/lib/types";

interface WorkoutLoggerProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  planId?: number;
}

type SetType = "WORKING" | "WARMUP" | "DROPSET" | "FAILURE";

interface WorkoutSetDraft {
  setNumber: number;
  weight: string;
  reps: string;
  rpe: string;
  rir: string;
  setType: SetType;
  restSeconds: number;
  tempo: string;
  supersetGroup: string;
  notes: string;
  completed: boolean;
}

interface WorkoutExerciseDraft {
  id: number;
  exerciseId: number;
  name: string;
  description: string;
  muscleGroup: string;
  equipment: string;
  difficulty: string;
  instructions: string[];
  videoUrl: string;
  targetNotes: string;
  expanded: boolean;
  performance?: WorkoutExercisePerformance;
  sets: WorkoutSetDraft[];
}

interface WorkoutSummary {
  volume: number;
  time: string;
  xp: number;
  level: number;
  nextLevelExp: number;
  experience: number;
}

const SET_TYPES: Array<{ value: SetType; label: string }> = [
  { value: "WORKING", label: "Chính" },
  { value: "WARMUP", label: "Khởi động" },
  { value: "DROPSET", label: "Drop set" },
  { value: "FAILURE", label: "Tới ngưỡng" },
];

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function normalizeInstructions(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      // Fall through to delimiter-based parsing.
    }

    return trimmed
      .split(/\r?\n|(?:\s*\|\s*)|(?:\s*\d+\.\s*)/)
      .map((item) => item.replace(/^[-•]\s*/, "").trim())
      .filter(Boolean);
  }

  return [];
}

function buildExerciseCues(exercise: WorkoutExerciseDraft) {
  const muscle = exercise.muscleGroup.toLowerCase();
  const equipment = exercise.equipment.toLowerCase();
  const cues = ["Siết core trước mỗi rep.", "Kiểm soát pha hạ tạ, không thả rơi tạ.", "Giữ chuyển động ổn định và ưu tiên form hơn số kg."];

  if (muscle.includes("chest") || muscle.includes("nguc")) {
    cues.push("Kéo bả vai về sau, giữ ngực mở và không nhún vai.");
  }
  if (muscle.includes("back") || muscle.includes("lung")) {
    cues.push("Kéo bằng khuỷu tay, không giật bằng lưng dưới.");
  }
  if (muscle.includes("leg") || muscle.includes("quad") || muscle.includes("glute") || muscle.includes("chan")) {
    cues.push("Đầu gối đi theo hướng mũi chân, giữ trọng tâm ổn định.");
  }
  if (muscle.includes("shoulder") || muscle.includes("vai")) {
    cues.push("Không ưỡn lưng quá mức, dùng core để khóa thân người.");
  }
  if (equipment.includes("barbell")) {
    cues.push("Cân thanh đòn và khóa cổ tay trước khi bắt đầu set.");
  }

  return cues.slice(0, 5);
}

function buildCommonMistakes(exercise: WorkoutExerciseDraft) {
  const muscle = exercise.muscleGroup.toLowerCase();
  const mistakes = ["Tăng tạ khi form chưa ổn.", "Rep quá nhanh làm mất cảm giác cơ.", "Nín thở quá lâu hoặc không siết core trước rep nặng."];

  if (muscle.includes("back") || muscle.includes("lung")) {
    mistakes.push("Đạp người hoặc giật tạ thay vì kéo bằng cơ lưng.");
  }
  if (muscle.includes("chest") || muscle.includes("nguc")) {
    mistakes.push("Vai bị đẩy về trước làm tăng áp lực lên khớp vai.");
  }
  if (muscle.includes("leg") || muscle.includes("chan")) {
    mistakes.push("Đầu gối sập vào trong khi đẩy lên.");
  }

  return mistakes.slice(0, 4);
}

function toDraft(workoutExercise: WorkoutExercise): WorkoutExerciseDraft {
  const targetSets = workoutExercise.targetSets || 1;
  return {
    id: workoutExercise.id,
    exerciseId: workoutExercise.exercise.id,
    name: workoutExercise.exercise.name,
    description: workoutExercise.exercise.description || "",
    muscleGroup: workoutExercise.exercise.muscleGroup || "",
    equipment: workoutExercise.exercise.equipment || "",
    difficulty: workoutExercise.exercise.difficulty || "",
    instructions: normalizeInstructions(workoutExercise.exercise.instructions),
    videoUrl: workoutExercise.exercise.videoUrl || "",
    targetNotes: workoutExercise.notes || "",
    expanded: true,
    sets: Array.from({ length: targetSets }, (_unused, index) => ({
      setNumber: index + 1,
      weight: workoutExercise.targetWeight != null ? String(workoutExercise.targetWeight) : "",
      reps: workoutExercise.targetReps != null ? String(workoutExercise.targetReps) : "",
      rpe: "",
      rir: "",
      setType: index === 0 && targetSets > 3 ? "WARMUP" : "WORKING",
      restSeconds: workoutExercise.restSeconds || 90,
      tempo: workoutExercise.tempo || "",
      supersetGroup: workoutExercise.supersetGroup || "",
      notes: "",
      completed: false,
    })),
  };
}

export function WorkoutLogger({ isOpen, onClose, onComplete, planId }: WorkoutLoggerProps) {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [exercises, setExercises] = useState<WorkoutExerciseDraft[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<WorkoutSummary | null>(null);
  const [error, setError] = useState("");
  const [restTimerSeconds, setRestTimerSeconds] = useState<number | null>(null);
  const [overloadAlert, setOverloadAlert] = useState<{ exerciseName: string; weight: number; reps: number; id: number } | null>(null);
  const hydratedRef = useRef(false);

  const resetState = useCallback(() => {
    setSession(null);
    setExercises([]);
    setElapsedTime(0);
    setIsPaused(false);
    setIsSaving(false);
    setSaveState("idle");
    setShowSummary(false);
    setSummaryData(null);
    setError("");
    setRestTimerSeconds(null);
    hydratedRef.current = false;
  }, []);

  const hydrateSession = useCallback(async (nextSession: WorkoutSession) => {
    setSession(nextSession);
    const planExercises = nextSession.workoutPlan?.workoutExercises ?? [];
    const sortedExercises = [...planExercises].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const drafts = sortedExercises.map(toDraft);
    setExercises(drafts);

    const performanceEntries = await Promise.allSettled(
      drafts.map((entry) => workoutApi.getExercisePerformance(entry.exerciseId))
    );

    setExercises((current) =>
      current.map((entry, index) => {
        const result = performanceEntries[index];
        return result.status === "fulfilled" ? { ...entry, performance: result.value } : entry;
      })
    );
    hydratedRef.current = true;
  }, []);

  const startSession = useCallback(async () => {
    setError("");
    try {
      const nextSession = planId ? await workoutApi.startSession(planId) : await workoutApi.startSession();
      await hydrateSession(nextSession);
    } catch (error: unknown) {
      console.error("Failed to start session:", error);
      setError(getErrorMessage(error, "Không thể bắt đầu buổi tập này lúc này."));
    }
  }, [hydrateSession, planId]);

  useEffect(() => {
    if (!isOpen) {
      resetState();
      return;
    }
    if (!session) void startSession();
  }, [isOpen, resetState, session, startSession]);

  useEffect(() => {
    if (!isOpen || !session || showSummary || isPaused) return;
    const timer = window.setInterval(() => setElapsedTime((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, [isOpen, isPaused, session, showSummary]);

  const buildPayload = useCallback((): WorkoutSetLogInput[] => {
    return exercises.flatMap((exercise) =>
      exercise.sets
        .map((set, index) => ({
          workoutExerciseId: exercise.id,
          setNumber: set.setNumber ?? index + 1,
          weight: set.weight !== "" ? Number(set.weight) : null,
          reps: set.reps !== "" ? Number(set.reps) : null,
          rpe: set.rpe !== "" ? Number(set.rpe) : null,
          rir: set.rir !== "" ? Number(set.rir) : null,
          setType: set.setType,
          restSeconds: set.restSeconds || null,
          tempo: set.tempo || null,
          supersetGroup: set.supersetGroup || null,
          notes: set.notes || null,
          completed: set.completed,
        }))
        .filter(
          (set) =>
            set.completed ||
            set.weight != null ||
            set.reps != null ||
            set.rpe != null ||
            set.rir != null ||
            Boolean(set.notes)
        )
    );
  }, [exercises]);

  const saveDraft = useCallback(async () => {
    if (!session || showSummary) return;
    setSaveState("saving");
    try {
      await workoutApi.saveSessionSets(session.id, buildPayload());
      setSaveState("saved");
    } catch (error) {
      console.error("Autosave failed:", getErrorMessage(error, "Tự động lưu thất bại"), error);
      setSaveState("error");
    }
  }, [buildPayload, session, showSummary]);

  useEffect(() => {
    if (!hydratedRef.current || !session || showSummary) return;
    const handle = window.setTimeout(() => void saveDraft(), 900);
    return () => window.clearTimeout(handle);
  }, [exercises, saveDraft, session, showSummary]);

  const completedSetCount = useMemo(
    () => exercises.reduce((total, exercise) => total + exercise.sets.filter((set) => set.completed).length, 0),
    [exercises]
  );

  const totalVolume = useMemo(
    () =>
      exercises.reduce(
        (exerciseTotal, exercise) =>
          exerciseTotal +
          exercise.sets.reduce((setTotal, set) => {
            if (!set.completed) return setTotal;
            return setTotal + (Number.parseFloat(set.weight) || 0) * (Number.parseInt(set.reps, 10) || 0);
          }, 0),
        0
      ),
    [exercises]
  );

  const updateSet = (exerciseIndex: number, setIndex: number, patch: Partial<WorkoutSetDraft>) => {
    setExercises((current) =>
      current.map((exercise, currentExerciseIndex) => {
        if (currentExerciseIndex !== exerciseIndex) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.map((set, currentSetIndex) =>
            currentSetIndex === setIndex ? { ...set, ...patch, setNumber: currentSetIndex + 1 } : set
          ),
        };
      })
    );
  };

  const addSet = (exerciseIndex: number) => {
    setExercises((current) =>
      current.map((exercise, currentExerciseIndex) => {
        if (currentExerciseIndex !== exerciseIndex) return exercise;
        const lastSet = exercise.sets[exercise.sets.length - 1];
        return {
          ...exercise,
          sets: [
            ...exercise.sets,
            {
              setNumber: exercise.sets.length + 1,
              weight: lastSet?.weight || "",
              reps: lastSet?.reps || "",
              rpe: "",
              rir: "",
              setType: "WORKING",
              restSeconds: lastSet?.restSeconds || 90,
              tempo: lastSet?.tempo || "",
              supersetGroup: lastSet?.supersetGroup || "",
              notes: "",
              completed: false,
            },
          ],
        };
      })
    );
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    setExercises((current) =>
      current.map((exercise, currentExerciseIndex) => {
        if (currentExerciseIndex !== exerciseIndex || exercise.sets.length <= 1) return exercise;
        return {
          ...exercise,
          sets: exercise.sets
            .filter((_set, currentSetIndex) => currentSetIndex !== setIndex)
            .map((set, index) => ({ ...set, setNumber: index + 1 })),
        };
      })
    );
  };

  const copyPrevious = (exerciseIndex: number) => {
    const performance = exercises[exerciseIndex]?.performance;
    if (!performance?.recentSets?.length) return;
    const recentSets = performance.recentSets.slice(0, Math.max(1, exercises[exerciseIndex].sets.length));
    setExercises((current) =>
      current.map((exercise, currentExerciseIndex) => {
        if (currentExerciseIndex !== exerciseIndex) return exercise;
        return {
          ...exercise,
          sets: recentSets.map((set, index) => ({
            setNumber: index + 1,
            weight: set.weight != null ? String(set.weight) : "",
            reps: set.reps != null ? String(set.reps) : "",
            rpe: "",
            rir: "",
            setType: (set.setType as SetType) || "WORKING",
            restSeconds: exercise.sets[index]?.restSeconds || 90,
            tempo: exercise.sets[index]?.tempo || "",
            supersetGroup: exercise.sets[index]?.supersetGroup || "",
            notes: "",
            completed: false,
          })),
        };
      })
    );
  };

  const toggleExpanded = (exerciseIndex: number) => {
    setExercises((current) =>
      current.map((exercise, index) => (index === exerciseIndex ? { ...exercise, expanded: !exercise.expanded } : exercise))
    );
  };

  const completeSet = (exerciseIndex: number, setIndex: number) => {
    const set = exercises[exerciseIndex].sets[setIndex];
    const nextCompleted = !set.completed;
    updateSet(exerciseIndex, setIndex, { completed: nextCompleted });
    if (!nextCompleted) return;

    const reps = Number(set.reps);
    const weight = Number(set.weight);
    if (set.restSeconds > 0) setRestTimerSeconds(set.restSeconds);
    if (reps >= 8 && weight > 0) {
      setOverloadAlert({
        exerciseName: exercises[exerciseIndex].name,
        weight,
        reps,
        id: Date.now(),
      });
    }
  };

  const handleFinish = async () => {
    if (!session) return;
    setIsSaving(true);
    setError("");

    try {
      await workoutApi.saveSessionSets(session.id, buildPayload());
      await workoutApi.completeSession(session.id);
      const gamificationData: GamificationSummary = await gamificationApi.getSummary();
      setSummaryData({
        volume: totalVolume,
        time: formatTime(elapsedTime),
        xp: 50,
        level: gamificationData.level,
        nextLevelExp: gamificationData.nextLevelExp,
        experience: gamificationData.experience,
      });
      setShowSummary(true);
      onComplete();
    } catch (error: unknown) {
      console.error("Failed to finish workout:", error);
      setError(getErrorMessage(error, "Không thể lưu buổi tập này."));
    } finally {
      setIsSaving(false);
    }
  };

  const closeWithSummary = () => {
    resetState();
    onClose();
  };

  const closeWithoutSaving = async () => {
    await saveDraft();
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[250] flex flex-col bg-background/95 backdrop-blur-xl">
        {!showSummary ? (
          <>
            <header className="flex h-20 shrink-0 items-center justify-between border-b border-white/5 bg-background/70 px-4 lg:px-8">
              <div className="flex min-w-0 items-center gap-3 lg:gap-4">
                <button onClick={closeWithoutSaving} className="rounded-2xl p-3 text-muted-foreground transition-all hover:bg-white/5">
                  <X size={22} />
                </button>
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-black uppercase tracking-tight lg:text-xl">
                    {session?.workoutPlan?.name || "Buổi tập nhanh"}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <span className="flex items-center gap-1 text-primary">
                      <Clock size={14} /> {formatTime(elapsedTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Save size={13} />
                      {saveState === "saving" ? "Đang tự lưu" : saveState === "saved" ? "Đã lưu" : saveState === "error" ? "Lỗi tự lưu" : "Sẵn sàng"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPaused((current) => !current)}
                  className="hidden rounded-2xl border border-white/10 px-4 py-3 text-xs font-black uppercase tracking-widest text-muted-foreground transition-all hover:text-primary sm:flex sm:items-center sm:gap-2"
                >
                  {isPaused ? <Play size={16} /> : <Pause size={16} />}
                  {isPaused ? "Tiếp tục" : "Tạm dừng"}
                </button>
                <button
                  onClick={handleFinish}
                  disabled={isSaving || !session}
                  className="rounded-2xl bg-primary px-4 py-3 text-xs font-black uppercase tracking-widest text-background shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] disabled:opacity-60 lg:px-8"
                >
                  {isSaving ? "Đang lưu..." : "Kết thúc"}
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-6 pb-32 lg:px-8">
              <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="space-y-5">
                  {error && (
                    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-200">
                      {error}
                    </div>
                  )}

                  {exercises.length === 0 ? (
                    <div className="mt-20 space-y-4 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-muted-foreground">
                        <Plus size={32} />
                      </div>
                      <h3 className="font-bold">Buổi tập này chưa có bài tập nào.</h3>
                      <p className="text-sm text-muted-foreground">Hãy cập nhật giáo án để bộ ghi tập có thể nạp các hiệp tập.</p>
                    </div>
                  ) : (
                    exercises.map((exercise, exerciseIndex) => (
                      <motion.section
                        key={exercise.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 lg:p-5"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <button onClick={() => toggleExpanded(exerciseIndex)} className="flex min-w-0 flex-1 items-start gap-3 text-left">
                            <div className="mt-1 rounded-xl bg-primary/10 p-2 text-primary">
                              {exercise.expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                            <div className="min-w-0">
                              <h3 className="truncate text-lg font-black uppercase tracking-tight">{exercise.name}</h3>
                              <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                {exercise.performance?.bestWeight ? <span>Kỷ lục {exercise.performance.bestWeight}kg x {exercise.performance.bestReps}</span> : <span>Chưa có kỷ lục</span>}
                                {exercise.performance?.bestOneRepMax ? <span>1RM {exercise.performance.bestOneRepMax.toFixed(1)}kg</span> : null}
                                {exercise.sets[0]?.tempo ? <span>Tempo {exercise.sets[0].tempo}</span> : null}
                              </div>
                              {exercise.targetNotes && <p className="mt-2 text-xs text-muted-foreground">{exercise.targetNotes}</p>}
                            </div>
                          </button>

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => copyPrevious(exerciseIndex)}
                              disabled={!exercise.performance?.recentSets?.length}
                              className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-all hover:text-primary disabled:opacity-40"
                            >
                              <Copy size={14} />
                              Copy lần trước
                            </button>
                            <button
                              onClick={() => addSet(exerciseIndex)}
                              className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-all hover:text-primary"
                            >
                              <Plus size={14} />
                              Thêm set
                            </button>
                          </div>
                        </div>

                        {exercise.performance?.recommendation && (
                          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs text-primary">
                            {exercise.performance.recommendation}
                          </div>
                        )}

                        {exercise.expanded && (
                          <div className="mt-5 space-y-4">
                            <ExerciseCoachGuide exercise={exercise} />

                            <div className="w-full lg:overflow-x-auto custom-scrollbar">
                              <div className="space-y-4 lg:min-w-[900px] xl:min-w-full">
                                <div className="hidden workout-log-grid gap-3 px-2 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground lg:grid">
                                  <span>Hiệp</span>
                                  <span>Loại</span>
                                  <span>Tạ</span>
                                  <span>Lần</span>
                                  <span>RPE</span>
                                  <span>RIR</span>
                                  <span>Nghi</span>
                                  <span>Xong</span>
                                  <span />
                                </div>

                                {exercise.sets.map((set, setIndex) => (
                                  <div
                                    key={`${exercise.id}-${set.setNumber}`}
                                    className={`grid workout-log-grid gap-3 rounded-2xl p-3 transition-all lg:items-center ${
                                      set.completed ? "bg-primary/10" : "bg-white/5 hover:bg-white/10"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between lg:block">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground lg:hidden">Hiệp</span>
                                      <span className="text-center text-sm font-black">{setIndex + 1}</span>
                                    </div>
                                    <select
                                      value={set.setType}
                                      onChange={(event) => updateSet(exerciseIndex, setIndex, { setType: event.target.value as SetType })}
                                      className="rounded-xl border border-white/10 bg-slate-950 px-2 py-2 text-xs font-bold outline-none focus:border-primary/40"
                                    >
                                      {SET_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                      ))}
                                    </select>
                                    <NumberInput
                                      value={set.weight}
                                      placeholder="kg"
                                      step={2.5}
                                      onChange={(value) => updateSet(exerciseIndex, setIndex, { weight: value })}
                                      onStep={(delta) => updateSet(exerciseIndex, setIndex, { weight: String(Math.max((Number(set.weight) || 0) + delta, 0)) })}
                                    />
                                    <NumberInput
                                      value={set.reps}
                                      placeholder="reps"
                                      step={1}
                                      onChange={(value) => updateSet(exerciseIndex, setIndex, { reps: value })}
                                      onStep={(delta) => updateSet(exerciseIndex, setIndex, { reps: String(Math.max((Number(set.reps) || 0) + delta, 0)) })}
                                    />
                                    <input
                                      type="number"
                                      min="0"
                                      max="10"
                                      step="0.5"
                                      value={set.rpe}
                                      onChange={(event) => updateSet(exerciseIndex, setIndex, { rpe: event.target.value })}
                                      placeholder="RPE"
                                      className="rounded-xl border border-white/10 bg-slate-950 px-2 py-2 text-center text-xs font-bold outline-none focus:border-primary/40"
                                    />
                                    <input
                                      type="number"
                                      min="0"
                                      max="10"
                                      value={set.rir}
                                      onChange={(event) => updateSet(exerciseIndex, setIndex, { rir: event.target.value })}
                                      placeholder="RIR"
                                      className="rounded-xl border border-white/10 bg-slate-950 px-2 py-2 text-center text-xs font-bold outline-none focus:border-primary/40"
                                    />
                                    <input
                                      type="number"
                                      min="0"
                                      value={set.restSeconds}
                                      onChange={(event) => updateSet(exerciseIndex, setIndex, { restSeconds: Number(event.target.value || 0) })}
                                      className="rounded-xl border border-white/10 bg-slate-950 px-2 py-2 text-center text-xs font-bold outline-none focus:border-primary/40"
                                    />
                                    <button
                                      onClick={() => completeSet(exerciseIndex, setIndex)}
                                      className={`flex h-10 items-center justify-center rounded-xl transition-all ${
                                        set.completed ? "bg-primary text-background" : "bg-white/5 text-muted-foreground hover:text-primary"
                                      }`}
                                    >
                                      <Check size={18} />
                                    </button>
                                    <button
                                      onClick={() => removeSet(exerciseIndex, setIndex)}
                                      disabled={exercise.sets.length <= 1}
                                      className="flex h-10 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-30"
                                    >
                                      <Minus size={16} />
                                    </button>
                                    <input
                                      value={set.notes}
                                      onChange={(event) => updateSet(exerciseIndex, setIndex, { notes: event.target.value })}
                                      placeholder="Ghi chu set, form, dau moi, spotter..."
                                      className="col-span-2 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-primary/40 lg:col-span-9"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.section>
                    ))
                  )}
                </div>

                <aside className="space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest">
                      <Timer size={16} className="text-primary" />
                      Điều khiển buổi tập
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <SessionStat label="Hiệp xong" value={completedSetCount} />
                      <SessionStat label="Khối lượng" value={`${(totalVolume / 1000).toFixed(1)}k`} />
                      <SessionStat label="Thời gian" value={formatTime(elapsedTime)} />
                      <SessionStat label="Bài tập" value={exercises.length} />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-primary">Danh sách kiểm tra chuyên nghiệp</h3>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p>1. Khởi động khớp và làm hiệp khởi động trước khi vào tạ nặng.</p>
                      <p>2. Nếu kỹ thuật vỡ, giảm 5-10% tạ và hoàn thành số lần sạch.</p>
                      <p>RPE 7-8: còn khoảng 2-3 lần trong khả năng.</p>
                      <p>RPE 9: gần tới ngưỡng thất bại, chỉ dùng cho hiệp chính.</p>
                      <p>Nếu khối lượng giảm 2 buổi liên tiếp, cần xem lại phục hồi.</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-amber-500/20 bg-amber-500/[0.04] p-5">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-amber-300">
                      <AlertTriangle size={16} />
                      Khi nao nen dung
                    </h3>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p>Đau nhói ở khớp, mất thăng bằng, tê buốt hoặc choáng.</p>
                      <p>Không có người hỗ trợ khi hiệp nặng gần tới ngưỡng thất bại.</p>
                      <p>Nhịp thở mất kiểm soát hoặc không giữ được thân giữa.</p>
                    </div>
                  </div>
                </aside>
              </div>
            </div>

            {overloadAlert && (
              <div className="fixed bottom-32 left-0 right-0 z-[100] mx-auto flex w-full max-w-2xl justify-center px-4">
                <ProgressiveOverloadAlert
                  key={overloadAlert.id}
                  exerciseName={overloadAlert.exerciseName}
                  weight={overloadAlert.weight}
                  reps={overloadAlert.reps}
                />
              </div>
            )}

            <footer className="fixed bottom-0 left-0 right-0 flex h-24 items-center justify-center gap-4 border-t border-white/5 bg-background/70 px-4 lg:px-8">
              <div className="max-w-[420px] flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center text-xs font-black uppercase tracking-widest text-muted-foreground">
                {completedSetCount} set - {(totalVolume / 1000).toFixed(1)}k kg
              </div>
              <button
                onClick={handleFinish}
                disabled={isSaving || !session}
                className="max-w-[420px] flex-1 rounded-2xl bg-primary py-4 text-xs font-black uppercase tracking-widest text-background shadow-lg shadow-primary/20 disabled:opacity-60"
              >
                Hoàn tất buổi tập
              </button>
            </footer>

            <RestTimer
              isOpen={restTimerSeconds != null}
              initialSeconds={restTimerSeconds || 90}
              onClose={() => setRestTimerSeconds(null)}
            />
          </>
        ) : summaryData ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="m-auto w-full max-w-lg space-y-8 overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/80 p-10 text-center backdrop-blur-3xl"
          >
            <div className="relative mx-auto w-fit">
              <div className="flex h-24 w-24 rotate-12 items-center justify-center rounded-3xl bg-primary text-background shadow-2xl shadow-primary/40">
                <Trophy size={48} strokeWidth={2.5} />
              </div>
              <div className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-background shadow-lg">
                <Sparkles size={20} />
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-4xl font-black uppercase tracking-tight">Hoàn thành</h2>
              <p className="font-medium text-muted-foreground">Buổi tập đã được lưu cùng RPE, ghi chú và khối lượng.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SummaryCard label="Khối lượng" value={`${(summaryData.volume / 1000).toFixed(1)}k kg`} />
              <SummaryCard label="Thời gian" value={summaryData.time} />
              <SummaryCard label="XP" value={`+${summaryData.xp}`} />
              <SummaryCard label="Cấp độ" value={summaryData.level} />
            </div>

            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6">
              <div className="mb-3 flex items-end justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-primary">Tiến độ cấp độ</span>
                <span className="text-sm font-black">{summaryData.experience}/{summaryData.nextLevelExp}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(summaryData.experience / summaryData.nextLevelExp) * 100}%` }}
                  className="h-full bg-primary"
                />
              </div>
            </div>

            <button
              onClick={closeWithSummary}
              className="group flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-white py-5 text-sm font-black uppercase tracking-widest text-background shadow-xl shadow-white/5 transition-all hover:bg-primary hover:text-white"
            >
              Quay về
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        ) : null}
      </div>
    </AnimatePresence>
  );
}

function NumberInput({
  value,
  placeholder,
  step,
  onChange,
  onStep,
}: {
  value: string;
  placeholder: string;
  step: number;
  onChange: (value: string) => void;
  onStep: (delta: number) => void;
}) {
  return (
    <div className="grid grid-cols-[2rem_1fr_2rem] overflow-hidden rounded-xl border border-white/10 bg-slate-950">
      <button 
        type="button" 
        onClick={() => onStep(-step)} 
        className="flex items-center justify-center text-muted-foreground hover:text-primary active:scale-90 transition-transform"
      >
        <Minus size={14} />
      </button>
      <input
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        onChange={(event) => {
          const val = event.target.value;
          if (val === "" || /^[0-9]*\.?[0-9]*$/.test(val)) {
            onChange(val);
          }
        }}
        className="w-full min-w-[3.5rem] border-x border-white/10 bg-transparent px-1 py-2 text-center text-sm font-black text-white outline-none focus:bg-white/5"
      />
      <button 
        type="button" 
        onClick={() => onStep(step)} 
        className="flex items-center justify-center text-muted-foreground hover:text-primary active:scale-90 transition-transform"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

function ExerciseCoachGuide({ exercise }: { exercise: WorkoutExerciseDraft }) {
  const cues = buildExerciseCues(exercise);
  const mistakes = buildCommonMistakes(exercise);
  const instructions = normalizeInstructions(exercise.instructions);
  const videoEmbedUrl = getYouTubeEmbedUrl(exercise.videoUrl, exercise.name);
  const videoThumbnailUrl = getYouTubeThumbnailUrl(exercise.videoUrl);
  const safeInstructions = instructions.length > 0
    ? instructions
    : [
        "Thiết lập vị trí bắt đầu thật chắc và chọn mức tạ có thể kiểm soát.",
        "Thực hiện rep với biên độ an toàn, không đánh đổi form để tăng kg.",
        "Kết thúc set khi tốc độ rep giảm mạnh hoặc form bắt đầu vỡ.",
      ];

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
          <BookOpen size={16} />
          Hướng dẫn bài tập
        </div>
        {videoEmbedUrl ? (
          <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                <Video size={14} />
                Video hướng dẫn
              </div>
              <a
                href={exercise.videoUrl || `https://www.youtube.com/watch?v=${getYouTubeVideoId(videoEmbedUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
              >
                Mở YouTube
                <ExternalLink size={12} />
              </a>
            </div>
            <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
              <iframe
                src={`${videoEmbedUrl}?rel=0&modestbranding=1&playsinline=1`}
                title={`Video hướng dẫn ${exercise.name}`}
                className="absolute inset-0 h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          <div className="mb-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-xs text-muted-foreground">
            Chưa có video riêng cho bài này. App vẫn hiển thị cue và checklist để bạn tập đúng form.
          </div>
        )}
        {exercise.description && (
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{exercise.description}</p>
        )}
        <ol className="space-y-2 text-xs leading-relaxed text-muted-foreground">
          {safeInstructions.slice(0, 5).map((step, index) => (
            <li key={`${step}-${index}`} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-background">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest">
            <Target size={16} className="text-primary" />
            Cue kỹ thuật
          </div>
          <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground">
            {cues.map((cue) => (
              <li key={cue} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{cue}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-rose-300">
            <AlertTriangle size={16} />
            Lỗi thường gặp
          </div>
          <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground">
            {mistakes.map((mistake) => (
              <li key={mistake} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-300" />
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SessionStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 text-xl font-black">{value}</div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-white/5 bg-white/5 p-5">
      <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-primary">{label}</div>
      <div className="text-2xl font-black">{value}</div>
    </div>
  );
}
