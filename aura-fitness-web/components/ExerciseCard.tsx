"use client";

import { BookOpen, Dumbbell, PlayCircle } from "lucide-react";
import { ExerciseImage } from "@/components/ExerciseImage";
import { Exercise } from "@/lib/exerciseApi";
import { getDifficultyLabel, getEquipmentLabel, getMuscleGroupLabel } from "@/lib/localizedLabels";

interface ExerciseCardProps {
  exercise: Exercise;
  onSelect: (exercise: Exercise) => void;
}

export function ExerciseCard({ exercise, onSelect }: ExerciseCardProps) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-950/72 shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-[0_24px_80px_rgba(249,115,22,0.14)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
        <ExerciseImage
          exercise={exercise}
          alt={exercise.name}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/32 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-background shadow-lg shadow-primary/25">
            {getMuscleGroupLabel(exercise.muscleGroup)}
          </span>
          <span className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-orange-50 backdrop-blur-md">
            {getDifficultyLabel(exercise.difficulty)}
          </span>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <h3 className="line-clamp-1 text-xl font-black tracking-tight text-orange-50">{exercise.name}</h3>
          <p className="mt-2 min-h-[2.75rem] line-clamp-2 text-sm leading-6 text-muted-foreground">
            {exercise.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <Dumbbell size={16} />
            </div>
            <div className="truncate text-xs font-black uppercase tracking-[0.16em] text-orange-50">
              {getEquipmentLabel(exercise.equipment)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-orange-400/12 text-orange-300">
              <BookOpen size={16} />
            </div>
            <div className="text-xs font-black uppercase tracking-[0.16em] text-orange-50">
              {exercise.instructions.length} bước
            </div>
          </div>
        </div>

        <button
          onClick={() => onSelect(exercise)}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-orange-400 text-sm font-black uppercase tracking-[0.18em] text-background shadow-lg shadow-primary/25 transition-all hover:scale-[1.015] active:scale-95"
        >
          <PlayCircle size={17} />
          Xem hướng dẫn
        </button>
      </div>
    </article>
  );
}
