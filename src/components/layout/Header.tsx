"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BitcoinWalletButton } from "@/components/layout/BitcoinWalletButton";

export function Header() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-40 w-full px-4 py-4"
      style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e8e4f2" }}
    >
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* Logo + nav */}
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full" style={{ background: "linear-gradient(135deg, #6B5DD3, #4e42b0)" }} />
              <div className="absolute inset-[2px] rounded-full flex items-center justify-center" style={{ background: "#ffffff" }}>
                <span className="text-[10px] font-bold" style={{ color: "#6B5DD3" }}>G</span>
              </div>
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight" style={{ color: "#1a1028" }}>GardenFi</span>
              <span className="text-[10px] block leading-none -mt-0.5 tracking-widest uppercase" style={{ color: "#8b88a0" }}>RWA Swap</span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                pathname === "/"
                  ? "bg-[#6B5DD3]/10"
                  : "hover:bg-[#6B5DD3]/5"
              }`}
              style={{ color: pathname === "/" ? "#6B5DD3" : "#8b88a0" }}
            >
              Swap
            </Link>
            <Link
              href="/history"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                pathname === "/history"
                  ? "bg-[#6B5DD3]/10"
                  : "hover:bg-[#6B5DD3]/5"
              }`}
              style={{ color: pathname === "/history" ? "#6B5DD3" : "#8b88a0" }}
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <rect x="1" y="0.5" width="7" height="9" rx="1" stroke="currentColor" strokeWidth="1.1" />
                <path d="M3 3h4M3 5h4M3 7h2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
              </svg>
              History
            </Link>
          </nav>
        </div>

        {/* Wallets — BTC + EVM side by side */}
        <div className="flex items-center gap-2">
          <BitcoinWalletButton />
          <ConnectButton
            chainStatus="icon"
            showBalance={false}
            accountStatus="avatar"
          />
        </div>
      </div>
    </header>
  );
}
