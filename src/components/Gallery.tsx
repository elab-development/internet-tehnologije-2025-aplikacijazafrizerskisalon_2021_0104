"use client";

import React, { useState } from "react";
import Modal from "./Modal";

type Img = { id: string; url: string; caption: string };

const gallery: Img[] = [
  { id: "1", url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500", caption: "Balayage u toplim nijansama" },
  { id: "2", url: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=500", caption: "Svečana frizura sa pletenicama" },
  { id: "3", url: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=500", caption: "Feniranje na lokne" },
  { id: "4", url: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=500", caption: "Kratka moderna frizura" },
];

// Funkcionalnost: lightbox za galeriju slika frizura (klik na sliku otvara uvecan prikaz)
export default function Gallery() {
  const [active, setActive] = useState<Img | null>(null);

  return (
    <>
      <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {gallery.map((img) => (
          <button
            key={img.id}
            onClick={() => setActive(img)}
            className="aspect-square overflow-hidden rounded"
          >
            <img src={img.url} alt={img.caption} className="h-full w-full object-cover transition-transform hover:scale-105" />
          </button>
        ))}
      </div>

      <Modal isOpen={!!active} onClose={() => setActive(null)} title={active?.caption}>
        {active && <img src={active.url} alt={active.caption} className="w-full rounded" />}
      </Modal>
    </>
  );
}
