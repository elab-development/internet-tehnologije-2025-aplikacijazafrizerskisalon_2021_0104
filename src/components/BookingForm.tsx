"use client";

import React, { useEffect, useState } from "react";
import Input from "./Input";
import Button from "./Button";
import Modal from "./Modal";
import type { ServiceDto, EmployeeDto, AppointmentDto } from "@/shared/types";

export default function BookingForm() {
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [myAppointments, setMyAppointments] = useState<AppointmentDto[]>([]);

  const [serviceId, setServiceId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [note, setNote] = useState("");

  // Slobodni termini koje API vraca
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    fetch("/api/services").then((r) => r.json()).then(setServices);
    fetch("/api/employees").then((r) => r.json()).then(setEmployees);
    loadAppointments();
  }, []);

  // Kad se promeni usluga, frizer ili datum - ucitaj slobodne termine
  useEffect(() => {
    if (!serviceId || !employeeId || !date) {
      setAvailableSlots([]);
      setSelectedTime("");
      return;
    }

    setLoadingSlots(true);
    setSlotsMessage("");
    setSelectedTime("");

    fetch(
      `/api/appointments/available-slots?serviceId=${serviceId}&employeeId=${employeeId}&date=${date}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.slots) {
          setAvailableSlots(data.slots);
          if (data.slots.length === 0) {
            setSlotsMessage(data.message || "Nema slobodnih termina za izabrani datum.");
          }
        }
      })
      .catch(() => setSlotsMessage("Greška pri učitavanju termina."))
      .finally(() => setLoadingSlots(false));
  }, [serviceId, employeeId, date]);

  function loadAppointments() {
    fetch("/api/appointments", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setMyAppointments(Array.isArray(data) ? data : []));
  }

  // Minimalni datum = danas (ne moze se zakazati u proslosti)
  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!selectedTime) {
      setError("Molimo izaberite vreme termina.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, employeeId, date, time: selectedTime, note }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Zakazivanje nije uspelo.");
        return;
      }

      setSuccessOpen(true);
      setServiceId("");
      setEmployeeId("");
      setDate("");
      setSelectedTime("");
      setNote("");
      setAvailableSlots([]);
      loadAppointments();
    } finally {
      setSubmitting(false);
    }
  }

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
const [cancelId, setCancelId] = useState<string | null>(null);
const [cancelStatus, setCancelStatus] = useState<string>("");

function openCancelModal(id: string, status: string) {
  setCancelId(id);
  setCancelStatus(status);
  setCancelModalOpen(true);
}

async function handleCancel() {
  if (!cancelId) return;
  await fetch(`/api/appointments/${cancelId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "cancelled" }),
  });
  setCancelModalOpen(false);
  setCancelId(null);
  loadAppointments();
}

  // Naziv izabrane usluge za prikaz trajanja
  const selectedService = services.find((s) => s.id === serviceId);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
      <form onSubmit={handleSubmit} className="rounded border border-stone-200 bg-white p-7">

        {/* USLUGA */}
        <label className="mb-1.5 block text-sm font-medium text-stone-600">Usluga</label>
        <select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          required
          className="mb-4 w-full rounded border border-stone-300 px-3.5 py-2.5 text-sm"
        >
          <option value="">Izaberite uslugu</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.price} RSD ({s.durationMinutes} min)
            </option>
          ))}
        </select>

        {/* FRIZER */}
        <label className="mb-1.5 block text-sm font-medium text-stone-600">Frizer</label>
        <select
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          required
          className="mb-4 w-full rounded border border-stone-300 px-3.5 py-2.5 text-sm"
        >
          <option value="">Izaberite frizera</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.fullName} ({e.specialization})
            </option>
          ))}
        </select>

        {/* DATUM */}
        <Input
          label="Datum"
          type="date"
          name="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        {/* Saljemo min atribut da blokira proslost - dodatna zastita na frontendu */}
        <input type="hidden" name="minDate" value={today} />

        {/* SLOBODNI TERMINI - prikaz kao dugmad umesto slobodnog unosa */}
        {serviceId && employeeId && date && (
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-stone-600">
              Slobodni termini
              {selectedService && (
                <span className="ml-1 text-stone-400">({selectedService.durationMinutes} min)</span>
              )}
            </p>

            {loadingSlots && (
              <p className="text-sm text-stone-400">Učitavanje termina...</p>
            )}

            {!loadingSlots && slotsMessage && (
              <p className="text-sm text-amber-700">{slotsMessage}</p>
            )}

            {!loadingSlots && availableSlots.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`rounded border px-3 py-1.5 text-sm font-medium transition-colors ${
                      selectedTime === slot
                        ? "border-rose-700 bg-rose-700 text-white"
                        : "border-stone-300 bg-white text-stone-700 hover:border-rose-700 hover:text-rose-700"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}

            {selectedTime && (
              <p className="mt-2 text-sm text-rose-700 font-medium">
                Izabrano: {selectedTime}
              </p>
            )}
          </div>
        )}

        {/* NAPOMENA */}
        <Input
          label="Napomena (opciono)"
          name="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="npr. alergija na boju..."
        />

        {error && <p className="mb-3 text-sm text-red-700">{error}</p>}

        <Button type="submit" disabled={submitting || !selectedTime}>
          {submitting ? "Zakazivanje..." : "Zakaži termin"}
        </Button>
      </form>

      {/* MOJI TERMINI */}
      <div>
        <h3 className="mb-4 font-serif text-xl">Moji termini</h3>
        {myAppointments.length === 0 && (
          <p className="text-sm text-stone-500">Trenutno nemate zakazane termine.</p>
        )}
        {myAppointments.map((a) => (
          <div
            key={a.id}
            className="mb-3 flex items-start justify-between rounded border border-stone-200 bg-white p-4"
          >
            <div>
              <strong>{a.serviceName}</strong>
              <p className="my-1 text-sm text-stone-500">
                {a.date} u {a.time?.slice(0, 5)} · {a.employeeName}
              </p>
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
            </div>
            {(a.status === "pending" || a.status === "confirmed") && (
  <Button variant="ghost" size="sm" onClick={() => openCancelModal(a.id, a.status)}>
    Otkaži
  </Button>
)}
          </div>
        ))}
      </div>

      {/* MODAL POTVRDA */}
      <Modal isOpen={successOpen} onClose={() => setSuccessOpen(false)} title="Upit uspešno poslat ✅">
  <p className="mb-4 text-sm text-stone-600">
    Vaš zahtev za termin je uspešno poslat! Email potvrdu ćete dobiti kada frizer odobri vaš termin.
  </p>
  <Button onClick={() => setSuccessOpen(false)}>U redu</Button>
</Modal>

<Modal
  isOpen={cancelModalOpen}
  onClose={() => setCancelModalOpen(false)}
  title="Otkazivanje termina"
>
  <p className="mb-4 text-sm text-stone-600">
    {cancelStatus === "confirmed"
      ? "⚠️ Ovaj termin je već potvrđen. Da li ste sigurni da želite da ga otkažete?"
      : "Da li ste sigurni da želite da otkažete ovaj termin?"}
  </p>
  <div className="flex gap-3">
    <Button variant="danger" onClick={handleCancel}>Da, otkaži</Button>
    <Button variant="ghost" onClick={() => setCancelModalOpen(false)}>Nazad</Button>
  </div>
</Modal>
    </div>
  );
}
