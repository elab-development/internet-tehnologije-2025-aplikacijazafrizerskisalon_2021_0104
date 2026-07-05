import { db } from "@/db";
import { appointments, employees, services, users } from "@/db/schema";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

// GET /api/users/me - podaci o prijavljenom korisniku i njegova zakazivanja
export const GET = async () => {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return new Response("Niste prijavljeni.", { status: 401 });

  let claims;
  try {
    claims = verifyAuthToken(token);
  } catch {
    return new Response("Sesija je istekla.", { status: 401 });
  }

  const [user] = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      phone: users.phone,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, claims.sub));

  const myAppointments = await db
    .select({
      id: appointments.id,
      date: appointments.date,
      time: appointments.time,
      status: appointments.status,
      serviceName: services.name,
      servicePrice: services.price,
      employeeName: users.fullName,
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .innerJoin(employees, eq(appointments.employeeId, employees.id))
    .innerJoin(users, eq(employees.userId, users.id))
    .where(eq(appointments.userId, claims.sub))
    .orderBy(appointments.date);

  return Response.json({ user, appointments: myAppointments });
};