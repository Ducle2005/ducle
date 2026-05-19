import { apiFetch } from "./api";
import type { DailyNutritionSummary, FoodLog, MealType } from "./types";

type FoodLogInput = {
  foodName: string;
  mealType: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date?: string;
};

export interface WeeklyNutritionDay {
  date: string;
  dayLabel: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  target: number | null;
}

export const nutritionApi = {
  getDaily: (date?: string) => {
    const params = date ? `?date=${date}` : "";
    return apiFetch<DailyNutritionSummary>(`/nutrition/daily${params}`);
  },

  logFood: (log: FoodLogInput) =>
    apiFetch<FoodLog>("/nutrition/log", {
      method: "POST",
      body: JSON.stringify(log),
    }),

  deleteLog: (id: number) =>
    apiFetch<void>(`/nutrition/log/${id}`, { method: "DELETE" }),

  getWeekly: () =>
    apiFetch<WeeklyNutritionDay[]>("/nutrition/weekly"),
};
