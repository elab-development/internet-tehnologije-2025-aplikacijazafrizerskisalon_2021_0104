import { db } from "@/db";
import { appointments, services } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";

// GET /api/appointments/available-slots?employeeId=...&date=...&serviceId=...
// Vraca listu slobodnih termina za izabranog frizera na izabrani datum
// Frontend prikazuje samo slobodne termine umesto slobodnog input polja za vreme

const SLOT_MINUTES = 30; // svakih 30 minuta jedan slot

const WORKING_HOURS: Record<number, { open: number; close: number }> = {
  1: { open: 9, close: 20 },
  2: { open: 9, close: 20 },
  3: { open: 9, close: 20 },
  4: { open: 9, close: 20 },
  5: { open: 9, close: 20 },
  6: { open: 9, close: 16 },
};

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get("employeeId");
  const date = searchParams.get("date");
  const serviceId = searchParams.get("serviceId");

  if (!employeeId || !date || !serviceId) {
    return Response.json({ error: "employeeId, date i serviceId su obavezni." }, { status: 400 });
  }

  // Ucitaj trajanje izabrane usluge
  const [service] = await db.select().from(services).where(eq(services.id, serviceId));
  if (!service) return Response.json({ error: "Usluga nije pronađena." }, { status: 404 });

  const durationMinutes = service.durationMinutes;

  // Odredi radno vreme za izabrani dan
  const dayOfWeek = new Date(date + "T12:00:00").getDay();
  const hours = WORKING_HOURS[dayOfWeek];

  if (!hours) {
    return Response.json({ slots: [], message: "Salon ne radi nedeljom." });
  }

  const openMinutes = hours.open * 60;
  const closeMinutes = hours.close * 60;

  // Ucitaj postojece termine frizera za taj dan (samo aktivne, ne otkazane)
  const existingAppointments = await db
    .select({ time: appointments.time, durationMinutes: services.durationMinutes })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .where(
      and(
        eq(appointments.employeeId, employeeId),
        eq(appointments.date, date),
        or(eq(appointments.status, "pending"), eq(appointments.status, "confirmed"))
      )
    );

  // Generisi sve moguce slotove za taj dan (svakih 30 min)
  const allSlots: string[] = [];
  for (let t = openMinutes; t + durationMinutes <= closeMinutes; t += SLOT_MINUTES) {
    allSlots.push(minutesToTime(t));
  }

  // Filtriraj zauzetе slotove - proveri preklapanje sa svakim postojecim terminom
  const availableSlots = allSlots.filter((slot) => {
    const slotStart = timeToMinutes(slot);
    const slotEnd = slotStart + durationMinutes;

    for (const existing of existingAppointments) {
      const existStart = timeToMinutes(existing.time);
      const existEnd = existStart + existing.durationMinutes;

      // Preklapanje postoji
      if (slotStart < existEnd && slotEnd > existStart) {
        return false;
      }
    }
    return true;
  });

  return Response.json({ slots: availableSlots, durationMinutes });
};
