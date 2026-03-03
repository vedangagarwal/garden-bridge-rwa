"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BitcoinWalletButton } from "@/components/layout/BitcoinWalletButton";

// Garden Finance logo — 4-petal blossom (petals N/E/S/W) with Bitcoin ₿
function GardenLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/*
        4 circles at cardinal points (N/E/S/W) + large centre circle.
        All same fill so they merge into a smooth 4-petal blossom
        with the bumps pointing up/right/down/left — matching the logo.
      */}
      {/* North petal */}
      <circle cx="50" cy="25" r="26" fill="#F590B9" />
      {/* East petal */}
      <circle cx="75" cy="50" r="26" fill="#F590B9" />
      {/* South petal */}
      <circle cx="50" cy="75" r="26" fill="#F590B9" />
      {/* West petal */}
      <circle cx="25" cy="50" r="26" fill="#F590B9" />
      {/* Centre fill — closes the gaps between petals */}
      <circle cx="50" cy="50" r="30" fill="#F590B9" />
      {/* Bitcoin ₿ symbol */}
      <text
        x="51"
        y="66"
        textAnchor="middle"
        fill="white"
        fontSize="45"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
      >
        ₿
      </text>
    </svg>
  );
}

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
            <GardenLogo size={34} />
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
