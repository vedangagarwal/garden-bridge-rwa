"use client";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  gold?: boolean;
}

const sizes = { sm: "16px", md: "24px", lg: "40px" };
const strokes = { sm: "2", md: "2.5", lg: "3" };

export function Spinner({ size = "md", gold = false }: SpinnerProps) {
  const px = sizes[size];
  const stroke = strokes[size];
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: "spin 0.8s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle
        cx="12" cy="12" r="9"
        stroke={gold ? "#d4af37" : "rgba(255,255,255,0.15)"}
        strokeWidth={stroke}
      />
      <path
        d="M12 3 A9 9 0 0 1 21 12"
        stroke={gold ? "#f5c518" : "rgba(255,255,255,0.7)"}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </svg>
  );
}
