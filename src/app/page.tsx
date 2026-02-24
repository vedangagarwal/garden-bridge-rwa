import { Header } from "@/components/layout/Header";
import { SwapInterface } from "@/components/swap/SwapInterface";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(212,175,55,0.08) 0%, transparent 70%), #0a0a0a" }}>
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-3">
          {/* Headline */}
          <div className="text-center mb-8 space-y-2">
            <h1 className="text-3xl font-light text-white tracking-tight">
              Swap to{" "}
              <span
                className="font-semibold"
                style={{
                  background: "linear-gradient(135deg, #d4af37 0%, #f5c518 50%, #d4af37 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Gold
              </span>
            </h1>
            <p className="text-sm text-white/30">
              Bridge BTC via Garden Finance · Receive XAUt0 on Arbitrum
            </p>
          </div>

          <SwapInterface />

          {/* Disclaimer */}
          <p className="text-center text-[10px] text-white/15 leading-relaxed pt-2">
            XAUt0 is Tether Gold bridged to Arbitrum via LayerZero OFT.
            Verify contract addresses before transacting.
          </p>
        </div>
      </main>
    </div>
  );
}
