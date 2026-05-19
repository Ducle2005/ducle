"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, RotateCcw, Timer, X } from "lucide-react";

const PRESETS = [30, 60, 90, 120, 180];

interface RestTimerProps {
  isOpen: boolean;
  onClose: () => void;
  initialSeconds?: number;
}

export function RestTimer({ isOpen, onClose, initialSeconds = 90 }: RestTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [remaining, setRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTotalSeconds(initialSeconds);
      setRemaining(initialSeconds);
      setIsRunning(true);
    }
  }, [isOpen, initialSeconds]);

  useEffect(() => {
    if (!isRunning || remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          // Play alert sound
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            gain.gain.value = 0.3;
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
            setTimeout(() => {
              const osc2 = ctx.createOscillator();
              const gain2 = ctx.createGain();
              osc2.connect(gain2);
              gain2.connect(ctx.destination);
              osc2.frequency.value = 1100;
              gain2.gain.value = 0.3;
              osc2.start();
              osc2.stop(ctx.currentTime + 0.4);
            }, 350);
          } catch { /* audio not available */ }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, remaining]);

  const progress = totalSeconds > 0 ? (totalSeconds - remaining) / totalSeconds : 0;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference * (1 - progress);

  const selectPreset = useCallback((secs: number) => {
    setTotalSeconds(secs);
    setRemaining(secs);
    setIsRunning(true);
  }, []);

  const reset = useCallback(() => {
    setRemaining(totalSeconds);
    setIsRunning(true);
  }, [totalSeconds]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative flex flex-col items-center gap-8 p-10"
          >
            <button
              onClick={onClose}
              className="absolute right-0 top-0 rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-primary">
              <Timer size={16} />
              Nghỉ giữa hiệp
            </div>

            {/* Circular Timer */}
            <div className="relative flex h-52 w-52 items-center justify-center">
              <svg className="absolute -rotate-90" width="208" height="208">
                <circle
                  cx="104"
                  cy="104"
                  r="90"
                  fill="transparent"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="104"
                  cy="104"
                  r="90"
                  fill="transparent"
                  stroke={remaining === 0 ? "#10b981" : "hsl(var(--color-primary))"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.3 }}
                />
              </svg>

              <div className="flex flex-col items-center">
                <span className={`text-5xl font-black tabular-nums tracking-tight ${remaining === 0 ? "text-emerald-400" : "text-foreground"}`}>
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </span>
                {remaining === 0 && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-xs font-black uppercase tracking-widest text-emerald-400"
                  >
                    Sẵn sàng!
                  </motion.span>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={reset}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-muted-foreground transition-all hover:bg-white/20 hover:text-foreground"
              >
                <RotateCcw size={20} />
              </button>
              <button
                onClick={() => setIsRunning((prev) => !prev)}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-background shadow-xl shadow-primary/30 transition-all hover:scale-105"
              >
                {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
              </button>
              <button
                onClick={onClose}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-muted-foreground transition-all hover:bg-white/20 hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            {/* Presets */}
            <div className="flex gap-2">
              {PRESETS.map((secs) => (
                <button
                  key={secs}
                  onClick={() => selectPreset(secs)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    totalSeconds === secs
                      ? "bg-primary text-background shadow-lg shadow-primary/20"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                  }`}
                >
                  {secs >= 60 ? `${secs / 60}p` : `${secs}s`}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
