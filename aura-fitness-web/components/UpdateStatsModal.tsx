"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  Scale,
  Zap,
  TrendingUp,
  Droplets,
  Flame,
  Activity,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { getGoalLabel } from "@/lib/localizedLabels";
import type { Goal, Profile } from "@/lib/types";

interface UpdateStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Profile | null;
  onUpdate: (newData: Profile) => void;
}

type ProfileFormState = {
  weight: string;
  bodyFat: string;
  muscleMass: string;
  waterIntake: string;
  calorieTarget: string;
  age: string;
  gender: string;
  height: string;
  goal: Goal;
};

const EMPTY_FORM: ProfileFormState = {
  weight: "",
  bodyFat: "",
  muscleMass: "",
  waterIntake: "",
  calorieTarget: "",
  age: "",
  gender: "",
  height: "",
  goal: "MAINTAIN",
};

export function UpdateStatsModal({ isOpen, onClose, initialData, onUpdate }: UpdateStatsModalProps) {
  const [formData, setFormData] = useState<ProfileFormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        weight: initialData.weight?.toString() ?? "",
        bodyFat: initialData.bodyFat?.toString() ?? "",
        muscleMass: initialData.muscleMass?.toString() ?? "",
        waterIntake: initialData.waterIntake?.toString() ?? "",
        calorieTarget: initialData.calorieTarget?.toString() ?? "",
        age: initialData.age?.toString() ?? "",
        gender: initialData.gender ?? "",
        height: initialData.height?.toString() ?? "",
        goal: initialData.goal ?? "MAINTAIN",
      });
      return;
    }

    setFormData(EMPTY_FORM);
  }, [initialData, isOpen]);

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    const payload = {
      ...formData,
      age: formData.age ? Number.parseInt(formData.age, 10) : null,
      height: formData.height ? Number.parseFloat(formData.height) : null,
      weight: formData.weight ? Number.parseFloat(formData.weight) : null,
      bodyFat: formData.bodyFat ? Number.parseFloat(formData.bodyFat) : null,
      muscleMass: formData.muscleMass ? Number.parseFloat(formData.muscleMass) : null,
      waterIntake: formData.waterIntake ? Number.parseFloat(formData.waterIntake) : null,
      calorieTarget: formData.calorieTarget ? Number.parseInt(formData.calorieTarget, 10) : null,
      goal: formData.goal || "MAINTAIN",
    };

    try {
      const response = await apiFetch<Profile>("/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      onUpdate(response);
      onClose();
    } catch (error: unknown) {
      console.error("Failed to update profile:", error);
      alert(
        getErrorMessage(
          error,
          "Không thể lưu thay đổi. Vui lòng thử lại."
        )
      );
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 glass-card shadow-2xl"
        >
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Activity size={24} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                Cập nhật chỉ số cơ thể
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-white/5"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field
                label="Cân nặng (kg)"
                icon={<Scale size={14} className="text-primary" />}
              >
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(event) => updateField("weight", event.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 glass"
                  placeholder="75.0"
                />
              </Field>

              <Field
                label="Lượng nước (L)"
                icon={<Droplets size={14} className="text-blue-400" />}
              >
                <input
                  type="number"
                  step="0.1"
                  value={formData.waterIntake}
                  onChange={(event) => updateField("waterIntake", event.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 glass"
                  placeholder="2.5"
                />
              </Field>

              <Field
                label="Khối lượng cơ (kg)"
                icon={<Zap size={14} className="text-emerald-400" />}
              >
                <input
                  type="number"
                  step="0.1"
                  value={formData.muscleMass}
                  onChange={(event) => updateField("muscleMass", event.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 glass"
                  placeholder="35.0"
                />
              </Field>

              <Field
                label="Tỷ lệ mỡ (%)"
                icon={<TrendingUp size={14} className="text-amber-400" />}
              >
                <input
                  type="number"
                  step="0.1"
                  value={formData.bodyFat}
                  onChange={(event) => updateField("bodyFat", event.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 glass"
                  placeholder="15.0"
                />
              </Field>

              <Field
                label="Mục tiêu calo (kcal)"
                icon={<Flame size={14} className="text-primary" />}
              >
                <input
                  type="number"
                  value={formData.calorieTarget}
                  onChange={(event) => updateField("calorieTarget", event.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 glass"
                  placeholder="2500"
                />
              </Field>

              <Field
                label="Mục tiêu thể chất"
                icon={<TrendingUp size={14} className="text-primary" />}
              >
                <select
                  value={formData.goal}
                  onChange={(event) => updateField("goal", event.target.value as Goal)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 [&>option]:bg-slate-900 [&>option]:text-white"
                >
                  <option value="MAINTAIN">{getGoalLabel("MAINTAIN")}</option>
                  <option value="CUT">{getGoalLabel("CUT")}</option>
                  <option value="BULK">{getGoalLabel("BULK")}</option>
                </select>
              </Field>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl bg-white/5 py-4 text-xs font-black uppercase tracking-widest transition-all hover:bg-white/10 glass"
              >
                Hủy
              </button>
              <button
                disabled={isSaving}
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-primary py-4 text-xs font-black uppercase tracking-widest text-background shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60"
              >
                {isSaving ? "Đang lưu..." : (
                  <>
                    <Save size={18} />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}
