import { use, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Filter, QrCode, Search, ShoppingBag } from "lucide-react";
import { readPublicMenu } from "@/mocks/mockApi";
import { useGuestPreferences, itemPassesAllergenFilters } from "@/context/GuestPreferencesContext";
import { GuestMenuFilterEmptyState } from "@/components/guest/GuestMenuFilterEmptyState";

export default function GuestMenuPage() {
  const { menuId = "" } = useParams<{ menuId: string }>();
  const data = use(readPublicMenu(menuId));
  const { excludedAllergens, addToCart, cartCount } = useGuestPreferences();
  const [search, setSearch] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState("cat-0");

  const activeCategory = useMemo(
    () => data.categories.find((c) => c.id === activeCategoryId) ?? data.categories[0],
    [data.categories, activeCategoryId],
  );

  const matchesSearchOnly = useMemo(() => {
    const ids =
      activeCategoryId === "cat-0"
        ? Object.keys(data.itemsById)
        : (activeCategory?.itemIds ?? []);
    return ids
      .map((id) => data.itemsById[id])
      .filter(Boolean)
      .filter((item) => {
        const q = search.trim().toLowerCase();
        return (
          !q ||
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        );
      });
  }, [data, activeCategory, activeCategoryId, search]);

  const visibleItems = useMemo(
    () =>
      matchesSearchOnly.filter((item) =>
        itemPassesAllergenFilters(item.allergens, excludedAllergens),
      ),
    [matchesSearchOnly, excludedAllergens],
  );

  return (
    <div className="min-h-screen bg-surface pb-28">
      <header className="glass-header sticky top-0 z-20 text-on-primary">
        <div className="max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold italic font-headline text-emerald-50">
                {data.venueName}
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-emerald-200/80">
                Digital menu · {data.menuId}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="QR code"
              >
                <QrCode className="w-5 h-5" />
              </button>
              <Link
                to="order"
                className="p-2 rounded-lg bg-primary-container relative hover:opacity-90 transition-opacity"
                aria-label="Your order"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-tertiary text-on-primary text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50" />
            <input
              type="search"
              placeholder="Search for dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50"
            />
          </div>
        </div>
      </header>

      <nav className="px-6 py-2 overflow-x-auto flex gap-3 max-w-lg mx-auto scrollbar-hide">
        <button
          type="button"
          onClick={() => setActiveCategoryId("cat-0")}
          className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
            activeCategoryId === "cat-0"
              ? "bg-primary-container text-on-primary shadow-[var(--shadow-ambient)]"
              : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          All
        </button>
        {data.categories
          .filter((c) => c.id !== "cat-0")
          .map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategoryId(cat.id)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeCategoryId === cat.id
                  ? "bg-primary-container text-on-primary shadow-[var(--shadow-ambient)]"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {cat.name}
            </button>
          ))}
      </nav>

      <div className="px-6 py-3 max-w-lg mx-auto">
        <Link
          to="filters"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed-variant text-sm font-medium"
        >
          <Filter className="w-4 h-4" />
          Filter allergens
          {excludedAllergens.size > 0 && (
            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
              {excludedAllergens.size}
            </span>
          )}
        </Link>
      </div>

      <div className="px-6 py-4 grid gap-5 max-w-lg mx-auto">
        {visibleItems.length > 0 ? (
          visibleItems.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl bg-surface-container-lowest overflow-hidden shadow-[var(--shadow-ambient)]"
            >
              <div className="aspect-[4/3] overflow-hidden bg-surface-container-low">
                <img
                  src={item.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <div className="flex justify-between gap-3 items-start">
                  <h2 className="text-lg font-headline text-primary">{item.name}</h2>
                  <span className="text-primary font-semibold whitespace-nowrap">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {item.allergens.slice(0, 3).map((a) => (
                    <span
                      key={a}
                      className="text-[10px] font-medium px-2 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant"
                    >
                      {a}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addToCart(item.id)}
                  className="mt-4 w-full py-3 rounded-xl primary-gradient text-on-primary text-sm font-semibold"
                >
                  Add to order
                </button>
              </div>
            </article>
          ))
        ) : matchesSearchOnly.length > 0 ? (
          <GuestMenuFilterEmptyState />
        ) : search.trim() ? (
          <div
            className="rounded-2xl border border-outline-variant/15 bg-surface-container-low px-6 py-12 text-center shadow-[var(--shadow-ambient)]"
            role="status"
            aria-live="polite"
          >
            <p className="font-headline text-lg text-primary">No dishes match your search</p>
            <p className="mt-2 text-sm text-on-surface-variant">
              Try a different keyword or browse a category above.
            </p>
          </div>
        ) : (
          <div
            className="rounded-2xl border border-outline-variant/15 bg-surface-container-low px-6 py-12 text-center shadow-[var(--shadow-ambient)]"
            role="status"
            aria-live="polite"
          >
            <p className="font-headline text-lg text-primary">No dishes here</p>
            <p className="mt-2 text-sm text-on-surface-variant">
              This section doesn&apos;t have any items yet.
            </p>
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 inset-x-0 z-30 bg-surface-container-lowest/80 backdrop-blur-xl border-t border-outline-variant/20 px-6 py-3 flex justify-around max-w-lg mx-auto rounded-t-2xl">
        <Link to="." className="text-primary text-xs font-semibold">
          Menu
        </Link>
        <Link to="filters" className="text-on-surface-variant text-xs font-medium">
          Filters
        </Link>
        <Link to="order" className="text-on-surface-variant text-xs font-medium">
          Order
        </Link>
      </nav>

      <Link
        to="/"
        className="fixed bottom-24 right-4 z-40 text-[10px] uppercase tracking-wider text-on-surface-variant hover:text-primary bg-surface-container-lowest/90 px-2 py-1 rounded-lg shadow-sm"
      >
        Owner
      </Link>
    </div>
  );
}
