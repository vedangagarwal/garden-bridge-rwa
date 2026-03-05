"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BitcoinWalletButton, walletBtnStyle } from "@/components/layout/BitcoinWalletButton";
import { NetworkSwitcherModal } from "@/components/layout/NetworkSwitcherModal";

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

// Extracted so we can use hooks inside ConnectButton.Custom render
function WalletButtons({
  mounted, connected, chainUnsupported, accountDisplayName,
  openConnectModal, openAccountModal, openChainModal,
}: {
  mounted: boolean;
  connected: boolean;
  chainUnsupported: boolean;
  accountDisplayName?: string;
  openConnectModal: () => void;
  openAccountModal: () => void;
  openChainModal: () => void;
}) {
  const [networkModalOpen, setNetworkModalOpen] = useState(false);

  if (!mounted) return <div style={{ opacity: 0, pointerEvents: "none" }} />;

  if (chainUnsupported) {
    return (
      <>
        <button
          onClick={openChainModal}
          className="flex items-center gap-2 px-4 py-[9px] rounded-xl transition-all hover:opacity-80"
          style={{ ...walletBtnStyle, border: "2px solid #ef4444", color: "#ef4444" }}
        >
          <span className="text-sm font-semibold">Switch to Arbitrum</span>
        </button>
        <NetworkSwitcherModal
          open={networkModalOpen}
          onClose={() => setNetworkModalOpen(false)}
          onConnectEVM={openConnectModal}
          onManageEVM={openAccountModal}
          chainUnsupported={true}
          onSwitchChain={openChainModal}
        />
      </>
    );
  }

  if (!connected) {
    return (
      <>
        {/* Network switcher */}
        <button
          onClick={() => setNetworkModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-[9px] rounded-xl transition-all hover:opacity-80"
          style={walletBtnStyle}
          title="Switch Network"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#1a1028" strokeWidth="1.8"/>
            <path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" stroke="#1a1028" strokeWidth="1.8"/>
          </svg>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3.5l3 3 3-3" stroke="#1a1028" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Connect EVM wallet */}
        <button
          onClick={openConnectModal}
          className="flex items-center gap-2.5 px-4 py-[9px] rounded-xl transition-all hover:opacity-80"
          style={walletBtnStyle}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="6" width="20" height="14" rx="2" stroke="#1a1028" strokeWidth="1.8"/>
            <path d="M2 10h20" stroke="#1a1028" strokeWidth="1.8"/>
            <circle cx="17" cy="15" r="1.5" fill="#1a1028"/>
          </svg>
          <span className="text-sm font-semibold" style={{ color: "#1a1028" }}>Connect Wallet</span>
        </button>

        <NetworkSwitcherModal
          open={networkModalOpen}
          onClose={() => setNetworkModalOpen(false)}
          onConnectEVM={openConnectModal}
          onManageEVM={openAccountModal}
        />
      </>
    );
  }

  // Connected
  return (
    <>
      {/* Network switcher button */}
      <button
        onClick={() => setNetworkModalOpen(true)}
        className="flex items-center gap-1.5 px-3 py-[9px] rounded-xl transition-all hover:opacity-80"
        style={walletBtnStyle}
        title="Switch Network"
      >
        {/* Arbitrum icon */}
        <svg width="16" height="18" viewBox="0 0 32 37" fill="none">
          <path d="M16 0.5L30.5 8.5V24.5L16 32.5L1.5 24.5V8.5L16 0.5Z" fill="#96BEDC"/>
          <path d="M16 3L28.5 10V24L16 31L3.5 24V10L16 3Z" fill="#213147"/>
          <path d="M10 24L16.5 10.5L17.5 13.5L12 24H10Z" fill="white"/>
          <path d="M13.5 24L20 10.5L21 13.5L15.5 24H13.5Z" fill="white"/>
          <path d="M20.5 24L17.5 17L19.5 13L24 24H20.5Z" fill="#12AAFF"/>
        </svg>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 3.5l3 3 3-3" stroke="#1a1028" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Account button */}
      <button
        onClick={openAccountModal}
        className="flex items-center gap-2 px-4 py-[9px] rounded-xl transition-all hover:opacity-80"
        style={walletBtnStyle}
      >
        <div className="w-5 h-5 rounded-full flex-shrink-0 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #6B5DD3, #F590B9)" }}
        />
        <span className="text-sm font-semibold font-mono" style={{ color: "#1a1028" }}>
          {accountDisplayName}
        </span>
      </button>

      <NetworkSwitcherModal
        open={networkModalOpen}
        onClose={() => setNetworkModalOpen(false)}
        onConnectEVM={openConnectModal}
        onManageEVM={openAccountModal}
      />
    </>
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

        {/* Wallets — BTC + Network switcher + EVM account */}
        <div className="flex items-center gap-2">
          <BitcoinWalletButton />
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <WalletButtons
                  mounted={!!ready}
                  connected={!!connected}
                  chainUnsupported={!!chain?.unsupported}
                  accountDisplayName={account?.displayName}
                  openConnectModal={openConnectModal}
                  openAccountModal={openAccountModal}
                  openChainModal={openChainModal}
                />
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </header>
  );
}
