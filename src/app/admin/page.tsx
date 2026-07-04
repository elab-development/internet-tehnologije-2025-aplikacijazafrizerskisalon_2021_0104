"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Button from "@/components/Button";

type Appointment = {
  id: string;
  date: string;
  time: string;
  status: string;
  note: string | null;
  serviceName: string;
  employeeName: string;
  clientName?: string;
  clientEmail?: string;
};

// Admin panel - dostupan samo za admin i employee role
// Prikazuje sve termine sa mogucnoscu potvrde i otkazivanja
export default function AdminPage() {
  const { status, user } = useAuth();
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && user.role === "client") {
      router.push("/");
      return;
    }
    if (status === "authenticated") {
      loadAppointments();
    }
  }, [status, user, router]);

  function loadAppointments() {
    setLoading(true);
    fetch("/api/appointments", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setAppointments(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }

  async function handleUpdateStatus(id: string, newStatus: string) {
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      loadAppointments();
    }
  }

  if (status === "loading") return null;

  // Filtriranje termina po statusu
  const filtered = filter === "all"
    ? appointments
    : appointments.filter((a) => a.status === filter);

  // Statistike
  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
    completed: appointments.filter((a) => a.status === "completed").length,
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <p className="text-xs font-semibold uppercase tracking-widest text-rose-700">
        {user?.role === "admin" ? "Administrator" : "Frizer"}
      </p>
      <h1 className="mb-2 font-serif text-4xl">Panel za upravljanje</h1>
      <p className="mb-8 text-stone-500">
        Pregled i upravljanje svim zakazanim terminima u salonu.
      </p>

      {/* STATISTIKE */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded border border-stone-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-stone-800">{stats.total}</p>
          <p className="text-sm text-stone-500">Ukupno</p>
        </div>
        <div className="rounded border border-amber-200 bg-amber-50 p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
          <p className="text-sm text-amber-600">Na čekanju</p>
        </div>
        <div className="rounded border border-green-200 bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{stats.confirmed}</p>
          <p className="text-sm text-green-600">Potvrđeni</p>
        </div>
        <div className="rounded border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
          <p className="text-sm text-red-600">Otkazani</p>
        </div>
      </div>

      {/* FILTER */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { key: "all", label: "Svi termini" },
          { key: "pending", label: "Na čekanju" },
          { key: "confirmed", label: "Potvrđeni" },
          { key: "cancelled", label: "Otkazani" },
          { key: "completed", label: "Završeni" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded border px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f.key
                ? "border-rose-700 bg-rose-700 text-white"
                : "border-stone-300 bg-white text-stone-600 hover:border-rose-700 hover:text-rose-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* LISTA TERMINA */}
      {loading && <p className="text-stone-500">Učitavanje termina...</p>}

      {!loading && filtered.length === 0 && (
        <p className="text-stone-500">Nema termina za izabrani filter.</p>
      )}

      {!loading && filtered.length > 0 && (
        <div className="overflow-hidden rounded border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-stone-200 bg-stone-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-stone-600">Datum i vreme</th>
                <th className="px-4 py-3 text-left font-medium text-stone-600">Usluga</th>
                <th className="px-4 py-3 text-left font-medium text-stone-600">Frizer</th>
                <th className="px-4 py-3 text-left font-medium text-stone-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-stone-600">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr
                  key={a.id}
                  className={`border-b border-stone-100 ${i % 2 === 0 ? "bg-white" : "bg-stone-50"}`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{a.date}</div>
                    <div className="text-stone-500">{a.time?.slice(0, 5)}</div>
                  </td>
                  <td className="px-4 py-3">{a.serviceName}</td>
                  <td className="px-4 py-3">{a.employeeName}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
                      a.status === "confirmed" ? "bg-green-100 text-green-800" :
                      a.status === "cancelled" ? "bg-red-100 text-red-800" :
                      a.status === "completed" ? "bg-stone-100 text-stone-600" :
                      "bg-amber-100 text-amber-800"
                    }`}>
                      {a.status === "pending" ? "na čekanju" :
                       a.status === "confirmed" ? "potvrđen" :
                       a.status === "cancelled" ? "otkazan" : "završen"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {a.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(a.id, "confirmed")}
                        >
                          Potvrdi
                        </Button>
                      )}
                      {a.status === "confirmed" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(a.id, "completed")}
                        >
                          Završi
                        </Button>
                      )}
                      {(a.status === "pending" || a.status === "confirmed") && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleUpdateStatus(a.id, "cancelled")}
                        >
                          Otkaži
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
