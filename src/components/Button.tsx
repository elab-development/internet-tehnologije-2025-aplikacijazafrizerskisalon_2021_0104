"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md";
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
};

// Reusable dugme - prilagodljivo varijanti, velicini i onClick akciji
export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  onClick,
}: Props) {
  const base =
    "rounded font-semibold tracking-wide transition-transform disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5";

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
  };

  const variants = {
    primary: "bg-rose-700 text-white hover:bg-rose-800",
    outline: "border-2 border-rose-700 text-rose-700 hover:bg-rose-700 hover:text-white",
    ghost: "border border-stone-300 text-stone-700 hover:border-rose-700 hover:text-rose-700",
    danger: "bg-red-700 text-white hover:bg-red-800",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}
