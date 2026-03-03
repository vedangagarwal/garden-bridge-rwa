import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SwapSession, SwapStatus, CombinedQuote } from "@/types/swap";
import { DEFAULT_SESSION } from "@/types/swap";
import type { InputTokenSymbol, OutputTokenKey } from "@/config/tokens";

interface SwapStore {
  session: SwapSession;
  inputToken: InputTokenSymbol;
  outputToken: OutputTokenKey;
  inputAmount: string;
  slippage: number;
  quote: CombinedQuote | null;
  setStatus: (status: SwapStatus) => void;
  setSession: (partial: Partial<SwapSession>) => void;
  setInputToken: (token: InputTokenSymbol) => void;
  setOutputToken: (token: OutputTokenKey) => void;
  setInputAmount: (amount: string) => void;
  setSlippage: (slippage: number) => void;
  setQuote: (quote: CombinedQuote | null) => void;
  resetSwap: () => void;
}

export const useSwapStore = create<SwapStore>()(
  persist(
    (set) => ({
      session: DEFAULT_SESSION,
      inputToken: "BTC",
      outputToken: "XAUT" as OutputTokenKey,
      inputAmount: "",
      slippage: 1,
      quote: null,
      setStatus: (status) =>
        set((s) => ({ session: { ...s.session, status } })),
      setSession: (partial) =>
        set((s) => ({ session: { ...s.session, ...partial } })),
      setInputToken: (inputToken) => set({ inputToken, quote: null }),
      setOutputToken: (outputToken) => set({ outputToken, quote: null }),
      setInputAmount: (inputAmount) => set({ inputAmount, quote: null }),
      setSlippage: (slippage) => set({ slippage }),
      setQuote: (quote) => set({ quote }),
      resetSwap: () =>
        set({ session: DEFAULT_SESSION, quote: null }),
    }),
    {
      name: "gardenfi-swap",
      partialize: (state) => ({ session: state.session }),
    }
  )
);
