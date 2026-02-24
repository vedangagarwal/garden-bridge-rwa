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
      <div className="flex flex-col gap-2 mt-2">
        {BTC_WALLETS.map((wallet) => {
          const installed = wallet.isInstalled();
          return (
            <button
              key={wallet.id}
              disabled={!installed || connecting}
              onClick={() => handleSelect(wallet.id)}
              className={[
                "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
                installed
                  ? "border-white/10 hover:border-[#d4af37]/50 hover:bg-[#d4af37]/5 cursor-pointer"
                  : "border-white/5 opacity-40 cursor-not-allowed",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={wallet.icon}
                  alt={wallet.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <span className="flex-1 text-left text-sm font-medium text-white">
                {wallet.name}
              </span>

              {connecting ? (
                <Spinner size="sm" />
              ) : !installed ? (
                <span className="text-xs text-white/30">Not installed</span>
              ) : (
                <span className="text-xs text-[#d4af37]/60">Connect →</span>
              )}
            </button>
          );
        })}

        {error && (
          <p className="text-xs text-red-400 text-center mt-1">{error}</p>
        )}

        <p className="text-xs text-white/30 text-center mt-2">
          Install a Bitcoin wallet extension to get started.
        </p>
      </div>
    </Modal>
  );
}
