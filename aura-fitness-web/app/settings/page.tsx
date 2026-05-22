"use client";

import { useEffect, useState, FormEvent, useMemo } from "react";
import { Sidebar } from "@/components/Sidebar";
import { AuthPage } from "@/components/AuthPage";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { apiFetch } from "@/lib/api";
import type { Profile } from "@/lib/types";
import { AvatarUpload } from "@/components/AvatarUpload";
import { useTheme } from "@/context/ThemeContext";
import { User, Target, Bell, Settings as SettingsIcon, Shield, Loader2, Save, LogOut } from "lucide-react";

type Tab = "personal" | "goals" | "reminders" | "preferences" | "security";
type ReminderDay = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
type ReminderSuggestion = { time: string; label: string; reason: string };

const REMINDER_DAY_OPTIONS: Array<{ value: ReminderDay; label: string; short: string }> = [
  { value: "MONDAY", label: "Thứ 2", short: "T2" },
  { value: "TUESDAY", label: "Thứ 3", short: "T3" },
  { value: "WEDNESDAY", label: "Thứ 4", short: "T4" },
  { value: "THURSDAY", label: "Thứ 5", short: "T5" },
  { value: "FRIDAY", label: "Thứ 6", short: "T6" },
  { value: "SATURDAY", label: "Thứ 7", short: "T7" },
  { value: "SUNDAY", label: "Chủ nhật", short: "CN" },
];

const DAY_ALIASES: Record<string, ReminderDay> = {
  MONDAY: "MONDAY",
  TUESDAY: "TUESDAY",
  WEDNESDAY: "WEDNESDAY",
  THURSDAY: "THURSDAY",
  FRIDAY: "FRIDAY",
  SATURDAY: "SATURDAY",
  SUNDAY: "SUNDAY",
  T2: "MONDAY",
  T3: "TUESDAY",
  T4: "WEDNESDAY",
  T5: "THURSDAY",
  T6: "FRIDAY",
  T7: "SATURDAY",
  CN: "SUNDAY",
};

function parseReminderDays(raw?: string | null): ReminderDay[] {
  if (!raw) return [];
  const seen = new Set<ReminderDay>();
  raw
    .split(",")
    .map((part) => part.trim().toUpperCase())
    .forEach((token) => {
      const mapped = DAY_ALIASES[token];
      if (mapped) seen.add(mapped);
    });
  return REMINDER_DAY_OPTIONS.map((d) => d.value).filter((d) => seen.has(d));
}

function serializeReminderDays(days: ReminderDay[]): string {
  return days.join(",");
}

function normalizeReminderTime(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  const hhmmMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(trimmed);
  if (hhmmMatch) return `${hhmmMatch[1]}:${hhmmMatch[2]}`;

  const hhmmssMatch = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.exec(trimmed);
  if (hhmmssMatch) return `${hhmmssMatch[1]}:${hhmmssMatch[2]}`;

  return null;
}

function buildReminderSuggestions(profile: Partial<Profile>): ReminderSuggestion[] {
  const suggestions: ReminderSuggestion[] = [];

  if (profile.preferredWorkoutType === "CARDIO") {
    suggestions.push(
      { time: "06:00", label: "Sáng sớm", reason: "Tập tim mạch buổi sáng giúp tỉnh táo và giữ nhịp đều." },
      { time: "17:30", label: "Cuối chiều", reason: "Dễ duy trì khi tan làm và chưa quá muộn." }
    );
  } else if (profile.goal === "BULK") {
    suggestions.push(
      { time: "18:00", label: "Giờ vàng tăng cơ", reason: "Thời điểm phổ biến để tập tạ sau bữa phụ." },
      { time: "20:00", label: "Buổi tối", reason: "Phù hợp người bận rộn giờ hành chính." }
    );
  } else if (profile.goal === "CUT") {
    suggestions.push(
      { time: "07:00", label: "Sáng năng lượng", reason: "Giữ lịch ổn định cho mục tiêu giảm mỡ." },
      { time: "18:30", label: "Sau giờ làm", reason: "Dễ duy trì lâu dài, hạn chế bỏ buổi." }
    );
  } else {
    suggestions.push(
      { time: "17:30", label: "Mặc định hợp lý", reason: "Khung giờ cân bằng cho đa số người dùng." },
      { time: "19:00", label: "Buổi tối linh hoạt", reason: "Phù hợp lịch sinh hoạt phổ biến." }
    );
  }

  // Bổ sung gợi ý theo số buổi tập/tuần để tăng tính thực tế.
  if ((profile.workoutDaysPerWeek || 0) >= 5) {
    suggestions.push({ time: "06:30", label: "Kỷ luật cao", reason: "Tập đều nhiều buổi nên ưu tiên khung giờ cố định." });
  } else {
    suggestions.push({ time: "20:30", label: "Lịch bận rộn", reason: "Hợp với người chỉ tập vài buổi/tuần." });
  }

  // Loại trùng time và giới hạn 3 gợi ý gọn gàng.
  const deduped = new Map<string, ReminderSuggestion>();
  suggestions.forEach((item) => {
    if (!deduped.has(item.time)) deduped.set(item.time, item);
  });
  return Array.from(deduped.values()).slice(0, 3);
}

