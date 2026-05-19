import { apiFetch } from "./api";
import type { WorkoutExercisePerformance, WorkoutPlan, WorkoutSession, WorkoutHistoryItem, WorkoutSetLogInput, WorkoutPlanCreateRequest } from "./types";

export const workoutApi = {
  getPlans: () => apiFetch<WorkoutPlan[]>("/workouts/plans"),

  getTodaysWorkout: () => apiFetch<WorkoutPlan | null>("/workouts/plans/today"),

  createPlan: (plan: WorkoutPlanCreateRequest) =>
    apiFetch<WorkoutPlan>("/workouts/plans", {
      method: "POST",
      body: JSON.stringify(plan),
    }),

  updatePlan: (id: number, plan: WorkoutPlanCreateRequest) =>
    apiFetch<WorkoutPlan>(`/workouts/plans/${id}`, {
      method: "PUT",
      body: JSON.stringify(plan),
    }),

  duplicatePlan: (id: number) =>
    apiFetch<WorkoutPlan>(`/workouts/plans/${id}/duplicate`, { method: "POST" }),

  archivePlan: (id: number) =>
    apiFetch<WorkoutPlan>(`/workouts/plans/${id}/archive`, { method: "POST" }),

  deletePlan: (id: number) =>
    apiFetch<void>(`/workouts/plans/${id}`, { method: "DELETE" }),

  startSession: (planId?: number) =>
    apiFetch<WorkoutSession>(`/workouts/sessions/start${planId ? `?planId=${planId}` : ""}`, {
      method: "POST",
    }),

  completeSession: (sessionId: number) =>
    apiFetch<WorkoutSession>(`/workouts/sessions/${sessionId}/complete`, {
      method: "POST",
    }),

  saveSessionSets: (sessionId: number, sets: WorkoutSetLogInput[]) =>
    apiFetch<WorkoutSession>(`/workouts/sessions/${sessionId}/sets`, {
      method: "PUT",
      body: JSON.stringify({ sets }),
    }),

  getHistory: () => apiFetch<WorkoutHistoryItem[]>("/workouts/sessions/history"),

  getExercisePerformance: (exerciseId: number) =>
    apiFetch<WorkoutExercisePerformance>(`/workouts/exercises/${exerciseId}/performance`),
};
