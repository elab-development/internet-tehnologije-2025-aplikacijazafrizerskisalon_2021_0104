import { db } from "@/db";
import { services } from "@/db/schema";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

type Params = { params: Promise<{ id: string }> };

// GET - javna ruta, detalji jedne usluge
export const GET = async (req: Request, { params }: Params) => {
  const { id } = await params;
  const [service] = await db.select().from(services).where(eq(services.id, id));

  if (!service) {
    return new Response("Usluga nije pronađena.", { status: 404 });
  }

  return Response.json(service);
};

// PUT - izmena usluge, samo admin
export const PUT = async (req: Request, { params }: Params) => {
  const { id } = await params;
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return new Response("Niste prijavljeni.", { status: 401 });

  let claims;
  try {
    claims = verifyAuthToken(token);
  } catch {
    return new Response("Sesija je istekla ili je nevažeća.", { status: 401 });
  }
  if (claims.role !== "admin") {
    return new Response("Nemate dozvolu za ovu akciju.", { status: 403 });
  }

  const body = await req.json();
  const [updated] = await db.update(services).set(body).where(eq(services.id, id)).returning();

  if (!updated) return new Response("Usluga nije pronađena.", { status: 404 });
  return Response.json(updated);
};

// DELETE - brisanje usluge, samo admin
export const DELETE = async (req: Request, { params }: Params) => {
  const { id } = await params;
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return new Response("Niste prijavljeni.", { status: 401 });

  let claims;
  try {
    claims = verifyAuthToken(token);
  } catch {
    return new Response("Sesija je istekla ili je nevažeća.", { status: 401 });
  }
  if (claims.role !== "admin") {
    return new Response("Nemate dozvolu za ovu akciju.", { status: 403 });
  }

  await db.delete(services).where(eq(services.id, id));
  return Response.json({ message: "Usluga je obrisana." });
};
