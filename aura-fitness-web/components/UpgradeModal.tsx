"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, CreditCard, Sparkles, Crown, Zap, ShieldCheck, Diamond } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { API_BASE_URL } from "@/lib/api";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess?: () => void;
}

const PLANS = [
  { id: "weekly", name: "1 Tuần", price: 49000, color: "from-blue-500/20 to-cyan-500/20", borderColor: "border-cyan-500/50" },
  { id: "monthly", name: "1 Tháng", price: 149000, color: "from-purple-500/20 to-indigo-500/20", borderColor: "border-purple-500/50", popular: true },
  { id: "yearly", name: "1 Năm", price: 999000, color: "from-amber-500/20 to-orange-500/20", borderColor: "border-amber-500/50" },
  { id: "trial", name: "Dùng thử 1 Năm", price: 0, color: "from-emerald-500/20 to-teal-500/20", borderColor: "border-emerald-500/50" },
];

const CONFETTI_PARTICLES = Array.from({ length: 15 }, (_, index) => {
  const angle = (index / 15) * Math.PI * 2;
  return {
    angle,
    distance: 150 + ((index * 37) % 100),
    delay: ((index * 11) % 40) / 100,
  };
});

export function UpgradeModal({ isOpen, onClose, onUpgradeSuccess }: UpgradeModalProps) {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1]);
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const bankId = "MB";
  const accountNo = "0347548188";
  const accountName = "LE VIET DUC";

  const content = `AuraVIP ${user?.email || user?.name || "User"} ${selectedPlan.id}`.replace(/\s/g, "%20");
  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${selectedPlan.price}&addInfo=${content}&accountName=${encodeURIComponent(accountName)}`;

  const completeUpgrade = useCallback(async () => {
    await refreshUser();
    setSuccess(true);
    setShowQR(false);
    toast.success("Đăng ký gói cao cấp thành công. Aura VIP đã được mở khóa.");
    onUpgradeSuccess?.();
  }, [onUpgradeSuccess, refreshUser, toast]);

  // Polling logic for automatic payment detection
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showQR && user?.email && !success) {
      interval = setInterval(async () => {
        try {
          // Use direct fetch to avoid the global interceptor which removes
          // the auth token on 401 and redirects to login during polling.
          const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
          if (!token) return;
          const response = await fetch(`${API_BASE_URL}/payment/check-status`, {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });
          if (!response.ok) return; // Silently ignore errors during polling
          const res = await response.json();
          if (res.isPremium) {
            await completeUpgrade();
          }
        } catch {}
      }, 3000); // Check every 3 seconds
    }
    return () => clearInterval(interval);
  }, [completeUpgrade, showQR, user?.email, success]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // Call upgrade API directly with fetch to avoid the global interceptor
      // which removes the auth token and redirects to login on 401/403 errors.
      const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/auth/upgrade`, {
        method: "POST",
        headers,
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        let errorMessage = "Không thể nâng cấp gói cao cấp. Vui lòng thử lại.";
        if (contentType.includes("application/json")) {
          const body = await response.json().catch(() => null);
          if (body?.message) errorMessage = body.message;
        }
        throw new Error(errorMessage);
      }

      await completeUpgrade();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể nâng cấp gói cao cấp. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    if (!loading && !success) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-h-[calc(100vh-2rem)] w-full max-w-5xl overflow-y-auto rounded-[2.5rem] border border-white/10 bg-slate-900 shadow-[0_0_100px_rgba(0,0,0,0.8)]"
          >
            {/* Background glow effects */}
            <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />

            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex h-[600px] flex-col items-center justify-center text-center p-12 relative z-10"
              >
                <div className="relative mb-12">
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.5, duration: 1 }}
                    className="relative z-10 flex h-40 w-40 items-center justify-center rounded-[2.5rem] bg-gradient-to-tr from-amber-400 to-yellow-200 shadow-[0_0_80px_rgba(251,191,36,0.6)] border-4 border-amber-300"
                  >
                    <Diamond size={80} className="text-amber-900 drop-shadow-md" fill="currentColor" />
                  </motion.div>
                  {/* Confetti particles */}
                  {CONFETTI_PARTICLES.map((particle, i) => {
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                        animate={{ 
                          opacity: [0, 1, 0],
                          scale: [0.5, 1.5, 0.5],
                          x: Math.cos(particle.angle) * particle.distance,
                          y: Math.sin(particle.angle) * particle.distance
                        }}
                        transition={{ duration: 2, ease: "easeOut", delay: particle.delay }}
                        className="absolute left-1/2 top-1/2 h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]"
                        style={{ marginLeft: -6, marginTop: -6 }}
                      />
                    );
                  })}
                </div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-1.5 text-xs font-black text-amber-400 border border-amber-500/30 uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                >
                  <Crown size={14} className="text-amber-400" /> THÀNH CÔNG RỰC RỠ
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-6 bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-5xl font-black italic tracking-tighter text-transparent drop-shadow-xl"
                >
                  CHÀO MỪNG VIP<br/> TỚI AURA FITNESS
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="max-w-lg text-lg text-slate-300 font-medium animate-pulse"
                >
                  Giao dịch thành công. Toàn bộ đặc quyền &quot;Mắt Thần&quot; và Aura Neural Engine PRO đã được mở khóa dành riêng cho bạn.
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                  onClick={() => {
                    onClose();
                    setTimeout(() => {
                      setSuccess(false);
                      setLoading(false);
                    }, 500);
                  }}
                  className="mt-10 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-8 py-4 text-sm font-black uppercase text-slate-950 shadow-[0_0_30px_rgba(251,191,36,0.3)] transition-all hover:scale-[1.03] active:scale-95 hover:shadow-[0_0_50px_rgba(251,191,36,0.5)] cursor-pointer"
                >
                  Bắt đầu trải nghiệm VIP
                </motion.button>
              </motion.div>
            ) : (
              <div className="flex h-full flex-col lg:flex-row">
                {/* LEFT SIDE: Info */}
                <div className="flex flex-1 flex-col p-8 lg:p-14 relative z-10">
                  <div className="mb-10">
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-4 py-1.5 text-xs font-black text-amber-400 border border-amber-500/30 uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                    >
                      <Crown size={14} className="text-amber-400" /> Đặc quyền Aura VIP
                    </motion.div>
                    <h2 className="text-5xl font-black italic tracking-tighter text-white drop-shadow-lg leading-[1.1]">
                      MỞ KHÓA <br/><span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">SỨC MẠNH AI</span>
                    </h2>
                    <p className="mt-5 text-slate-400 font-medium text-lg max-w-sm">Trải nghiệm huấn luyện viên cá nhân thông minh nhất với công nghệ đồng bộ thần kinh Aura.</p>
                  </div>

                  <div className="space-y-5 mb-10">
                    {[
                      { icon: <Sparkles size={18} className="text-primary" />, text: "Không giới hạn tương tác với huấn luyện AI" },
                      { icon: <Check size={18} className="text-cyan-400" />, text: "Tính năng 'Mắt Thần' phân tích ảnh & tư thế" },
                      { icon: <Crown size={18} className="text-amber-400" />, text: "Kích hoạt mô hình AI Gemini 1.5 Pro" },
                      { icon: <Zap size={18} className="text-orange-400" />, text: "Gợi ý lộ trình tập luyện cá nhân hóa 100%" }
                    ].map((feat, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                        key={i} 
                        className="flex items-center gap-4"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                          {feat.icon}
                        </div>
                        <span className="text-[15px] font-bold text-slate-200">{feat.text}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-auto">
                    <div className="grid grid-cols-2 gap-4">
                      {PLANS.map((plan) => (
                        <button
                          key={plan.id}
                          onClick={() => { setSelectedPlan(plan); setShowQR(false); }}
                          className={`relative flex flex-col rounded-3xl border p-5 text-left transition-all duration-300 overflow-hidden ${
                            selectedPlan.id === plan.id 
                              ? `border-primary bg-primary/10 shadow-[0_0_30px_rgba(var(--primary),0.15)] scale-[1.02] z-10` 
                              : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10"
                          }`}
                        >
                          {selectedPlan.id === plan.id && (
                             <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                          )}
                          {plan.popular && (
                            <span className="absolute -top-1 right-3 rounded-b-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-[9px] font-black text-white uppercase shadow-lg">Phổ biến</span>
                          )}
                          <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{plan.name}</span>
                          <span className="mt-2 text-2xl font-black text-white tracking-tight">{plan.price === 0 ? "MIỄN PHÍ" : `${plan.price.toLocaleString()}đ`}</span>
                          {plan.id === "trial" && (
                            <span className="mt-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md inline-block w-max">Ưu đãi 1 năm</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE: Payment */}
                <div className="flex w-full flex-col border-l border-white/5 bg-slate-950/50 p-8 lg:w-[440px] relative z-10 backdrop-blur-md">
                  {!showQR ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex h-full flex-col items-center justify-center text-center p-4"
                    >
                      <div className="relative mb-8">
                        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 shadow-2xl">
                          <CreditCard size={40} className="text-primary drop-shadow-md" />
                        </div>
                      </div>
                      <h3 className="mb-3 text-2xl font-black text-white">Thanh toán an toàn</h3>
                      <p className="mb-10 text-sm font-medium text-slate-400 uppercase tracking-widest leading-relaxed">
                        Hỗ trợ chuyển khoản <br/>QR chuẩn VietQR
                      </p>
                      
                      <button 
                        onClick={() => setShowQR(true)}
                        className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-white py-5 text-sm font-black text-black transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <Zap size={20} className="text-amber-500" fill="currentColor" /> XÁC NHẬN CHỌN GÓI
                      </button>
                      
                      <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <ShieldCheck size={14} /> Encrypted & Secure Payment
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex h-full flex-col items-center justify-center text-center p-2"
                    >
                      <div className="mb-6 rounded-[2rem] border-[6px] border-white/10 bg-white p-3 shadow-2xl relative group">
                        <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-primary/30 to-purple-500/30 blur-xl -z-10 group-hover:bg-gradient-to-br group-hover:from-primary/50 group-hover:to-purple-500/50 transition-all duration-500" />
                        <img src={qrUrl} alt="QR Code" className="h-56 w-56 rounded-xl object-contain mix-blend-multiply" />
                      </div>
                      
                      <div className="mb-8 w-full rounded-3xl bg-slate-900 p-6 border border-white/5 shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-primary" />
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Thông tin chuyển khoản</div>
                        <div className="text-sm font-black text-white mb-1">Ngân hàng MB - LE VIET DUC</div>
                        <div className="text-2xl font-black text-primary tracking-tighter mb-4">{accountNo}</div>
                        <div className="inline-flex w-full justify-center rounded-xl bg-black/50 px-4 py-3 text-xs font-mono text-slate-300 border border-white/5 break-all shadow-inner">
                          ND: {content.replace(/%20/g, " ")}
                        </div>
                      </div>

                      <button 
                        onClick={handleUpgrade}
                        disabled={loading}
                        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-600 py-4 text-sm font-black text-white transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-95 disabled:opacity-50"
                      >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative z-10 flex items-center gap-2">
                          {loading ? "ĐANG KIỂM TRA GIAO DỊCH..." : "TÔI ĐÃ CHUYỂN KHOẢN"}
                        </span>
                      </button>
                      
                      <button 
                        onClick={() => setShowQR(false)}
                        className="mt-6 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                      >
                        Quay lại chọn gói khác
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {!success && (
              <button 
                onClick={closeModal}
                className="absolute right-6 top-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-slate-400 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white hover:rotate-90"
              >
                <X size={20} />
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
