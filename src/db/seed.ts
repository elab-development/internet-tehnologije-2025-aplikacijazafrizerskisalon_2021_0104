import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "./index";
import { users, categories, services, employees } from "./schema";
import bcrypt from "bcrypt";

const hash = await bcrypt.hash("lozinka123", 10);

await db.transaction(async (tx) => {
  // Korisnici - fiksni UUID-ovi da seed može da se pokreće više puta bez dupliranja
  const [admin] = await tx
    .insert(users)
    .values({
      id: "11111111-1111-1111-1111-111111111111",
      fullName: "Admin Salona",
      email: "admin@bibi.rs",
      passHash: hash,
      phone: "0601234567",
      role: "admin",
    })
    .onConflictDoNothing()
    .returning();

  await tx
    .insert(users)
    .values([
      {
        id: "22222222-2222-2222-2222-222222222222",
        fullName: "Jovana Jovanović",
        email: "jovana@bibi.rs",
        passHash: hash,
        phone: "0611111111",
        role: "employee",
      },
      {
        id: "33333333-3333-3333-3333-333333333333",
        fullName: "Marija Marković",
        email: "marija@bibi.rs",
        passHash: hash,
        phone: "0622222222",
        role: "employee",
      },
      {
        id: "44444444-4444-4444-4444-444444444444",
        fullName: "Ana Anić",
        email: "ana@gmail.com",
        passHash: hash,
        phone: "0633333333",
        role: "client",
      },
    ])
    .onConflictDoNothing();

  await tx
    .insert(employees)
    .values([
      {
        id: "55555555-5555-5555-5555-555555555555",
        userId: "22222222-2222-2222-2222-222222222222",
        specialization: "Feniranje, Frizure",
        bio: "Stilista sa 8 godina iskustva.",
      },
      {
        id: "66666666-6666-6666-6666-666666666666",
        userId: "33333333-3333-3333-3333-333333333333",
        specialization: "Farbanje, Tretmani",
        bio: "Specijalista za boje i tretmane kose.",
      },
    ])
    .onConflictDoNothing();

  // Glavne kategorije
  const mainCats = [
    { id: "a0000000-0000-0000-0000-000000000001", name: "Feniranje", slug: "feniranje" },
    { id: "a0000000-0000-0000-0000-000000000002", name: "Farbanje", slug: "farbanje" },
    { id: "a0000000-0000-0000-0000-000000000003", name: "Tretmani", slug: "tretmani" },
    { id: "a0000000-0000-0000-0000-000000000004", name: "Frizure", slug: "frizure" },
  ];
  await tx.insert(categories).values(mainCats.map((c) => ({ ...c, parentId: null }))).onConflictDoNothing();

  // Podgrupe
  const subCats = [
    { id: "b0000000-0000-0000-0000-000000000001", name: "Feniranje na ravno - kratka kosa", slug: "feniranje-ravno-kratka", parentId: mainCats[0].id },
    { id: "b0000000-0000-0000-0000-000000000002", name: "Feniranje na ravno - srednja kosa", slug: "feniranje-ravno-srednja", parentId: mainCats[0].id },
    { id: "b0000000-0000-0000-0000-000000000003", name: "Feniranje na ravno - duga kosa", slug: "feniranje-ravno-duga", parentId: mainCats[0].id },
    { id: "b0000000-0000-0000-0000-000000000004", name: "Feniranje na lokne - kratka kosa", slug: "feniranje-lokne-kratka", parentId: mainCats[0].id },
    { id: "b0000000-0000-0000-0000-000000000005", name: "Feniranje na lokne - srednja kosa", slug: "feniranje-lokne-srednja", parentId: mainCats[0].id },
    { id: "b0000000-0000-0000-0000-000000000006", name: "Feniranje na lokne - duga kosa", slug: "feniranje-lokne-duga", parentId: mainCats[0].id },
    { id: "b0000000-0000-0000-0000-000000000007", name: "Feniranje nadogradnje", slug: "feniranje-nadogradnja", parentId: mainCats[0].id },
    { id: "b0000000-0000-0000-0000-000000000008", name: "Bleach & Balayage", slug: "bleach-balayage", parentId: mainCats[1].id },
    { id: "b0000000-0000-0000-0000-000000000009", name: "Pramenovi", slug: "pramenovi", parentId: mainCats[1].id },
    { id: "b0000000-0000-0000-0000-000000000010", name: "Olaplex tretman", slug: "olaplex", parentId: mainCats[2].id },
    { id: "b0000000-0000-0000-0000-000000000011", name: "Keratin tretman", slug: "keratin", parentId: mainCats[2].id },
    { id: "b0000000-0000-0000-0000-000000000012", name: "Svečane frizure", slug: "svecane-frizure", parentId: mainCats[3].id },
    { id: "b0000000-0000-0000-0000-000000000013", name: "Obične frizure", slug: "obicne-frizure", parentId: mainCats[3].id },
  ];
  await tx.insert(categories).values(subCats).onConflictDoNothing();

  // Usluge
  await tx
    .insert(services)
    .values([
      { id: "c0000000-0000-0000-0000-000000000001", name: "Feniranje na ravno - kratka kosa", description: "Feniranje prave kratke kose.", price: "1200", durationMinutes: 30, categoryId: subCats[0].id },
      { id: "c0000000-0000-0000-0000-000000000002", name: "Feniranje na ravno - srednja kosa", description: "Feniranje prave srednje kose.", price: "1500", durationMinutes: 40, categoryId: subCats[1].id },
      { id: "c0000000-0000-0000-0000-000000000003", name: "Feniranje na ravno - duga kosa", description: "Feniranje prave duge kose.", price: "1800", durationMinutes: 50, categoryId: subCats[2].id },
      { id: "c0000000-0000-0000-0000-000000000004", name: "Feniranje na lokne - kratka kosa", description: "Feniranje na lokne, kratka kosa.", price: "1400", durationMinutes: 40, categoryId: subCats[3].id },
      { id: "c0000000-0000-0000-0000-000000000005", name: "Feniranje na lokne - srednja kosa", description: "Feniranje na lokne, srednja kosa.", price: "1700", durationMinutes: 50, categoryId: subCats[4].id },
      { id: "c0000000-0000-0000-0000-000000000006", name: "Feniranje na lokne - duga kosa", description: "Feniranje na lokne, duga kosa.", price: "2000", durationMinutes: 60, categoryId: subCats[5].id },
      { id: "c0000000-0000-0000-0000-000000000007", name: "Feniranje nadogradnje", description: "Feniranje kose sa nadogradnjom.", price: "2200", durationMinutes: 60, categoryId: subCats[6].id },
      { id: "c0000000-0000-0000-0000-000000000008", name: "Bleach & Balayage", description: "Blanjanje i balayage tehnika bojenja.", price: "6000", durationMinutes: 180, categoryId: subCats[7].id },
      { id: "c0000000-0000-0000-0000-000000000009", name: "Pramenovi", description: "Klasični pramenovi.", price: "4000", durationMinutes: 120, categoryId: subCats[8].id },
      { id: "c0000000-0000-0000-0000-000000000010", name: "Olaplex tretman", description: "Regenerativni tretman kose Olaplex.", price: "3000", durationMinutes: 60, categoryId: subCats[9].id },
      { id: "c0000000-0000-0000-0000-000000000011", name: "Keratin tretman", description: "Keratinsko izravnavanje i regeneracija.", price: "5000", durationMinutes: 120, categoryId: subCats[10].id },
      { id: "c0000000-0000-0000-0000-000000000012", name: "Svečana frizura", description: "Frizura za posebne prilike.", price: "3500", durationMinutes: 90, categoryId: subCats[11].id },
      { id: "c0000000-0000-0000-0000-000000000013", name: "Obična frizura", description: "Svakodnevna frizura.", price: "1000", durationMinutes: 30, categoryId: subCats[12].id },
    ])
    .onConflictDoNothing();
});

console.log("Seed završen.");
process.exit(0);
