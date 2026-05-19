import { apiFetch } from "./api";
import type { StagnationInsight, VolumeProgressionItem, WeeklyComparison, WeightTrends } from "./types";

export const analyticsApi = {
  getWeightTrends: () => apiFetch<WeightTrends>("/analytics/weight"),

  logWeight: (weight: number) =>
    apiFetch<unknown>("/analytics/weight", {
      method: "POST",
      body: JSON.stringify({ weight }),
    }),

  getVolumeProgression: () =>
    apiFetch<VolumeProgressionItem[]>("/analytics/volume"),

  getWeeklyComparison: () =>
    apiFetch<WeeklyComparison>("/analytics/weekly"),

  getStagnation: () =>
    apiFetch<StagnationInsight>("/analytics/stagnation"),
};
