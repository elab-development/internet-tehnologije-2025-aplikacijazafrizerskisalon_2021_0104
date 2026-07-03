import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

// Javna ruta - vraća podgrupe za dato parentId (npr. /api/categories/sub?parentId=...)
export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const parentId = searchParams.get("parentId");

  if (!parentId) {
    return Response.json({ error: "parentId je obavezan parametar" }, { status: 400 });
  }

  const data = await db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .where(eq(categories.parentId, parentId))
    .orderBy(categories.name);

  return Response.json(data);
};
