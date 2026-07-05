"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import Button from "./Button";

export default function Navbar() {
  const { status, user, refresh } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    await refresh();
    router.refresh();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif text-2xl font-bold">
          Bibi <span className="text-rose-700">Salon</span>
        </Link>

        <nav className="hidden gap-7 text-sm font-medium sm:flex">
          <Link href="/" className="hover:text-rose-700">Početna</Link>
          <Link href="/usluge" className="hover:text-rose-700">Usluge</Link>

          {/* samo za prijavljene klijente */}
          {status === "authenticated" && user.role === "client" && (
  <>
    <Link href="/zakazivanje" className="hover:text-rose-700">Zakazivanje</Link>
    <Link href="/profil" className="hover:text-rose-700">Profil</Link>
  </>
)}


          {/*  samo za admin i employee */}
          {status === "authenticated" && (user.role === "admin" || user.role === "employee") && (
            <Link href="/admin" className="hover:text-rose-700">Upravljanje terminima</Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {status === "authenticated" ? (
            <>
              <span className="hidden text-sm text-stone-500 sm:inline">
                Zdravo, {user.fullName.split(" ")[0]}
                {user.role !== "client" && (
                  <span className="ml-1 text-xs text-rose-700">
                    ({user.role === "admin" ? "admin" : "frizer"})
                  </span>
                )}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Odjava
              </Button>
            </>
          ) : (
  <div className="flex gap-2">
    <Link href="/login">
      <Button variant="outline" size="sm">Prijava</Button>
    </Link>
    <Link href="/register">
      <Button variant="primary" size="sm">Registracija</Button>
    </Link>
  </div>
)}
        </div>
      </div>
    </header>
  );
}
