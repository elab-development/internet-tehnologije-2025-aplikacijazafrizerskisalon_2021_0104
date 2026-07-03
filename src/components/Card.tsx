"use client";

import React from "react";
import Button from "./Button";

type Props = {
  image?: string;
  title: string;
  description?: string;
  price?: string;
  actionLabel?: string;
  onAction?: () => void;
};

// Reusable kartica - prikaz slike, naslova, opisa, cene i dugmeta za akciju
export default function Card({ image, title, description, price, actionLabel, onAction }: Props) {
  return (
    <div className="flex flex-col overflow-hidden rounded border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {image && (
        <div
          className="h-40 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-serif text-lg">{title}</h3>
        {description && <p className="flex-1 text-sm text-stone-500">{description}</p>}
        {price && <div className="font-semibold text-rose-700">{price} RSD</div>}
        {actionLabel && (
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
