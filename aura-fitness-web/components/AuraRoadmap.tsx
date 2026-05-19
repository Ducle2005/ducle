"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  Target, 
  Calendar, 
  Activity, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  BrainCircuit,
  Dumbbell
} from "lucide-react";

interface Phase {
  name: string;
  focus: string;
  weeks: string;
  details: string;
  exercises: string[];
}

interface RoadmapData {
  title: string;
  overview: string;
  phases: Phase[];
  nutritionAdvice: string;
  recoveryTip: string;
}

interface AuraRoadmapProps {
  data: RoadmapData;
  onClose: () => void;
}

export function AuraRoadmap({ data, onClose }: AuraRoadmapProps) {
  return (
    <div className="flex h-full flex-col bg-slate-950 p-6 md:p-10 overflow-y-auto">
      {/* Header */}
      <div className="mb-10 flex flex-col items-center text-center">
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-4 rounded-full bg-emerald-500/10 p-4 border border-emerald-500/20"
        >
            <BrainCircuit size={48} className="text-emerald-500" />
        </motion.div>
        <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white mb-2"
        >
            {data.title || "Aura Elite AI Roadmap"}
        </motion.h1>
        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl text-sm font-medium text-white/50 leading-relaxed"
        >
            {data.overview}
        </motion.p>
      </div>

      {/* 4-Phase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {data.phases.map((phase, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative group flex flex-col rounded-3xl bg-white/5 p-6 border border-white/5 hover:border-emerald-500/30 transition-all hover:bg-white/[0.08]"
          >
            <div className="absolute -top-3 -left-3 h-10 w-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center font-black text-emerald-500">
               {index + 1}
            </div>
            
            <div className="mt-4 mb-4">
                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">{phase.weeks} WEEKS</div>
                <h3 className="text-lg font-black text-white uppercase leading-tight">{phase.name}</h3>
            </div>

            <div className="mb-6 p-3 rounded-xl bg-black/40 border border-white/5">
                <div className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-1">TRỌNG TÂM</div>
                <div className="text-xs font-bold text-white/80">{phase.focus}</div>
            </div>

            <p className="text-xs text-white/40 mb-6 leading-relaxed flex-1">
                {phase.details}
            </p>

            <div className="space-y-2">
                {phase.exercises.map((ex, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-white/60 bg-white/5 px-3 py-1.5 rounded-lg">
                        <Dumbbell size={10} className="text-emerald-500" /> {ex}
                    </div>
                ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Strategies Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[32px] bg-emerald-500/5 p-8 border border-emerald-500/10"
          >
              <div className="flex items-center gap-3 mb-4">
                  <Flame className="text-emerald-500" />
                  <h4 className="font-black italic uppercase tracking-tight text-white text-xl">Dinh dưỡng Chiến lược</h4>
              </div>
              <p className="text-sm text-white/60 leading-relaxed italic">
                  "{data.nutritionAdvice}"
              </p>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="rounded-[32px] bg-blue-500/5 p-8 border border-blue-500/10"
          >
              <div className="flex items-center gap-3 mb-4">
                  <Zap className="text-blue-500" />
                  <h4 className="font-black italic uppercase tracking-tight text-white text-xl">Mẹo Phục hồi</h4>
              </div>
              <p className="text-sm text-white/60 leading-relaxed italic">
                  "{data.recoveryTip}"
              </p>
          </motion.div>
      </div>

      {/* Footer Actions */}
      <div className="mt-auto flex flex-col md:flex-row items-center justify-center gap-4">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-white text-slate-950 font-black uppercase text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
          >
            TIẾP TỤC ĐẾN DASHBOARD <ArrowRight size={16} />
          </button>
          <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">AURA NEURAL ROADMAP v1.0</div>
      </div>
    </div>
  );
}
