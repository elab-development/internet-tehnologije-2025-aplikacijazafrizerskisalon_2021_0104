"use client";

import React from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

// Reusable modalni prozor - za potvrde, obavestenja, formulare
export default function Modal({ isOpen, onClose, title, children }: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h3 className="font-serif text-lg">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Zatvori"
            className="text-2xl leading-none text-stone-400 hover:text-stone-700"
          >
            &times;
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
