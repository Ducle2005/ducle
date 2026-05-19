"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Candy,
  Check,
  CheckCircle2,
  ChevronLeft,
  CloudRain,
  Coffee,
  CupSoda,
  Dumbbell,
  Flame,
  HelpCircle,
  IceCreamCone,
  Leaf,
  Lock,
  Mail,
  Menu,
  Minus,
  PersonStanding,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  User,
  Waves,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { completeOnboardingPlan } from "@/lib/onboardingPlan";
import type { JwtAuthResponse } from "@/lib/types";

type OnboardingStep =
  | "gender"
  | "bodyType"
  | "goal"
  | "assessment"
  | "age"
  | "diet"
  | "sugar"
  | "water"
  | "hydrationResult"
  | "height"
  | "planChart"
  | "fitnessLevel"
  | "focusAreas"
  | "equipment"
  | "exercisePreference"
  | "loadingPlan"
  | "bodyEvaluation"
  | "account";

type HeightUnit = "cm" | "ft";

const steps: OnboardingStep[] = [
  "gender",
  "bodyType",
  "goal",
  "assessment",
  "age",
  "diet",
  "sugar",
  "water",
  "hydrationResult",
  "height",
  "planChart",
  "fitnessLevel",
  "focusAreas",
  "equipment",
  "exercisePreference",
  "loadingPlan",
  "bodyEvaluation",
  "account",
];

const maleImage = "/onboarding/male-average.svg";
const athleticImage = "/onboarding/male-bulky.svg";

const genderOptions = [
  { label: "Nam", value: "male", image: maleImage },
  {
    label: "Nữ",
    value: "female",
    image: "/onboarding/female-athletic.svg",
  },
];

const bodyTypes = [
  {
    label: "Mảnh khảnh",
    image: "/onboarding/male-lean.svg",
  },
  { label: "Trung bình", image: maleImage },
  {
    label: "To",
    image: athleticImage,
  },
  {
    label: "Nặng",
    image: "/onboarding/male-heavy.svg",
  },
];

const fitnessGoals = [
  {
    label: "Giảm Cân",
    image: "/onboarding/male-average.svg",
  },
  { label: "Tăng Cơ Bắp", image: athleticImage },
  {
    label: "Cắt Nét Cơ",
    image: "/onboarding/goal-cut.svg",
  },
];

const ageGroups = [
  {
    label: "18-29",
    image: "/onboarding/age-pair-young.svg",
  },
  {
    label: "30-39",
    image: "/onboarding/age-pair-adult.svg",
  },
  {
    label: "40-49",
    image: "/onboarding/male-average.svg",
  },
  {
    label: "50+",
    image: "/onboarding/male-heavy.svg",
  },
];

const dietOptions = [
  { title: "Ăn chay trường", description: "Không bao gồm thịt", icon: Leaf },
  { title: "Ăn chay", description: "Không bao gồm tất cả các sản phẩm động vật", icon: Leaf },
  { title: "Keto", description: "Ăn ít carb, nhiều chất béo", icon: Flame },
  { title: "Địa Trung Hải", description: "Giàu thực phẩm có nguồn gốc thực vật", icon: Leaf },
  { title: "Không, tôi chưa từng", description: "", icon: X, separated: true },
];

const sugarOptions = [
  { title: "Không thường xuyên. Tôi không hảo ngọt", icon: Candy, widthClass: "max-w-[405px]" },
  { title: "3-5 lần mỗi tuần", icon: IceCreamCone, widthClass: "max-w-[216px]" },
  { title: "Khá nhiều mỗi ngày", icon: CupSoda, widthClass: "max-w-[242px]" },
];

const waterOptions = [
  { title: "Ít hơn 2 cốc", description: "lên đến 0,5 l / 17 oz", icon: Waves },
  { title: "2-6 cốc", description: "0,5-1,5 l / 17-50 oz", icon: Waves },
  { title: "7-10 cốc", description: "1,5-2,5 l / 50-85 oz", icon: Waves },
  { title: "Hơn 10 cốc", description: "hơn 2,5 l / 85 oz", icon: CloudRain },
  { title: "Tôi chỉ uống cà phê hoặc trà", description: "", icon: Coffee, separated: true },
];

const fitnessLevels = [
  {
    title: "Sơ cấp",
    description: "Bất cứ khi nào tôi ngồi trên sàn, tôi rất khó để đứng lên.",
    icon: Zap,
  },
  {
    title: "Nghiệp dư",
    description: "Tôi cố gắng tập thể dục mỗi tuần một lần, nhưng vẫn không đều đặn.",
    icon: Zap,
  },
  {
    title: "Cao cấp",
    description: "Tôi đang làm rất tốt! Tôi đang trong hình dáng đẹp nhất của cuộc đời mình.",
    icon: Zap,
  },
];

const focusAreas = [
  "Toàn thân",
  "Vai",
  "Bắp tay lớn",
  "Lưng rộng",
  "Ngực",
  "Sáu múi",
  "Mông săn chắc",
  "Chân khỏe",
];

const equipmentOptions = [
  { title: "Tạ đơn", icon: Dumbbell },
  { title: "Thảm yoga", icon: Minus },
  { title: "Tạ đòn", icon: Dumbbell },
  { title: "Dây nhảy", icon: Waves },
  { title: "Xà đơn", icon: Activity },
  { title: "Dây kháng lực", icon: Waves },
  { title: "Tạ chuông", icon: Dumbbell },
  { title: "Không có dụng cụ", icon: X },
];

