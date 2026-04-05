import { use, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Camera, Trash2 } from "lucide-react";
import type { MenuItemEditor } from "@/types";
import { readItemEditor } from "@/mocks/mockApi";
import { DIETARY_VEGAN, EU_ALLERGEN_LABELS } from "@/mocks/constants";
import { OwnerSlidingActionFooter } from "@/components/owner/OwnerSlidingActionFooter";
// Future: import { OwnerConfirmDialog } from "@/components/owner/OwnerConfirmDialog" for a pre-save summary modal before API persist.

function ItemEditPageForm({ initialItem }: { initialItem: MenuItemEditor }) {
  const navigate = useNavigate();
  const [item, setItem] = useState(initialItem);
  const backTo = `/menus/menu-1/category/${item.category}`;

  const toggleAllergen = (label: string) => {
    setItem((prev) => ({
      ...prev,
      allergens: prev.allergens.includes(label)
        ? prev.allergens.filter((a) => a !== label)
        : [...prev.allergens, label],
    }));
  };

  const toggleVegan = () => {
    setItem((prev) => {
      const has = prev.dietaryTags.includes(DIETARY_VEGAN);
      return {
        ...prev,
        dietaryTags: has
          ? prev.dietaryTags.filter((t) => t !== DIETARY_VEGAN)
          : [...prev.dietaryTags, DIETARY_VEGAN],
      };
    });
  };

  const vegan = item.dietaryTags.includes(DIETARY_VEGAN);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 pb-28">
      <Link
        to={backTo}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to category
      </Link>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <section className="space-y-6 rounded-2xl bg-surface-container-lowest p-8 shadow-[var(--shadow-ambient)]">
            <h2 className="border-b border-outline-variant/20 pb-4 font-headline text-xl text-primary">
              General information
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  Item name
                </label>
                <input
                  className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40"
                  value={item.name}
                  onChange={(e) => setItem({ ...item, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface-variant">Category</label>
                <select
                  className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 focus:ring-2 focus:ring-primary/40"
                  value={item.category}
                  onChange={(e) => setItem({ ...item, category: e.target.value })}
                >
                  <option value="cat-1">Starters</option>
                  <option value="cat-2">Mains</option>
                  <option value="cat-3">Desserts</option>
                  <option value="cat-4">Drinks</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface-variant">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 focus:ring-2 focus:ring-primary/40"
                  value={item.price}
                  onChange={(e) =>
                    setItem({ ...item, price: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-on-surface-variant">
                  Description
                </label>
                <textarea
                  rows={4}
                  className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 focus:ring-2 focus:ring-primary/40"
                  value={item.description}
                  onChange={(e) => setItem({ ...item, description: e.target.value })}
                />
              </div>
            </div>
          </section>

          <section className="space-y-6 rounded-2xl bg-surface-container-lowest p-8 shadow-[var(--shadow-ambient)]">
            <h2 className="border-b border-outline-variant/20 pb-4 font-headline text-xl text-primary">
              Ingredients & preparation
            </h2>
            <textarea
              rows={3}
              placeholder="Ingredients separated by commas…"
              className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 focus:ring-2 focus:ring-primary/40"
              value={item.ingredients}
              onChange={(e) => setItem({ ...item, ingredients: e.target.value })}
            />
            <p className="text-xs italic text-on-surface-variant">
              Used for kitchen tracking and smart allergen hints (mock).
            </p>
          </section>

          <section className="space-y-6 rounded-2xl bg-surface-container-lowest p-8 shadow-[var(--shadow-ambient)]">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <h2 className="font-headline text-xl text-primary">Allergens & dietary</h2>
              <span className="rounded-full bg-secondary-fixed px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-on-secondary-fixed-variant">
                Smart scan on
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {EU_ALLERGEN_LABELS.map((label) => {
                const on = item.allergens.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleAllergen(label)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                      on
                        ? "bg-tertiary-fixed text-on-tertiary-fixed-variant ring-1 ring-tertiary/20"
                        : "bg-surface-container-low text-on-surface hover:bg-surface-variant"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={toggleVegan}
                className={`rounded-full px-4 py-2 text-xs font-medium ${
                  vegan
                    ? "bg-primary-fixed-dim text-on-primary-fixed-variant"
                    : "bg-surface-container-low text-on-surface"
                }`}
              >
                {DIETARY_VEGAN}
              </button>
            </div>
          </section>
        </div>

        <div className="space-y-8 lg:col-span-4">
          <section className="space-y-4 rounded-2xl bg-surface-container-lowest p-6 shadow-[var(--shadow-ambient)]">
            <h2 className="font-headline text-lg text-primary">Item photography</h2>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-container-low">
              <img src={item.image} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
                <div className="rounded-full bg-white/90 p-4 backdrop-blur-md">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-lg bg-surface-container-high py-2 text-xs font-semibold text-on-surface-variant"
              >
                Replace image
              </button>
              <button
                type="button"
                className="rounded-lg p-2 text-error hover:bg-error-container/40"
                aria-label="Remove image"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
            <p className="text-center text-[10px] text-on-surface-variant">
              Mock: single placeholder image for all items.
            </p>
          </section>

          <section className="space-y-6 rounded-2xl bg-surface-container-lowest p-6 shadow-[var(--shadow-ambient)]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Publishing
            </h3>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">Visible on menu</span>
              <button
                type="button"
                role="switch"
                aria-checked={item.visibleOnMenu}
                onClick={() =>
                  setItem((prev) => ({ ...prev, visibleOnMenu: !prev.visibleOnMenu }))
                }
                className={`relative h-7 w-11 rounded-full transition-colors ${
                  item.visibleOnMenu ? "bg-primary" : "bg-surface-container-high"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                    item.visibleOnMenu ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">Featured item</span>
              <button
                type="button"
                role="switch"
                aria-checked={item.featured}
                onClick={() =>
                  setItem((prev) => ({ ...prev, featured: !prev.featured }))
                }
                className={`relative h-7 w-11 rounded-full transition-colors ${
                  item.featured ? "bg-primary" : "bg-surface-container-high"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                    item.featured ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>
            <div className="space-y-2 border-t border-outline-variant/10 pt-4">
              <label className="text-[10px] font-bold text-on-surface-variant">SKU</label>
              <input
                className="w-full rounded-lg border-none bg-surface-container-low px-3 py-2 font-mono text-sm"
                value={item.sku}
                onChange={(e) => setItem({ ...item, sku: e.target.value })}
              />
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {item.stockStatus === "in_stock"
                  ? "In stock"
                  : item.stockStatus === "low"
                    ? "Low stock"
                    : "Out of stock"}
              </p>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-12 flex justify-center border-t border-outline-variant/20 pt-8">
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl px-4 py-2 font-medium text-error hover:bg-error-container/20"
        >
          <Trash2 className="h-5 w-5" />
          Archive menu item
        </button>
      </div>

      <OwnerSlidingActionFooter
        leading={
          <span>Save applies changes locally then returns to the category list (mock — no API yet).</span>
        }
        onCancel={() => navigate(backTo)}
        onSave={() => navigate(backTo)}
      />
    </div>
  );
}

export default function ItemEditPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const id = itemId ?? "";
  const loaded = use(readItemEditor(id));

  if (!loaded) {
    return <Navigate to="/" replace />;
  }

  return <ItemEditPageForm key={id} initialItem={loaded} />;
}
