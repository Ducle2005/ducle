"use client";

import { useState } from "react";
import {
  Activity,
  Apple,
  ArrowRight,
  BarChart3,
  Check,
  Dumbbell,
  Flame,
  Heart,
  MessageCircle,
  Monitor,
  Play,
  Timer,
  Trophy,
  Users,
  Watch,
} from "lucide-react";
import { AuthPage } from "@/components/AuthPage";

const workoutRows = [
  { name: "Bench Press", sets: "4 x 8", value: "80 kg" },
  { name: "Lat Pulldown", sets: "3 x 10", value: "62 kg" },
  { name: "Leg Press", sets: "4 x 12", value: "160 kg" },
];

const features = [
  "Fast workout logging",
  "Routine planner",
  "Warmup, drop and failure sets",
  "Automatic rest timers",
  "Exercise notes",
];

const progressFeatures = [
  "Exercise charts",
  "Personal records",
  "One rep max estimates",
  "Exercise history",
  "Video guidance",
];

const featureTiles = [
  { label: "Rest timer", Icon: Timer, color: "#ff5a2a" },
  { label: "Plan routines", Icon: Dumbbell, color: "#2563eb" },
  { label: "Track volume", Icon: BarChart3, color: "#138a45" },
  { label: "Beat records", Icon: Trophy, color: "#f59e0b" },
];

