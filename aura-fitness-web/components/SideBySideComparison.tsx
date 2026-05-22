"use client";

import React, { useState, useRef, useEffect } from "react";
import { MoveHorizontal, Smartphone, Calendar, Weight, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { BASE_URL, getFullImageUrl } from "@/lib/api";

interface BodyScan {
  id: number;
  scanDate: string;
  imageUrl: string;
  bodyFatPercentage: number;
  chest: number;
  waist: number;
  hips: number;
  weightAtScan: number;
}

interface SideBySideComparisonProps {
  scans: BodyScan[];
  onClose: () => void;
}

export function SideBySideComparison({ scans, onClose }: SideBySideComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  
  // Default to first and last scan if history exists
  const [beforeIdx, setBeforeIdx] = useState(scans.length - 1);
  const [afterIdx, setAfterIdx] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    
    setSliderPosition(Math.max(0, Math.min(100, position)));
  };

  const beforeScan = scans[beforeIdx];
  const afterScan = scans[afterIdx];

  if (!beforeScan || !afterScan) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 backdrop-blur-3xl overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-[110] border-b border-white/5 bg-slate-950/80 p-6 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all">
                <ChevronLeft size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">So sánh Tiến độ AI</h2>
              <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Phân tích trí tuệ VIP</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-black text-white uppercase italic">
                {scans.length} Bản quét đã lưu
             </div>
             <button onClick={onClose} className="px-6 py-2 rounded-xl bg-white text-slate-950 font-black uppercase text-xs transition-all hover:scale-105 active:scale-95">
                Hoàn tất
             </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl w-full p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Comparison Slider Area */}
        <div className="lg:col-span-2 space-y-8">
            <div 
                ref={containerRef}
                className="relative aspect-[3/4] max-h-[70vh] mx-auto overflow-hidden rounded-[40px] border-8 border-white/5 bg-slate-900 shadow-2xl cursor-ew-resize select-none"
                onMouseMove={handleMouseMove}
                onTouchMove={handleMouseMove}
                onMouseDown={() => setIsResizing(true)}
                onMouseUp={() => setIsResizing(false)}
                onMouseLeave={() => setIsResizing(false)}
            >
                {/* After Image (Top) */}
                <div 
                    className="absolute inset-0 z-10 overflow-hidden"
                    style={{ width: `${sliderPosition}%` }}
                >
                    <img 
                        src={getFullImageUrl(afterScan.imageUrl)} 
                        className="absolute inset-0 h-full w-full object-cover"
                        alt="After"
                    />
                    <div className="absolute left-6 top-6 rounded-full bg-emerald-500 px-4 py-1.5 text-[10px] font-black text-slate-950 uppercase tracking-widest shadow-xl">
                        HIỆN TẠI ({new Date(afterScan.scanDate).toLocaleDateString()})
                    </div>
                </div>

                {/* Before Image (Bottom) */}
                <div className="absolute inset-0">
                    <img 
                        src={getFullImageUrl(beforeScan.imageUrl)} 
                        className="h-full w-full object-cover grayscale"
                        alt="Before"
                    />
                    <div className="absolute right-6 top-6 rounded-full bg-slate-700 px-4 py-1.5 text-[10px] font-black text-white uppercase tracking-widest shadow-xl">
                        LÚC MỚI TẬP ({new Date(beforeScan.scanDate).toLocaleDateString()})
                    </div>
                </div>

                {/* Slider Handle */}
                <div 
                    className="absolute inset-y-0 z-20 w-1 bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)] cursor-ew-resize"
                    style={{ left: `${sliderPosition}%` }}
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-950 shadow-2xl border-4 border-slate-900">
                        <MoveHorizontal size={20} />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center gap-4 py-4 px-8 rounded-3xl bg-white/2 border border-white/5 text-slate-400 font-bold italic text-sm text-center">
                <Smartphone size={16} className="text-amber-500" />
                Dùng thanh trượt để cảm nhận sự thay đổi của cơ bắp và độ săn chắc của làn da.
            </div>
        </div>

        {/* Metrics Delta Area */}
        <div className="space-y-8">
            <h3 className="text-xl font-black italic uppercase tracking-tight text-white mb-6">Kết quả Phân tích</h3>
            
            <div className="space-y-4">
                {[
                    { label: "% Mỡ cơ thể", before: beforeScan.bodyFatPercentage + "%", after: afterScan.bodyFatPercentage + "%", unit: "%", delta: (afterScan.bodyFatPercentage - beforeScan.bodyFatPercentage).toFixed(1), icon: Activity, color: "rose" },
                    { label: "Vòng eo", before: beforeScan.waist + "cm", after: afterScan.waist + "cm", unit: "cm", delta: (afterScan.waist - beforeScan.waist).toFixed(1), icon: Smartphone, color: "emerald" },
                    { label: "Vòng hông", before: beforeScan.hips + "cm", after: afterScan.hips + "cm", unit: "cm", delta: (afterScan.hips - beforeScan.hips).toFixed(1), icon: Smartphone, color: "blue" },
                    { label: "Cân nặng", before: beforeScan.weightAtScan + "kg", after: afterScan.weightAtScan + "kg", unit: "kg", delta: (afterScan.weightAtScan - beforeScan.weightAtScan).toFixed(1), icon: Weight, color: "amber" },
                ].map((metric, i) => {
                    const deltaVal = parseFloat(metric.delta);
                    const isGood = metric.label === "% Mỡ cơ thể" || metric.label === "Vòng eo" ? deltaVal < 0 : deltaVal > 0;
                    
                    return (
                        <div key={i} className="p-6 rounded-3xl bg-slate-900/50 border border-white/5 transition-all hover:bg-slate-900">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-${metric.color}-500/10 text-${metric.color}-500`}>
                                        <metric.icon size={18} />
                                    </div>
                                    <span className="text-sm font-black uppercase text-slate-400 tracking-tight">{metric.label}</span>
                                </div>
                                <div className={`text-xs font-black px-2 py-1 rounded-full ${isGood ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                    {deltaVal > 0 ? '+' : ''}{metric.delta} {metric.unit}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-center">
                                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">TRƯỚC</div>
                                    <div className="text-xl font-black italic text-slate-500">{metric.before}</div>
                                </div>
                                <div className="h-8 w-px bg-white/5" />
                                <div className="text-center">
                                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">SAU</div>
                                    <div className="text-2xl font-black italic text-white">{metric.after}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <section className="rounded-3xl bg-gradient-to-br from-indigo-900/40 to-slate-900 p-8 border border-indigo-500/10 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                   <Calendar size={18} className="text-indigo-400" />
                   <h4 className="text-sm font-black italic uppercase text-white">Nhận định từ Aura AI</h4>
                </div>
                <p className="text-sm text-slate-300 font-medium leading-relaxed italic">
                    "Trong {Math.floor((new Date(afterScan.scanDate).getTime() - new Date(beforeScan.scanDate).getTime()) / (1000 * 60 * 60 * 24))} ngày qua, tỉ lệ mỡ cơ thể của bạn giảm {Math.abs(afterScan.bodyFatPercentage - beforeScan.bodyFatPercentage).toFixed(1)}%. Khối lượng cơ bắp ở ngực cho thấy có sự dày lên rõ rệt. Hãy tiếp tục duy trì khối lượng tập luyện hiện tại."
                </p>
            </section>
        </div>
      </main>
    </div>
  );
}
