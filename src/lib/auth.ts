import * as jwt from "jsonwebtoken";

export const AUTH_COOKIE = "auth"; // ime cookie-ja u kome cuvamo token

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in env file");
}

// Tipovi korisnika koje cuvamo u tokenu - client/employee/admin
export type UserRole = "client" | "employee" | "admin";

export type JwtUserClaims = {
  sub: string; // id korisnika
  email: string;
  name?: string;
  role: UserRole;
};

// Kreira token nakon uspesnog login-a/registracije
export function signAuthToken(claims: JwtUserClaims) {
  return jwt.sign(claims, JWT_SECRET, { algorithm: "HS256", expiresIn: "7d" });
}

// Verifikuje token i vraca podatke (claims) koje sadrzi
export function verifyAuthToken(token: string): JwtUserClaims {
  const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & JwtUserClaims;
  if (!payload || !payload.sub || !payload.email) throw new Error("Invalid token");
  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  };
}

// Opcije za cookie u koji smestamo token
export function cookieOpts() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}