function AuraLogo() {
  return (
    <div className="flex items-center gap-2 text-zinc-950">
      <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#ff5a2a] text-white">
        <Activity size={22} strokeWidth={3} />
      </span>
      <span className="text-xl font-black tracking-tight">Aura Fitness</span>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[430px] px-8 py-10 sm:px-10">
      <div className="absolute inset-8 rounded-full bg-zinc-950/10 blur-3xl" />

      <div className="absolute left-2 top-[88px] hidden h-[420px] w-[225px] rotate-[-8deg] rounded-[38px] border-[10px] border-[#090909] bg-[#090909] shadow-[0_28px_70px_rgba(15,23,42,0.25)] md:block">
        <div className="h-full overflow-hidden rounded-[27px] bg-[#f4f3ee]">
          <div className="bg-[#1b2638] px-5 pb-7 pt-9 text-white">
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/55">Today</div>
            <div className="mt-3 text-3xl font-black tracking-tight">Pull Day</div>
          </div>
          <div className="space-y-4 p-4">
            {workoutRows.slice(0, 2).map((row) => (
              <div key={row.name} className="rounded-[10px] bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-black text-zinc-950">{row.name}</div>
                  <Check size={17} className="text-[#16a34a]" />
                </div>
                <div className="mt-2 text-xs font-black text-zinc-500">{row.sets}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 ml-auto max-w-[360px] rounded-[42px] border-[12px] border-[#090909] bg-[#090909] shadow-[0_32px_90px_rgba(15,23,42,0.28)]">
        <div className="overflow-hidden rounded-[28px] bg-[#f8f7f2]">
          <div className="bg-[#ff542f] px-5 pb-7 pt-9 text-white sm:px-6 sm:pt-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.24em] text-white/85">Live workout</div>
                <div className="mt-3 text-[31px] font-black leading-none tracking-tight">Upper Body</div>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#ff542f]">
                <Timer size={22} />
              </div>
            </div>
            <div className="mt-7 grid grid-cols-3 gap-2 text-center">
              {[
                ["42", "min"],
                ["14", "sets"],
                ["7.8k", "kg"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-[8px] bg-white/17 px-2 py-4">
                  <div className="text-xl font-black leading-none">{value}</div>
                  <div className="mt-2 text-[9px] font-black uppercase text-white/85">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 px-4 pb-4 pt-4 sm:px-5">
            {workoutRows.map((row, index) => (
              <div
                key={row.name}
                className="rounded-[10px] border border-zinc-200/80 bg-white p-4 shadow-[0_7px_18px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-black leading-none text-zinc-950">{row.name}</div>
                    <div className="mt-3 text-sm font-black leading-none text-zinc-500">{row.sets}</div>
                  </div>
                  <div className={index === 1 ? "rounded-full bg-zinc-100 px-3 py-2 text-sm font-black leading-none text-zinc-700" : "rounded-full bg-[#e4f9ee] px-3 py-2 text-sm font-black leading-none text-[#079247]"}>
                    {row.value}
                  </div>
                </div>
              </div>
            ))}
            <button className="flex w-full items-center justify-center gap-2 rounded-[9px] bg-[#070707] py-4 font-black text-white shadow-[0_8px_18px_rgba(0,0,0,0.22)]">
              <Play size={16} fill="currentColor" />
              Finish workout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StoreBadges() {
  return (
    <div className="mt-8 max-w-xl">
      <p className="text-lg font-semibold leading-8 text-zinc-800">
        Aura Fitness is a free workout tracker for iOS and Android. Build routines and track progress with friends.
      </p>
      <div className="mt-6 flex flex-wrap gap-4">
        <button className="flex h-[54px] min-w-[178px] items-center gap-3 rounded-[7px] bg-black px-4 text-left text-white shadow-sm transition hover:-translate-y-0.5">
          <Apple size={30} fill="currentColor" />
          <span>
            <span className="block text-[10px] font-semibold leading-none">Download on the</span>
            <span className="block text-[24px] font-black leading-7">App Store</span>
          </span>
        </button>
        <button className="flex h-[54px] min-w-[178px] items-center gap-3 rounded-[7px] bg-black px-4 text-left text-white shadow-sm transition hover:-translate-y-0.5">
          <span className="relative block h-7 w-7 shrink-0 overflow-hidden rounded-[4px]">
            <span className="absolute inset-y-0 left-0 w-0 border-y-[14px] border-l-[23px] border-y-transparent border-l-[#34a853]" />
            <span className="absolute left-[9px] top-0 h-0 w-0 border-x-[12px] border-t-[14px] border-x-transparent border-t-[#4285f4]" />
            <span className="absolute bottom-0 left-[9px] h-0 w-0 border-x-[12px] border-b-[14px] border-x-transparent border-b-[#fbbc05]" />
            <span className="absolute right-0 top-[7px] h-0 w-0 border-y-[7px] border-l-[12px] border-y-transparent border-l-[#ea4335]" />
          </span>
          <span>
            <span className="block text-[10px] font-semibold uppercase leading-none">Get it on</span>
            <span className="block text-[24px] font-black leading-7">Google Play</span>
          </span>
        </button>
      </div>
      <div className="mt-8 border-t border-zinc-200 pt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex -space-x-2">
            {["AF", "LV", "MR"].map((initials, index) => (
              <span
                key={initials}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#fbfaf7] text-[10px] font-black text-white"
                style={{ backgroundColor: ["#0f766e", "#ff5a2a", "#2563eb"][index] }}
              >
                {initials}
              </span>
            ))}
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-800">
              The smart workout tracker. Loved by 13,000+ athletes.
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-zinc-500">
              <span className="tracking-[0.12em] text-[#ff9f1c]">★★★★★</span>
              <span>4.9 App Store & 4.9 Google Play (4,670+ ratings)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="mt-7 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-3 text-base font-bold text-zinc-700">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e9f8ef] text-[#138a45]">
            <Check size={15} strokeWidth={3} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function PublicLanding() {
  const [showAuth, setShowAuth] = useState(false);

  if (showAuth) {
    return <AuthPage />;
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-[#fbfaf7]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <AuraLogo />
          <nav className="hidden items-center gap-8 text-sm font-black text-zinc-700 md:flex">
            <a href="#features" className="transition hover:text-[#ff5a2a]">Features</a>
            <a href="#progress" className="transition hover:text-[#ff5a2a]">Progress</a>
            <a href="#community" className="transition hover:text-[#ff5a2a]">Community</a>
            <a href="#desktop" className="transition hover:text-[#ff5a2a]">Web</a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAuth(true)}
              className="hidden rounded-[8px] px-4 py-2 text-sm font-black text-zinc-700 transition hover:bg-zinc-100 sm:block"
            >
              Log in
            </button>
            <button
              onClick={() => setShowAuth(true)}
              className="flex items-center gap-2 rounded-[8px] bg-zinc-950 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-zinc-950/10 transition hover:-translate-y-0.5"
            >
              Start free
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_440px] lg:py-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-zinc-700 shadow-sm ring-1 ring-zinc-200">
            <Trophy size={16} className="text-[#ff5a2a]" />
            Workout tracker for serious consistency
          </div>
          <h1 className="mt-8 text-[52px] font-black leading-[0.95] tracking-tight text-zinc-950 sm:text-[76px] lg:text-[92px]">
            Log workouts.
            <br />
            Get stronger.
            <br />
            Stay driven.
          </h1>
          <p className="mt-7 max-w-2xl text-lg font-semibold leading-8 text-zinc-600 sm:text-xl">
            Aura Fitness helps you build routines, track every set, watch your progress, and keep the habit alive with AI guidance.
          </p>
          <StoreBadges />
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => setShowAuth(true)}
              className="flex items-center justify-center gap-2 rounded-[10px] bg-[#ff5a2a] px-7 py-4 text-base font-black text-white shadow-xl shadow-[#ff5a2a]/25 transition hover:-translate-y-0.5"
            >
              Get started
              <ArrowRight size={18} />
            </button>
            <a
              href="#features"
              className="flex items-center justify-center gap-2 rounded-[10px] bg-white px-7 py-4 text-base font-black text-zinc-950 shadow-sm ring-1 ring-zinc-200 transition hover:-translate-y-0.5"
            >
              See features
            </a>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-6 text-sm font-black text-zinc-500">
            <span className="flex items-center gap-2"><Heart size={17} className="text-[#ff5a2a]" /> Loved by gym members</span>
            <span className="flex items-center gap-2"><Flame size={17} className="text-[#f59e0b]" /> Routine first</span>
            <span className="flex items-center gap-2"><BarChart3 size={17} className="text-[#138a45]" /> Progress focused</span>
          </div>
        </div>
        <PhoneMockup />
      </section>

      <section id="features" className="border-y border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#fff1eb] text-[#ff5a2a]">
              <Dumbbell size={25} />
            </div>
            <h2 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">Log workouts without friction.</h2>
            <p className="mt-5 max-w-xl text-lg font-semibold leading-8 text-zinc-600">
              Build a plan, start a session, complete sets, and keep notes without losing focus mid-workout.
            </p>
            <FeatureList items={features} />
          </div>
          <div className="grid content-center gap-4 sm:grid-cols-2">
            {featureTiles.map(({ label, Icon, color }) => {
              return (
                <div key={label} className="rounded-[8px] border border-zinc-200 bg-[#fbfaf7] p-5">
                  <Icon size={28} style={{ color }} />
                  <div className="mt-5 text-xl font-black">{label}</div>
                  <div className="mt-2 text-sm font-bold leading-6 text-zinc-500">Simple controls designed for repeat gym use.</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="progress" className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="order-2 rounded-[12px] bg-zinc-950 p-5 text-white lg:order-1">
          <div className="rounded-[8px] bg-white/8 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-black uppercase tracking-[0.18em] text-white/45">Bench Press</div>
                <div className="mt-2 text-3xl font-black">Progress</div>
              </div>
              <BarChart3 className="text-[#ff5a2a]" size={34} />
            </div>
            <div className="mt-10 flex h-56 items-end gap-3">
              {[36, 48, 44, 62, 58, 74, 86, 80, 96].map((height, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full rounded-t-[6px] bg-[#ff5a2a]" style={{ height: `${height}%` }} />
                  <span className="text-[10px] font-bold text-white/45">{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#e9f8ef] text-[#138a45]">
            <BarChart3 size={25} />
          </div>
          <h2 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">Measure progress and keep momentum.</h2>
          <p className="mt-5 max-w-xl text-lg font-semibold leading-8 text-zinc-600">
            See what is improving, where you stalled, and what your next session should target.
          </p>
          <FeatureList items={progressFeatures} />
        </div>
      </section>

      <section id="community" className="bg-[#eff7f0]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-white text-[#138a45]">
              <Users size={25} />
            </div>
            <h2 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">Train with accountability.</h2>
            <p className="mt-5 max-w-xl text-lg font-semibold leading-8 text-zinc-600">
              Share workouts, compare streaks, and let AI coaching turn your logs into next-step guidance.
            </p>
          </div>
          <div className="grid gap-4">
            {[
              ["Minh completed Push Day", "12 sets completed, new chest volume PR"],
              ["Lan saved your routine", "Upper Body Strength was added to her plan"],
              ["Aura Coach insight", "Your pull volume is 18% lower than push volume this week"],
            ].map(([title, detail], index) => (
              <div key={title} className="flex items-start gap-4 rounded-[8px] bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white">
                  {index === 2 ? <MessageCircle size={20} /> : <Users size={20} />}
                </div>
                <div>
                  <div className="font-black text-zinc-950">{title}</div>
                  <div className="mt-1 text-sm font-semibold leading-6 text-zinc-500">{detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="desktop" className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#eef2ff] text-[#2563eb]">
              <Monitor size={25} />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-zinc-950 text-white">
              <Watch size={25} />
            </div>
          </div>
          <h2 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">Use it anywhere you train.</h2>
          <p className="mt-5 max-w-xl text-lg font-semibold leading-8 text-zinc-600">
            Plan on desktop, log from your phone, and keep the workout simple when you are already under the bar.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm font-black text-zinc-700"><Apple size={16} /> iOS ready</span>
            <span className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm font-black text-zinc-700"><Watch size={16} /> Wearable ready</span>
            <span className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm font-black text-zinc-700"><Monitor size={16} /> Web dashboard</span>
          </div>
        </div>
        <div className="rounded-[12px] border border-zinc-200 bg-white p-4 shadow-xl shadow-zinc-950/5">
          <div className="rounded-[8px] bg-[#f5f4ef] p-5">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <div>
                <div className="text-sm font-black uppercase tracking-[0.18em] text-zinc-400">Routine planner</div>
                <div className="mt-1 text-2xl font-black">Weekly split</div>
              </div>
              <button className="rounded-[8px] bg-[#ff5a2a] px-4 py-2 text-sm font-black text-white">Create</button>
            </div>
            <div className="mt-5 grid gap-3">
              {["Push", "Pull", "Legs", "Mobility"].map((day, index) => (
                <div key={day} className="grid grid-cols-[72px_1fr_80px] items-center gap-3 rounded-[8px] bg-white p-3">
                  <div className="text-sm font-black text-zinc-400">Day {index + 1}</div>
                  <div className="font-black">{day}</div>
                  <div className="text-right text-sm font-black text-[#138a45]">{index === 3 ? "20 min" : "55 min"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
          <AuraLogo />
          <button
            onClick={() => setShowAuth(true)}
            className="flex items-center justify-center gap-2 rounded-[8px] bg-zinc-950 px-5 py-3 text-sm font-black text-white"
          >
            Build my plan
            <ArrowRight size={16} />
          </button>
        </div>
      </footer>
    </main>
  );
}
