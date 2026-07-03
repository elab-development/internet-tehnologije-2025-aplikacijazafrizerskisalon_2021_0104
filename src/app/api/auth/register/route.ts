import { db } from "@/db";
import { users } from "@/db/schema";
import { AUTH_COOKIE, cookieOpts, signAuthToken } from "@/lib/auth";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type Body = {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
};

export async function POST(req: Request) {
  // 1. Parse request
  const { fullName, email, password, phone } = (await req.json()) as Body;

  // 2. Validate input
  if (!fullName || !email || !password) {
    return NextResponse.json({ error: "Nedostaju podaci" }, { status: 400 });
  }

  // 3. Check if user already exists
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length) {
    return NextResponse.json({ error: "Email već postoji u bazi" }, { status: 400 });
  }

  // 4. Hash password
  const passHash = await bcrypt.hash(password, 10);

  // 5. Create user - registracija sa sajta je uvek role "client"
  const [u] = await db
    .insert(users)
    .values({ fullName, email, passHash, phone, role: "client" })
    .returning({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
    });

  // 6. Sign JWT
  const token = signAuthToken({ sub: u.id, email: u.email, name: u.fullName, role: u.role });

  // 7. Set cookie + 8. Return JSON user data
  const res = NextResponse.json(u);
  res.cookies.set(AUTH_COOKIE, token, cookieOpts());
  return res;
}
