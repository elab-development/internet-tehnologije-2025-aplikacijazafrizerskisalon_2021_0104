import { db } from "@/db";
import { categories } from "@/db/schema";
import { isNull } from "drizzle-orm";

// Javna ruta - vraća glavne kategorije; podgrupe se dobijaju preko ?parentId=
export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

export const GET = async () => {
  const data: CategoryDto[] = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      parentId: categories.parentId,
    })
    .from(categories)
    .where(isNull(categories.parentId))
    .orderBy(categories.name);

  return Response.json(data);
};
