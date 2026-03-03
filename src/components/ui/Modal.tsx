"use client";

import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  title?: string;
}

export function Modal({ open, onClose, children, title }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 9999, // high enough to always sit above sticky/backdrop-filter headers
        animation: "fadeIn 0.15s ease",
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { transform: scale(0.96); opacity: 0 } to { transform: scale(1); opacity: 1 } }
      `}</style>

      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(26,16,40,0.45)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden"
        style={{
          background: "#ffffff",
          border: "1.5px solid #e8e4f2",
          boxShadow: "0 24px 64px rgba(107,93,211,0.18)",
          animation: "scaleIn 0.18s ease",
        }}
      >
        {title && (
          <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: "1px solid #e8e4f2" }}>
            <h2 className="text-base font-semibold" style={{ color: "#1a1028" }}>{title}</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-colors text-lg leading-none"
                style={{ background: "#f5f3fc", color: "#8b88a0" }}
              >
                ×
              </button>
            )}
          </div>
        )}
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
