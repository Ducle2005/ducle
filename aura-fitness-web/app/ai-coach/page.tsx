"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, Send, User, Bot, Camera, ChevronRight, Zap, Shield, MessageSquare } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { AuthPage } from "@/components/AuthPage";
import { AppLoading } from "@/components/AppLoading";
import { useAuth } from "@/context/AuthContext";
import { aiCoachApi } from "@/lib/aiCoachApi";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  image?: string;
}

function formatMessageText(text: string): React.ReactNode {
  const lines = text
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/^\s*[\*\-]\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .split('\n');

  return lines.map((line, i) => (
    <span key={i}>
      {i > 0 && <br />}
      <span dangerouslySetInnerHTML={{ __html: line }} />
    </span>
  ));
}

const SUGGESTIONS = ['Hôm nay ăn gì?', 'Lập kế hoạch tập', 'Phân tích form', 'Nghỉ bao lâu?', 'Bài tập tăng cơ'];

export default function AICoachPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isPremium = user?.roles?.includes("ROLE_PREMIUM");

  useEffect(() => {
    if (!user) return;
    setMessages([
      {
        id: "welcome",
        sender: "ai",
        text: `Xin chào **${user.name}**! Tôi là huấn luyện viên AI Aura. ${isPremium ? "🏆 Gói **Cao Cấp** đã kích hoạt — phân tích ảnh & tư thế, AI không giới hạn!" : "💡 Bạn đang dùng bản miễn phí (5 câu hỏi/ngày)."}

Hôm nay tôi có thể giúp gì cho bạn?`,
        timestamp: new Date()
      }
    ]);
  }, [user, isPremium]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (text?: string, e?: React.FormEvent) => {
    e?.preventDefault();
    const messageText = text || input;
    if ((!messageText.trim() && !selectedImage) || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: messageText.trim() || "📷 [Hình ảnh]",
      timestamp: new Date(),
      image: selectedImage || undefined,
    };

    setMessages(prev => [...prev, userMsg]);
    const currentImage = selectedImage;
    setInput("");
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const res = await aiCoachApi.sendMessage(userMsg.text, currentImage || undefined);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: res.reply,
        timestamp: new Date()
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Hệ thống đang bảo trì hoặc mất kết nối. Phiền bạn thử lại sau nha! 🙏",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (authLoading) return <AppLoading />;
  if (!user) return <AuthPage />;

  return (
    <div className="flex min-h-screen bg-[#07080c] text-foreground">
      <Sidebar />
      <main className="flex flex-1 flex-col lg:ml-20">
        <div className="flex h-screen flex-col relative overflow-hidden">
          
          {/* Subtle Background Radial Glows */}
          <div className="absolute top-0 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />

          {/* ── HEADER ── */}
          <header className="z-20 flex items-center justify-between border-b border-white/[0.05] bg-[#090a0f]/90 px-6 py-4 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 ring-1 ring-primary/20 shadow-lg shadow-primary/10">
                <Brain size={24} className="text-primary" />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-[#090a0f] bg-emerald-500">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400 opacity-75" />
                </span>
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white uppercase italic">Huấn luyện viên Aura AI</h1>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Trực tuyến · Phản hồi tức thì
                </p>
              </div>
            </div>
            {isPremium ? (
              <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-3.5 py-2 ring-1 ring-amber-500/20 shadow-lg shadow-amber-500/5">
                <Zap size={13} className="text-amber-400" fill="currentColor" />
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">VIP · Không giới hạn</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-full bg-white/5 px-3.5 py-2 ring-1 ring-white/10">
                <Shield size={13} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">5 câu hỏi/ngày</span>
              </div>
            )}
          </header>

          {/* ── CHAT AREA ── */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 custom-scrollbar">
            <div className="mx-auto w-full max-w-3xl space-y-6">
              
              {/* Custom Dashboard Empty State when only Welcome msg is present */}
              {messages.length === 1 && messages[0].id === "welcome" ? (
                <div className="py-8 text-center space-y-8">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 shadow-xl"
                  >
                    <div className="absolute inset-0 rounded-[2rem] bg-primary/20 blur-xl animate-pulse" />
                    <Brain size={40} className="text-primary relative z-10" />
                  </motion.div>
                  
                  <div className="max-w-md mx-auto space-y-2">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">Tập luyện thông minh cùng Aura AI</h2>
                    <p className="text-sm font-medium text-slate-400 leading-relaxed">
                      Tôi là chuyên gia AI về Thể hình và Dinh dưỡng của riêng bạn. Hãy hỏi tôi về bài tập, thực đơn ăn uống hoặc cách cải thiện cơ bắp!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto pt-4">
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-primary/20 transition-all group">
                      <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                        💪 Luyện tập & Lịch tập
                      </h4>
                      <div className="space-y-2">
                        <button onClick={() => setInput("Gợi ý lịch tập 4 buổi/tuần cho nam")} className="w-full text-left text-xs font-semibold text-slate-300 hover:text-white transition-colors bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.03]">
                          "Gợi ý lịch tập 4 buổi/tuần"
                        </button>
                        <button onClick={() => setInput("Cách thở đúng khi tập Bench Press")} className="w-full text-left text-xs font-semibold text-slate-300 hover:text-white transition-colors bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.03]">
                          "Cách thở đúng khi tập Bench Press"
                        </button>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-primary/20 transition-all group">
                      <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        🍎 Dinh dưỡng & Thực đơn
                      </h4>
                      <div className="space-y-2">
                        <button onClick={() => setInput("Thiết kế thực đơn tăng cơ 2500 calo")} className="w-full text-left text-xs font-semibold text-slate-300 hover:text-white transition-colors bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.03]">
                          "Thiết kế thực đơn tăng cơ 2500 calo"
                        </button>
                        <button onClick={() => setInput("Ăn gì trước tập để có nhiều năng lượng?")} className="w-full text-left text-xs font-semibold text-slate-300 hover:text-white transition-colors bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.03]">
                          "Ăn gì trước tập để có năng lượng?"
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
                      className={`flex w-full items-start gap-4 ${
                        m.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* AI Avatar */}
                      {m.sender === "ai" && (
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-400 shadow-lg shadow-primary/20 border border-primary/20">
                          <Bot size={18} className="text-white" />
                        </div>
                      )}

                      <div className={`flex max-w-[80%] flex-col gap-1.5 ${
                        m.sender === "user" ? "items-end" : "items-start"
                      }`}>
                        {m.image && (
                          <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl max-w-sm mb-1">
                            <img src={m.image} alt="Uploaded" className="h-44 w-full object-cover" />
                          </div>
                        )}
                        <div
                          className={`relative rounded-2xl px-5 py-3.5 text-[14.5px] font-medium leading-[1.65] shadow-xl ${
                            m.sender === "user"
                              ? "rounded-tr-sm bg-gradient-to-r from-primary to-orange-500 text-white shadow-primary/10 border border-primary/20"
                              : "rounded-tl-sm bg-white/[0.03] text-slate-100 border border-white/[0.08] backdrop-blur-md"
                          }`}
                        >
                          <div className="whitespace-pre-wrap break-words">{formatMessageText(m.text)}</div>
                        </div>
                        <span className="px-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {m.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      {/* User Avatar */}
                      {m.sender === "user" && (
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-white/5 shadow-md">
                          <User size={16} className="text-slate-300" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-400 shadow-lg shadow-primary/20 border border-primary/20">
                    <Bot size={18} className="text-white" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-white/[0.03] border border-white/[0.08] px-5 py-4 backdrop-blur-md shadow-lg">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map(i => (
                        <span
                          key={i}
                          className="h-2 w-2 rounded-full bg-primary/80 animate-bounce"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* ── INPUT AREA ── */}
          <div className="border-t border-white/[0.05] bg-[#090a0f]/90 px-4 pb-6 pt-4 backdrop-blur-xl sm:px-6 lg:px-8 z-10">
            <div className="mx-auto w-full max-w-3xl">
              
              {/* Suggestion chips */}
              {messages.length < 3 && messages.length > 1 && (
                <div className="mb-3 flex flex-wrap gap-2 justify-center">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSend(s)}
                      className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.02] px-3.5 py-1.5 text-[12.5px] font-semibold text-slate-300 transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                    >
                      <MessageSquare size={11} />
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Image preview */}
              {selectedImage && (
                <div className="relative mb-3 inline-block">
                  <div className="relative overflow-hidden rounded-xl border border-primary/40 shadow-xl">
                    <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover" />
                  </div>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md hover:bg-red-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}

              <form onSubmit={(e) => handleSend(undefined, e)} className="flex items-center gap-3">
                <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleImageSelect} />

                {/* Camera button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-all border ${
                    isPremium
                      ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/35 text-amber-400 shadow-lg shadow-amber-500/5 hover:scale-105"
                      : "bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Camera size={20} />
                </button>

                {/* Text input */}
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={isTyping ? "Đang phân tích..." : isPremium ? "Hỏi bất cứ điều gì về thể hình..." : "Nhập câu hỏi của bạn..."}
                    disabled={isTyping}
                    className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] pl-4 pr-12 text-[14px] font-medium text-white placeholder-slate-500 transition-all focus:border-primary/50 focus:bg-white/[0.04] focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
                  />
                  <AnimatePresence>
                    {(input.trim() || selectedImage) && !isTyping && (
                      <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        type="submit"
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-background shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <Send size={14} className="ml-0.5" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
