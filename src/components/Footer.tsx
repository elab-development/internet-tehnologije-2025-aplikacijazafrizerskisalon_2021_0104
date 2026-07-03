export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-50 py-10">
      <div className="mx-auto max-w-6xl px-6 text-center text-sm text-stone-500">
        <p className="font-serif text-lg text-stone-800">Bibi Salon</p>
        <p className="mt-1">Bulevar Kralja Aleksandra 45, Beograd</p>
        <p>Pon - Pet: 09 - 20h · Sub: 09 - 16h · Ned: ne radimo</p>
        <p className="mt-4">&copy; {new Date().getFullYear()} Bibi Salon. Sva prava zadržana.</p>
      </div>
    </footer>
  );
}