const preferenceExercise = {
  title: "Yoga / Giãn cơ",
  image: "/onboarding/yoga-stretch.svg",
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function MiniLogo() {
  return (
    <div className="flex items-center gap-1.5 text-[#ff4b12]">
      <span className="text-2xl font-black uppercase leading-none tracking-[-0.12em]">AURA</span>
      <span className="rounded-[3px] border-2 border-[#ff4b12] px-1.5 py-0.5 text-[10px] font-black uppercase leading-none tracking-wider">
        Fitness
      </span>
    </div>
  );
}

function Header({
  step,
  progressWidth,
  currentStep,
  totalSteps,
  onBack,
}: {
  step: OnboardingStep;
  progressWidth: string;
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
}) {
  return (
    <>
      <header className="relative z-10 flex h-20 items-center justify-center border-b border-white/10 px-6">
        <button
          type="button"
          onClick={onBack}
          disabled={step === "gender"}
          aria-label="Quay lại"
          className="absolute left-5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 disabled:pointer-events-none disabled:opacity-0"
        >
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <MiniLogo />
        <div className="absolute right-5 top-1/2 hidden -translate-y-1/2 items-center gap-8 text-sm font-black sm:flex">
          <button className="flex items-center gap-1.5 text-white/90 transition hover:text-[#ff4b12]">
            <HelpCircle size={16} />
            Trợ giúp
          </button>
          <span>Việt Nam</span>
          <button aria-label="Menu" className="text-white/90 transition hover:text-[#ff4b12]">
            <Menu size={22} />
          </button>
        </div>
      </header>
      <div className="relative z-10 h-1 w-full bg-white/15">
        <motion.div
          className="h-full bg-[#ff4b12]"
          animate={{ width: progressWidth }}
          transition={{ type: "spring", stiffness: 220, damping: 28 }}
        />
        <span className="absolute right-5 top-3 text-xs font-black text-white">
          {currentStep}/{totalSteps}
        </span>
      </div>
    </>
  );
}

function Screen({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.22 }}
      className={cn("w-full", className)}
    >
      {children}
    </motion.section>
  );
}

function IconChoice({
  title,
  description,
  icon: Icon,
  selected,
  onClick,
  separated,
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  selected?: boolean;
  onClick: () => void;
  separated?: boolean;
}) {
  return (
    <>
      {separated && <div className="my-2 h-px w-full bg-white/15" />}
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "group flex min-h-[88px] items-center gap-4 rounded-[16px] border bg-[#202020] px-8 py-4 text-left shadow-2xl transition active:scale-[0.985]",
          selected ? "border-[#ff4b12]" : "border-transparent hover:border-white/15",
        )}
      >
        <Icon size={26} className={cn("shrink-0 transition", separated ? "order-2 ml-auto text-[#ff4b12]" : "text-white/65 group-hover:text-white")} strokeWidth={2.4} />
        <div className={separated ? "order-1 flex-1" : "flex-1"}>
          <div className="text-base font-black text-white">{title}</div>
          {description && <div className="mt-2 text-sm font-semibold leading-5 text-white/70">{description}</div>}
        </div>
      </button>
    </>
  );
}

function MuscleBadge({ label, selected }: { label: string; selected: boolean }) {
  return (
    <div className={cn("relative mx-auto flex h-20 w-20 items-center justify-center rounded-[22px] bg-[#25272c]", selected && "bg-[#1847db]")}>
      <PersonStanding className={selected ? "text-white" : "text-slate-300"} size={54} strokeWidth={1.6} />
      <div className="absolute inset-x-5 top-4 h-3 rounded-full bg-blue-500/80" />
      {label.includes("Chân") && <div className="absolute bottom-2 left-7 h-8 w-3 rounded-full bg-blue-500/80" />}
      {label.includes("Ngực") && <div className="absolute left-6 top-7 h-4 w-8 rounded-full bg-blue-500/80" />}
      {label.includes("Vai") && <div className="absolute left-3 top-5 h-4 w-4 rounded-full bg-blue-500/80" />}
    </div>
  );
}

function PlanChart({ goal }: { goal: string }) {
  const target = goal === "Giảm Cân" ? 68 : goal === "Cắt Nét Cơ" ? 74 : 89;
  const start = goal === "Giảm Cân" ? 89 : 68;
  const verb = goal === "Giảm Cân" ? "để lấy lại vóc dáng" : goal === "Cắt Nét Cơ" ? "để cắt nét cơ thể" : "để tăng cơ bắp";

  return (
    <div className="mx-auto w-full max-w-[520px] text-center">
      <h1 className="text-[34px] font-black leading-tight text-white sm:text-4xl">
        Kế hoạch cuối cùng bạn
        <br />
        sẽ cần <span className="text-[#ff4b12]">{verb}</span>
      </h1>
      <p className="mx-auto mt-10 max-w-[470px] text-base font-bold leading-7 text-white/85">
        Dựa trên tính toán của chúng tôi, bạn có thể đạt được cân nặng mục tiêu của mình là
        <br />
        <span className="text-lg text-white">{target} kg</span> trước
      </p>
      <div className="mt-10 text-2xl font-black text-white underline decoration-[#ff4b12] decoration-2 underline-offset-8">
        8 thg 10, 2026
      </div>
      <div className="relative mx-auto mt-12 h-[340px] w-full max-w-[460px]">
        <svg viewBox="0 0 460 300" className="h-full w-full overflow-visible">
          <defs>
            <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#ff5a1f" stopOpacity="0.72" />
              <stop offset="100%" stopColor="#ff5a1f" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d="M35 238 C85 240 92 198 145 165 C205 128 268 142 326 116 C382 92 400 42 425 28 L425 286 L35 286 Z" fill="url(#chartFill)" />
          <path d="M35 238 C85 240 92 198 145 165 C205 128 268 142 326 116 C382 92 400 42 425 28" fill="none" stroke="#ff5a1f" strokeWidth="4" />
          <circle cx="35" cy="238" r="5" fill="#ff4b12" />
          <circle cx="425" cy="28" r="7" fill="#ff4b12" stroke="#ffd08a" strokeWidth="3" />
          <line x1="35" x2="425" y1="286" y2="286" stroke="#4a2a1d" strokeWidth="2" />
        </svg>
        <div className="absolute left-2 top-[210px] rounded-lg bg-[#4b4b4b] px-2 py-1 text-base font-black text-white">{start} kg</div>
        <div className="absolute right-5 top-[28px] rounded-lg bg-[#ff4b12] px-2 py-1 text-base font-black text-white">{target} kg</div>
        <div className="absolute bottom-0 left-5 text-sm font-semibold text-white/65">14 thg 5, 2026</div>
        <div className="absolute bottom-0 right-2 text-sm font-semibold text-white/65">8 thg 10, 2026</div>
      </div>
      <p className="mt-7 text-left text-xs font-semibold text-white/65">Biểu đồ này chỉ mang tính minh họa</p>
    </div>
  );
}

