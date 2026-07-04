import ServicesAccordion from "@/components/ServicesAccordion";
import type { CategoryDto, ServiceDto } from "@/shared/types";

// Server komponenta - ucitava podatke sa servera (SSR), kao u skripti (page.tsx -> fetch -> komponenta)
export default async function UslugePage() {
  const apiUrl = process.env.API_URL || "http://localhost:3000";

  const mainCategoriesRes = await fetch(`${apiUrl}/api/categories`, { cache: "no-store" });
  const mainCategories = (await mainCategoriesRes.json()) as CategoryDto[];

  const categoriesWithSub = await Promise.all(
    mainCategories.map(async (cat) => {
      const res = await fetch(`${apiUrl}/api/categories/sub?parentId=${cat.id}`, { cache: "no-store" });
      const subcategories = (await res.json()) as CategoryDto[];
      return { ...cat, subcategories };
    })
  );

  const servicesRes = await fetch(`${apiUrl}/api/services`, { cache: "no-store" });
  const services = (await servicesRes.json()) as ServiceDto[];

  return (
    <main>
      <section className="border-b border-stone-200 bg-white px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-rose-700">Ponuda salona</p>
          <h1 className="font-serif text-4xl">Usluge</h1>
          <p className="mt-2 text-stone-600">
            Feniranje, farbanje, tretmani i frizure - pregledajte podgrupe i izaberite uslugu koja
            vam odgovara.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <ServicesAccordion categories={categoriesWithSub} services={services} />
      </section>
    </main>
  );
}
