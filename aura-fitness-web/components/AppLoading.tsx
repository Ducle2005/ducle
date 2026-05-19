import { Activity } from "lucide-react";

export function AppLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050713] text-orange-50">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-600 text-slate-950 shadow-[0_0_34px_rgba(249,115,22,0.34)]">
          <Activity size={24} />
        </div>
        <div className="h-1 w-32 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-orange-400 to-amber-300" />
        </div>
      </div>
    </div>
  );
}
