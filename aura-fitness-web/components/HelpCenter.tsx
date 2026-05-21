"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  CreditCard,
  Dumbbell,
  FileText,
  HelpCircle,
  History,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

type HelpTab = "guide" | "faq" | "contact" | "report" | "policies";

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const guideItems = [
  {
    icon: UserRound,
    title: "Đăng ký / đăng nhập",
    text: "Mở trang Aura Fitness, chọn tạo tài khoản, nhập họ tên, email và mật khẩu. Sau khi đăng nhập, app sẽ tự lưu phiên bằng token.",
  },
  {
    icon: Dumbbell,
    title: "Xem gói tập",
    text: "Vào mục Tập luyện để xem giáo án hôm nay, các buổi đã tạo và bài tập trong từng buổi.",
  },
  {
    icon: RefreshCw,
    title: "Gia hạn membership",
    text: "Chọn nâng cấp VIP hoặc liên hệ quầy lễ tân để gia hạn. Trạng thái gói sẽ được cập nhật sau khi xác nhận thanh toán.",
  },
  {
    icon: CalendarClock,
    title: "Đặt lịch tập / PT",
    text: "Kiểm tra lịch trống với nhân viên hoặc PT, sau đó xác nhận thời gian tập. Nếu cần đổi lịch, hãy báo trước giờ hẹn.",
  },
  {
    icon: History,
    title: "Xem lịch sử thanh toán",
    text: "Các giao dịch membership và thanh toán PT sẽ được đối soát bởi phòng gym. Khi cần sao kê, dùng Contact Support.",
  },
  {
    icon: UserRound,
    title: "Cập nhật thông tin cá nhân",
    text: "Vào Cài đặt để đổi tên, chỉ số cơ thể, đơn vị đo, giao diện và mật khẩu.",
  },
];

const faqs = [
  {
    question: "Tôi quên mật khẩu thì làm sao?",
    answer: "Dùng chức năng đổi mật khẩu nếu còn đăng nhập, hoặc liên hệ hotline để được xác minh tài khoản và đặt lại mật khẩu.",
  },
  {
    question: "Làm sao để đổi gói tập?",
    answer: "Liên hệ quầy lễ tân hoặc gửi yêu cầu hỗ trợ. Nhân viên sẽ kiểm tra số ngày còn lại và tư vấn gói phù hợp.",
  },
  {
    question: "Có thể hủy lịch PT không?",
    answer: "Có. Bạn nên báo trước tối thiểu 6 giờ để phòng gym sắp xếp lại lịch cho PT.",
  },
  {
    question: "Thanh toán rồi nhưng chưa được cập nhật thì sao?",
    answer: "Chụp lại biên lai hoặc mã giao dịch, chọn Report an Issue và gửi nhóm Khiếu nại thanh toán.",
  },
  {
    question: "Gói tập còn bao nhiêu ngày xem ở đâu?",
    answer: "Thông tin membership sẽ hiển thị trong hồ sơ hoặc được nhân viên kiểm tra khi bạn liên hệ hỗ trợ.",
  },
];

const policies = [
  "Gói tập tự động kết thúc khi hết hạn; gia hạn cần được xác nhận thanh toán.",
  "Hoàn tiền chỉ áp dụng khi có lỗi thanh toán hoặc trường hợp đặc biệt được phòng gym phê duyệt.",
  "Thành viên cần tuân thủ nội quy phòng tập, giữ vệ sinh thiết bị và không chia sẻ tài khoản.",
  "Thông tin cá nhân chỉ dùng cho quản lý hội viên, lịch tập, thanh toán và hỗ trợ khách hàng.",
];

