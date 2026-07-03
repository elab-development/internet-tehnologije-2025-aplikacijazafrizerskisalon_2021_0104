import { db } from "@/db";
import { appointments, employees, services, users } from "@/db/schema";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";
import { and, eq, gte, lt, or } from "drizzle-orm";
import { cookies } from "next/headers";
import { sendConfirmationEmail } from "@/lib/mailer";

export interface AppointmentDto {
  id: string;
  date: string;
  time: string;
  status: string;
  note: string | null;
  serviceName: string;
  employeeName: string;
}

// Radno vreme salona
const WORKING_HOURS = {
  // 0=ned, 1=pon, 2=uto, 3=sre, 4=cet, 5=pet, 6=sub
  1: { open: 9, close: 20 },
  2: { open: 9, close: 20 },
  3: { open: 9, close: 20 },
  4: { open: 9, close: 20 },
  5: { open: 9, close: 20 },
  6: { open: 9, close: 16 },
} as Record<number, { open: number; close: number }>;

// Slot = 30 minuta (trajanje najkrace usluge)
const SLOT_MINUTES = 30;

// Proverava da li je vreme unutar radnog vremena salona
// i da li se termin (sa trajanjem usluge) zavrsava pre zatvaranja
function isWithinWorkingHours(dateStr: string, timeStr: string, durationMinutes: number): boolean {
  const date = new Date(dateStr + "T" + timeStr);
  const dayOfWeek = date.getDay(); // 0=ned

  const hours = WORKING_HOURS[dayOfWeek];
  if (!hours) return false; // nedeljom ne radimo

  const [h, m] = timeStr.split(":").map(Number);
  const startMinutes = h * 60 + m;
  const endMinutes = startMinutes + durationMinutes;

  const openMinutes = hours.open * 60;
  const closeMinutes = hours.close * 60;

  return startMinutes >= openMinutes && endMinutes <= closeMinutes;
}

// Proverava da li je vreme na tacnom slotu (svakih 30 min: 09:00, 09:30, 10:00...)
function isValidSlot(timeStr: string): boolean {
  const [, m] = timeStr.split(":").map(Number);
  return m % SLOT_MINUTES === 0;
}

// Konvertuje "09:00" u minute od ponoci
function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

// GET - svaki prijavljeni korisnik vidi SVOJE termine; admin vidi sve
export const GET = async () => {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return new Response("Niste prijavljeni.", { status: 401 });

  let claims;
  try {
    claims = verifyAuthToken(token);
  } catch {
    return new Response("Sesija je istekla.", { status: 401 });
  }

  const baseQuery = db
    .select({
      id: appointments.id,
      date: appointments.date,
      time: appointments.time,
      status: appointments.status,
      note: appointments.note,
      serviceName: services.name,
      employeeName: users.fullName,
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .innerJoin(employees, eq(appointments.employeeId, employees.id))
    .innerJoin(users, eq(employees.userId, users.id));

  let data;

if (claims.role === "admin") {
  // Admin vidi sve termine
  data = await baseQuery.orderBy(appointments.date);
} else if (claims.role === "employee") {
  // Frizer vidi samo termine gde je on izabran kao frizer
  // Prvo nadji employeeId za ovog korisnika
  const [emp] = await db
    .select({ id: employees.id })
    .from(employees)
    .where(eq(employees.userId, claims.sub));

  data = emp
    ? await baseQuery.where(eq(appointments.employeeId, emp.id)).orderBy(appointments.date)
    : [];
} else {
  // Klijent vidi samo svoje termine
  data = await baseQuery.where(eq(appointments.userId, claims.sub)).orderBy(appointments.date);
}

  return Response.json(data);
};

// GET /api/appointments/available-slots - slobodni termini za frizera na datum
// (poziva se sa ?employeeId=...&date=...&serviceId=...)
export const POST = async (req: Request) => {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return new Response("Niste prijavljeni.", { status: 401 });

  let claims;
  try {
    claims = verifyAuthToken(token);
  } catch {
    return new Response("Sesija je istekla.", { status: 401 });
  }

  const body = await req.json();
  const { serviceId, employeeId, date, time, note } = body as {
    serviceId: string;
    employeeId: string;
    date: string;
    time: string;
    note?: string;
  };

  if (!serviceId || !employeeId || !date || !time) {
    return Response.json({ error: "Sve potrebne podatke je obavezno popuniti." }, { status: 400 });
  }

  // 1. Ucitaj trajanje izabrane usluge
  const [service] = await db.select().from(services).where(eq(services.id, serviceId));
  if (!service) {
    return Response.json({ error: "Usluga nije pronađena." }, { status: 404 });
  }

  const durationMinutes = service.durationMinutes;

  // 2. Provera da li je vreme na ispravnom slotu (svakih 30 min)
  if (!isValidSlot(time)) {
    return Response.json(
      { error: `Termini su dostupni svakih ${SLOT_MINUTES} minuta (npr. 09:00, 09:30, 10:00...).` },
      { status: 400 }
    );
  }

  // 3. Provera radnog vremena - i da li se termin ZAVRSAVA pre zatvaranja
  if (!isWithinWorkingHours(date, time, durationMinutes)) {
    return Response.json(
      { error: "Izabrano vreme nije u okviru radnog vremena salona (Pon-Pet 09-20h, Sub 09-16h). Nedeljom ne radimo." },
      { status: 400 }
    );
  }

  // 4. Provera da nema preklapanja sa postojecim terminima istog frizera
  // Logika: novi termin [startNew, endNew] ne sme da se preklapa sa postojecim [startExist, endExist]
  // Preklapanje postoji ako: startNew < endExist AND endNew > startExist
  const existingAppointments = await db
    .select({
      time: appointments.time,
      durationMinutes: services.durationMinutes,
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .where(
      and(
        eq(appointments.employeeId, employeeId),
        eq(appointments.date, date),
        // Ne uzimamo u obzir otkazane termine
        or(
          eq(appointments.status, "pending"),
          eq(appointments.status, "confirmed")
        )
      )
    );

  const newStart = timeToMinutes(time);
  const newEnd = newStart + durationMinutes;

  for (const existing of existingAppointments) {
    const existStart = timeToMinutes(existing.time);
    const existEnd = existStart + existing.durationMinutes;

    // Preklapanje: novi pocetak je pre kraja postojeceg I novi kraj je posle pocetka postojeceg
    if (newStart < existEnd && newEnd > existStart) {
      return Response.json(
        { error: "Izabrani frizer već ima termin u to vreme. Molimo izaberite drugi termin." },
        { status: 409 }
      );
    }
  }

  // 5. Sve provere prosle - zakazujemo termin
  try {
    const [appointment] = await db
      .insert(appointments)
      .values({
        userId: claims.sub,
        serviceId,
        employeeId,
        date,
        time,
        note: note || null,
        status: "pending",
      })
      .returning();

   

    return Response.json(appointment);
  } catch (err: any) {
    console.error("APPOINTMENT ERROR:", err.message);
    // Unique constraint - race condition (dva korisnika u isto vreme)
    if (err.code === "23505") {
      return Response.json(
        { error: "Izabrani termin je upravo zauzet. Molimo izaberite drugi termin." },
        { status: 409 }
      );
    }
    return Response.json({ error: "Greška pri zakazivanju." }, { status: 500 });
  }
};
