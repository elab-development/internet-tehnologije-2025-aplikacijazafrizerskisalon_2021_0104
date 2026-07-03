import { db } from "@/db";
import { users } from "@/db/schema";
import { AUTH_COOKIE, cookieOpts, signAuthToken } from "@/lib/auth";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type Body = {
  email: string;
  password: string;
};

export async function POST(req: Request) {
  // 1. Parse request - izdvajamo email i password
  const { email, password } = (await req.json()) as Body;

  // 2. Validate input
  if (!email || !password) {
    return NextResponse.json({ error: "Pogrešan email ili lozinka" }, { status: 401 });
  }

  // 3. Look up user by email
  const [u] = await db.select().from(users).where(eq(users.email, email));
  if (!u) {
    return NextResponse.json({ error: "Pogrešan email ili lozinka" }, { status: 401 });
  }

  // 4. Compare password
  const ok = await bcrypt.compare(password, u.passHash);
  if (!ok) {
    return NextResponse.json({ error: "Pogrešan email ili lozinka" }, { status: 401 });
  }

  // 5. Sign JWT (sadrži i role - koristi se za autorizaciju na drugim rutama)
  const token = signAuthToken({
    sub: u.id,
    email: u.email,
    name: u.fullName,
    role: u.role,
  });

  // 6. Set cookie + 7. Return JSON user data
  const res = NextResponse.json({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
  });
  res.cookies.set(AUTH_COOKIE, token, cookieOpts());
  return res;
}
