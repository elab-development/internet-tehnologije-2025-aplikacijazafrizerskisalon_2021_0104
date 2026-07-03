import { db } from "@/db";
import { employees, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface EmployeeDto {
  id: string;
  fullName: string;
  specialization: string | null;
}

// Javna ruta - lista frizera, koristi se prilikom zakazivanja
export const GET = async () => {
  const data: EmployeeDto[] = await db
    .select({
      id: employees.id,
      fullName: users.fullName,
      specialization: employees.specialization,
    })
    .from(employees)
    .innerJoin(users, eq(employees.userId, users.id))
    .orderBy(users.fullName);

  return Response.json(data);
};
