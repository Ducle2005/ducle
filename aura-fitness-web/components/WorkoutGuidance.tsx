"use client";

import Image from "next/image";
import { AlertTriangle, CheckCircle2, Dumbbell, ExternalLink, HeartPulse, ListChecks, PlayCircle, Timer } from "lucide-react";
import type { WorkoutPlan } from "@/lib/types";
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/video";

interface WorkoutGuidanceProps {
  todaysPlan: WorkoutPlan | null;
  plans?: WorkoutPlan[];
}

export function WorkoutGuidance({ todaysPlan, plans = [] }: WorkoutGuidanceProps) {
  const fallbackPlan =
    plans.find((plan) =>
      plan.workoutExercises?.some((entry) => getYouTubeEmbedUrl(entry.exercise.videoUrl))
    ) ??
    plans[0] ??
    null;
  const guidancePlan = todaysPlan ?? fallbackPlan;
  const exerciseCount = guidancePlan?.workoutExercises?.length || 0;
  const mainMuscles = [
    ...new Set((guidancePlan?.workoutExercises || []).map((entry) => entry.exercise.muscleGroup).filter(Boolean)),
  ].slice(0, 3);
  const guidedExercises = (guidancePlan?.workoutExercises || [])
    .map((entry) => ({
      id: entry.id,
      name: entry.exercise.name,
      muscleGroup: entry.exercise.muscleGroup,
      videoUrl: entry.exercise.videoUrl,
      embedUrl: getYouTubeEmbedUrl(entry.exercise.videoUrl),
      thumbnailUrl: getYouTubeThumbnailUrl(entry.exercise.videoUrl),
    }))
    .filter((entry) => entry.embedUrl)
    .slice(0, 4);
  const planBadge = todaysPlan
    ? `${exerciseCount} bài hôm nay`
    : guidancePlan
      ? `${exerciseCount} bài trong giáo án`
      : "Chưa có lịch hôm nay";
  const videoTitle = todaysPlan ? "Video theo giáo án hôm nay" : "Video trong giáo án của bạn";

  return (
    <section className="rounded-3xl border border-orange-400/18 bg-gradient-to-br from-orange-500/[0.075] via-white/[0.025] to-transparent p-5 shadow-2xl shadow-black/20 ring-1 ring-white/[0.025] lg:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight lg:text-xl">Hướng dẫn tập luyện</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Đọc nhanh trước khi bắt đầu để tập đúng form, đúng cường độ và tránh chấn thương.
          </p>
        </div>
        <div className="rounded-2xl border border-orange-400/25 bg-orange-500/10 px-4 py-3 text-xs font-black uppercase tracking-widest text-orange-300 shadow-[0_0_24px_rgba(249,115,22,0.08)]">
          {planBadge}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <GuideCard
          icon={HeartPulse}
          title="Khởi động"
          items={[
            "5-8 phút cardio nhẹ để tăng thân nhiệt.",
            "Làm 1-2 warm-up set trước bài nặng.",
            "Tăng tạ từ từ, không vào set chính quá sớm.",
          ]}
        />
        <GuideCard
          icon={Dumbbell}
          title="Trong set"
          items={[
            "Giữ core chặt và kiểm soát đường tạ.",
            "Dùng biên độ an toàn, không đánh đổi form để tăng kg.",
            "Dừng set khi đau nhói, choáng hoặc mất kiểm soát.",
          ]}
        />
        <GuideCard
          icon={Timer}
          title="Nghỉ giữa hiệp"
          items={[
            "Tăng cơ: nghỉ 60-120 giây.",
            "Tăng sức mạnh: nghỉ 2-4 phút cho set nặng.",
            "Ghi RPE/RIR để lần sau biết nên tăng hay giữ.",
          ]}
        />
        <GuideCard
          icon={ListChecks}
          title="Sau buổi tập"
          items={[
            "Lưu ghi chú về form, đau mỏi và mức nặng.",
            "Ưu tiên protein, nước và ngủ đủ.",
            "Nếu RPE cao liên tiếp, cần deload hoặc giảm volume.",
          ]}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-orange-200/10 bg-[#111827]/70 p-4 shadow-lg shadow-black/10">
          <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
            <CheckCircle2 size={16} />
            Cách đọc RPE/RIR
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
            <p><strong className="text-foreground">RPE 7</strong>: còn khoảng 3 lần.</p>
            <p><strong className="text-foreground">RPE 8</strong>: còn khoảng 2 lần.</p>
            <p><strong className="text-foreground">RPE 9</strong>: còn khoảng 1 lần, dùng cẩn thận.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4 shadow-lg shadow-black/10">
          <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-300">
            <AlertTriangle size={16} />
            Lưu ý an toàn
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            App đưa ra hướng dẫn tập luyện chung. Nếu bạn có chấn thương, bệnh nền, đau bất thường hoặc đang
            tập mức rất nặng, hãy hỏi HLV/người có chuyên môn trực tiếp.
          </p>
        </div>
      </div>

      {guidedExercises.length > 0 && (
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
              <PlayCircle size={16} />
              {videoTitle}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {guidedExercises.length} bài có video
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {guidedExercises.map((exercise) => (
              <article key={exercise.id} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
                <div className="aspect-video w-full">
                  <a
                    href={exercise.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative block h-full w-full overflow-hidden bg-slate-950"
                    aria-label={`Mở video hướng dẫn ${exercise.name}`}
                  >
                    <Image
                      src={exercise.thumbnailUrl || "/onboarding/goal-cut.svg"}
                      alt={`Video hướng dẫn ${exercise.name}`}
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
                    src={exercise.embedUrl}
                    title={`Video hướng dẫn ${exercise.name}`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                <div className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black">{exercise.name}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {exercise.muscleGroup || "Bài tập"}
                    </p>
                  </div>
                  <a
                    href={exercise.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex shrink-0 items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    Mở
                    <ExternalLink size={12} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {mainMuscles.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <span>Trọng tâm hôm nay:</span>
          {mainMuscles.map((muscle) => (
            <span key={muscle} className="rounded-full bg-primary/10 px-2 py-1 text-primary">
              {muscle}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

function GuideCard({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof Dumbbell;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-orange-200/10 bg-[#111827]/70 p-4 shadow-lg shadow-black/10 transition-all hover:border-orange-400/25">
      <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest">
        <Icon size={16} className="text-primary" />
        {title}
      </div>
      <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