export default function SettingsPage() {
  const { user, logout, token, refreshUser, isLoading: authLoading } = useAuth();
  const { setTheme } = useTheme();
  const toast = useToast();
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("personal");
  const [selectedReminderDays, setSelectedReminderDays] = useState<ReminderDay[]>([]);
  const [reminderError, setReminderError] = useState("");
  
  // Security Tab State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const reminderSuggestions = useMemo(() => buildReminderSuggestions(profile), [
    profile.goal,
    profile.preferredWorkoutType,
    profile.workoutDaysPerWeek,
  ]);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    void loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const data = await apiFetch<Profile>("/profile");
      setProfile(data || {});
      setSelectedReminderDays(parseReminderDays(data?.reminderDays));
      return data || null;
    } catch (error) {
      console.error("Failed to load profile:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof Profile, value: string | number | boolean | null) => {
    setProfile((prev) => {
      if (field === "reminderEnabled") {
        const enabled = Boolean(value);
        if (enabled) {
          return {
            ...prev,
            reminderEnabled: true,
            reminderTime: normalizeReminderTime((prev.reminderTime as string | null | undefined) || null) || "17:00",
          };
        }
        return {
          ...prev,
          reminderEnabled: false,
          reminderTime: null,
          reminderDays: null,
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setReminderError("");
    setIsSaving(true);
    try {
      const profilePayload: Partial<Profile> = { ...profile };

      if (profile.reminderEnabled) {
        const normalizedReminderTime = normalizeReminderTime((profile.reminderTime as string | null | undefined) || null) || "17:00";
        const normalizedReminderDays: ReminderDay[] =
          selectedReminderDays.length > 0 ? selectedReminderDays : ["MONDAY", "WEDNESDAY", "FRIDAY"];

        profilePayload.reminderTime = normalizedReminderTime;
        profilePayload.reminderDays = serializeReminderDays(normalizedReminderDays);
        setSelectedReminderDays(normalizedReminderDays);
      } else {
        profilePayload.reminderTime = null;
        profilePayload.reminderDays = null;
      }

      // 1. Save Profile
      await apiFetch("/profile", {
        method: "PUT",
        body: JSON.stringify(profilePayload),
      });

      // 2. Save Name if changed
      if (name !== user?.name) {
        await apiFetch("/users/me", {
          method: "PUT",
          body: JSON.stringify({ name }),
        });
      }

      // 3. Đồng bộ lại thông tin user & profile cho toàn bộ UI
      const [_, updatedProfile] = await Promise.all([
        refreshUser(),
        loadProfile(),
      ]);

      // 4. Áp dụng theme mới ngay lập tức (nếu có)
      const nextTheme = (updatedProfile?.theme || profile.theme || "DARK") as "DARK" | "LIGHT";
      setTheme(nextTheme);

      toast.success("Đã lưu thông tin cài đặt thành công!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      const message = error instanceof Error ? error.message : "Có lỗi xảy ra khi lưu cài đặt.";
      if (activeTab === "reminders") {
        setReminderError(message);
      } else {
        toast.error(message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const toggleReminderDay = (day: ReminderDay) => {
    setSelectedReminderDays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day]
    );
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu mới không khớp.");
      return;
    }

    setIsSaving(true);
    try {
      await apiFetch("/auth/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setPasswordSuccess("Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError("Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.");
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate BMI dynamically
  const bmi = useMemo(() => {
    if (profile.weight && profile.height) {
      const heightInMeters = profile.height / 100;
      return (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  }, [profile.weight, profile.height]);

  const getBmiCategory = (bmiValue: string) => {
    const val = parseFloat(bmiValue);
    if (val < 18.5) return { label: "Thiếu cân", color: "text-blue-400" };
    if (val < 24.9) return { label: "Bình thường", color: "text-emerald-400" };
    if (val < 29.9) return { label: "Thừa cân", color: "text-amber-400" };
    return { label: "Béo phì", color: "text-rose-400" };
  };

  if (authLoading || (user && isLoading)) return null;
  if (!user) return <AuthPage />;

  return (
    <div className="flex min-h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <main className="mobile-scroll-page">
        <header className="mb-7 sm:mb-10 lg:mb-12">
          <h1 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">Cài đặt hệ thống</h1>
          <p className="mt-1 text-sm font-medium italic text-muted-foreground sm:text-base">Trung tâm kiểm soát trải nghiệm của bạn</p>
        </header>

        <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
          {/* Vertical Tabs */}
          <div className="w-full flex-shrink-0 lg:w-64">
            <nav className="custom-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
              <TabButton active={activeTab === "personal"} onClick={() => setActiveTab("personal")} icon={User} label="Hồ sơ cá nhân" />
              <TabButton active={activeTab === "goals"} onClick={() => setActiveTab("goals")} icon={Target} label="Mục tiêu tập luyện" />
              <TabButton active={activeTab === "reminders"} onClick={() => setActiveTab("reminders")} icon={Bell} label="Nhắc lịch" />
              <TabButton active={activeTab === "preferences"} onClick={() => setActiveTab("preferences")} icon={SettingsIcon} label="Tuỳ chọn UI" />
              <TabButton active={activeTab === "security"} onClick={() => setActiveTab("security")} icon={Shield} label="Bảo mật" />
            </nav>
          </div>

          {/* Tab Content */}
          <div className="glass-card min-h-[500px] flex-1 sm:p-8">
            {activeTab === "personal" && (
              <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 sm:space-y-8">
                <div className="flex flex-col items-center justify-center mb-8 border-b border-white/10 pb-8">
                  <AvatarUpload 
                    currentAvatarUrl={profile.avatarUrl} 
                    onUploadSuccess={(url) => handleChange("avatarUrl", url)} 
                    token={token || ""}
                  />
                  <h3 className="mt-4 text-xl font-bold">{name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                  <InputField label="Họ và tên" value={name} onChange={(v) => setName(v)} />
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Giới tính</label>
                    <select 
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary [&>option]:bg-slate-900 [&>option]:text-white"
                      value={profile.gender || ""} onChange={(e) => handleChange("gender", e.target.value)}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                  <InputField label="Tuổi" type="number" value={profile.age || ""} onChange={(v) => handleChange("age", parseInt(v) || 0)} />
                  <InputField label="Chiều cao (cm)" type="number" value={profile.height || ""} onChange={(v) => handleChange("height", parseFloat(v) || 0)} />
                  <InputField label="Cân nặng (kg)" type="number" value={profile.weight || ""} onChange={(v) => handleChange("weight", parseFloat(v) || 0)} />
                </div>

                {bmi && (
                  <div className="mt-6 flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:mt-8 sm:p-6">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-1">Chỉ số BMI</h4>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black">{bmi}</span>
                        <span className={`text-sm font-bold uppercase ${getBmiCategory(bmi).color}`}>
                          ({getBmiCategory(bmi).label})
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <SaveButton isSaving={isSaving} />
              </form>
            )}

            {activeTab === "goals" && (
              <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 sm:space-y-8">
                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Mục tiêu chính</label>
                    <select 
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-primary focus:outline-none [&>option]:bg-slate-900 [&>option]:text-white"
                      value={profile.goal || ""} onChange={(e) => handleChange("goal", e.target.value)}
                    >
                      <option value="CUT">Giảm mỡ</option>
                      <option value="BULK">Tăng cân / Tăng cơ</option>
                      <option value="MAINTAIN">Giữ dáng</option>
                    </select>
                  </div>
                  <InputField label="Mục tiêu cân nặng (kg)" type="number" value={profile.targetWeight || ""} onChange={(v) => handleChange("targetWeight", parseFloat(v) || 0)} />
                  
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Trình độ</label>
                    <select 
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-primary focus:outline-none [&>option]:bg-slate-900 [&>option]:text-white"
                      value={profile.experienceLevel || "BEGINNER"} onChange={(e) => handleChange("experienceLevel", e.target.value)}
                    >
                      <option value="BEGINNER">Mới bắt đầu</option>
                      <option value="INTERMEDIATE">Trung bình</option>
                      <option value="ADVANCED">Nâng cao</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Loại hình tập luyện</label>
                    <select 
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-primary focus:outline-none [&>option]:bg-slate-900 [&>option]:text-white"
                      value={profile.preferredWorkoutType || "GYM"} onChange={(e) => handleChange("preferredWorkoutType", e.target.value)}
                    >
                      <option value="GYM">Thể hình</option>
                      <option value="CARDIO">Tim mạch</option>
                      <option value="CALISTHENICS">Thể trọng</option>
                    </select>
                  </div>

                  <InputField label="Số buổi tập / tuần" type="number" min="1" max="7" value={profile.workoutDaysPerWeek || ""} onChange={(v) => handleChange("workoutDaysPerWeek", parseInt(v) || 0)} />
                </div>
                <SaveButton isSaving={isSaving} />
              </form>
            )}

            {activeTab === "reminders" && (
              <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 sm:space-y-8">
                {reminderError && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-400">
                    {reminderError}
                  </div>
                )}
                <div className="flex items-center justify-between p-4 border border-white/10 rounded-xl bg-white/5">
                  <div>
                    <h3 className="font-bold">Bật nhắc nhở tập luyện</h3>
                    <p className="text-xs text-muted-foreground">Chúng tôi sẽ gửi thông báo đẩy để nhắc bạn đi tập.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={profile.reminderEnabled || false} onChange={(e) => handleChange("reminderEnabled", e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {profile.reminderEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border border-primary/20 bg-primary/5 rounded-xl">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Giờ nhắc hằng ngày</label>
                      <input 
                        type="time" 
                        value={normalizeReminderTime(profile.reminderTime || null) || "17:00"} 
                        onChange={(e) => handleChange("reminderTime", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                        Gợi ý khung giờ
                      </label>
                      <div className="space-y-2">
                        {reminderSuggestions.map((suggestion) => {
                          const activeTime = normalizeReminderTime((profile.reminderTime as string | null | undefined) || null);
                          const isActive = activeTime === suggestion.time;
                          return (
                            <button
                              key={suggestion.time}
                              type="button"
                              onClick={() => handleChange("reminderTime", suggestion.time)}
                              className={`w-full rounded-xl border px-3 py-2 text-left transition-all ${
                                isActive
                                  ? "border-primary bg-primary/20"
                                  : "border-white/15 bg-white/5 hover:border-primary/50"
                              }`}
                            >
                              <p className="text-sm font-black">{suggestion.label} - {suggestion.time}</p>
                              <p className="mt-1 text-[11px] text-muted-foreground">{suggestion.reason}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Ngày trong tuần</label>
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                        {REMINDER_DAY_OPTIONS.map((day) => {
                          const isActive = selectedReminderDays.includes(day.value);
                          return (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => toggleReminderDay(day.value)}
                              className={`rounded-lg border px-3 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                                isActive
                                  ? "border-primary bg-primary text-background"
                                  : "border-white/15 bg-white/5 text-muted-foreground hover:border-primary/50"
                              }`}
                            >
                              {day.short}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-muted-foreground italic">
                        Lịch hiện tại:{" "}
                        {selectedReminderDays.length > 0
                          ? selectedReminderDays
                              .map((value) => REMINDER_DAY_OPTIONS.find((d) => d.value === value)?.label)
                              .filter(Boolean)
                              .join(", ")
                          : "Chưa chọn ngày nào"}
                      </p>
                    </div>
                  </div>
                )}
                
                <SaveButton isSaving={isSaving} />
              </form>
            )}

            {activeTab === "preferences" && (
              <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 sm:space-y-8">
                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Giao diện</label>
                    <select 
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-primary focus:outline-none [&>option]:bg-slate-900 [&>option]:text-white"
                      value={profile.theme || "DARK"} onChange={(e) => handleChange("theme", e.target.value)}
                    >
                      <option value="DARK">Tối - Mặc định</option>
                      <option value="LIGHT">Sáng</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Đơn vị Khối lượng</label>
                    <select 
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-primary focus:outline-none [&>option]:bg-slate-900 [&>option]:text-white"
                      value={profile.weightUnit || "KG"} onChange={(e) => handleChange("weightUnit", e.target.value)}
                    >
                      <option value="KG">Kilôgam (kg)</option>
                      <option value="LB">Pao (lb)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Đơn vị Chiều cao</label>
                    <select 
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-primary focus:outline-none [&>option]:bg-slate-900 [&>option]:text-white"
                      value={profile.heightUnit || "CM"} onChange={(e) => handleChange("heightUnit", e.target.value)}
                    >
                      <option value="CM">Centimet (cm)</option>
                      <option value="FT">Foot (ft)</option>
                    </select>
                  </div>
                </div>
                <SaveButton isSaving={isSaving} />
              </form>
            )}

            {activeTab === "security" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 sm:space-y-8">
                <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                  <h3 className="text-xl font-bold border-b border-white/10 pb-4">Đổi mật khẩu</h3>
                  
                  {passwordError && <div className="text-sm font-bold text-rose-500 bg-rose-500/10 p-3 rounded-lg">{passwordError}</div>}
                  {passwordSuccess && <div className="text-sm font-bold text-emerald-500 bg-emerald-500/10 p-3 rounded-lg">{passwordSuccess}</div>}

                  <InputField label="Mật khẩu hiện tại" type="password" value={currentPassword} onChange={setCurrentPassword} required />
                  <InputField label="Mật khẩu mới" type="password" value={newPassword} onChange={setNewPassword} required />
                  <InputField label="Xác nhận mật khẩu mới" type="password" value={confirmPassword} onChange={setConfirmPassword} required />
                  
                  <SaveButton isSaving={isSaving} text="Cập nhật mật khẩu" />
                </form>

                <div className="pt-8 border-t border-white/10">
                  <h3 className="text-xl font-bold text-rose-500 mb-4">Khu vực nguy hiểm</h3>
                  <button onClick={logout} className="flex items-center gap-2 px-6 py-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500/20 font-bold transition-colors">
                    <LogOut size={18} /> Đăng xuất khỏi hệ thống
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: React.ElementType, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left transition-all lg:w-full
        ${active ? 'bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20' : 'hover:bg-white/5 text-muted-foreground'}`}
    >
      <Icon size={18} />
      <span className="whitespace-nowrap text-sm font-bold lg:text-base">{label}</span>
    </button>
  );
}

function InputField({ label, type = "text", value, onChange, min, max, required, placeholder }: { label?: string, type?: string, value: string | number, onChange: (val: string) => void, min?: string, max?: string, required?: boolean, placeholder?: string }) {
  return (
    <div className="space-y-2 w-full">
      {label && <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
      />
    </div>
  );
}

function SaveButton({ isSaving, text = "Lưu thay đổi" }: { isSaving: boolean, text?: string }) {
  return (
    <div className="flex justify-end border-t border-white/10 pt-4">
      <button 
        type="submit" 
        disabled={isSaving}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 sm:w-auto sm:px-8"
      >
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {text}
      </button>
    </div>
  );
}
