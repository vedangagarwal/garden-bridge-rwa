"use client";

import { useAccount } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { Modal } from "@/components/ui/Modal";

function ArbitrumLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 37" fill="none">
      <path d="M16 0.5L30.5 8.5V24.5L16 32.5L1.5 24.5V8.5L16 0.5Z" fill="#96BEDC" />
      <path d="M16 3L28.5 10V24L16 31L3.5 24V10L16 3Z" fill="#213147" />
      <path d="M10 24L16.5 10.5L17.5 13.5L12 24H10Z" fill="white" />
      <path d="M13.5 24L20 10.5L21 13.5L15.5 24H13.5Z" fill="white" />
      <path d="M20.5 24L17.5 17L19.5 13L24 24H20.5Z" fill="#12AAFF" />
      <path d="M17.5 17L16.5 14.5L21 24H19L17.5 17Z" fill="#12AAFF" />
    </svg>
  );
}

function SolanaLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#1a1a2e" />
      <rect x="7" y="10" width="18" height="3" rx="1.5" fill="url(#sg1)" />
      <rect x="7" y="14.5" width="18" height="3" rx="1.5" fill="url(#sg2)" />
      <rect x="7" y="19" width="18" height="3" rx="1.5" fill="url(#sg3)" />
      <defs>
        <linearGradient id="sg1" x1="7" y1="11.5" x2="25" y2="11.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9945FF" /><stop offset="1" stopColor="#14F195" />
        </linearGradient>
        <linearGradient id="sg2" x1="7" y1="16" x2="25" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9945FF" /><stop offset="1" stopColor="#14F195" />
        </linearGradient>
        <linearGradient id="sg3" x1="7" y1="20.5" x2="25" y2="20.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9945FF" /><stop offset="1" stopColor="#14F195" />
        </linearGradient>
      </defs>
    </svg>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  onConnectEVM: () => void;
  onManageEVM: () => void;
  chainUnsupported?: boolean;
  onSwitchChain?: () => void;
}

function truncate(addr: string, head = 6, tail = 4) {
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

export function NetworkSwitcherModal({ open, onClose, onConnectEVM, onManageEVM, chainUnsupported, onSwitchChain }: Props) {
  const { isConnected: evmConnected, address: evmAddress } = useAccount();
  const { connected: solanaConnected, publicKey, wallets, select, disconnect: solanaDisconnect } = useWallet();

  const installedWallets = wallets.filter(
    (w) => w.readyState === WalletReadyState.Installed || w.readyState === WalletReadyState.Loadable
  );

  function handleArbitrumClick() {
    if (chainUnsupported && onSwitchChain) {
      onSwitchChain(); // opens RainbowKit chain switcher to switch to Arbitrum
    } else if (evmConnected) {
      onManageEVM();
    } else {
      onConnectEVM();
    }
    onClose();
  }

  function handleSolanaWallet(walletName: string) {
    select(walletName as Parameters<typeof select>[0]);
    onClose();
  }

  function handleSolanaDisconnect() {
    solanaDisconnect().catch(() => {});
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Switch Networks">
      <div className="flex flex-col gap-3">

        {/* ── Arbitrum ── */}
        <button
          onClick={handleArbitrumClick}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-left"
          style={{
            background: evmConnected ? "rgba(107,93,211,0.06)" : "#fafafa",
            border: evmConnected ? "1.5px solid rgba(107,93,211,0.25)" : "1.5px solid #e8e4f2",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#6B5DD3"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = evmConnected ? "rgba(107,93,211,0.25)" : "#e8e4f2"; }}
        >
          <ArbitrumLogo size={32} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold" style={{ color: "#1a1028" }}>Arbitrum</div>
            <div className="text-[11px] font-mono" style={{ color: "#8b88a0" }}>
              {evmConnected && evmAddress ? truncate(evmAddress) : "EVM — XAUt0, PAXG"}
            </div>
          </div>
          {evmConnected && chainUnsupported ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs font-medium text-amber-600">Wrong Network</span>
            </div>
          ) : evmConnected ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-emerald-600">Connected</span>
            </div>
          ) : (
            <span className="text-xs font-medium" style={{ color: "#6B5DD3" }}>Connect →</span>
          )}
        </button>

        {/* ── Solana ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: solanaConnected ? "1.5px solid rgba(153,69,255,0.30)" : "1.5px solid #e8e4f2" }}
        >
          {/* Header row */}
          <div
            className="flex items-center gap-3 px-4 py-3.5"
            style={{ background: solanaConnected ? "rgba(153,69,255,0.06)" : "#fafafa" }}
          >
            <SolanaLogo size={32} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold" style={{ color: "#1a1028" }}>Solana</div>
              <div className="text-[11px] font-mono" style={{ color: "#8b88a0" }}>
                {solanaConnected && publicKey ? truncate(publicKey.toBase58(), 6, 4) : "TSLAx, USDG"}
              </div>
            </div>
            {solanaConnected ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-emerald-600">Connected</span>
                </div>
                <button
                  onClick={handleSolanaDisconnect}
                  className="text-[11px] text-red-400 hover:text-red-500 transition font-medium px-2 py-0.5 rounded-lg hover:bg-red-50"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <span className="text-xs font-medium" style={{ color: "#9945FF" }}>
                {installedWallets.length === 0 ? "Not installed" : "Connect →"}
              </span>
            )}
          </div>

          {/* Wallet list (only when not yet connected) */}
          {!solanaConnected && installedWallets.length > 0 && (
            <div style={{ borderTop: "1px solid #e8e4f2" }}>
              {installedWallets.map((wallet) => (
                <button
                  key={wallet.adapter.name}
                  onClick={() => handleSolanaWallet(wallet.adapter.name)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left"
                  style={{ background: "transparent" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f5f3fc"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  {wallet.adapter.icon && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={wallet.adapter.icon} alt={wallet.adapter.name} width={20} height={20} className="rounded-md" />
                  )}
                  <span className="text-sm font-medium" style={{ color: "#1a1028" }}>
                    {wallet.adapter.name}
                  </span>
                  <span className="ml-auto text-xs font-medium" style={{ color: "#9945FF" }}>Connect →</span>
                </button>
              ))}
            </div>
          )}

          {/* No wallets installed hint */}
          {!solanaConnected && installedWallets.length === 0 && (
            <div className="px-4 pb-3 pt-1" style={{ borderTop: "1px solid #e8e4f2", background: "#fafafa" }}>
              <p className="text-[11px]" style={{ color: "#b0adc4" }}>
                Install Phantom or OKX Wallet to connect Solana.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
