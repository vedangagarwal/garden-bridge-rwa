import { Header } from "@/components/layout/Header";
import { HistoryList } from "@/components/history/HistoryList";

export default function HistoryPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
        {/* Page heading */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            {/* Ledger icon */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(107,93,211,0.10)", border: "1px solid rgba(107,93,211,0.20)" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="1" width="9" height="12" rx="1" stroke="#6B5DD3" strokeWidth="1.2" />
                <path d="M5 4h5M5 7h5M5 10h3" stroke="#6B5DD3" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M11 6l3 3-3 3" stroke="#6B5DD3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: "#1a1028" }}>
              Transaction History
            </h1>
          </div>
          <p className="text-xs ml-11" style={{ color: "#8b88a0" }}>
            All your BTC → Real Asset swaps, stored locally
          </p>
        </div>

        <HistoryList />
      </main>
    </div>
  );
}
