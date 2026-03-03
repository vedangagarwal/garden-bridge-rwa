"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BitcoinWalletButton } from "@/components/layout/BitcoinWalletButton";

// Garden Finance official logo — flower blob with Bitcoin ₿ inside
function GardenLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Petal top-left */}
      <ellipse cx="32" cy="32" rx="22" ry="22" fill="#F590B9" />
      {/* Petal top-right */}
      <ellipse cx="68" cy="32" rx="22" ry="22" fill="#F590B9" />
      {/* Petal bottom-left */}
      <ellipse cx="32" cy="68" rx="22" ry="22" fill="#F590B9" />
      {/* Petal bottom-right */}
      <ellipse cx="68" cy="68" rx="22" ry="22" fill="#F590B9" />
      {/* Center fill to merge petals */}
      <rect x="28" y="28" width="44" height="44" fill="#F590B9" />
      {/* Bitcoin ₿ symbol */}
      <text
        x="50"
        y="65"
        textAnchor="middle"
        fill="white"
        fontSize="44"
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
