# Bibi Salon - Next.js verzija (po skripti)

Aplikacija za zakazivanje termina u frizerskom salonu Bibi, napravljena tačno po obrascu iz priložene
NextJS skripte: Next.js (App Router) + TypeScript + Tailwind + Drizzle ORM (PostgreSQL) + JWT u
httpOnly cookie-ju.

## Struktura (ista kao u skripti)

```
bibi-salon-next/
  drizzle.config.ts
  .env.example
  src/
    db/
      index.ts          -> konekcija na bazu (Pool + drizzle)
      schema.ts          -> 5 povezanih tabela (users, categories, services, employees, appointments)
      seed.ts            -> test podaci
      migrations/         -> generišu se komandom `npm run db:migrate`
    lib/
      auth.ts            -> JWT (signAuthToken / verifyAuthToken) + cookie opcije
    components/
      AuthProvider.tsx    -> React Context za stanje prijave (useAuth hook)
      AuthForm.tsx        -> zajednička login/register forma
      Navbar.tsx, Footer.tsx
      Button.tsx, Input.tsx, Card.tsx, Modal.tsx  -> 4 reusable komponente
      Gallery.tsx         -> lightbox galerija (useState)
      ServicesAccordion.tsx -> accordion za usluge (useState)
      BookingForm.tsx     -> forma za zakazivanje (useState + useEffect)
    app/
      layout.tsx          -> obmotava app u <AuthProvider>
      page.tsx             -> Početna strana
      usluge/page.tsx       -> Usluge (server komponenta, SSR fetch)
      login/page.tsx
      register/page.tsx
      zakazivanje/page.tsx  -> zaštićena strana
      api/
        auth/{login,register,logout,me}/route.ts
        categories/route.ts        -> javna (glavne grupe)
        categories/sub/route.ts    -> javna (podgrupe po parentId)
        services/route.ts          -> GET javna, POST samo admin
        services/[id]/route.ts     -> GET javna, PUT/DELETE samo admin
        employees/route.ts         -> javna
        appointments/route.ts      -> GET/POST samo prijavljeni
        appointments/[id]/route.ts -> PUT/DELETE vlasnik ili osoblje
```

## Pokretanje

### 1. Baza (Docker, samo Postgres)
```bash
docker run --name bibi-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=bibi_salon -p 5432:5432 -d postgres:16-alpine
```

### 2. Environment
```bash
cp .env.example .env
```
(podesi DATABASE_URL ako koristiš drugačije podatke za bazu)

### 3. Instalacija i migracije
```bash
npm install
npm run db:migrate
npm run db:seed
```

### 4. Pokretanje aplikacije
```bash
npm run dev
```
Otvori `http://localhost:3000`.

### Sve odjednom kroz Docker
```bash
docker-compose up --build
```

## Demo nalozi
| Uloga | Email | Lozinka |
|---|---|---|
| admin | admin@bibi.rs | lozinka123 |
| employee | jovana@bibi.rs | lozinka123 |
| employee | marija@bibi.rs | lozinka123 |
| client | ana@gmail.com | lozinka123 |

## Stranice
1. **Početna (`/`)** - hero, galerija frizura (lightbox), o nama, zakazivanje + dugme, usluge + dugme, adresa i radno vreme.
2. **Usluge (`/usluge`)** - grupe i podgrupe usluga, accordion prikaz.
3. **Login / Registracija (`/login`, `/register`)** - JWT autentifikacija kroz httpOnly cookie.
4. **Zakazivanje (`/zakazivanje`)** - zaštićena strana, izbor usluge/frizera/termina.

## Tipovi korisnika i autorizacija
`client`, `employee`, `admin` - uloga se čuva u `users.role` i u JWT tokenu (`claims.role`), a API rute
proveravaju ulogu pre mutacija (npr. samo admin može da menja usluge).

## Korisne komande
| Komanda | Šta radi |
|---|---|
| `npm run dev` | pokreće Next.js dev server |
| `npm run db:migrate` | generiše i primenjuje Drizzle migracije (`drizzle-kit generate && push`) |
| `npm run db:seed` | puni bazu test podacima (`tsx src/db/seed.ts`) |
| `npx drizzle-kit studio` | grafički prikaz baze (opciono, za proveru podataka) |
