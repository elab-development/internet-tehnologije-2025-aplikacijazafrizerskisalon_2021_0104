"use client";

import React, { useState } from "react";
import Card from "./Card";
import type { CategoryDto, ServiceDto } from "@/shared/types";

type CategoryWithSub = CategoryDto & { subcategories: CategoryDto[] };

type Props = {
  categories: CategoryWithSub[];
  services: ServiceDto[];
};

// Funkcionalnost: otvaranje/zatvaranje grupa usluga (accordion) - cist useState, bez biblioteke
export default function ServicesAccordion({ categories, services }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  function servicesFor(categoryId: string) {
    return services.filter((s) => s.categoryId === categoryId);
  }

  return (
    <div>
      {categories.map((cat) => (
        <div key={cat.id} className="border-b border-stone-200 py-6">
          <button
            onClick={() => toggle(cat.id)}
            className="flex w-full items-center justify-between"
          >
            <h2 className="font-serif text-2xl">{cat.name}</h2>
            <span
              className={`text-xl text-rose-700 transition-transform ${
                openId === cat.id ? "rotate-180" : ""
              }`}
            >
              ⌄
            </span>
          </button>

          {openId === cat.id && (
            <div className="mt-6 grid gap-7">
              {cat.subcategories.map((sub) => (
                <div key={sub.id}>
                  <h4 className="mb-3 font-medium text-stone-500">{sub.name}</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {servicesFor(sub.id).map((service) => (
                      <Card
                        key={service.id}
                        title={service.name}
                        description={`${service.durationMinutes} min`}
                        price={service.price}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