const reportTypes = [
  "Báo lỗi app",
  "Góp ý tính năng",
  "Khiếu nại thanh toán",
  "Vấn đề với lịch tập",
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function HelpCenter({ isOpen, onClose }: HelpCenterProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<HelpTab>("guide");
  const [reportType, setReportType] = useState(reportTypes[0]);
  const [message, setMessage] = useState("");
  const [selectedFaq, setSelectedFaq] = useState(0);

  const tabs = useMemo(
    () => [
      { id: "guide" as const, label: "Hướng dẫn", icon: HelpCircle },
      { id: "faq" as const, label: "FAQ", icon: MessageCircle },
      { id: "contact" as const, label: "Liên hệ", icon: Phone },
      { id: "report" as const, label: "Báo lỗi", icon: AlertTriangle },
      { id: "policies" as const, label: "Chính sách", icon: ShieldCheck },
    ],
    [],
  );

  const submitReport = () => {
    if (message.trim().length < 10) {
      toast.warning("Vui lòng mô tả vấn đề ít nhất 10 ký tự.");
      return;
    }

    setMessage("");
    setReportType(reportTypes[0]);
    toast.success("Đã ghi nhận phản hồi. Nhân viên sẽ kiểm tra sớm.");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-3 sm:p-6">
          <motion.button
            type="button"
            aria-label="Đóng trợ giúp"
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label="Help Center"
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 22, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020] text-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-orange-300">Aura Fitness</div>
                <h2 className="mt-1 text-xl font-black sm:text-2xl">Help Center</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </header>

            <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[220px_1fr]">
              <nav className="flex gap-2 overflow-x-auto border-b border-white/10 p-3 lg:flex-col lg:border-b-0 lg:border-r lg:p-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition lg:w-full",
                        active ? "bg-orange-500 text-slate-950" : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <Icon size={17} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
                {activeTab === "guide" && (
                  <div>
                    <h3 className="text-lg font-black">Hướng dẫn sử dụng app</h3>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {guideItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <article key={item.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                            <div className="flex items-start gap-3">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-300">
                                <Icon size={20} />
                              </span>
                              <div>
                                <h4 className="font-black">{item.title}</h4>
                                <p className="mt-2 text-sm leading-6 text-white/68">{item.text}</p>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === "faq" && (
                  <div>
                    <h3 className="text-lg font-black">Câu hỏi thường gặp</h3>
                    <div className="mt-5 grid gap-3 lg:grid-cols-[300px_1fr]">
                      <div className="space-y-2">
                        {faqs.map((item, index) => (
                          <button
                            key={item.question}
                            type="button"
                            onClick={() => setSelectedFaq(index)}
                            className={cn(
                              "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-bold transition",
                              selectedFaq === index ? "bg-orange-500 text-slate-950" : "bg-white/5 text-white/75 hover:bg-white/10",
                            )}
                          >
                            <span>{item.question}</span>
                            <ChevronRight size={16} />
                          </button>
                        ))}
                      </div>
                      <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
                        <h4 className="text-base font-black">{faqs[selectedFaq].question}</h4>
                        <p className="mt-3 text-sm leading-7 text-white/70">{faqs[selectedFaq].answer}</p>
                      </article>
                    </div>
                  </div>
                )}

                {activeTab === "contact" && (
                  <div>
                    <h3 className="text-lg font-black">Liên hệ hỗ trợ</h3>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {[
                        { icon: Phone, title: "Hotline", value: "0901 234 567" },
                        { icon: Mail, title: "Email hỗ trợ", value: "support@aurafitness.vn" },
                        { icon: CalendarClock, title: "Giờ làm việc", value: "06:00 - 22:00, Thứ 2 - Chủ nhật" },
                        { icon: MapPin, title: "Địa chỉ", value: "Aura Fitness Center, Quận 1, TP. Hồ Chí Minh" },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <article key={item.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                            <Icon className="text-orange-300" size={22} />
                            <h4 className="mt-3 text-sm font-black uppercase tracking-wide text-white/50">{item.title}</h4>
                            <p className="mt-1 font-bold">{item.value}</p>
                          </article>
                        );
                      })}
                    </div>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <a href="mailto:support@aurafitness.vn" className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-orange-400">
                        <Mail size={18} />
                        Contact Support
                      </a>
                      <button type="button" onClick={() => toast.info("Chat with Staff sẽ sớm được kích hoạt.")} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10">
                        <MessageCircle size={18} />
                        Chat with Staff
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "report" && (
                  <div>
                    <h3 className="text-lg font-black">Báo lỗi / Gửi phản hồi</h3>
                    <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                      <label className="text-xs font-black uppercase tracking-wide text-white/50">Loại phản hồi</label>
                      <select
                        value={reportType}
                        onChange={(event) => setReportType(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-[#12182a] px-4 py-3 text-sm font-bold text-white outline-none focus:border-orange-400"
                      >
                        {reportTypes.map((type) => (
                          <option key={type}>{type}</option>
                        ))}
                      </select>

                      <label className="mt-4 block text-xs font-black uppercase tracking-wide text-white/50">Mô tả vấn đề</label>
                      <textarea
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        rows={5}
                        placeholder="Ví dụ: Thanh toán đã chuyển khoản nhưng membership chưa cập nhật..."
                        className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-[#12182a] px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-white/35 focus:border-orange-400"
                      />

                      <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-4 text-sm font-bold text-white/65 transition hover:bg-white/10">
                        <FileText size={18} />
                        Gửi ảnh lỗi nếu cần
                        <input type="file" accept="image/*" className="hidden" />
                      </label>

                      <button type="button" onClick={submitReport} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-orange-400">
                        <AlertTriangle size={18} />
                        Report an Issue
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "policies" && (
                  <div>
                    <h3 className="text-lg font-black">Điều khoản & chính sách</h3>
                    <div className="mt-5 space-y-3">
                      {policies.map((policy) => (
                        <article key={policy} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                          <ShieldCheck className="mt-0.5 shrink-0 text-orange-300" size={20} />
                          <p className="text-sm leading-6 text-white/72">{policy}</p>
                        </article>
                      ))}
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-white/5 p-4">
                        <CreditCard className="text-orange-300" size={22} />
                        <h4 className="mt-3 font-black">Hủy / gia hạn gói tập</h4>
                        <p className="mt-2 text-sm leading-6 text-white/65">Các thay đổi membership cần xác nhận bởi phòng gym để đảm bảo quyền lợi hội viên.</p>
                      </div>
                      <div className="rounded-xl bg-white/5 p-4">
                        <FileText className="text-orange-300" size={22} />
                        <h4 className="mt-3 font-black">Bảo mật thông tin</h4>
                        <p className="mt-2 text-sm leading-6 text-white/65">Aura Fitness chỉ hiển thị dữ liệu cần thiết cho trải nghiệm tập luyện và hỗ trợ.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  );
}
