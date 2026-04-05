import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { EU_ALLERGEN_LABELS, GUEST_FILTER_SHORTLIST } from "@/mocks/constants";
import { useGuestPreferences } from "@/context/GuestPreferencesContext";

export default function GuestFiltersPage() {
  const {
    excludedAllergens,
    toggleEuAllergen,
    toggleShortlist,
    clearFilters,
  } = useGuestPreferences();

  return (
    <div className="min-h-screen bg-surface pb-28">
      <header className="sticky top-0 z-20 bg-surface-container-lowest/90 backdrop-blur-xl px-6 py-4 flex items-center gap-4 border-b border-outline-variant/10">
        <Link
          to=".."
          relative="path"
          className="p-2 rounded-lg hover:bg-surface-container-low -ml-2"
          aria-label="Back to menu"
        >
          <ChevronLeft className="w-6 h-6 text-primary" />
        </Link>
        <h1 className="text-xl font-headline text-primary">Allergen filters</h1>
      </header>

      <div className="px-6 py-4 max-w-lg mx-auto">
        <div className="relative mb-8">
          <input
            type="search"
            placeholder="Search allergens..."
            className="w-full h-14 pl-4 pr-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 text-on-surface"
          />
        </div>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-headline text-lg text-tertiary">Common intolerances</h2>
            <span className="h-px flex-1 bg-surface-container-high rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {GUEST_FILTER_SHORTLIST.map((s) => {
              const labels =
                s.id === "gluten"
                  ? ["Cereals containing gluten"]
                  : s.id === "dairy"
                    ? ["Milk (including lactose)"]
                    : s.id === "nuts"
                      ? ["Nuts", "Peanuts"]
                      : ["Crustaceans", "Molluscs"];
              const active = labels.some((l) => excludedAllergens.has(l));
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleShortlist(s.id)}
                  className={`text-left p-5 rounded-2xl transition-all shadow-[var(--shadow-ambient)] ${
                    active
                      ? "bg-primary/5 ring-2 ring-primary/20"
                      : "bg-surface-container-lowest hover:ring-1 hover:ring-primary/10"
                  }`}
                >
                  <span className="font-headline font-semibold text-on-surface block">
                    {s.label}
                  </span>
                  <span className="text-xs text-on-surface-variant mt-1 block">
                    {s.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-headline text-lg text-tertiary">
              Mandatory allergens (EU)
            </h2>
            <span className="h-px flex-1 bg-surface-container-high rounded-full" />
          </div>
          <p className="text-xs text-on-surface-variant mb-4">
            Hide dishes that contain these allergens.
          </p>
          <div className="space-y-2">
            {EU_ALLERGEN_LABELS.map((label) => {
              const on = excludedAllergens.has(label);
              return (
                <div
                  key={label}
                  className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl"
                >
                  <span className="text-sm font-medium text-on-surface pr-4">
                    {label}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    onClick={() => toggleEuAllergen(label)}
                    className={`w-12 h-7 rounded-full relative transition-colors shrink-0 ${
                      on ? "bg-primary" : "bg-outline-variant/30"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
                        on ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <button
          type="button"
          onClick={clearFilters}
          className="w-full py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-medium"
        >
          Clear all filters
        </button>
      </div>

      <nav className="fixed bottom-0 inset-x-0 z-30 bg-surface-container-lowest/80 backdrop-blur-xl border-t border-outline-variant/20 px-6 py-3 flex justify-around max-w-lg mx-auto rounded-t-2xl">
        <Link to=".." relative="path" className="text-on-surface-variant text-xs font-medium">
          Menu
        </Link>
        <Link to="." className="text-primary text-xs font-semibold">
          Filters
        </Link>
        <Link to="../order" relative="path" className="text-on-surface-variant text-xs font-medium">
          Order
        </Link>
      </nav>
    </div>
  );
}
