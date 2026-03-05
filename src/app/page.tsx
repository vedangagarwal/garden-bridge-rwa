import { Header } from "@/components/layout/Header";
import { SwapInterface } from "@/components/swap/SwapInterface";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-3">
          {/* Headline */}
          <div className="text-center mb-8 space-y-2">
            <h1 className="text-3xl font-light tracking-tight" style={{ color: "#1a1028" }}>
              Swap to{" "}
              <span
                className="font-semibold"
                style={{ color: "#6B5DD3" }}
              >
                Real Assets
              </span>
            </h1>
            <p className="text-sm" style={{ color: "#8b88a0" }}>
              Bridge BTC via Garden Finance · Receive gold or RWA tokens
            </p>
          </div>

          <SwapInterface />
        </div>
      </main>
    </div>
  );
}
