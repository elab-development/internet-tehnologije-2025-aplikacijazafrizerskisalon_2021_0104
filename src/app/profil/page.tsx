"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

type ProfileData = {
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    role: string;
  };
  appointments: {
    id: string;
    date: string;
    time: string;
    status: string;
    serviceName: string;
    servicePrice: string;
    employeeName: string;
  }[];
};

export default function ProfilPage() {
  const { status } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/users/me", { credentials: "include" })
        .then((r) => r.json())
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  if (loading) return <p className="p-10">Učitavanje...</p>;
  if (!data) return null;

  const prosli = data.appointments.filter(
    (a) => a.status === "completed" || a.status === "cancelled"
  );
  const buduci = data.appointments.filter(
    (a) => a.status === "pending" || a.status === "confirmed"
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      
      <p className="text-xs font-semibold uppercase tracking-widest text-rose-700">Moj nalog</p>
      <h1 className="mb-8 font-serif text-4xl">Profil</h1>

      <div className="mb-10 rounded border border-stone-200 bg-white p-6">
        <h2 className="mb-4 font-serif text-xl">Lični podaci</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-stone-400 uppercase">Ime i prezime</p>
            <p className="font-medium">{data.user.fullName}</p>
          </div>
          <div>
            <p className="text-xs text-stone-400 uppercase">Email</p>
            <p className="font-medium">{data.user.email}</p>
          </div>
          <div>
            <p className="text-xs text-stone-400 uppercase">Telefon</p>
            <p className="font-medium">{data.user.phone ?? "Nije unet"}</p>
          </div>
          <div>
            <p className="text-xs text-stone-400 uppercase">Uloga</p>
            <p className="font-medium capitalize">{data.user.role}</p>
          </div>
        </div>
      </div>

      
      <h2 className="mb-4 font-serif text-2xl">Predstojeći termini</h2>
      {buduci.length === 0 ? (
        <p className="mb-8 text-stone-500">Nemate predstojeće termine.</p>
      ) : (
        <div className="mb-8 grid gap-3">
          {buduci.map((a) => (
            <div key={a.id} className="rounded border border-stone-200 bg-white p-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{a.serviceName}</p>
                  <p className="text-sm text-stone-500">
                    {a.date} u {a.time?.slice(0, 5)} · {a.employeeName}
                  </p>
                  <p className="text-sm font-medium text-rose-700">{a.servicePrice} RSD</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase h-fit ${
                  a.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {a.status === "confirmed" ? "potvrđen" : "na čekanju"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      
      <h2 className="mb-4 font-serif text-2xl">Istorija termina</h2>
      {prosli.length === 0 ? (
        <p className="text-stone-500">Nemate prethodnih termina.</p>
      ) : (
        <div className="grid gap-3">
          {prosli.map((a) => (
            <div key={a.id} className="rounded border border-stone-100 bg-stone-50 p-4">
              <p className="font-medium">{a.serviceName}</p>
              <p className="text-sm text-stone-500">
                {a.date} u {a.time?.slice(0, 5)} · {a.employeeName}
              </p>
              <p className="text-sm font-medium text-stone-600">{a.servicePrice} RSD</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}