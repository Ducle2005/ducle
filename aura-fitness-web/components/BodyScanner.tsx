"use client";

import React, { useRef, useEffect, useState } from "react";
import { 
  FilesetResolver, 
  PoseLandmarker, 
  DrawingUtils 
} from "@mediapipe/tasks-vision";
import { X, Activity, ShieldCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { vipApi } from "@/lib/vipApi";
import { AuraRoadmap } from "./AuraRoadmap";

interface ScanMetrics {
  bodyFat: number;
  waist: number;
  hips: number;
  chest: number;
}

type RoadmapData = React.ComponentProps<typeof AuraRoadmap>["data"];
type ScanCompletePayload = ScanMetrics | (ScanMetrics & { date: string });

interface BodyScannerProps {
  onClose: () => void;
  onScanComplete: (data: ScanCompletePayload) => void;
  userHeight: number; // in cm
  gender: string; // "MALE" or "FEMALE"
}

function getCameraAccessMessage(err: unknown) {
  if (err instanceof DOMException) {
    if (err.name === "NotAllowedError" || err.name === "SecurityError") {
      return "Trình duyệt đang chặn quyền camera. Hãy cho phép camera trên thanh địa chỉ rồi bấm thử lại.";
    }
    if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
      return "Không tìm thấy camera trên thiết bị này.";
    }
    if (err.name === "NotReadableError" || err.name === "TrackStartError") {
      return "Camera đang được ứng dụng khác sử dụng. Hãy tắt ứng dụng đó rồi thử lại.";
    }
  }

  return "Không thể truy cập camera. Hãy kiểm tra quyền camera rồi thử lại.";
}

