"use client";

import { BTC_WALLETS, type BtcWalletId } from "@/lib/bitcoin/wallets";
import { useBitcoinWallet } from "@/hooks/useBitcoinWallet";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function BitcoinWalletSelector({ open, onClose }: Props) {
  const { connect, connecting, error } = useBitcoinWallet();

  async function handleSelect(id: BtcWalletId) {
    await connect(id);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Connect Bitcoin Wallet">
      <div className="flex flex-col gap-2">
        {BTC_WALLETS.map((wallet) => {
          const installed = wallet.isInstalled();
          return (
            <button
              key={wallet.id}
              disabled={!installed || connecting}
              onClick={() => handleSelect(wallet.id)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left"
              style={{
                border: `1.5px solid ${installed ? "#e8e4f2" : "#f0eef8"}`,
                background: installed ? "#fafafa" : "#f9f8fd",
                opacity: installed ? 1 : 0.5,
                cursor: installed ? "pointer" : "not-allowed",
              }}
              onMouseEnter={(e) => {
                if (installed) (e.currentTarget as HTMLButtonElement).style.border = "1.5px solid #6B5DD3";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.border = `1.5px solid ${installed ? "#e8e4f2" : "#f0eef8"}`;
              }}
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 border border-[#e8e4f2]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={wallet.icon} alt={wallet.name} className="w-full h-full object-cover" />
              </div>

              <span className="flex-1 text-sm font-semibold" style={{ color: "#1a1028" }}>
                {wallet.name}
              </span>

              {connecting ? (
                <Spinner size="sm" />
              ) : !installed ? (
                <span className="text-xs" style={{ color: "#b0adc4" }}>Not installed</span>
              ) : (
                <span className="text-xs font-medium" style={{ color: "#6B5DD3" }}>Connect →</span>
              )}
            </button>
          );
        })}

        {error && (
          <p className="text-xs text-red-500 text-center mt-1">{error}</p>
        )}

        <p className="text-xs text-center pt-1" style={{ color: "#b0adc4" }}>
          Install a Bitcoin wallet extension to get started.
        </p>
      </div>
    </Modal>
  );
}
