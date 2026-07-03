"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// Tip korisnika koji dobijamo sa /api/auth/me
export type User = {
  id: string;
  fullName: string;
  email: string;
  role: "client" | "employee" | "admin";
  createdAt: string;
};

// Stanje autentifikacije koje delimo kroz celu aplikaciju
type AuthState =
  | { status: "loading"; user: null }
  | { status: "unauthenticated"; user: null }
  | { status: "authenticated"; user: User };

type Ctx = AuthState & {
  refresh: () => Promise<void>;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading", user: null });

  // refresh poziva /api/auth/me i proverava da li postoji validna sesija (cookie)
  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      if (data?.user) {
        setState({ status: "authenticated", user: data.user });
      } else {
        setState({ status: "unauthenticated", user: null });
      }
    } catch {
      setState({ status: "unauthenticated", user: null });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<Ctx>(() => ({ ...state, refresh }), [state, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
