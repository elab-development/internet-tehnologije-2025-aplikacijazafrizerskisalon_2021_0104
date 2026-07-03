"use client";

import React from "react";

type Props = {
  label?: string;
  type?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
};

// Reusable polje za unos - tekst, email, lozinka, datum, vreme... sa labelom i validacijom
export default function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
}: Props) {
  return (
    <div className="mb-4 flex flex-col gap-1.5">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-stone-600">
          {label}
          {required && <span className="text-red-700"> *</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`rounded border px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-rose-700 ${
          error ? "border-red-700" : "border-stone-300"
        }`}
      />
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  );
}
