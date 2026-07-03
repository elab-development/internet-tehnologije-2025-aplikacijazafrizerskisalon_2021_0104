import { db } from "@/db";
import { services } from "@/db/schema";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export interface ServiceDto {
  id: string;
  name: string;
  description: string | null;
  price: string;
  durationMinutes: number;
  image: string | null;
  categoryId: string;
}

// GET - javna ruta, moguće filtriranje po categoryId (npr. ?categoryId=...)
export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");

  const data: ServiceDto[] = await db
    .select({
      id: services.id,
      name: services.name,
      description: services.description,
      price: services.price,
      durationMinutes: services.durationMinutes,
      image: services.image,
      categoryId: services.categoryId,
    })
    .from(services)
    .where(categoryId ? eq(services.categoryId, categoryId) : undefined)
    .orderBy(services.name);

  return Response.json(data);
};

// POST - kreiranje nove usluge, samo za admina
export const POST = async (req: Request) => {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) {
    return new Response("Niste prijavljeni.", { status: 401 });
  }

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
  const { name, description, price, durationMinutes, categoryId, image } = body;

  if (!name || !price || !categoryId) {
    return new Response("Nedostaju podaci za uslugu.", { status: 400 });
  }

  const [service] = await db
    .insert(services)
    .values({ name, description, price, durationMinutes, categoryId, image })
    .returning();

  return Response.json(service);
};
