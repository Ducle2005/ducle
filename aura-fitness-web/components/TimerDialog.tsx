"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Play, Pause, Repeat2, Volume2, VolumeOff, X } from "lucide-react";

interface RestTimerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSeconds?: number;
}

export function RestTimer({ isOpen, onClose, defaultSeconds = 90 }: RestTimerProps) {
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (!isMuted) {
            playNotificationSound();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isMuted]);

  const playNotificationSound = () => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(defaultSeconds);
  };

  const handleTogglePlay = () => {
    setIsRunning(!isRunning);
  };

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const displayTime = `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  const isExpired = seconds === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="fixed bottom-6 right-6 z-50 w-80 max-w-[calc(100vw-24px)]"
        >
          <div className={`glass-card border-white/5 p-6 ${isExpired ? "border-amber-500/50 bg-amber-500/5" : ""}`}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-primary" />
                <span className="font-bold uppercase tracking-widest">Rest Timer</span>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg transition-colors hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-8 text-center">
              <motion.div
                key={displayTime}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-6xl font-black tracking-tight ${
                  isExpired ? "text-amber-400" : "text-primary"
                }`}
              >
                {displayTime}
              </motion.div>
              {isExpired && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-sm font-bold text-amber-400 animate-pulse"
                >
                  Thời gian nghỉ kết thúc! 💪
                </motion.p>
              )}
            </div>

            <div className="mb-4 flex items-center gap-3">
              <button
                onClick={handleTogglePlay}
                className={`flex-1 rounded-lg px-4 py-3 font-bold transition-all ${
                  isRunning
                    ? "bg-primary text-background hover:scale-[1.02]"
                    : "glass hover:border-primary/40"
                }`}
              >
                {isRunning ? (
                  <div className="flex items-center justify-center gap-2">
                    <Pause size={18} />
                    <span>Dừng</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Play size={18} fill="currentColor" />
                    <span>Bắt đầu</span>
                  </div>
                )}
              </button>

              <button
                onClick={handleReset}
                className="glass rounded-lg px-4 py-3 transition-all hover:border-primary/40"
              >
                <Repeat2 size={18} />
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`rounded-lg px-4 py-3 transition-all ${
                  isMuted ? "glass hover:border-primary/40" : "glass hover:border-primary/40"
                }`}
              >
                {isMuted ? <VolumeOff size={18} /> : <Volume2 size={18} />}
              </button>
            </div>

            <div className="space-y-2">
              {[60, 90, 120, 180].map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setSeconds(preset);
                    setIsRunning(false);
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-sm font-bold uppercase transition-all ${
                    seconds === preset
                      ? "bg-primary text-background"
                      : "glass hover:border-primary/40"
                  }`}
                >
                  {preset}s
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
