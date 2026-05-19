import { apiFetch } from "./api";
import type { Exercise, ExercisePageResponse } from "./types";

export type { Exercise, ExercisePageResponse } from "./types";

export const exerciseApi = {
  getExercises: (params: {
    page?: number;
    size?: number;
    muscle?: string;
    level?: string;
    equipment?: string;
    search?: string;
  } = {}) => {
    const searchParams = new URLSearchParams();

    if (params.page !== undefined) searchParams.set("page", String(params.page));
    if (params.size !== undefined) searchParams.set("size", String(params.size));
    if (params.muscle) searchParams.set("muscle", params.muscle);
    if (params.level) searchParams.set("level", params.level);
    if (params.equipment) searchParams.set("equipment", params.equipment);
    if (params.search) searchParams.set("search", params.search);

    const query = searchParams.toString();
    return apiFetch<ExercisePageResponse>(`/exercises${query ? `?${query}` : ""}`);
  },
  getExerciseById: (id: number) => apiFetch<Exercise>(`/exercises/${id}`)
};
