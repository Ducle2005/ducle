"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, TrendingDown, TrendingUp, X } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface WeightLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeight?: number;
  onLogged: () => void;
}

export function WeightLogModal({ isOpen, onClose, currentWeight, onLogged }: WeightLogModalProps) {
  const [weight, setWeight] = useState(currentWeight?.toString() || "");
  const [isSaving, setIsSaving] = useState(false);

  const diff = currentWeight && weight ? parseFloat(weight) - currentWeight : 0;

  const handleSubmit = async () => {
    if (!weight || isNaN(parseFloat(weight))) return;

    setIsSaving(true);
    try {
      await apiFetch("/analytics/weight", {
        method: "POST",
        body: JSON.stringify({ weight: parseFloat(weight) }),
      });

      // Also update profile weight
      await apiFetch("/profile", {
        method: "PUT",
        body: JSON.stringify({ weight: parseFloat(weight) }),
      });

      onLogged();
      onClose();
    } catch (error) {
      console.error("Failed to log weight:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            className="glass-card w-full max-w-md border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-background">
                  <Scale size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Cập nhật cân nặng</h3>
                  <p className="text-xs text-muted-foreground">Ghi lại cân nặng hôm nay</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-xl p-2 text-muted-foreground hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Nhập cân nặng"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-center text-4xl font-black tracking-tight transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">
                  kg
                </span>
              </div>

              {currentWeight && weight && parseFloat(weight) !== currentWeight && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 flex items-center justify-center gap-2 text-sm font-bold ${
                    diff > 0 ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  {diff > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>{diff > 0 ? "+" : ""}{diff.toFixed(1)} kg so với lần trước</span>
                </motion.div>
              )}
            </div>

            {currentWeight && (
              <div className="mb-6 rounded-xl border border-white/5 bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cân nặng hiện tại</span>
                  <span className="font-bold">{currentWeight} kg</span>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSaving || !weight}
              className="w-full rounded-2xl bg-primary py-4 font-black text-background shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {isSaving ? "Đang lưu..." : "Lưu cân nặng"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
