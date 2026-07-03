"use client";

import { useEffect, useRef } from "react";

// Tipovi koje Google Maps API globalno ubaci na window objekat
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

// Koordinate salona - Bulevar Kralja Aleksandra 45, Beograd
const SALON_LAT = 44.8121;
const SALON_LNG = 20.4728;

// Google Maps komponenta - koristi Google Maps JavaScript API (eksterni API br.1)
// API kljuc se cuva u .env.local kao NEXT_PUBLIC_GOOGLE_MAPS_KEY
export default function SalonMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ako je Google Maps vec ucitan (npr. hot reload), samo inicijalizuj mapu
    if (window.google?.maps) {
      initializeMap();
      return;
    }

    // Definisi callback koji ce Google pozvati kad se skripta ucita
    window.initMap = initializeMap;

    // Dinamicki dodajemo Google Maps skriptu u <head>
    // NEXT_PUBLIC_ prefix znaci da je ova env varijabla dostupna i na frontendu
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup - ukloni skriptu kad se komponenta unmountuje
      document.head.removeChild(script);
    };
  }, []);

  function initializeMap() {
    if (!mapRef.current) return;

    // Kreiranje mape centrirane na lokaciju salona
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: SALON_LAT, lng: SALON_LNG },
      zoom: 16,
      // Stilizacija mape - uklanjamo neke elemente da bude cistija
      styles: [
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
      ],
    });

    // Dodavanje markera (ciodicom) na lokaciju salona
    const marker = new window.google.maps.Marker({
      position: { lat: SALON_LAT, lng: SALON_LNG },
      map: map,
      title: "Bibi Salon",
      // Prilagodjena ikonica markera u boji salona
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#b5654a",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
    });

    // Info prozor koji se otvori kad kliknes na marker
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; font-family: sans-serif;">
          <strong style="color: #b5654a; font-size: 15px;">Bibi Salon</strong><br/>
          <span style="color: #555; font-size: 13px;">Bulevar Kralja Aleksandra 45</span><br/>
          <span style="color: #555; font-size: 13px;">Beograd</span><br/>
          <span style="color: #555; font-size: 12px;">Pon-Pet: 09-20h | Sub: 09-16h</span>
        </div>
      `,
    });

    // Otvori info prozor na klik markera
    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    // Otvori info prozor odmah pri ucitavanju mape
    infoWindow.open(map, marker);
  }

  return (
    <div className="mt-8 overflow-hidden rounded border border-stone-200 shadow-sm">
      <div ref={mapRef} className="h-72 w-full bg-stone-100" />
    </div>
  );
}
