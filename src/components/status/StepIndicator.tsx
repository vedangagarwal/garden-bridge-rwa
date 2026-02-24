"use client";

import type { SwapStatus } from "@/types/swap";

interface StepIndicatorProps {
  status: SwapStatus;
}

const STEP1_ACTIVE: SwapStatus[] = ["awaiting_deposit", "confirming", "bridging"];
const STEP1_DONE: SwapStatus[] = ["bridge_complete", "approving", "swapping", "complete"];
const STEP2_ACTIVE: SwapStatus[] = ["approving", "swapping"];
const STEP2_DONE: SwapStatus[] = ["complete"];

function getStepState(status: SwapStatus, active: SwapStatus[], done: SwapStatus[]) {
  if (done.includes(status)) return "done";
  if (active.includes(status)) return "active";
  return "pending";
}

interface StepProps {
  num: number;
  label: string;
  sublabel: string;
  state: "pending" | "active" | "done";
}

function Step({ num, label, sublabel, state }: StepProps) {
  return (
    <div className="flex items-center gap-3 flex-1">
      <div className="relative flex-shrink-0">
        {state === "done" ? (
          <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7L5.5 10L11.5 4" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ) : state === "active" ? (
          <div className="w-9 h-9 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/50 flex items-center justify-center">
            <span className="text-[#d4af37] text-sm font-bold">{num}</span>
            <span className="absolute -inset-1 rounded-full border border-[#d4af37]/30 animate-ping" />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <span className="text-white/30 text-sm font-bold">{num}</span>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className={`text-xs font-semibold tracking-wide uppercase ${
          state === "done" ? "text-emerald-400" :
          state === "active" ? "text-[#d4af37]" : "text-white/25"
        }`}>{label}</div>
        <div className={`text-[11px] mt-0.5 ${state === "pending" ? "text-white/20" : "text-white/50"}`}>{sublabel}</div>
      </div>
    </div>
  );
}

export function StepIndicator({ status }: StepIndicatorProps) {
  const s1 = getStepState(status, STEP1_ACTIVE, STEP1_DONE);
  const s2 = getStepState(status, STEP2_ACTIVE, STEP2_DONE);

  return (
    <div className="flex items-center gap-2 px-6 py-4 border-b border-white/5">
      <Step num={1} label="Bridge" sublabel="via Garden Finance" state={s1} />
      <div className={`w-8 h-px flex-shrink-0 ${s1 === "done" ? "bg-emerald-500/40" : "bg-white/10"}`} />
      <Step num={2} label="Swap" sublabel="USDC → XAUt0" state={s2} />
    </div>
  );
}
