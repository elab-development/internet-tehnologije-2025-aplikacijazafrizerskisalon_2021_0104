"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import Input from "./Input";
import Button from "./Button";

type Props = {
  mode: "login" | "register";
};

export default function AuthForm({ mode }: Props) {
  const router = useRouter();
  const { refresh } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const title = mode === "login" ? "Dobrodošli nazad" : "Napravite nalog";
  const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const body =
        mode === "login"
          ? { email, password }
          : { fullName, email, password, phone };

      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErr(data?.error ?? "Greška pri autentifikaciji");
        return;
      }

      await refresh();
      router.refresh();

      const userData = await fetch("/api/auth/me", { credentials: "include" }).then((r) => r.json());
      if (userData.user?.role === "admin" || userData.user?.role === "employee") {
        router.push("/admin");
      } else {
        router.push("/zakazivanje");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded border border-stone-200 bg-white p-10 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-700">
          {mode === "login" ? "Prijava" : "Registracija"}
        </p>
        <h1 className="mb-6 mt-2 font-serif text-3xl">{title}</h1>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <Input label="Ime i prezime" name="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              <Input label="Telefon" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </>
          )}
          <Input label="Email" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Lozinka" type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {err && <p className="mb-4 text-sm text-red-700">{err}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? "Slanje..." : mode === "login" ? "Prijavi se" : "Registruj se"}
          </Button>
        </form>

        <p className="mt-5 text-sm text-stone-500">
          {mode === "login" ? (
            <>Nemate nalog? <a href="/register" className="text-rose-700">Registrujte se</a></>
          ) : (
            <>Već imate nalog? <a href="/login" className="text-rose-700">Prijavite se</a></>
          )}
        </p>

        
      </div>
    </div>
  );
}
