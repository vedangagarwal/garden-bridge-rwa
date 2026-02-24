"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BitcoinWalletButton } from "@/components/layout/BitcoinWalletButton";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full px-4 py-4">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* Logo + nav */}
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#d4af37] to-[#7a5c08] opacity-80" />
              <div className="absolute inset-[2px] rounded-full bg-[#0a0a0a] flex items-center justify-center">
                <span className="text-[10px] font-bold text-[#d4af37]">Au</span>
              </div>
            </div>
            <div>
              <span className="text-sm font-semibold text-white tracking-tight">GardenFi</span>
              <span className="text-[10px] text-white/30 block leading-none -mt-0.5 tracking-widest uppercase">Gold Swap</span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                pathname === "/"
                  ? "text-white bg-white/6"
                  : "text-white/35 hover:text-white/60"
              }`}
            >
              Swap
            </Link>
            <Link
              href="/history"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                pathname === "/history"
                  ? "text-[#d4af37] bg-[#d4af37]/8"
                  : "text-white/35 hover:text-white/60"
              }`}
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
