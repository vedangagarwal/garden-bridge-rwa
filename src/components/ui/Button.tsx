"use client";

import { Spinner } from "./Spinner";
import type { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: ReactNode;
}

const variants = {
  primary: `
    font-semibold text-white
    transition-all duration-200
  `,
  secondary: `
    font-medium border
    transition-all duration-200
  `,
  ghost: `
    font-medium
    transition-all duration-200
  `,
};

const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-4 text-base rounded-2xl w-full",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  style,
  ...props
}: ButtonProps) {
  const variantStyle =
    variant === "primary"
      ? {
          background: disabled || loading ? "#d8d2ef" : "#6B5DD3",
          color: disabled || loading ? "#a09ac0" : "#ffffff",
          boxShadow: disabled || loading ? "none" : "0 2px 12px rgba(107,93,211,0.30)",
          cursor: disabled || loading ? "not-allowed" : "pointer",
        }
      : variant === "secondary"
      ? {
          background: "#f5f3fc",
          color: "#6B5DD3",
          border: "1.5px solid #e8e4f2",
          cursor: disabled || loading ? "not-allowed" : "pointer",
          opacity: disabled || loading ? 0.5 : 1,
        }
      : {
          background: "transparent",
          color: "#8b88a0",
          cursor: disabled || loading ? "not-allowed" : "pointer",
          opacity: disabled || loading ? 0.5 : 1,
        };

  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      style={{ ...variantStyle, ...style }}
      {...props}
    >
      {loading && <Spinner size="sm" gold={false} />}
      {children}
    </button>
  );
}