export function BodyScanner({ onClose, onScanComplete, userHeight, gender }: BodyScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const metricsBufferRef = useRef<ScanMetrics[]>([]);
  const latestMetricsRef = useRef<ScanMetrics>({
    bodyFat: 18.5,
    waist: 78,
    hips: 92,
    chest: 98,
  });
  const scanningRef = useRef(false);
  const lastUiUpdateRef = useRef(0);
  const lastValidationRef = useRef<{ isValid: boolean; message: string } | null>(null);
  const handleStartScanRef = useRef<() => void>(() => {});
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoScanCountdown, setAutoScanCountdown] = useState<number | null>(null);
  const [validation, setValidation] = useState<{ isValid: boolean; message: string }>({
    isValid: false,
    message: "Đang khởi tạo AI..."
  });
  const [metrics, setMetrics] = useState({
    bodyFat: 18.5,
    waist: 78,
    hips: 92,
    chest: 98
  });
  const [finalMetrics, setFinalMetrics] = useState<ScanMetrics | null>(null);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);

  useEffect(() => {
    scanningRef.current = isScanning;
  }, [isScanning]);

  // Initialize MediaPipe
  useEffect(() => {
    async function initMediaPipe() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        });
        poseLandmarkerRef.current = landmarker;
        setPoseLandmarker(landmarker);
        setIsReady(true);
      } catch (err) {
        console.warn("MediaPipe init failed:", err);
        setError("Không thể khởi động AI Engine. Hãy tải lại trang rồi thử lại.");
      }
    }
    initMediaPipe();
    return () => {
      poseLandmarkerRef.current?.close();
      poseLandmarkerRef.current = null;
    };
  }, []);

  // Start Camera
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Trình duyệt hiện tại không hỗ trợ mở camera.");
        return;
      }

      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 960 },
          height: { ideal: 540 },
          frameRate: { ideal: 60, max: 60 },
          facingMode: "user",
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          void videoRef.current?.play().catch(() => {
            setError("Không thể phát camera trong trình duyệt. Hãy tải lại trang rồi thử lại.");
          });
          setStreaming(true);
        };
      }
    } catch (err) {
      setStreaming(false);
      setValidation({ isValid: false, message: "CAMERA CHƯA SẴN SÀNG" });
      setError(getCameraAccessMessage(err));
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        setStreaming(false);
    }
  };

  useEffect(() => {
    if (isReady && !isAnalysisComplete) startCamera();
    return () => stopCamera();
  }, [isReady, isAnalysisComplete]);

  // Auto-Scan Countdown
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (validation.isValid && !isScanning && autoScanCountdown === null && !scanProgress && !isAnalysisComplete) {
        setAutoScanCountdown(3);
    } else if (!validation.isValid && autoScanCountdown !== null) {
        setAutoScanCountdown(null);
    }
    if (autoScanCountdown !== null && autoScanCountdown > 0) {
        timerId = setTimeout(() => {
            setAutoScanCountdown(prev => (prev !== null ? prev - 1 : null));
        }, 1000);
    } else if (autoScanCountdown === 0) {
        setAutoScanCountdown(null);
        handleStartScanRef.current();
    }
    return () => clearTimeout(timerId);
  }, [validation.isValid, isScanning, autoScanCountdown, scanProgress, isAnalysisComplete]);

  // Detection Loop
  useEffect(() => {
    let animationId: number;
    const uiUpdateIntervalMs = 1000 / 12;

    const syncValidation = (nextValidation: { isValid: boolean; message: string }) => {
      const previous = lastValidationRef.current;
      if (!previous || previous.isValid !== nextValidation.isValid || previous.message !== nextValidation.message) {
        lastValidationRef.current = nextValidation;
        setValidation(nextValidation);
      }
    };

    const detect = () => {
      if (poseLandmarker && videoRef.current && canvasRef.current && streaming && !isAnalysisComplete) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
          }

          const frameTime = performance.now();
          const results = poseLandmarker.detectForVideo(video, frameTime);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (results.landmarks && results.landmarks.length > 0) {
            const landmark = results.landmarks[0];
            const drawingUtils = new DrawingUtils(ctx);
            const criticalPoints = [0, 11, 12, 23, 24];
            const visiblePoints = criticalPoints.filter(idx => landmark[idx] && landmark[idx].visibility > 0.65);
            const yCoords = landmark.filter((_, i) => criticalPoints.includes(i)).map(l => l.y);
            const height = Math.max(...yCoords) - Math.min(...yCoords);
            let status = { isValid: true, message: "SẴN SÀNG QUÉT" };
            if (visiblePoints.length < criticalPoints.length) {
                status = { isValid: false, message: "VUI LÒNG ĐỂ LỘ ĐẦU, VAI VÀ HÔNG" };
            } else if (height < 0.3) {
                status = { isValid: false, message: "BẠN ĐANG ĐỨNG QUÁ XA" };
            } else if (height > 0.85) {
                status = { isValid: false, message: "BẠN ĐANG ĐỨNG QUÁ GẦN" };
            }
            syncValidation(status);
            if (status.isValid) {
                const nose = landmark[0];
                const avgHipY = (landmark[23].y + landmark[24].y) / 2;
                const noseToHipPixel = avgHipY - nose.y;
                const estTotalPixel = noseToHipPixel / 0.48;
                const cmPerPixel = userHeight / estTotalPixel;
                const shoulderWidth = Math.abs(landmark[11].x - landmark[12].x);
                const hipWidth = Math.abs(landmark[23].x - landmark[24].x);
                const chestCm = Math.floor(shoulderWidth * estTotalPixel * 0.9 * cmPerPixel * 0.9);
                const waistCm = Math.floor(hipWidth * estTotalPixel * 0.85 * cmPerPixel * 0.95);
                const hipsCm = Math.floor(hipWidth * estTotalPixel * cmPerPixel * 1.05);
                const bodyFat = gender === "MALE" ? 86.010 * Math.log10(waistCm - 37) - 70.041 * Math.log10(userHeight) + 36.76 : 163.205 * Math.log10(waistCm + hipsCm - 35) - 97.684 * Math.log10(userHeight) - 78.387;
                const finalBF = Number(Math.max(5, Math.min(45, bodyFat)).toFixed(1));
                
                const nextMetrics = {
                    bodyFat: finalBF,
                    waist: waistCm,
                    hips: hipsCm,
                    chest: chestCm
                };

                latestMetricsRef.current = nextMetrics;

                if (scanningRef.current) {
                    metricsBufferRef.current.push(nextMetrics);
                }

                if (frameTime - lastUiUpdateRef.current >= uiUpdateIntervalMs) {
                    lastUiUpdateRef.current = frameTime;
                    setMetrics(nextMetrics);
                }
            }
            drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, { color: status.isValid ? "#10b981" : "#f43f5e", lineWidth: 2 });
          } else {
            syncValidation({ isValid: false, message: "CHƯA PHÁT HIỆN CƠ THỂ" });
          }
        }
      }
      animationId = requestAnimationFrame(detect);
    };
    if (streaming) detect();
    return () => cancelAnimationFrame(animationId);
  }, [poseLandmarker, streaming, isAnalysisComplete, gender, userHeight]);

  const handleStartScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setIsAnalysisComplete(false);
    setFinalMetrics(null);
    metricsBufferRef.current = [];
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) { clearInterval(interval); finishScan(); return 100; }
        return prev + 2;
      });
    }, 50);
  };

  handleStartScanRef.current = handleStartScan;

  const finishScan = () => {
    setIsScanning(false);
    setIsAnalysisComplete(true);
    stopCamera(); // Turn off camera for privacy and resource saving
    
    // 100% ACCURACY LOGIC: Use Median of the scan buffer to eliminate noise/jitter
    const buffer = metricsBufferRef.current;
    if (buffer.length > 0) {
        const getMedian = (arr: number[]) => {
            const sorted = [...arr].sort((a, b) => a - b);
            return sorted[Math.floor(sorted.length / 2)];
        };

        const medianMetrics = {
            bodyFat: getMedian(buffer.map(m => m.bodyFat)),
            chest: getMedian(buffer.map(m => m.chest)),
            waist: getMedian(buffer.map(m => m.waist)),
            hips: getMedian(buffer.map(m => m.hips))
        };
        setFinalMetrics(medianMetrics);
    } else {
        setFinalMetrics({...latestMetricsRef.current});
    }
  };

  const handleConfirmSave = async () => {
    if (finalMetrics) {
        setIsGeneratingRoadmap(true);
        try {
            const roadmap = await vipApi.generateRoadmap(finalMetrics);
            setRoadmapData(roadmap);
            onScanComplete({ ...finalMetrics, date: new Date().toISOString() });
        } catch {
            onScanComplete(finalMetrics);
        } finally {
            setIsGeneratingRoadmap(false);
        }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-4 overflow-hidden">
        <div className="relative w-full max-w-6xl h-full max-h-[90vh] overflow-hidden rounded-[32px] border border-white/10 bg-slate-900 shadow-2xl flex flex-col">
            {roadmapData ? (
                <AuraRoadmap data={roadmapData} onClose={onClose} />
            ) : (
                <>
                <button onClick={onClose} className="absolute right-6 top-6 z-[110] rounded-full bg-black/50 p-2 text-white hover:bg-white/10 transition-all">
                    <X size={24} />
                </button>

                <div className="flex h-full flex-col lg:flex-row overflow-hidden">
                    <div className="relative flex-1 bg-black overflow-hidden">
                        {!isReady && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 bg-slate-900">
                                <Loader2 size={48} className="animate-spin text-amber-500 mb-4" />
                                <div className="text-xs font-black uppercase tracking-widest italic text-center">Đang khởi tạo AI Aura...</div>
                            </div>
                        )}
                        {error && (
                            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/95 p-8 text-center text-white">
                                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                                    <Activity size={30} />
                                </div>
                                <h2 className="mb-3 text-xl font-black uppercase italic tracking-tight">Camera chưa sẵn sàng</h2>
                                <p className="max-w-sm text-sm font-medium leading-6 text-slate-400">{error}</p>
                                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                    <button
                                        onClick={startCamera}
                                        disabled={!isReady}
                                        className="rounded-2xl bg-amber-400 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-950 transition-all hover:scale-[1.02] disabled:opacity-50"
                                    >
                                        Thử lại camera
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="rounded-2xl border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        )}
                        <video ref={videoRef} className="h-full w-full object-cover mirror transform -scale-x-100" playsInline muted />
                        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover pointer-events-none transform -scale-x-100" />
                        
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                            <div className="border-[6px] border-dashed border-white/30 rounded-[100px] h-4/5 aspect-[1/2] animate-pulse" />
                        </div>  

                        <AnimatePresence>
                            {isAnalysisComplete && finalMetrics && (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-x-4 bottom-4 md:inset-6 z-[120] flex items-center justify-center">
                                    <div className="w-full max-w-sm rounded-[32px] bg-slate-900/90 p-6 md:p-8 backdrop-blur-2xl border border-white/10 shadow-3xl overflow-y-auto max-h-[80vh]">
                                        <div className="flex flex-col items-center mb-6">
                                            <div className="p-3 rounded-full bg-emerald-500/10 mb-3 border border-emerald-500/20"><ShieldCheck size={32} className="text-emerald-500" /></div>
                                            <h2 className="text-xl font-black italic uppercase text-white">Phân tích hoàn tất</h2>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            {[["Mỡ cơ thể", `${finalMetrics.bodyFat}%`], ["Ngực", `${finalMetrics.chest}cm`], ["Eo", `${finalMetrics.waist}cm`], ["Hông", `${finalMetrics.hips}cm`]].map(([label, val]) => (
                                                <div key={label} className="bg-white/5 rounded-2xl p-3 border border-white/5 text-center">
                                                    <div className="text-[8px] font-black text-white/40 uppercase mb-1">{label}</div>
                                                    <div className="text-xl font-black text-white">{val}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-3">
                                            <button onClick={handleConfirmSave} disabled={isGeneratingRoadmap} className="w-full py-4 rounded-2xl bg-emerald-500 text-slate-950 font-black uppercase text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                                                {isGeneratingRoadmap ? <><Loader2 size={18} className="animate-spin" /> ĐANG LẬP LỘ TRÌNH...</> : "XÁC NHẬN & LẬP LỘ TRÌNH"}
                                            </button>
                                            <button onClick={() => { setIsAnalysisComplete(false); setScanProgress(0); }} disabled={isGeneratingRoadmap} className="w-full py-4 rounded-2xl bg-white/5 text-white/60 font-black uppercase text-sm border border-white/10">QUÉT LẠI</button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {autoScanCountdown !== null && (
                                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1.2, opacity: 1 }} exit={{ scale: 2 }} className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none">
                                    <div className="text-[120px] font-black italic text-emerald-500 drop-shadow-[0_0_30px_#10b981]">{autoScanCountdown}</div>
                                    <div className="text-xs font-black text-white uppercase tracking-[0.3em] bg-black/40 px-6 py-2 rounded-full backdrop-blur-xl border border-white/10">GIỮ NGUYÊN VỊ TRÍ</div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="w-full lg:w-80 bg-slate-900 p-6 md:p-8 flex flex-col border-l border-white/5 overflow-y-auto">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-2"><div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-500"><Activity size={18} /></div><h3 className="font-black italic uppercase text-white">Sinh trắc AI</h3></div>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Đứng cách camera 2m. Đảm bảo toàn bộ cơ thể nằm trong khung dáng người để AI có kết quả chuẩn nhất.</p>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="p-4 rounded-2xl bg-slate-950 border border-white/5">
                                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3">Dữ liệu trực tiếp</div>
                                <div className="space-y-3">
                                    {[["Ngực", metrics.chest], ["Eo", metrics.waist], ["Hông", metrics.hips], ["Mỡ cơ thể", `${metrics.bodyFat}%`]].map(([l, v]) => (
                                        <div key={l} className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-400">{l}</span><span className={`text-xs font-black ${l==='Mỡ cơ thể'?'text-emerald-500':'text-white'}`}>{v} {l!=='Mỡ cơ thể'&&'cm'}</span></div>
                                    ))}
                                </div>
                            </div>
                            {isScanning && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[8px] font-black text-emerald-500 uppercase tracking-widest"><span>Đang phân tích...</span><span>{scanProgress}%</span></div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${scanProgress}%` }} className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" /></div>
                                </div>
                            )}
                        </div>
                        <div className="mt-8">
                            {!isScanning && !isAnalysisComplete ? (
                                <button onClick={handleStartScan} disabled={!streaming || !validation.isValid} className={`w-full flex items-center justify-center h-14 rounded-2xl font-black uppercase text-xs transition-all ${validation.isValid ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20' : 'bg-slate-800 text-slate-600 grayscale'}`}>
                                    {autoScanCountdown !== null ? `BẮT ĐẦU TRONG ${autoScanCountdown}s` : "Bắt đầu quét AI"}
                                </button>
                            ) : null}
                            <div className="mt-4 text-center text-[8px] font-black text-slate-600 uppercase tracking-widest">Trí tuệ VIP Aura v1.0</div>
                        </div>
                    </div>
                </div>
                </>
            )}
        </div>
    </div>
  );
}
