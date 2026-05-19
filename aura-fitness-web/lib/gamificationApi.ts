import { apiFetch } from "./api";
import type { Achievement, GamificationSummary } from "./types";

export const gamificationApi = {
  getSummary: () => apiFetch<GamificationSummary>("/gamification/summary"),
  getStats: () => apiFetch<unknown>("/gamification/stats"),
  getAchievements: () => apiFetch<Achievement[]>("/gamification/achievements"),
};
