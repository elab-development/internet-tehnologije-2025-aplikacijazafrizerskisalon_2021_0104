import { db } from "@/db";
import { appointments, employees, services, users } from "@/db/schema";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { sendConfirmationEmail } from "@/lib/mailer";

type Params = { params: Promise<{ id: string }> };

// PUT - izmena statusa termina (admin/employee potvrdjuje ili otkazuje)
export const PUT = async (req: Request, { params }: Params) => {
  const { id } = await params;
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return new Response("Niste prijavljeni.", { status: 401 });

  let claims;
  try {
    claims = verifyAuthToken(token);
  } catch {
    return new Response("Sesija je istekla.", { status: 401 });
  }

  const [existing] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, id));

  if (!existing) return new Response("Termin nije pronađen.", { status: 404 });

  const isOwner = existing.userId === claims.sub;
  const isStaff = claims.role === "admin" || claims.role === "employee";

  if (!isOwner && !isStaff) {
    return new Response("Nemate dozvolu za izmenu ovog termina.", { status: 403 });
  }

  const body = await req.json();
  const newStatus = body.status;

  const [updated] = await db
    .update(appointments)
    .set(body)
    .where(eq(appointments.id, id))
    .returning();

  // Email se salje SAMO kad admin/frizer potvrdi termin (status = confirmed)
  // Ne salje se kad klijent otkazuje ili menja napomenu
  if (newStatus === "confirmed" && isStaff) {
    try {
      // Ucitaj sve podatke potrebne za email
      const [client] = await db
        .select({ email: users.email, fullName: users.fullName })
        .from(users)
        .where(eq(users.id, existing.userId));

      const [service] = await db
        .select({ name: services.name })
        .from(services)
        .where(eq(services.id, existing.serviceId));

      const [employee] = await db
        .select({ fullName: users.fullName })
        .from(employees)
        .innerJoin(users, eq(employees.userId, users.id))
        .where(eq(employees.id, existing.employeeId));

      await sendConfirmationEmail({
        to: client.email,
        fullName: client.fullName,
        serviceName: service.name,
        employeeName: employee.fullName,
        date: existing.date,
        time: existing.time ?? "",
      });
    } catch (emailErr) {
      console.error("Email nije poslat:", emailErr);
      // Ne blokiramo odgovor ako email ne uspe
    }
  }

  return Response.json(updated);
};

// DELETE - otkazivanje termina (vlasnik termina ili admin)
export const DELETE = async (req: Request, { params }: Params) => {
  const { id } = await params;
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return new Response("Niste prijavljeni.", { status: 401 });

  let claims;
  try {
    claims = verifyAuthToken(token);
  } catch {
    return new Response("Sesija je istekla.", { status: 401 });
  }

  const [existing] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, id));

  if (!existing) return new Response("Termin nije pronađen.", { status: 404 });

  const isOwner = existing.userId === claims.sub;
  if (!isOwner && claims.role !== "admin") {
    return new Response("Nemate dozvolu.", { status: 403 });
  }

  // Umesto brisanja - menjamo status na "cancelled"
  // Tako frizer/admin i dalje vidi da je termin otkazan
  const [updated] = await db
    .update(appointments)
    .set({ status: "cancelled" })
    .where(eq(appointments.id, id))
    .returning();

  return Response.json(updated);
};