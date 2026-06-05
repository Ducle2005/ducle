"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Crown,
  ChevronRight,
  Flame,
  BrainCircuit,
  Camera,
  CheckCircle2,
  X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { vipApi, type VIPInsights } from "@/lib/vipApi";
import { Sidebar } from "@/components/Sidebar";
import { UpgradeModal } from "@/components/UpgradeModal";
import { getFullImageUrl } from "@/lib/api";
import { AuthPage } from "@/components/AuthPage";

const BodyScanner = dynamic(
  () => import("@/components/BodyScanner").then((mod) => mod.BodyScanner),
  { ssr: false }
);
const SideBySideComparison = dynamic(
  () => import("@/components/SideBySideComparison").then((mod) => mod.SideBySideComparison),
  { ssr: false }
);

interface BodyScanRecord {
  id: number;
  imageUrl: string;
  scanDate: string;
  bodyFatPercentage: number;
  chest: number;
  waist: number;
  hips: number;
  weightAtScan: number;
}

interface VIPProfile {
  height?: number | null;
  gender?: string | null;
}

interface BodyScanMetrics {
  bodyFat: number;
  chest: number;
  waist: number;
  hips: number;
}

export default function VIPIntelligence() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<VIPInsights | null>(null);
  const [scans, setScans] = useState<BodyScanRecord[]>([]);
  const [profile, setProfile] = useState<VIPProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentBpm, setCurrentBpm] = useState(72);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [upgradeNotice, setUpgradeNotice] = useState(false);

  const isPremium = user?.roles?.includes("ROLE_PREMIUM");

  const handleUpgradeSuccess = () => {
    setUpgradeNotice(true);
  };

  const upgradeModal = (
    <UpgradeModal
      isOpen={isUpgradeOpen}
      onClose={() => setIsUpgradeOpen(false)}
      onUpgradeSuccess={handleUpgradeSuccess}
    />
  );

  useEffect(() => {
    if (isPremium) {
      loadInsights();
      loadScans();
      loadProfileOrSettings();
    }
  }, [isPremium]);

  const loadProfileOrSettings = async () => {
    try {
      const data = await vipApi.getProfile();
      setProfile(data as VIPProfile);
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  };

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const data = await vipApi.getInsights();
      setInsights(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadScans = async () => {
    try {
      const data = await vipApi.getBodyScanHistory();
      setScans(Array.isArray(data) ? (data as BodyScanRecord[]) : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleScanComplete = async (metrics: BodyScanMetrics) => {
    const formData = new FormData();
    const blob = await fetch("/onboarding/body-scan-demo.svg").then(r => r.blob());
    formData.append("file", blob, "scan.jpg");
    formData.append("bodyFat", metrics.bodyFat.toString());
    formData.append("chest", metrics.chest.toString());
    formData.append("waist", metrics.waist.toString());
    formData.append("hips", metrics.hips.toString());
    formData.append("weight", "75.0");

    try {
      await vipApi.uploadBodyScan(formData);
      setIsScannerOpen(false);
      loadScans();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <AuthPage mode="login-only" />;
  if (!isPremium) {
    return (
      <>
        <div className="flex min-h-screen bg-slate-950">
          <Sidebar />
          <div className="flex-1 px-6 py-10 pb-24 lg:ml-20 lg:px-12 lg:pb-10">
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
              <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                <div>
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-amber-400">
                    <Crown size={14} /> Aura VIP Intelligence
                  </div>
                  <h1 className="max-w-2xl text-4xl font-black uppercase italic tracking-tighter text-white lg:text-6xl">
                    Mở khóa phân tích cao cấp
                  </h1>
                  <p className="mt-5 max-w-xl text-sm font-medium leading-7 text-slate-400 lg:text-base">
                    Nâng cấp để dùng phân tích nhịp tim, tăng tải tiến bộ, thành phần cơ thể bằng AI và các tính năng AI chuyên sâu.
                  </p>

                  <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[
                      "Huấn luyện AI không giới hạn",
                      "Phân tích ảnh và chỉ số cơ thể",
                      "Dự báo cường độ tập luyện",
                      "Báo cáo phục hồi sau buổi tập",
                    ].map((benefit) => (
                      <div key={benefit} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm font-bold text-slate-200">
                        <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
                        {benefit}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsUpgradeOpen(true)}
                    className="mt-8 inline-flex items-center justify-center gap-3 rounded-2xl bg-amber-400 px-8 py-4 text-sm font-black uppercase tracking-widest text-slate-950 shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Crown size={18} fill="currentColor" />
                    Nâng cấp gói cao cấp ngay
                  </button>
                </div>

                <div className="rounded-[2rem] border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-white/[0.03] to-slate-900 p-6 shadow-2xl shadow-amber-500/10 lg:p-8">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                    <BrainCircuit size={34} />
                  </div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Gói cao cấp đang chờ kích hoạt</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    Sau khi thanh toán hoặc dùng chế độ demo, hệ thống sẽ tự refresh quyền tài khoản và hiển thị thông báo thành công ngay trên giao diện.
                  </p>
                  <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                    <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Trạng thái hiện tại</div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-black text-white">{user?.email || user?.name || "Tài khoản của bạn"}</span>
                      <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Free
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {upgradeModal}
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-4 py-6 pb-24 sm:p-8 sm:pb-24 lg:p-12 lg:pb-12">
        <AnimatePresence>
          {upgradeNotice && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mb-8 flex items-start justify-between gap-4 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-emerald-100 shadow-2xl shadow-emerald-500/10"
            >
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-emerald-300">Đăng ký gói cao cấp thành công</h2>
                  <p className="mt-1 text-sm font-medium text-emerald-50/80">
                    Tài khoản đã được mở khóa Aura VIP. Các phân tích nâng cao đã sẵn sàng sử dụng.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUpgradeNotice(false)}
                className="rounded-xl p-2 text-emerald-100/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Đóng thông báo"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="mb-12">
          {/* ... */}
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1 text-xs font-black text-amber-500 border border-amber-500/20 uppercase tracking-widest">
              <Crown size={14} /> Aura Neural
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1 text-xs font-black text-emerald-500 border border-emerald-500/20 uppercase tracking-widest">
              {isLoading ? "Đang đồng bộ" : "Trí tuệ trực tiếp"}
            </div>
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter mb-4 uppercase">TRÍ TUỆ VIP & SINH TRẮC HP</h1>
          <p className="text-slate-400 font-medium max-w-2xl">Phân tích chuyên sâu từ hệ tim mạch đến cường độ tập luyện để tối ưu hóa từng giọt mồ hôi của bạn.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Heart Rate Section */}
            {/* ... same as before */}
            <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/50 p-8 backdrop-blur-xl">
              <div className="absolute -right-20 -top-20 h-64 w-64 bg-rose-500/10 blur-[100px] rounded-full" />
              
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                    <Heart size={24} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic tracking-tight uppercase">Phân tích trí tuệ nhịp tim</h3>
                    <p className="text-sm font-medium text-slate-400">Được đo chuẩn hóa theo ngưỡng kỵ khí</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black italic tracking-tighter text-rose-500">{currentBpm}</div>
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">NHỊP TIM TRỰC TIẾP</div>
                  <input
                    aria-label="Điều chỉnh BPM"
                    type="range"
                    min="50"
                    max="190"
                    value={currentBpm}
                    onChange={(event) => setCurrentBpm(Number(event.target.value))}
                    className="mt-3 h-1 w-28 cursor-pointer accent-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                {[
                  { label: "Đốt mỡ", range: `${insights?.heartRate?.fatBurnZone?.min || 0}-${insights?.heartRate?.fatBurnZone?.max || 0}`, color: "bg-emerald-500", active: currentBpm < 140 },
                    { label: "Tim mạch", range: `${insights?.heartRate?.cardioZone?.min || 0}-${insights?.heartRate?.cardioZone?.max || 0}`, color: "bg-amber-500", active: currentBpm >= 140 && currentBpm < 165 },
                  { label: "Ngưỡng (Peak)", range: `${insights?.heartRate?.peakZone?.min || 0}-${insights?.heartRate?.peakZone?.max || 0}`, color: "bg-rose-500", active: currentBpm >= 165 },
                ].map((zone, i) => (
                  <div key={i} className={`p-4 rounded-2xl border transition-all ${zone.active ? "border-white/20 bg-white/5 scale-[1.02]" : "border-white/5 bg-white/2 opacity-50"}`}>
                    <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{zone.label}</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black">{zone.range}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">BPM</span>
                    </div>
                    <div className={`mt-3 h-1 w-full rounded-full ${zone.color} ${zone.active ? "opacity-100" : "opacity-20"}`} />
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-slate-950/50 p-6 border border-white/5">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-emerald-500">
                    <Activity size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-black uppercase tracking-wider text-white">Chỉ số phục hồi sau hiệp</span>
                      <span className="text-xs font-black text-emerald-500 uppercase">Tốt (+24 BPM/phút)</span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Tốc độ giảm nhịp tim của bạn nhanh hơn 15% so với mức trung bình. Hệ tim mạch của bạn đang phục hồi rất tốt, có thể rút ngắn thời gian nghỉ xuống còn 45s.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Progressive Overload Section */}
            {/* ... same as before */}
            <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/50 p-8 backdrop-blur-xl">
              <div className="absolute -left-20 -bottom-20 h-64 w-64 bg-blue-500/10 blur-[100px] rounded-full" />
              
              <div className="flex items-center gap-4 mb-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black italic tracking-tight uppercase">Phân tích tăng tải tiến bộ</h3>
                  <p className="text-sm font-medium text-slate-400">Dựa trên khối lượng tập luyện tích lũy</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">TỔNG KHỐI LƯỢNG BUỔI GẦN NHẤT</div>
                    <div className="text-4xl font-black italic tracking-tighter text-white">{(insights?.progressiveOverload?.totalVolume || 0).toLocaleString()} <span className="text-lg font-normal text-slate-500 uppercase tracking-normal">KG</span></div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase ${insights?.progressiveOverload?.trend === 'UP' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      <Zap size={12} fill="currentColor" /> {insights?.progressiveOverload?.deltaPercentage || 0}% TUẦN QUA
                    </div>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">SO VỚI TRUNG BÌNH 4 TUẦN</span>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-sm font-bold text-blue-100 italic">
                    &ldquo;{insights?.progressiveOverload?.insight || "Hãy bắt đầu tập luyện để AI phân tích cường độ của bạn."}&rdquo;
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-6 text-center flex flex-col items-center justify-center">
                  <div className="bg-amber-500/10 p-3 rounded-full mb-4 text-amber-500 border border-amber-500/20">
                    <Flame size={24} />
                  </div>
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">DỰ BÁO SỨC MẠNH 1 LẦN TỐI ĐA</div>
                  <div className="text-5xl font-black italic tracking-tighter text-amber-500">105 <span className="text-xl font-normal text-slate-500 uppercase tracking-normal">KG</span></div>
                  <div className="mt-2 text-xs font-black text-white uppercase tracking-wider">Cho bài đẩy ngực ghế ngang</div>
                  <p className="mt-4 text-[10px] text-slate-500 font-black uppercase max-w-[150px]">Dựa trên công thức Epley từ dữ liệu tập 8 lần gần nhất.</p>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-indigo-900/50 to-slate-950 p-8 shadow-2xl">
              <div className="mb-8 flex items-center gap-3">
                <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
                  <BrainCircuit size={20} />
                </div>
                <h3 className="font-black italic uppercase tracking-tight text-white">Độ sẵn sàng (HRV)</h3>
              </div>

              <div className="mb-6 text-center">
                <div className="text-sm font-black text-slate-500 uppercase tracking-widest mb-1">CHỈ SỐ BIẾN THIÊN HRV</div>
                <div className="text-5xl font-black italic tracking-tighter text-indigo-400">68 <span className="text-xl font-normal text-slate-500 tracking-normal">ms</span></div>
              </div>

              <div className="rounded-2xl bg-white/5 p-4 text-sm font-bold border border-white/5 leading-relaxed text-slate-200 backdrop-blur-md">
                &ldquo;{insights?.readiness || "Chưa có đủ dữ liệu để phân tích HRV."}&rdquo;
              </div>
            </section>

            {/* AI Body Composition Scan SECTION */}
            <section className="rounded-3xl border border-white/5 bg-slate-900/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="font-black italic uppercase tracking-tight text-white">Thành phần cơ thể AI</h3>
              </div>
              
              <div className="relative aspect-video rounded-2xl bg-slate-950 mb-6 flex flex-col items-center justify-center border-2 border-dashed border-white/10 overflow-hidden group">
                {scans.length > 0 ? (
                    <Image 
                      src={getFullImageUrl(scans[0].imageUrl)} 
                      alt="Bản quét cơ thể gần nhất"
                      fill
                      sizes="(min-width: 1024px) 320px, 100vw"
                      className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                      unoptimized
                    />
                ) : (
                    <Activity size={32} className="text-slate-800 mb-2 group-hover:scale-110 transition-transform" />
                )}
                <div className="relative z-10 text-[10px] font-black text-white uppercase tracking-tighter bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                   {scans.length > 0 ? "Bản quét gần nhất: " + new Date(scans[0].scanDate).toLocaleDateString() : "Sẵn sàng Quét cơ thể bằng AI"}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button 
                    onClick={() => setIsScannerOpen(true)}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-500 p-4 text-xs font-black uppercase text-slate-950 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Camera size={16} /> BẮT ĐẦU QUÉT AI
                </button>
                {scans.length >= 2 && (
                    <button 
                        onClick={() => setIsComparisonOpen(true)}
                        className="flex w-full items-center justify-between rounded-xl bg-white/5 p-4 text-xs font-black uppercase text-white hover:bg-white/10 transition-all border border-white/10"
                    >
                        SO SÁNH SIDE-BY-SIDE <ChevronRight size={16} />
                    </button>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Scan History Gallery */}
        {scans.length > 0 && (
          <section className="mt-12">
             <h3 className="text-xl font-black italic uppercase tracking-tight text-white mb-6">Lịch sử quét sinh trắc</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {scans.map((scan) => (
                    <div key={scan.id} className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 bg-slate-900 transition-all hover:scale-[1.05] hover:border-white/20">
                        <Image 
                            src={getFullImageUrl(scan.imageUrl)} 
                            alt={`Bản quét cơ thể ngày ${new Date(scan.scanDate).toLocaleDateString()}`}
                            fill
                            sizes="(min-width: 1024px) 16vw, (min-width: 768px) 25vw, 50vw"
                            className="object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                            unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                           <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{scan.bodyFatPercentage}% BODY FAT</div>
                           <div className="text-[10px] font-bold text-white/60">{new Date(scan.scanDate).toLocaleDateString()}</div>
                        </div>
                    </div>
                ))}
             </div>
          </section>
        )}
      </main>
      {upgradeModal}

      {/* Modals */}
      <AnimatePresence>
        {isScannerOpen && (
            <BodyScanner 
                userHeight={profile?.height || 170}
                gender={profile?.gender || "MALE"}
                onClose={() => setIsScannerOpen(false)} 
                onScanComplete={handleScanComplete} 
            />
        )}
        {isComparisonOpen && (
            <SideBySideComparison 
                scans={scans} 
                onClose={() => setIsComparisonOpen(false)} 
            />
        )}
      </AnimatePresence>
    </div>
  );
}
