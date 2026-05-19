"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { Transition } from "framer-motion";
import { Brain, Sparkles, Send, User, Cpu, Signal, Wifi, BatteryFull } from "lucide-react";
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
}

export default function AICoachPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isPremium = user?.roles?.includes("ROLE_PREMIUM");

  useEffect(() => {
    if (!user) return;
    setMessages([
      {
        id: "welcome",
        sender: "ai",
        text: `Xin chào ${user.name}! Tôi là Aura AI Coach. ${isPremium ? "🏆 Bạn đang sử dụng gói Premium - Mọi tính năng 'Mắt thần' và phân tích chuyên sâu đã sẵn sàng!" : "💡 Bạn đang dùng bản Miễn phí (5 câu hỏi/ngày)."}\n\nHôm nay tôi có thể giúp gì cho bạn?`,
        timestamp: new Date()
      }
    ]);
  }, [user, isPremium]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedImage) || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: input.trim() || (selectedImage ? "📷 [Hình ảnh]" : ""),
      timestamp: new Date()
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
        text: "Hệ thống đang bảo trì hoặc mất kết nối. Phiền bạn thử lại sau nha!",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (authLoading) return <AppLoading />;
  if (!user) return <AuthPage />;

  // 120fps ProMotion physics for Framer Motion
  const springConfig: Transition = { type: "spring", stiffness: 400, damping: 30, mass: 0.8 };

  return (
    <div className="flex min-h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <main className="ml-20 flex h-screen w-full items-center justify-center p-8">
        
        {/* IPHONE 14 PRO MAX MOCKUP CONTAINER */}
        <motion.div 
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={springConfig}
          className="relative flex h-[850px] w-[400px] flex-col overflow-hidden rounded-[3.5rem] border-[12px] border-slate-900 bg-background shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] ring-4 ring-slate-800/50"
        >
          {/* Hardware Buttons */}
          <div className="absolute -left-[14px] top-[120px] h-8 w-1 rounded-l-md bg-slate-900"></div> {/* Mute switch */}
          <div className="absolute -left-[14px] top-[170px] h-14 w-1 rounded-l-md bg-slate-900"></div> {/* Vol Up */}
          <div className="absolute -left-[14px] top-[240px] h-14 w-1 rounded-l-md bg-slate-900"></div> {/* Vol Down */}
          <div className="absolute -right-[14px] top-[200px] h-20 w-1 rounded-r-md bg-slate-900"></div> {/* Power */}

          {/* DYNAMIC ISLAND & STATUS BAR */}
          <div className="absolute top-0 z-50 flex w-full items-center justify-between px-7 pt-4 text-[13px] font-bold tracking-wider text-white">
            <span className="mt-0.5">9:41</span>
            {/* Dynamic Island Pill */}
            <motion.div 
              initial={{ width: "120px", height: "35px" }}
              animate={isTyping ? { width: "170px", height: "35px" } : { width: "120px", height: "35px" }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute left-1/2 top-3 flex -translate-x-1/2 items-center justify-between overflow-hidden rounded-full bg-black px-2 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
            >
              <AnimatePresence>
                {isTyping && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="flex items-center gap-1.5 pl-2 text-primary"
                  >
                    <motion.div className="h-1.5 w-1.5 rounded-full bg-primary" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} />
                    <motion.div className="h-1.5 w-1.5 rounded-full bg-primary" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} />
                    <motion.div className="h-1.5 w-1.5 rounded-full bg-primary" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="absolute right-2.5 top-1/2 flex h-3.5 w-3.5 -translate-y-1/2 items-center justify-center rounded-full bg-slate-800/40">
                <div className="h-2 w-2 rounded-full bg-[#111]"></div>
              </div>
            </motion.div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Signal size={14} className="opacity-90" />
              <Wifi size={14} className="opacity-90" />
              <BatteryFull size={16} className="opacity-90" />
            </div>
          </div>

          {/* APP HEADER */}
          <div className="z-40 flex items-center justify-between border-b border-white/5 bg-background/80 px-6 pb-4 pt-16 backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <div className="relative">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary shadow-lg ring-1 ring-primary/20"
                >
                  <Cpu size={22} />
                </motion.div>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-emerald-500"></span>
              </div>
              <div>
                <h3 className="text-base font-black italic tracking-tight text-white">Aura Coach</h3>
                <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-primary uppercase">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary"></span>
                  </span>
                  Trực Tuyến
                </p>
              </div>
            </div>
            {isPremium && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-500 ring-1 ring-amber-500/20"
              >
                Premium
              </motion.div>
            )}
          </div>

          {/* CHAT MESSAGES */}
          <div ref={scrollRef} className="custom-scrollbar flex-1 overflow-y-auto overflow-x-hidden bg-slate-950/40 p-5 space-y-6 pb-8">
             <AnimatePresence initial={false}>
               {messages.map((m) => (
                 <motion.div 
                   key={m.id}
                   initial={{ opacity: 0, y: 20, scale: 0.95 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   transition={springConfig}
                   className={`flex w-full ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                 >
                    <div className={`flex max-w-[85%] items-end gap-2.5 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      {/* Avatar */}
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full shadow-md ${m.sender === "user" ? "bg-slate-800 text-white" : "bg-gradient-to-br from-primary to-emerald-500 text-background"}`}>
                        {m.sender === "user" ? <User size={16} /> : <Sparkles size={16} />}
                      </div>
                      
                      {/* Bubble */}
                      <div className={`relative rounded-[1.25rem] px-4 py-3 shadow-sm ${
                          m.sender === "user" 
                            ? "rounded-br-sm bg-primary text-background" 
                            : "rounded-bl-sm bg-slate-800/90 text-foreground ring-1 ring-white/5 backdrop-blur-md"
                        }`}>
                        <p className="text-[15px] font-medium leading-relaxed whitespace-pre-wrap">{m.text}</p>
                        <div className={`mt-1.5 text-[10px] font-bold ${m.sender === "user" ? "text-background/60" : "text-muted-foreground"}`}>
                          {m.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                 </motion.div>
               ))}
               {isTyping && (
                 <motion.div 
                   initial={{ opacity: 0, y: 20, scale: 0.95 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                   transition={springConfig}
                   className="flex w-full justify-start"
                 >
                    <div className="flex items-end gap-2.5">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-500 text-background shadow-md">
                        <Sparkles size={16} />
                      </div>
                      <div className="rounded-[1.25rem] rounded-bl-sm bg-slate-800/90 px-4 py-3.5 ring-1 ring-white/5 backdrop-blur-md">
                        <div className="flex gap-1.5 py-1">
                          <motion.div className="h-1.5 w-1.5 rounded-full bg-primary/60" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                          <motion.div className="h-1.5 w-1.5 rounded-full bg-primary/80" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} />
                          <motion.div className="h-1.5 w-1.5 rounded-full bg-primary" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} />
                        </div>
                      </div>
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          {/* INPUT AREA */}
          <div className="z-40 border-t border-white/5 bg-background/80 px-4 pb-8 pt-3 backdrop-blur-2xl">
            {selectedImage && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 relative inline-block"
              >
                <Image
                  src={selectedImage}
                  alt="Preview"
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-xl object-cover border border-primary/50 shadow-lg"
                  unoptimized
                />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-white text-[10px] font-bold shadow-md hover:bg-red-500 transition-colors"
                >
                  ✕
                </button>
              </motion.div>
            )}
            
            {/* Suggestions */}
            {!selectedImage && messages.length < 3 && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="mb-3 flex gap-2 overflow-x-auto pb-1 custom-scrollbar"
              >
                {['Hôm nay ăn gì?', 'Tạo lịch tập', 'Phân tích form'].map((suggestion, i) => (
                  <motion.button 
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    key={i} 
                    type="button"
                    onClick={() => setInput(suggestion)}
                    className="flex-shrink-0 rounded-full border border-white/5 bg-slate-800/50 px-3.5 py-1.5 text-[12px] font-bold text-slate-300 transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </motion.div>
            )}

            <form onSubmit={handleSend} className="relative flex items-end gap-2.5">
              <input 
                type="file" 
                accept="image/*" 
                hidden 
                ref={fileInputRef} 
                onChange={handleImageSelect}
              />
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-full transition-all ${
                  isPremium 
                    ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Sparkles size={20} className={isPremium ? "animate-pulse" : ""} />
              </motion.button>

              <div className="relative flex-1">
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={isPremium ? "Hỏi Aura..." : "Nhập tin nhắn..."}
                  className="h-[42px] w-full rounded-full border border-white/5 bg-slate-900/80 pl-4 pr-11 text-[14px] font-medium text-white placeholder-slate-500 focus:border-primary/50 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                />
                <AnimatePresence>
                  {(input.trim() || selectedImage) && !isTyping && (
                    <motion.button 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      type="submit" 
                      className="absolute right-1 top-1 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-primary text-background shadow-md transition-transform hover:scale-105 active:scale-95"
                    >
                      <Send size={16} className="ml-0.5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>

          {/* HOME INDICATOR */}
          <div className="absolute bottom-2 left-1/2 z-50 h-1 w-32 -translate-x-1/2 rounded-full bg-white/40"></div>
        </motion.div>
        
        {/* Right side info area */}
        <div className="ml-16 hidden max-w-md flex-col justify-center xl:flex">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="flex items-center gap-3 text-5xl font-black uppercase tracking-tight text-white">
              <Brain className="text-primary" size={48} /> Aura AI
            </h1>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-400">120Hz ProMotion Experience</h2>
            <p className="mt-6 text-base leading-relaxed text-slate-500">
              Trải nghiệm huấn luyện viên AI đỉnh cao với giao diện siêu mượt mà mô phỏng iPhone 14 Pro Max.
              Hệ thống vật lý <span className="font-bold text-primary">Framer Motion Spring</span> mang lại cảm giác phản hồi 120fps chân thực nhất.
            </p>
            
            <div className="mt-8 flex flex-col gap-4">
              <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <Cpu size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Dynamic Island</h4>
                  <p className="text-sm text-slate-400">Tương tác thời gian thực</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-500">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Fluid Animations</h4>
                  <p className="text-sm text-slate-400">60-120fps Spring Physics</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      </main>
    </div>
  );
}
