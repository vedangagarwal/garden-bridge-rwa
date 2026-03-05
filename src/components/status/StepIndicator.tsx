"use client";

import type { SwapStatus } from "@/types/swap";

interface StepIndicatorProps {
  status: SwapStatus;
}

const STEP1_ACTIVE: SwapStatus[] = ["awaiting_deposit", "confirming", "bridging"];
const STEP1_DONE: SwapStatus[] = [
  "bridge_complete", "approving", "swapping", "complete", "bridge_jupiter_failed",
];
const STEP2_ACTIVE: SwapStatus[] = ["approving", "swapping", "bridge_complete"];
const STEP2_DONE: SwapStatus[] = ["complete"];
const STEP2_ERROR: SwapStatus[] = ["bridge_jupiter_failed"];

function getStepState(
  status: SwapStatus,
  active: SwapStatus[],
  done: SwapStatus[],
  error?: SwapStatus[]
): "pending" | "active" | "done" | "error" {
  if (error?.includes(status)) return "error";
  if (done.includes(status)) return "done";
  if (active.includes(status)) return "active";
  return "pending";
}

interface StepProps {
  num: number;
  label: string;
  sublabel: string;
  state: "pending" | "active" | "done" | "error";
}

function Step({ num, label, sublabel, state }: StepProps) {
  return (
    <div className="flex items-center gap-3 flex-1">
      <div className="relative flex-shrink-0">
        {state === "done" ? (
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "rgba(52,211,153,0.12)",
            border: "1.5px solid rgba(52,211,153,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7L5.5 10L11.5 4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ) : state === "error" ? (
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "rgba(239,68,68,0.10)",
            border: "1.5px solid rgba(239,68,68,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M4 4l6 6M10 4l-6 6" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
        ) : state === "active" ? (
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "rgba(107,93,211,0.12)",
            border: "1.5px solid rgba(107,93,211,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
          }}>
            <span style={{ color: "#6B5DD3", fontSize: 13, fontWeight: 700 }}>{num}</span>
            <span style={{
              position: "absolute", inset: -4, borderRadius: "50%",
              border: "1.5px solid rgba(107,93,211,0.25)",
              animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
            }} />
          </div>
        ) : (
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "#f5f3fc",
            border: "1.5px solid #e8e4f2",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#c0bdd0", fontSize: 13, fontWeight: 700 }}>{num}</span>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase",
          color: state === "done" ? "#22c55e"
            : state === "error" ? "#ef4444"
            : state === "active" ? "#6B5DD3"
            : "#c0bdd0",
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 11, marginTop: 2,
          color: state === "pending" ? "#d8d5e5" : "#8b88a0",
        }}>
          {sublabel}
        </div>
      </div>
    </div>
  );
}

export function StepIndicator({ status }: StepIndicatorProps) {
  const s1 = getStepState(status, STEP1_ACTIVE, STEP1_DONE);
  const s2 = getStepState(status, STEP2_ACTIVE, STEP2_DONE, STEP2_ERROR);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "16px 0 14px",
      borderBottom: "1px solid #e8e4f2",
    }}>
      <Step num={1} label="Bridge" sublabel="via Garden Finance" state={s1} />
      <div style={{
        width: 32, height: 1, flexShrink: 0,
        background: s1 === "done" ? "rgba(34,197,94,0.4)" : "#e8e4f2",
      }} />
      <Step num={2} label="Swap" sublabel="USDC → Token" state={s2} />
    </div>
  );
}
