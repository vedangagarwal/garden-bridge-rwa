import { Header } from "@/components/layout/Header";
import { HistoryList } from "@/components/history/HistoryList";

export default function HistoryPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(212,175,55,0.06) 0%, transparent 70%), #0a0a0a",
      }}
    >
      <Header />
      <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
        {/* Page heading */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            {/* Ledger icon */}
            <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="1" width="9" height="12" rx="1" stroke="#d4af37" strokeWidth="1.2" />
                <path d="M5 4h5M5 7h5M5 10h3" stroke="#d4af37" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M11 6l3 3-3 3" stroke="#d4af37" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white tracking-tight">Transaction History</h1>
          </div>
          <p className="text-xs text-white/30 ml-11">All your BTC → XAUt0 swaps, stored locally</p>
        </div>

        <HistoryList />
      </main>
    </div>
  );
}
