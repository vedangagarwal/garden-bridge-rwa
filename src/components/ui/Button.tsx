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
    bg-[#d4af37] text-black font-semibold
    hover:bg-[#f5c518] active:bg-[#b8960c]
    disabled:bg-white/10 disabled:text-white/20 disabled:cursor-not-allowed
    shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]
  `,
  secondary: `
    bg-white/5 text-white/80 font-medium border border-white/10
    hover:bg-white/10 hover:border-white/20
    disabled:opacity-40 disabled:cursor-not-allowed
  `,
  ghost: `
    text-white/50 font-medium
    hover:text-white/80 hover:bg-white/5
    disabled:opacity-40 disabled:cursor-not-allowed
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
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        transition-all duration-200 cursor-pointer
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading && <Spinner size="sm" gold={variant === "primary"} />}
      {children}
    </button>
  );
}
