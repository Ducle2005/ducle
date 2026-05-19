"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Utensils, X } from "lucide-react";
import { nutritionApi } from "@/lib/nutritionApi";
import { getErrorMessage } from "@/lib/errors";
import { getMealTypeLabel } from "@/lib/localizedLabels";
import type { FoodLog, MealType } from "@/lib/types";

interface MealLogModalProps {
  isOpen: boolean;
  defaultMealType?: MealType;
  onClose: () => void;
  onLogged: (log: FoodLog) => void;
}

const MEAL_TYPES: MealType[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

export function MealLogModal({ isOpen, defaultMealType = "BREAKFAST", onClose, onLogged }: MealLogModalProps) {
  const [foodName, setFoodName] = useState("");
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [calories, setCalories] = useState("350");
  const [protein, setProtein] = useState("30");
  const [carbs, setCarbs] = useState("25");
  const [fat, setFat] = useState("10");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setMealType(defaultMealType);
  }, [defaultMealType, isOpen]);

  useEffect(() => {
    if (isOpen) return;

    setFoodName("");
    setMealType(defaultMealType);
    setCalories("350");
    setProtein("30");
    setCarbs("25");
    setFat("10");
    setError("");
    setIsSaving(false);
  }, [defaultMealType, isOpen]);

  const handleSubmit = async () => {
    if (!foodName.trim()) {
      setError("Vui lòng nhập tên món ăn.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const log = await nutritionApi.logFood({
        foodName: foodName.trim(),
        mealType,
        calories: Number.parseInt(calories, 10) || 0,
        protein: Number.parseFloat(protein) || 0,
        carbs: Number.parseFloat(carbs) || 0,
        fat: Number.parseFloat(fat) || 0,
      });
      onLogged(log);
      onClose();
    } catch (error: unknown) {
      console.error("Failed to log food:", error);
      setError(
        getErrorMessage(
          error,
          "Không thể lưu bữa ăn này lúc này."
        )
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[230] flex items-center justify-center p-4">
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
          className="relative w-full max-w-xl rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-2xl"
        >
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-background">
                <Utensils size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  Ghi bữa ăn
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Thêm calo và chỉ số dinh dưỡng vào bảng theo dõi hôm nay.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-3 text-muted-foreground transition-all hover:bg-white/5"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Tên món ăn
              </span>
              <input
                value={foodName}
                onChange={(event) => setFoodName(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-all focus:border-primary/40"
                placeholder="Cơm gà nướng"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Loại bữa ăn
              </span>
              <select
                value={mealType}
                onChange={(event) => setMealType(event.target.value as MealType)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition-all focus:border-primary/40 [&>option]:bg-slate-900 [&>option]:text-white"
              >
                {MEAL_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {getMealTypeLabel(option)}
                  </option>
                ))}
              </select>
            </label>

            <MacroInput label="Calo" value={calories} onChange={setCalories} />
            <MacroInput label="Protein (g)" value={protein} onChange={setProtein} />
            <MacroInput label="Carb (g)" value={carbs} onChange={setCarbs} />
            <MacroInput label="Chất béo (g)" value={fat} onChange={setFat} />
          </div>

          <div className="mt-8 flex gap-3">
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
                {isSaving ? "Đang lưu..." : "Lưu bữa ăn"}
              </button>
            </div>
          </motion.div>
      </div>
    </AnimatePresence>
  );
}

function MacroInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        min="0"
        step="0.1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-all focus:border-primary/40"
      />
    </label>
  );
}
