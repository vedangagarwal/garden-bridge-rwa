import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { InputTokenSymbol } from "@/config/tokens";

export interface SwapRecord {
  id: string;
  createdAt: number;
  inputToken: InputTokenSymbol;
  inputAmountSats: number;
  wbtcReceived: string | null;
  xautReceived: string | null;
  btcSentTxId: string | null;
  bridgeTxHash: string | null;
  dexTxHash: string | null;
  gardenOrderId: string | null;
  status: "complete" | "failed" | "refunding";
  errorMessage: string | null;
}

interface HistoryStore {
  records: SwapRecord[];
  addRecord: (record: SwapRecord) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      records: [],
      addRecord: (record) =>
        set((s) => ({
          // Avoid duplicates by id (gardenOrderId or timestamp-based)
          records: s.records.some((r) => r.id === record.id)
            ? s.records.map((r) => (r.id === record.id ? record : r))
            : [record, ...s.records].slice(0, 100), // keep last 100
        })),
      clearHistory: () => set({ records: [] }),
    }),
    { name: "gardenfi-history" }
  )
);