export function AuthPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>("gender");
  const [isLogin, setIsLogin] = useState(true);
  const [selectedGender, setSelectedGender] = useState(genderOptions[0]);
  const [selectedBodyType, setSelectedBodyType] = useState(bodyTypes[1].label);
  const [selectedGoal, setSelectedGoal] = useState(fitnessGoals[0].label);
  const [selectedAge, setSelectedAge] = useState(ageGroups[0].label);
  const [selectedDiet, setSelectedDiet] = useState(dietOptions[dietOptions.length - 1].title);
  const [selectedSugar, setSelectedSugar] = useState(sugarOptions[0].title);
  const [selectedWater, setSelectedWater] = useState(waterOptions[1].title);
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [heightValue, setHeightValue] = useState("");
  const [fitnessLevel, setFitnessLevel] = useState(fitnessLevels[1].title);
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>(["Chân khỏe"]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(["Tạ đơn"]);
  const [exercisePreference, setExercisePreference] = useState("Trung lập");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const currentStepIndex = steps.indexOf(step);
  const progressWidth = `${((currentStepIndex + 1) / steps.length) * 100}%`;
  const numericHeight = Number(heightValue);
  const isHeightValid =
    Number.isFinite(numericHeight) &&
    (heightUnit === "cm" ? numericHeight >= 90 && numericHeight <= 240 : numericHeight >= 3 && numericHeight <= 8);

  const assessment = useMemo(() => {
    if (selectedGoal === "Giảm Cân") {
      return {
        score: selectedBodyType === "Nặng" ? 86 : 78,
        topic: "kiểm soát calo",
        image: fitnessGoals[0].image,
        intro: "Để giảm mỡ hiệu quả mà vẫn giữ sức bền, bạn cần:",
        points: ["Duy trì mức calo thấp hơn nhu cầu hằng ngày.", "Ưu tiên protein và bài tập sức mạnh để hạn chế mất cơ."],
      };
    }

    if (selectedGoal === "Cắt Nét Cơ") {
      return {
        score: selectedBodyType === "Mảnh khảnh" ? 74 : 83,
        topic: "tỷ lệ mỡ",
        image: fitnessGoals[2].image,
        intro: "Để cơ thể nét hơn và vẫn giữ hiệu suất tập luyện, bạn cần:",
        points: ["Giữ protein cao và giảm calo từ từ.", "Kết hợp tập tạ đều với cardio vừa phải."],
      };
    }

    return {
      score: selectedBodyType === "Mảnh khảnh" ? 88 : 81,
      topic: "dinh dưỡng",
      image: fitnessGoals[1].image,
      intro: "Để đạt được nhiều nhất về khối lượng cơ và sức mạnh, bạn cần:",
      points: ["Đủ tổng lượng calo mỗi ngày.", "Hấp thụ đủ protein để cơ thể tái tạo nhiều mô cơ hơn."],
    };
  }, [selectedBodyType, selectedGoal]);

  const hydrationFeedback = useMemo(() => {
    if (selectedWater === waterOptions[0].title || selectedWater === waterOptions[4].title) {
      return {
        title: "Cần cải thiện thêm!",
        message: "Cơ thể bạn có thể đang thiếu nước. Hãy tăng dần lượng nước trong ngày để hỗ trợ tập luyện tốt hơn.",
      };
    }

    if (selectedWater === waterOptions[1].title) {
      return {
        title: "Bạn đang đi đúng hướng!",
        message: "Bạn uống nước tốt hơn một nửa người dùng Aura Fitness. Hãy cố gắng tăng thêm một chút mỗi ngày.",
      };
    }

    return {
      title: "Ôi! Thật ấn tượng!",
      message: "Bạn uống nhiều nước hơn 72% người dùng. Tiếp tục phát huy nhé!",
    };
  }, [selectedWater]);

  useEffect(() => {
    if (step !== "loadingPlan") return;

    setLoadingProgress(0);
    const interval = window.setInterval(() => {
      setLoadingProgress((value) => Math.min(value + 8, 100));
    }, 80);
    const timer = window.setTimeout(() => setStep("bodyEvaluation"), 1500);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timer);
    };
  }, [step]);

  const goBack = () => {
    if (step === "account") setStep("bodyEvaluation");
    if (step === "bodyEvaluation") setStep("loadingPlan");
    if (step === "loadingPlan") setStep("exercisePreference");
    if (step === "exercisePreference") setStep("equipment");
    if (step === "equipment") setStep("focusAreas");
    if (step === "focusAreas") setStep("fitnessLevel");
    if (step === "fitnessLevel") setStep("planChart");
    if (step === "planChart") setStep("height");
    if (step === "height") setStep("hydrationResult");
    if (step === "hydrationResult") setStep("water");
    if (step === "water") setStep("sugar");
    if (step === "sugar") setStep("diet");
    if (step === "diet") setStep("age");
    if (step === "age") setStep("assessment");
    if (step === "assessment") setStep("goal");
    if (step === "goal") setStep("bodyType");
    if (step === "bodyType") setStep("gender");
  };

  const toggleFocusArea = (area: string) => {
    setSelectedFocusAreas((current) =>
      current.includes(area) ? current.filter((item) => item !== area) : [...current, area],
    );
  };

  const toggleEquipment = (item: string) => {
    setSelectedEquipment((current) =>
      current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item],
    );
  };

  const buildOnboardingSelections = () => ({
    gender: selectedGender.label,
    ageGroup: selectedAge,
    bodyType: selectedBodyType,
    goal: selectedGoal,
    diet: selectedDiet,
    sugar: selectedSugar,
    water: selectedWater,
    heightUnit,
    heightValue,
    fitnessLevel,
    focusAreas: selectedFocusAreas,
    equipment: selectedEquipment,
    exercisePreference,
  });

  const finishAuthAndCreatePlan = async (accessToken: string) => {
    await login(accessToken);
    setSuccess("Đang cá nhân hóa lộ trình tập cho bạn...");
    await completeOnboardingPlan(buildOnboardingSelections());
    setSuccess("Lộ trình tập của bạn đã sẵn sàng.");
    router.push("/workout");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await apiFetch<JwtAuthResponse>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        await finishAuthAndCreatePlan(response.accessToken);
      } else {
        await apiFetch<string>("/auth/register", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });
        const response = await apiFetch<JwtAuthResponse>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        await finishAuthAndCreatePlan(response.accessToken);
      }
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#111] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0,rgba(17,17,17,0)_34rem),linear-gradient(180deg,#151515_0%,#101010_58%,#0d0d0d_100%)]" />
      {step !== "loadingPlan" && (
        <Header
          step={step}
          progressWidth={progressWidth}
          currentStep={currentStepIndex + 1}
          totalSteps={steps.length}
          onBack={goBack}
        />
      )}

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-5.25rem)] w-full max-w-5xl flex-col items-center px-5 pb-8 pt-12">
        <AnimatePresence mode="wait">
          {step === "gender" && (
            <Screen>
              <h1 className="text-center text-[34px] font-black leading-tight sm:text-4xl">Chọn giới tính của bạn</h1>
              <div className="mx-auto mt-10 flex w-full max-w-[470px] flex-col gap-4">
                {genderOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSelectedGender(option);
                      setStep("bodyType");
                    }}
                    className={cn(
                      "group relative flex h-[168px] items-center overflow-hidden rounded-[22px] border bg-[#202020] px-6 text-left shadow-2xl transition active:scale-[0.985]",
                      selectedGender.value === option.value ? "border-[#ff4b12]" : "border-transparent hover:border-white/15",
                    )}
                  >
                    <span className="relative z-10 text-xl font-black">{option.label}</span>
                    <div className="absolute bottom-0 right-3 h-[160px] w-[170px]">
                      <Image src={option.image} alt={option.label} fill sizes="170px" unoptimized className="object-cover object-top saturate-[0.9] transition duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#202020] via-transparent to-transparent" />
                    </div>
                  </button>
                ))}
              </div>
            </Screen>
          )}

          {step === "bodyType" && (
            <Screen>
              <h1 className="text-center text-[34px] font-black leading-tight sm:text-4xl">Chọn tạng người của bạn</h1>
              <div className="mx-auto mt-10 grid w-full max-w-[470px] grid-cols-2 gap-4 sm:gap-5">
                {bodyTypes.map((type) => (
                  <button
                    key={type.label}
                    type="button"
                    onClick={() => {
                      setSelectedBodyType(type.label);
                      setStep("goal");
                    }}
                    className={cn(
                      "group overflow-hidden rounded-[20px] border bg-[#202020] shadow-2xl transition active:scale-[0.985]",
                      selectedBodyType === type.label ? "border-[#ff4b12]" : "border-transparent hover:border-white/15",
                    )}
                  >
                    <div className="relative h-[210px] overflow-hidden bg-[#202020] sm:h-[250px]">
                      <Image src={type.image} alt={type.label} fill sizes="(max-width: 640px) 45vw, 230px" unoptimized className="object-cover object-top saturate-[0.9] transition duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#202020] via-transparent to-transparent" />
                    </div>
                    <div className="bg-[#2b2b2b] px-3 py-2 text-center text-xl font-black">{type.label}</div>
                  </button>
                ))}
              </div>
            </Screen>
          )}

          {step === "goal" && (
            <Screen>
              <h1 className="text-center text-[34px] font-black leading-tight sm:text-4xl">Chọn mục tiêu của bạn</h1>
              <div className="mx-auto mt-10 flex w-full max-w-[470px] flex-col gap-4">
                {fitnessGoals.map((goal) => (
                  <button
                    key={goal.label}
                    type="button"
                    onClick={() => {
                      setSelectedGoal(goal.label);
                      setStep("assessment");
                    }}
                    className="group relative flex h-[124px] items-center overflow-hidden rounded-[22px] border border-transparent bg-[#202020] px-6 text-left shadow-2xl transition hover:border-white/15 active:scale-[0.985]"
                  >
                    <span className="relative z-10 text-xl font-black">{goal.label}</span>
                    <div className="absolute bottom-0 right-3 h-[124px] w-[150px]">
                      <Image src={goal.image} alt={goal.label} fill sizes="150px" unoptimized className="object-cover object-top saturate-[0.9] transition duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#202020] via-transparent to-transparent" />
                    </div>
                  </button>
                ))}
              </div>
            </Screen>
          )}

          {step === "assessment" && (
            <Screen className="flex flex-col items-center">
              <div className="relative h-[288px] w-full max-w-[470px] overflow-hidden rounded-[22px] bg-[#202020] shadow-2xl">
                <Image src={assessment.image} alt="Đánh giá thể trạng" fill sizes="470px" unoptimized className="object-cover object-center saturate-[0.9]" priority />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_0,rgba(32,32,32,0.12)_45%,rgba(32,32,32,0.88)_100%)]" />
                <div className="absolute bottom-16 left-1/2 h-1 w-52 -translate-x-1/2 rounded-full bg-cyan-300/70 shadow-[0_0_28px_rgba(103,232,249,0.95)]" />
              </div>
              <div className="mt-10 w-full max-w-[510px] text-center">
                <h1 className="text-[34px] font-black leading-tight sm:text-4xl">
                  <span className="text-[#ff4b12]">{assessment.score}%</span> kết quả của bạn là về
                  <br />
                  {assessment.topic}
                </h1>
                <div className="mx-auto mt-10 max-w-[470px] text-left">
                  <p className="text-base font-bold leading-7">{assessment.intro}</p>
                  <div className="mt-5 space-y-4">
                    {assessment.points.map((point) => (
                      <div key={point} className="flex items-start gap-2 text-base font-bold leading-6">
                        <CheckCircle2 className="mt-0.5 shrink-0" size={22} />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={() => setStep("age")} className="mt-12 w-full max-w-[330px] rounded-[24px] bg-[#ff4b12] px-8 py-4 text-base font-black shadow-lg shadow-[#ff4b12]/20 transition hover:scale-[1.02]">
                  Đã hiểu
                </button>
              </div>
            </Screen>
          )}

          {step === "age" && (
            <Screen className="text-center">
              <h1 className="mx-auto max-w-3xl text-[42px] font-black uppercase leading-[1.08] sm:text-6xl lg:text-7xl">
                Xây dựng cơ thể
                <br />
                hoàn hảo của
                <br />
                bạn
              </h1>
              <p className="mt-5 text-base font-semibold sm:text-lg">Theo độ tuổi và chỉ số BMI của bạn</p>
              <div className="mx-auto mt-10 grid w-full max-w-[470px] grid-cols-2 gap-6">
                {ageGroups.map((group) => (
                  <button
                    key={group.label}
                    type="button"
                    onClick={() => {
                      setSelectedAge(group.label);
                      setStep("diet");
                    }}
                    className="group overflow-hidden rounded-[18px] border border-transparent bg-[#202020] text-left shadow-2xl transition-transform hover:-translate-y-1 active:scale-[0.98]"
                  >
                    <div className="relative h-[150px] overflow-hidden bg-[#202020]">
                      <Image src={group.image} alt={`Nhóm tuổi ${group.label}`} fill sizes="(max-width: 640px) 45vw, 220px" unoptimized className="object-cover object-center opacity-90 saturate-[0.9] transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#202020] via-transparent to-transparent" />
                    </div>
                    <div className="flex items-center justify-between bg-[#ff4b12] px-3 py-2">
                      <span className="text-lg font-black">Tuổi: {group.label}</span>
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#ff4b12]">
                        <ArrowRight size={14} strokeWidth={4} />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </Screen>
          )}

          {step === "diet" && (
            <Screen>
              <h1 className="mx-auto max-w-[520px] text-center text-[34px] font-black leading-tight sm:text-4xl">
                Bạn có tuân theo bất kỳ chế độ ăn kiêng nào không?
              </h1>
              <div className="mx-auto mt-10 flex w-full max-w-[470px] flex-col gap-4">
                {dietOptions.map((option) => (
                  <IconChoice
                    key={option.title}
                    title={option.title}
                    description={option.description}
                    icon={option.icon}
                    separated={option.separated}
                    selected={selectedDiet === option.title}
                    onClick={() => {
                      setSelectedDiet(option.title);
                      setStep("sugar");
                    }}
                  />
                ))}
              </div>
            </Screen>
          )}

          {step === "sugar" && (
            <Screen>
              <h1 className="mx-auto max-w-[520px] text-center text-[34px] font-black leading-tight sm:text-4xl">
                Bạn có thường xuyên dùng thực phẩm hoặc đồ uống có đường không?
              </h1>
              <div className="mx-auto mt-12 flex w-full max-w-[470px] flex-col items-center gap-4">
                {sugarOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.title}
                      type="button"
                      onClick={() => {
                        setSelectedSugar(option.title);
                        setStep("water");
                      }}
                      className={cn("group flex min-h-[60px] w-full items-center gap-4 rounded-[14px] border border-transparent bg-[#202020] px-8 py-4 text-left shadow-2xl transition hover:border-white/15 active:scale-[0.985]", option.widthClass)}
                    >
                      <Icon size={22} className="shrink-0 text-white/65 transition group-hover:text-white" strokeWidth={2.4} />
                      <span className="text-base font-black leading-5">{option.title}</span>
                    </button>
                  );
                })}
              </div>
            </Screen>
          )}

          {step === "water" && (
            <Screen>
              <h1 className="mx-auto max-w-[520px] text-center text-[34px] font-black leading-tight sm:text-4xl">
                Hằng ngày bạn uống bao nhiêu nước?
              </h1>
              <div className="mx-auto mt-10 flex w-full max-w-[470px] flex-col gap-4">
                {waterOptions.map((option) => (
                  <IconChoice
                    key={option.title}
                    title={option.title}
                    description={option.description}
                    icon={option.icon}
                    separated={option.separated}
                    selected={selectedWater === option.title}
                    onClick={() => {
                      setSelectedWater(option.title);
                      setStep("hydrationResult");
                    }}
                  />
                ))}
              </div>
            </Screen>
          )}

          {step === "hydrationResult" && (
            <Screen className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center text-center">
              <div className="relative h-[152px] w-[152px] overflow-hidden rounded-full bg-[#1d2528] shadow-2xl">
                <motion.div className="absolute bottom-0 left-0 h-[56%] w-full bg-[#2ea8d7]" initial={{ y: 44 }} animate={{ y: 0 }} transition={{ duration: 0.65, ease: "easeOut" }} />
                <div className="absolute left-[-10%] top-[44%] h-10 w-[120%] rounded-[50%] bg-cyan-100/70" />
                <div className="absolute left-[-8%] top-[40%] h-12 w-[116%] rounded-[50%] bg-[#1d2528]" />
                <div className="absolute inset-x-0 bottom-0 h-[48%] bg-[#2ea8d7]" />
              </div>
              <div className="mt-16 w-full max-w-[470px]">
                <h1 className="text-[34px] font-black leading-tight sm:text-4xl">{hydrationFeedback.title}</h1>
                <p className="mx-auto mt-5 max-w-[470px] text-base font-bold leading-7 text-white/85">{hydrationFeedback.message}</p>
                <p className="mt-28 text-xs font-semibold text-white/70">*dựa trên lựa chọn nước uống của người dùng Aura Fitness</p>
                <button type="button" onClick={() => setStep("height")} className="mt-10 w-full max-w-[330px] rounded-[24px] bg-[#ff4b12] px-8 py-4 text-base font-black shadow-lg shadow-[#ff4b12]/20 transition hover:scale-[1.02]">
                  Đã hiểu
                </button>
              </div>
            </Screen>
          )}

          {step === "height" && (
            <Screen className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center text-center">
              <h1 className="mx-auto max-w-[460px] text-[34px] font-black leading-tight sm:text-4xl">
                Chiều cao của bạn là bao nhiêu?
              </h1>
              <div className="mt-11 flex rounded-[12px] bg-[#242424] p-0.5">
                {(["cm", "ft"] as HeightUnit[]).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => {
                      setHeightUnit(unit);
                      setHeightValue("");
                    }}
                    className={cn(
                      "h-8 w-[58px] rounded-[10px] border text-sm font-black transition",
                      heightUnit === unit ? "border-[#ff4b12] bg-[#171717]" : "border-transparent text-white/80 hover:text-white",
                    )}
                  >
                    {unit}
                  </button>
                ))}
              </div>
              <div className="mt-12 w-full max-w-[470px]">
                <input
                  type="number"
                  inputMode="decimal"
                  min={heightUnit === "cm" ? 90 : 3}
                  max={heightUnit === "cm" ? 240 : 8}
                  step={heightUnit === "cm" ? 1 : 0.1}
                  value={heightValue}
                  onChange={(e) => setHeightValue(e.target.value)}
                  placeholder={heightUnit === "cm" ? "Chiều cao, cm" : "Chiều cao, ft"}
                  className="w-full border-0 border-b-2 border-white/70 bg-transparent px-4 pb-3 text-center text-2xl font-semibold text-white outline-none transition placeholder:text-white/35 focus:border-[#ff4b12]"
                />
              </div>
              <button
                type="button"
                disabled={!isHeightValid}
                onClick={() => setStep("planChart")}
                className="mt-10 w-full max-w-[330px] rounded-[24px] bg-[#ff4b12] px-8 py-4 text-base font-black shadow-lg shadow-[#ff4b12]/20 transition hover:scale-[1.02] disabled:pointer-events-none disabled:bg-[#9a2a06] disabled:text-white/45 disabled:shadow-none"
              >
                Tiếp tục
              </button>
            </Screen>
          )}

          {step === "planChart" && (
            <Screen>
              <PlanChart goal={selectedGoal} />
              <div className="mt-10 text-center">
                <button type="button" onClick={() => setStep("fitnessLevel")} className="w-full max-w-[330px] rounded-[24px] bg-[#ff4b12] px-8 py-4 text-base font-black shadow-lg shadow-[#ff4b12]/20 transition hover:scale-[1.02]">
                  Tiếp tục
                </button>
              </div>
            </Screen>
          )}

          {step === "fitnessLevel" && (
            <Screen>
              <h1 className="mx-auto max-w-[520px] text-center text-[34px] font-black leading-tight sm:text-4xl">
                Mức độ tập thể hình của bạn là gì?
              </h1>
              <div className="mx-auto mt-10 flex w-full max-w-[470px] flex-col gap-4">
                {fitnessLevels.map((level) => (
                  <IconChoice
                    key={level.title}
                    title={level.title}
                    description={level.description}
                    icon={level.icon}
                    selected={fitnessLevel === level.title}
                    onClick={() => {
                      setFitnessLevel(level.title);
                      setStep("focusAreas");
                    }}
                  />
                ))}
              </div>
            </Screen>
          )}

          {step === "focusAreas" && (
            <Screen>
              <h1 className="mx-auto max-w-[520px] text-left text-[32px] font-black leading-tight sm:text-center sm:text-4xl">
                Bạn muốn tập trung vào vùng nào?
              </h1>
              <div className="mx-auto mt-8 grid w-full max-w-[520px] grid-cols-2 gap-x-7 gap-y-7 sm:grid-cols-3">
                {focusAreas.map((area) => {
                  const selected = selectedFocusAreas.includes(area);
                  return (
                    <button key={area} type="button" onClick={() => toggleFocusArea(area)} className="text-center">
                      <MuscleBadge label={area} selected={selected} />
                      <div className={cn("mt-2 text-sm font-black", selected ? "text-white" : "text-slate-400")}>{area}</div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-10 text-center">
                <button type="button" onClick={() => setStep("equipment")} className="w-full max-w-[330px] rounded-[24px] bg-[#ff4b12] px-8 py-4 text-base font-black shadow-lg shadow-[#ff4b12]/20 transition hover:scale-[1.02]">
                  Tiếp tục
                </button>
              </div>
            </Screen>
          )}

          {step === "equipment" && (
            <Screen>
              <div className="mx-auto w-full max-w-[470px]">
                <div className="mb-5 text-center text-xs font-black uppercase tracking-wide text-white/80">Tùy chọn tập luyện</div>
                <h1 className="text-[32px] font-black leading-tight sm:text-4xl">Bạn có dụng cụ nào ở nhà?</h1>
                <div className="mt-7 flex flex-col gap-3">
                  {equipmentOptions.map((item) => {
                    const Icon = item.icon;
                    const selected = selectedEquipment.includes(item.title);
                    return (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => toggleEquipment(item.title)}
                        className="flex min-h-[88px] items-center gap-4 rounded-[16px] bg-[#202126] px-4 text-left shadow-2xl"
                      >
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#202126]">
                          <Icon size={28} />
                        </span>
                        <span className="flex-1 text-lg font-black">{item.title}</span>
                        <span className={cn("flex h-6 w-6 items-center justify-center rounded-lg border-2", selected ? "border-[#ff4b12] bg-[#ff4b12]" : "border-slate-400")}>
                          {selected && <Check size={16} strokeWidth={4} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button type="button" onClick={() => setStep("exercisePreference")} className="mt-8 w-full rounded-[24px] bg-[#ff4b12] px-8 py-4 text-base font-black shadow-lg shadow-[#ff4b12]/20 transition hover:scale-[1.02]">
                  Tiếp tục
                </button>
              </div>
            </Screen>
          )}

          {step === "exercisePreference" && (
            <Screen>
              <h1 className="text-center text-[34px] font-black leading-tight sm:text-4xl">Thích hay không thích</h1>
              <div className="mx-auto mt-10 w-full max-w-[470px] overflow-hidden rounded-[18px] bg-[#202020] shadow-2xl">
                <div className="relative h-[365px]">
                  <Image src={preferenceExercise.image} alt={preferenceExercise.title} fill sizes="470px" unoptimized className="object-cover object-center" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#202020] via-transparent to-transparent" />
                </div>
                <div className="bg-[#2b2b2b] py-3 text-center text-xl font-black">{preferenceExercise.title}</div>
              </div>
              <div className="mx-auto mt-10 grid w-full max-w-[470px] grid-cols-3 gap-8">
                {[
                  { label: "Không thích", icon: ThumbsDown },
                  { label: "Trung lập", icon: Minus },
                  { label: "Thích", icon: ThumbsUp },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => {
                        setExercisePreference(option.label);
                        setStep("loadingPlan");
                      }}
                      className={cn("flex h-28 flex-col items-center justify-center rounded-[14px] bg-[#202020] text-sm font-black shadow-2xl transition hover:-translate-y-1", exercisePreference === option.label && "outline outline-2 outline-[#ff4b12]")}
                    >
                      <Icon className="mb-5 text-[#ff4b12]" size={30} strokeWidth={2.8} />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </Screen>
          )}

          {step === "loadingPlan" && (
            <Screen className="flex min-h-screen flex-col items-center justify-center text-center">
              <div className="relative h-40 w-40">
                <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
                  <circle cx="80" cy="80" r="62" stroke="#3c1709" strokeWidth="14" fill="transparent" />
                  <circle
                    cx="80"
                    cy="80"
                    r="62"
                    stroke="#ff4b12"
                    strokeWidth="14"
                    strokeLinecap="round"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 62}`}
                    strokeDashoffset={`${2 * Math.PI * 62 * (1 - loadingProgress / 100)}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-3xl font-black">{loadingProgress}%</div>
              </div>
              <p className="mt-8 text-lg font-black">Kế hoạch tập luyện được cá nhân hóa của bạn đã sẵn sàng!</p>
            </Screen>
          )}

          {step === "bodyEvaluation" && (
            <Screen>
              <div className="mx-auto w-full max-w-[650px] text-center">
                <div className="mb-8 flex items-end justify-center gap-8">
                  <div className="relative h-56 w-36">
                    <Image src={bodyTypes.find((item) => item.label === selectedBodyType)?.image || maleImage} alt="Bây giờ" fill sizes="160px" unoptimized className="object-cover object-top" />
                  </div>
                  <div className="text-8xl font-black text-white/10">&gt;&gt;</div>
                  <div className="relative h-56 w-36">
                    <Image src={athleticImage} alt="Mục tiêu" fill sizes="160px" unoptimized className="object-cover object-top" />
                  </div>
                </div>
                <div className="grid grid-cols-2 border border-white/10 text-left">
                  <div className="border-b border-r border-white/10 bg-[#202020] py-3 text-center text-lg font-black">Bây giờ</div>
                  <div className="border-b border-white/10 bg-[#202020] py-3 text-center text-lg font-black">Mục tiêu của bạn</div>
                  <div className="border-r border-white/10 p-8">
                    <div className="text-sm font-black">Mỡ cơ thể</div>
                    <div className="mt-2 text-xl font-black text-[#ff4b12]">20-24%</div>
                    <div className="mt-5 text-sm font-black">Độ tuổi thể chất</div>
                    <div className="mt-2 text-xl font-black text-[#ff4b12]">26</div>
                    <div className="mt-5 text-sm font-black">Cơ bắp cơ thể</div>
                    <div className="mt-3 flex gap-2">{[1, 2, 3, 4, 5].map((i) => <span key={i} className="h-1 w-7 rounded-full bg-[#7a2f17]" />)}</div>
                  </div>
                  <div className="p-8">
                    <div className="text-sm font-black">Mỡ cơ thể</div>
                    <div className="mt-2 text-xl font-black text-[#ff4b12]">15-17%</div>
                    <div className="mt-5 text-sm font-black">Độ tuổi thể chất</div>
                    <div className="mt-2 text-xl font-black text-[#ff4b12]">23</div>
                    <div className="mt-5 text-sm font-black">Cơ bắp cơ thể</div>
                    <div className="mt-3 flex gap-2">{[1, 2, 3, 4, 5].map((i) => <span key={i} className={cn("h-1 w-7 rounded-full", i < 5 ? "bg-[#ff4b12]" : "bg-[#7a2f17]")} />)}</div>
                  </div>
                </div>
                <p className="mx-auto mt-4 max-w-[620px] text-xs leading-5 text-white/55">
                  *Kết quả chỉ mang tính minh họa. Kết quả cá nhân có thể khác nhau tùy thuộc vào chế độ ăn uống, tập luyện và quá trình trao đổi chất.
                </p>
                <h2 className="mt-16 text-left text-[44px] font-black leading-tight text-white">
                  Tóm tắt cá nhân dựa trên
                  <br />
                  <span className="text-white/45">câu trả lời của bạn</span>
                </h2>
                <button type="button" onClick={() => setStep("account")} className="mt-8 w-full max-w-[330px] rounded-[24px] bg-[#ff4b12] px-8 py-4 text-base font-black shadow-lg shadow-[#ff4b12]/20 transition hover:scale-[1.02]">
                  Nhận Kế Hoạch Của Tôi
                </button>
              </div>
            </Screen>
          )}

          {step === "account" && (
            <Screen className="max-w-md">
              <div className="mb-5 rounded-[22px] border border-white/10 bg-white/[0.045] p-4 backdrop-blur-md">
                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ff4b12]">Hồ sơ cá nhân</div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-sm font-black">
                  <span>{selectedGender.label}</span>
                  <span>{selectedBodyType}</span>
                  <span>{selectedGoal}</span>
                  <span>Tuổi {selectedAge}</span>
                  <span>{selectedDiet}</span>
                  <span>{selectedSugar}</span>
                  <span>{selectedWater}</span>
                  <span>{heightValue} {heightUnit}</span>
                  <span>{fitnessLevel}</span>
                  <span>{selectedFocusAreas.join(", ")}</span>
                </div>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-5 shadow-2xl backdrop-blur-md sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ff4b12]">Aura Fitness</div>
                    <h2 className="mt-1 text-xl font-black uppercase tracking-tight">
                      {isLogin ? "Đăng nhập Aura" : "Tạo tài khoản Aura"}
                    </h2>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ff4b12]">
                    <Sparkles size={22} />
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <AnimatePresence mode="wait">
                    {!isLogin && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45" size={18} />
                          <input
                            type="text"
                            placeholder="Họ và tên"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required={!isLogin}
                            className="w-full rounded-xl border border-white/10 bg-[#191919] py-3 pl-10 pr-4 text-sm font-semibold placeholder:text-white/40 focus:border-[#ff4b12] focus:outline-none focus:ring-2 focus:ring-[#ff4b12]/20"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45" size={18} />
                    <input
                      type="email"
                      placeholder="Địa chỉ email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-xl border border-white/10 bg-[#191919] py-3 pl-10 pr-4 text-sm font-semibold placeholder:text-white/40 focus:border-[#ff4b12] focus:outline-none focus:ring-2 focus:ring-[#ff4b12]/20"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45" size={18} />
                    <input
                      type="password"
                      placeholder="Mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full rounded-xl border border-white/10 bg-[#191919] py-3 pl-10 pr-4 text-sm font-semibold placeholder:text-white/40 focus:border-[#ff4b12] focus:outline-none focus:ring-2 focus:ring-[#ff4b12]/20"
                    />
                  </div>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-bold text-red-300">
                      <AlertCircle size={14} />
                      {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-300">
                      <CheckCircle2 size={14} />
                      {success}
                    </motion.div>
                  )}
                  <button
                    disabled={isLoading}
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff4b12] py-3 font-black uppercase shadow-lg shadow-[#ff4b12]/20 transition-all hover:scale-[1.02] hover:bg-[#ff5d29] active:scale-95 disabled:opacity-50"
                  >
                    {isLoading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Tạo tài khoản"}
                    {!isLoading && <ArrowRight size={18} />}
                  </button>
                </form>
                <div className="mt-5 text-center">
                  <button onClick={() => setIsLogin(!isLogin)} className="text-sm font-bold text-white/60 underline underline-offset-4 transition-colors hover:text-[#ff4b12]">
                    {isLogin ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
                  </button>
                </div>
                <p className="mt-6 text-center text-[11px] leading-5 text-white/40">
                  Bằng cách tiếp tục, bạn đồng ý với <span className="font-bold text-[#ff4b12] underline">Điều khoản dịch vụ</span> và <span className="font-bold text-[#ff4b12] underline">Chính sách bảo mật</span> của Aura Fitness.
                </p>
              </div>
            </Screen>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
