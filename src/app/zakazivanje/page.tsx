"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import BookingForm from "@/components/BookingForm";

// Zasticena stranica - ako korisnik nije prijavljen, preusmeri na /login
export default function ZakazivanjePage() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return null;
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <p className="text-xs font-semibold uppercase tracking-widest text-rose-700">Zakazivanje termina</p>
      <h1 className="font-serif text-4xl">Izaberite uslugu, frizera i termin</h1>
      <div className="mt-8">
        <BookingForm />
      </div>
    </main>
  );
}
