// Forsiramo Node.js runtime jer koristimo biblioteke koje nisu kompatibilne sa Edge runtime-om
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

export async function GET() {
  // 1. Čitanje JWT tokena iz cookie-ja
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ user: null });
  }

  try {
    // 2. Verifikacija tokena
    const claims = verifyAuthToken(token);

    // 3. Tražimo korisnika u bazi po id-ju iz tokena
    const [u] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, claims.sub));

    // 4. Vraćamo podatke ili null ako korisnik ne postoji
    return NextResponse.json({ user: u ?? null });
  } catch {
    // 5. Token nevalidan ili istekao
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
