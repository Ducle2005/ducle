"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, Plus, Search, Trash2, X } from "lucide-react";
import { exerciseApi } from "@/lib/exerciseApi";
import { workoutApi } from "@/lib/workoutApi";
import { getErrorMessage } from "@/lib/errors";
import {
  getDayLabel,
  getDifficultyLabel,
  getEquipmentLabel,
  getMuscleGroupLabel,
} from "@/lib/localizedLabels";
import type { Exercise, WorkoutPlan, WorkoutPlanCreateRequest, WorkoutPlanExerciseDraft } from "@/lib/types";

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (plan: WorkoutPlan) => void;
  initialPlan?: WorkoutPlan | null;
}

const DAY_OPTIONS = ["", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const GOAL_OPTIONS = [
  { value: "", label: "Tùy chọn" },
  { value: "HYPERTROPHY", label: "Tăng cơ" },
  { value: "STRENGTH", label: "Tăng sức mạnh" },
  { value: "ENDURANCE", label: "Sức bền" },
  { value: "DELOAD", label: "Giảm tải / phục hồi" },
];

function createDraft(exercise: Exercise, sortOrder: number): WorkoutPlanExerciseDraft {
  return {
    exercise,
    targetSets: 3,
    targetReps: 10,
    targetWeight: null,
    restSeconds: 90,
    tempo: "",
    supersetGroup: "",
    notes: "",
    sortOrder,
  };
}

export function CreatePlanModal({ isOpen, onClose, onCreated, initialPlan }: CreatePlanModalProps) {
  const [catalog, setCatalog] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDay, setScheduledDay] = useState("");
  const [goal, setGoal] = useState("");
  const [programWeek, setProgramWeek] = useState<number | "">("");
  const [selectedExercises, setSelectedExercises] = useState<WorkoutPlanExerciseDraft[]>([]);
  const isEditing = Boolean(initialPlan?.id);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    setError("");
    void exerciseApi
      .getExercises({ page: 0, size: 200 })
      .then((response) => setCatalog(response.content))
      .catch((error: unknown) => {
        console.error("Failed to load exercise catalog:", error);
        setError(getErrorMessage(error, "Không thể tải danh sách bài tập lúc này."));
      })
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setName("");
      setDescription("");
      setScheduledDay("");
      setGoal("");
      setProgramWeek("");
      setSelectedExercises([]);
      setError("");
      setIsSaving(false);
      return;
    }

    if (!initialPlan) return;
    setName(initialPlan.name || "");
    setDescription(initialPlan.description || "");
    setScheduledDay(initialPlan.scheduledDay || "");
    setGoal(initialPlan.goal || "");
    setProgramWeek(initialPlan.programWeek || "");
    setSelectedExercises(
      [...(initialPlan.workoutExercises || [])]
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((entry, index) => ({
          exercise: entry.exercise,
          targetSets: entry.targetSets ?? 3,
          targetReps: entry.targetReps ?? 10,
          targetWeight: entry.targetWeight,
          restSeconds: entry.restSeconds ?? 90,
          tempo: entry.tempo || "",
          supersetGroup: entry.supersetGroup || "",
          notes: entry.notes || "",
          sortOrder: index + 1,
        }))
    );
  }, [initialPlan, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const filteredCatalog = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const selectedIds = new Set(selectedExercises.map((entry) => entry.exercise.id));

    return catalog.filter((exercise) => {
      if (selectedIds.has(exercise.id)) return false;
      if (!needle) return true;
      return [exercise.name, exercise.description, exercise.muscleGroup, exercise.equipment]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [catalog, search, selectedExercises]);

  const addExercise = (exercise: Exercise) => {
    setSelectedExercises((current) => [...current, createDraft(exercise, current.length + 1)]);
  };

  const removeExercise = (exerciseId: number) => {
    setSelectedExercises((current) =>
      current
        .filter((entry) => entry.exercise.id !== exerciseId)
        .map((entry, index) => ({ ...entry, sortOrder: index + 1 }))
    );
  };

  const moveExercise = (exerciseId: number, direction: -1 | 1) => {
    setSelectedExercises((current) => {
      const index = current.findIndex((entry) => entry.exercise.id === exerciseId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next.map((entry, sortIndex) => ({ ...entry, sortOrder: sortIndex + 1 }));
    });
  };

  const updateExercise = (
    exerciseId: number,
    patch: Partial<Omit<WorkoutPlanExerciseDraft, "exercise">>
  ) => {
    setSelectedExercises((current) =>
      current.map((entry) => (entry.exercise.id === exerciseId ? { ...entry, ...patch } : entry))
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Vui lòng đặt tên cho giáo án.");
      return;
    }
    if (selectedExercises.length === 0) {
      setError("Hãy thêm ít nhất một bài tập để tạo giáo án.");
      return;
    }

    setIsSaving(true);
    setError("");

    const payload: WorkoutPlanCreateRequest = {
      name: name.trim(),
      description: description.trim(),
      scheduledDay: scheduledDay || null,
      goal: goal || null,
      programWeek: typeof programWeek === "number" && programWeek > 0 ? programWeek : null,
      workoutExercises: selectedExercises.map((entry, index) => ({
        exercise: { id: entry.exercise.id },
        targetSets: entry.targetSets,
        targetReps: entry.targetReps,
        targetWeight: entry.targetWeight,
        restSeconds: entry.restSeconds || null,
        tempo: entry.tempo || null,
        supersetGroup: entry.supersetGroup || null,
        notes: entry.notes || null,
        sortOrder: index + 1,
      })),
    };

    try {
      const savedPlan = isEditing && initialPlan?.id
        ? await workoutApi.updatePlan(initialPlan.id, payload)
        : await workoutApi.createPlan(payload);
      onCreated(savedPlan);
      onClose();
    } catch (error: unknown) {
      console.error("Failed to save workout plan:", error);
      setError(getErrorMessage(error, "Không thể lưu giáo án tập luyện."));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[240] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/85 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 24 }}
          className="relative grid max-h-[92vh] w-full max-w-7xl grid-cols-1 overflow-y-auto overscroll-contain touch-pan-y rounded-[2rem] border border-white/10 bg-slate-950/95 shadow-2xl lg:grid-cols-[1.05fr_0.95fr] lg:overflow-hidden"
        >
          <section className="border-b border-white/5 p-6 overflow-y-auto lg:border-b-0 lg:border-r lg:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  {isEditing ? "Chỉnh sửa giáo án" : "Tạo giáo án tập luyện"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Thiết lập chương trình, thứ tự bài, nhịp nâng, thời gian nghỉ và ghi chú kỹ thuật.
                </p>
              </div>
              <button onClick={onClose} className="rounded-xl p-3 text-muted-foreground transition-all hover:bg-white/5">
                <X size={20} />
              </button>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextField label="Tên giáo án" value={name} onChange={setName} placeholder="Đẩy thân trên - Sức mạnh" />
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Ngày tập</span>
                <select
                  value={scheduledDay}
                  onChange={(event) => setScheduledDay(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition-all focus:border-primary/40"
                >
                  {DAY_OPTIONS.map((option) => (
                    <option key={option || "ANY"} value={option}>
                      {getDayLabel(option)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Mục tiêu</span>
                <select
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition-all focus:border-primary/40"
                >
                  {GOAL_OPTIONS.map((option) => (
                    <option key={option.value || "NONE"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <MetricInput
                label="Tuần chương trình"
                value={programWeek}
                onChange={(value) => setProgramWeek(value === 0 ? "" : value)}
              />
            </div>

            <label className="mb-5 block space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Mô tả</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-all focus:border-primary/40"
                placeholder="Mục tiêu, giai đoạn, giảm tải hoặc ghi chú riêng cho buổi này."
              />
            </label>

            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary/40"
                placeholder="Tìm bài tập để thêm"
              />
            </div>

            <div className="grid max-h-[38vh] grid-cols-1 gap-3 overflow-y-auto pr-1 md:grid-cols-2">
              {isLoading ? (
                Array.from({ length: 6 }, (_unused, index) => (
                  <div key={index} className="h-28 animate-pulse rounded-2xl bg-white/5" />
                ))
              ) : filteredCatalog.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted-foreground md:col-span-2">
                  Không có bài tập phù hợp với bộ lọc này.
                </div>
              ) : (
                filteredCatalog.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => addExercise(exercise)}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-black">{exercise.name}</h3>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{exercise.description}</p>
                      </div>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-background">
                        <Plus size={18} />
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                        {getMuscleGroupLabel(exercise.muscleGroup)}
                      </span>
                      <span className="rounded-full bg-white/5 px-2 py-1 text-muted-foreground">
                        {getEquipmentLabel(exercise.equipment)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="flex min-h-0 flex-col p-6 lg:p-8">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Trình tạo giáo án</h3>
                <p className="mt-1 text-sm text-muted-foreground">Dùng nút lên/xuống để sắp xếp bài tập.</p>
              </div>
              <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-right">
                <div className="text-[10px] font-black uppercase tracking-widest text-primary">Bài tập</div>
                <div className="text-2xl font-black">{selectedExercises.length}</div>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-200">
                {error}
              </div>
            )}

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
              {selectedExercises.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-8 text-center">
                  <h4 className="text-lg font-black">Chưa chọn bài tập</h4>
                  <p className="mt-2 text-sm text-muted-foreground">Thêm bài từ danh mục để bắt đầu tạo buổi tập.</p>
                </div>
              ) : (
                selectedExercises.map((entry, index) => (
                  <div key={entry.exercise.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-primary">Vị trí {index + 1}</div>
                        <h4 className="text-lg font-black">{entry.exercise.name}</h4>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {getMuscleGroupLabel(entry.exercise.muscleGroup)} - {getDifficultyLabel(entry.exercise.difficulty)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <IconButton disabled={index === 0} onClick={() => moveExercise(entry.exercise.id, -1)}>
                          <ArrowUp size={16} />
                        </IconButton>
                        <IconButton disabled={index === selectedExercises.length - 1} onClick={() => moveExercise(entry.exercise.id, 1)}>
                          <ArrowDown size={16} />
                        </IconButton>
                        <button
                          onClick={() => removeExercise(entry.exercise.id)}
                          className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <MetricInput label="Hiệp" value={entry.targetSets} onChange={(value) => updateExercise(entry.exercise.id, { targetSets: value })} />
                      <MetricInput label="Lần" value={entry.targetReps} onChange={(value) => updateExercise(entry.exercise.id, { targetReps: value })} />
                      <MetricInput
                        label="Tạ"
                        value={entry.targetWeight ?? ""}
                        step="0.5"
                        onChange={(value) => updateExercise(entry.exercise.id, { targetWeight: value === 0 ? null : value })}
                      />
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-3">
                      <MetricInput label="Nghi" value={entry.restSeconds ?? ""} onChange={(value) => updateExercise(entry.exercise.id, { restSeconds: value })} />
                      <TextField label="Nhịp nâng" value={entry.tempo || ""} onChange={(value) => updateExercise(entry.exercise.id, { tempo: value })} placeholder="3-1-1" compact />
                      <TextField label="Nhóm ghép" value={entry.supersetGroup || ""} onChange={(value) => updateExercise(entry.exercise.id, { supersetGroup: value })} placeholder="A1" compact />
                    </div>

                    <label className="mt-3 block space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ghi chú</span>
                      <textarea
                        value={entry.notes || ""}
                        onChange={(event) => updateExercise(entry.exercise.id, { notes: event.target.value })}
                        rows={2}
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm outline-none transition-all focus:border-primary/40"
                        placeholder="Gợi ý kỹ thuật, biên độ, bài thay thế, mức độ nặng..."
                      />
                    </label>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-2xl border border-white/10 px-4 py-4 text-sm font-black uppercase tracking-widest text-muted-foreground transition-all hover:border-primary/30 hover:text-primary"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex-1 rounded-2xl bg-primary px-4 py-4 text-sm font-black uppercase tracking-widest text-background shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] disabled:opacity-60"
              >
                {isSaving ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo giáo án"}
              </button>
            </div>
          </section>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  compact = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  compact?: boolean;
}) {
  return (
    <label className="space-y-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm font-bold outline-none transition-all focus:border-primary/40 ${
          compact ? "py-3" : "py-3.5"
        }`}
      />
    </label>
  );
}

function MetricInput({
  label,
  value,
  onChange,
  step = "1",
}: {
  label: string;
  value: number | "";
  onChange: (value: number) => void;
  step?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        type="number"
        min="0"
        step={step}
        value={value}
        onChange={(event) => onChange(Math.max(Number(event.target.value || 0), 0))}
        className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm font-bold outline-none transition-all focus:border-primary/40"
      />
    </label>
  );
}

function IconButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-primary disabled:opacity-30"
    >
      {children}
    </button>
  );
}
