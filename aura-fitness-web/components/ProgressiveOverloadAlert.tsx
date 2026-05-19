"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ProgressiveOverloadAlertProps {
  exerciseName: string;
  weight: number;
  reps: number;
}

export function ProgressiveOverloadAlert({ exerciseName, weight, reps }: ProgressiveOverloadAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  const suggestedWeight = weight > 0 ? weight + 2.5 : 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute z-50 mb-4 bottom-[100%] left-0 right-0 mx-auto w-full max-w-sm rounded-2xl border border-primary/20 bg-primary/10 p-4 shadow-xl shadow-primary/5 backdrop-blur-xl"
        >
          <div className="flex items-start gap-4">
            <div className="flex mt-1 h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-background shadow-lg shadow-primary/20">
              <TrendingUp size={16} />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-black uppercase tracking-widest text-primary">
                Gợi ý tăng cường độ
              </h4>
              <p className="mt-1 text-xs font-medium text-primary-foreground/80 leading-relaxed">
                Bạn đã hoàn thành rất tốt <strong>{exerciseName}</strong> với {reps} reps!
                {suggestedWeight > 0 && (
                  <span> Hãy thử nâng lên <strong>{suggestedWeight}kg</strong> ở hiệp tiếp theo hoặc buổi tập sau nhé!</span>
                )}
              </p>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="rounded-full p-1 text-primary-foreground/50 hover:bg-white/5 hover:text-primary-foreground"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
