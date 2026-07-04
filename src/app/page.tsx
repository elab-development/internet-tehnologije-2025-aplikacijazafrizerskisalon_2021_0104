import Link from "next/link";
import Gallery from "@/components/Gallery";
import SalonMap from "@/components/SalonMap";

export default function Home() {
  return (
    <main>
      {/* HERO */}
      <section className="bg-gradient-to-br from-stone-900 to-amber-900 py-28 text-center text-white">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">
            Frizerski salon u srcu Beograda
          </p>
          <h1 className="my-4 font-serif text-5xl">Salon Bibi</h1>
          <p className="text-stone-200">
            Negujemo vašu kosu i stil već više od deset godina, kombinujući pažljivu negu, savremene
            tehnike bojenja i frizure prilagođene svakom licu.
          </p>
        </div>
      </section>

      {/* GALERIJA */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-700">Inspiracija</p>
        <h2 className="font-serif text-3xl">Frizure iz našeg salona</h2>
        <Gallery />
      </section>

      {/* O NAMA */}
      <section className="bg-stone-100 py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-rose-700">O nama</p>
          <h2 className="font-serif text-3xl">Salon koji pamti svaki detalj o vašoj kosi</h2>
          <p className="mt-4 text-stone-600">
            Salon Bibi je porodični frizerski salon koji od 2013. godine pruža usluge feniranja,
            bojenja, tretmana i izrade frizura za sve prilike. Naš tim stilista pažljivo prati
            trendove, ali pre svega slušamo želje svake mušterije.
          </p>
        </div>
      </section>

      {/* ZAKAZIVANJE */}
      <section className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-700">Zakazivanje</p>
        <h2 className="font-serif text-3xl">Zakažite termin u nekoliko klikova</h2>
        <p className="mt-4 text-stone-600">
          Izaberite uslugu, omiljenog frizera i termin koji vam odgovara. Nakon prijave na sajt,
          zakazivanje traje manje od minuta, a potvrdu termina dobijate odmah.
        </p>
        <Link
          href="/zakazivanje"
          className="mt-6 inline-block rounded bg-rose-700 px-6 py-3 font-semibold text-white hover:bg-rose-800"
        >
          Zakaži termin
        </Link>
      </section>

      {/* USLUGE */}
      <section className="bg-stone-100 py-16">
        <div className="mx-auto max-w-2xl px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-rose-700">Usluge</p>
          <h2 className="font-serif text-3xl">Od svakodnevnog feniranja do svečanih frizura</h2>
          <p className="mt-4 text-stone-600">
            Ponuda salona obuhvata feniranje, farbanje (bleach, balayage, pramenovi), tretmane kose
            (Olaplex, keratin) i izradu frizura za svečane i obične prilike.
          </p>
          <Link
            href="/usluge"
            className="mt-6 inline-block rounded border-2 border-rose-700 px-6 py-3 font-semibold text-rose-700 hover:bg-rose-700 hover:text-white"
          >
            Više o uslugama
          </Link>
        </div>
      </section>

      {/* ADRESA, RADNO VREME I MAPA */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-rose-700">Adresa</p>
            <h3 className="font-serif text-xl">Bulevar Kralja Aleksandra 45, Beograd</h3>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-rose-700">Radno vreme</p>
            <h3 className="font-serif text-xl">Pon - Pet: 09 - 20h · Sub: 09 - 16h · Ned: ne radimo</h3>
          </div>
        </div>
        {/* Google Maps(eksterni API) */}
        <SalonMap />
      </section>
    </main>
  );
}
