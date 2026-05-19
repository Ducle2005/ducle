"use client";

import { useState } from "react";
import { Plus, Zap, ArrowRight, Loader2 } from "lucide-react";
import { exerciseApi } from "@/lib/exerciseApi";
import { workoutApi } from "@/lib/workoutApi";
import { useToast } from "@/context/ToastContext";
import type { WorkoutPlan } from "@/lib/types";

interface WorkoutTemplatesProps {
  onTemplateUsed: (plan: WorkoutPlan) => void;
}

const TEMPLATES = [
  {
    name: "Push Day (Ngực, Vai, Tay Sau)",
    description: "Giáo án tập trung phát triển thân trên phía trước.",
    scheduledDay: "MONDAY",
    exercises: [
      { nameMatch: "Bench Press", sets: 4, reps: 8 },
      { nameMatch: "Overhead Press", sets: 3, reps: 10 },
      { nameMatch: "Incline Dumbbell Press", sets: 3, reps: 10 },
      { nameMatch: "Tricep Extension", sets: 3, reps: 12 },
      { nameMatch: "Lateral Raise", sets: 4, reps: 15 },
    ],
    color: "from-blue-500/20 to-transparent",
    iconColor: "text-blue-500",
  },
  {
    name: "Pull Day (Lưng, Tay Trước)",
    description: "Xây dựng tấm lưng rộng và bắp tay cắt nét.",
    scheduledDay: "WEDNESDAY",
    exercises: [
      { nameMatch: "Deadlift", sets: 4, reps: 6 },
      { nameMatch: "Pull Up", sets: 3, reps: 8 },
      { nameMatch: "Barbell Row", sets: 3, reps: 10 },
      { nameMatch: "Face Pull", sets: 3, reps: 15 },
      { nameMatch: "Bicep Curl", sets: 4, reps: 12 },
    ],
    color: "from-emerald-500/20 to-transparent",
    iconColor: "text-emerald-500",
  },
  {
    name: "Legs Day (Đùi, Mông, Bắp chân)",
    description: "Giáo án cường độ cao cho bệ phóng sức mạnh cơ thể.",
    scheduledDay: "FRIDAY",
    exercises: [
      { nameMatch: "Squat", sets: 4, reps: 8 },
      { nameMatch: "Leg Press", sets: 3, reps: 10 },
      { nameMatch: "Romanian Deadlift", sets: 3, reps: 10 },
      { nameMatch: "Leg Extension", sets: 3, reps: 12 },
      { nameMatch: "Calf Raise", sets: 4, reps: 15 },
    ],
    color: "from-rose-500/20 to-transparent",
    iconColor: "text-rose-500",
  },
];

export function WorkoutTemplates({ onTemplateUsed }: WorkoutTemplatesProps) {
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const toast = useToast();

  const handleUseTemplate = async (template: typeof TEMPLATES[0], index: number) => {
    setLoadingIndex(index);
    try {
      const { content: catalog } = await exerciseApi.getExercises({ page: 0, size: 200 });

      const workoutExercises = template.exercises
        .map((tplEx, i) => {
          // Find closest matching exercise by name
          const match = catalog.find((e) => e.name.toLowerCase().includes(tplEx.nameMatch.toLowerCase()));
          if (!match) return null;
          return {
            exercise: { id: match.id },
            targetSets: tplEx.sets,
            targetReps: tplEx.reps,
            targetWeight: null,
            sortOrder: i + 1,
          };
        })
        .filter((e): e is NonNullable<typeof e> => e !== null);

      if (workoutExercises.length === 0) {
        toast.error("Không tìm thấy bài tập phù hợp trong cơ sở dữ liệu.");
        setLoadingIndex(null);
        return;
      }

      const createdPlan = await workoutApi.createPlan({
        name: template.name,
        description: template.description,
        scheduledDay: template.scheduledDay,
        workoutExercises,
      });

      toast.success(`Đã thêm giáo án ${template.name}!`);
      onTemplateUsed(createdPlan);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi tạo giáo án từ template.");
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <section className="mt-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight lg:text-xl">
            Giáo án mẫu (Templates)
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">Các giáo án chuẩn chuyên gia cho bạn.</p>
        </div>
        <Zap size={24} className="text-primary" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {TEMPLATES.map((template, index) => (
          <div
            key={template.name}
            className={`glass-card relative overflow-hidden bg-gradient-to-br ${template.color} p-5 transition-all hover:scale-[1.02]`}
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
              <Zap size={20} className={template.iconColor} />
            </div>
            <h3 className="mb-2 text-sm font-bold leading-tight">{template.name}</h3>
            <p className="mb-4 text-[10px] text-muted-foreground line-clamp-2">
              {template.description}
            </p>
            <ul className="mb-6 space-y-1">
              {template.exercises.map((ex) => (
                <li key={ex.nameMatch} className="text-[10px] font-medium text-white/70">
                  • {ex.nameMatch} ({ex.sets}x{ex.reps})
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUseTemplate(template, index)}
              disabled={loadingIndex !== null}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-primary/20 hover:text-primary disabled:opacity-50"
            >
              {loadingIndex === index ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <Plus size={14} />
                  Sử dụng ngay
                  <ArrowRight size={14} className="opacity-0 transition-opacity group-hover:opacity-100" />
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
