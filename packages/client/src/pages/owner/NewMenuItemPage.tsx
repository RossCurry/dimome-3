import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Trash2 } from "lucide-react";
import type { MenuItemEditor } from "@/types";
import type { NewMenuItemLocationState } from "@/types/navigation";
import {
  DIETARY_VEGAN,
  EU_ALLERGEN_LABELS,
  PLACEHOLDER_IMAGE,
} from "@/mocks/constants";

function emptyEditorForCategory(categoryId: string): MenuItemEditor {
  return {
    id: `item-${Date.now()}`,
    name: "",
    price: 0,
    description: "",
    allergens: [],
    image: PLACEHOLDER_IMAGE,
    category: categoryId,
    ingredients: "",
    visibleOnMenu: true,
    featured: false,
    sku: "",
    stockStatus: "in_stock",
    dietaryTags: [],
  };
}

export default function NewMenuItemPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as NewMenuItemLocationState | null;

  if (!state?.categoryName?.trim() || !state?.categoryId) {
    return <Navigate to="/" replace />;
  }

  const { categoryName, categoryId, menuId } = state;
  const returnTo =
    menuId != null && menuId !== ""
      ? `/menus/${menuId}/category/${categoryId}`
      : "/";
  const [item, setItem] = useState(() => emptyEditorForCategory(categoryId));

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

  const addMenuItem = () => {
    navigate(returnTo);
  };

  const fromExistingCategory = Boolean(menuId);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <Link
          to={returnTo}
          className="inline-flex items-center gap-2 text-sm text-primary font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {fromExistingCategory ? "Back to category" : "Back to dashboard"}
        </Link>
        <div className="flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate(returnTo)}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-low"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={addMenuItem}
            className="primary-gradient text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold"
          >
            Add menu item
          </button>
        </div>
      </div>

      <div
        role="status"
        className="mb-6 rounded-2xl border border-primary/20 bg-primary-container/15 px-5 py-4 text-sm text-on-surface"
      >
        {fromExistingCategory ? (
          <>
            <span className="font-semibold text-primary">Add menu item</span>
            {" — "}
            <span className="font-headline text-primary">{categoryName}</span>
            <span className="text-on-surface-variant">
              {" "}
              (same form as editing an item; saved under this category in mock).
            </span>
          </>
        ) : (
          <>
            <span className="font-semibold text-primary">New category:</span>{" "}
            <span className="font-headline text-primary">{categoryName}</span>
            <span className="text-on-surface-variant">
              {" "}
              — add the first menu item below. It will be saved under this category (mock).
            </span>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-surface-container-lowest rounded-2xl p-8 space-y-6 shadow-[var(--shadow-ambient)]">
            <h2 className="text-xl font-headline text-primary pb-4 border-b border-outline-variant/20">
              General information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                  Item name
                </label>
                <input
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest"
                  value={item.name}
                  onChange={(e) => setItem({ ...item, name: e.target.value })}
                  placeholder="e.g. House salad"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface-variant">Category</label>
                <div className="w-full bg-surface-container-low/80 border border-outline-variant/10 rounded-xl px-4 py-3 text-sm text-on-surface">
                  {categoryName}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface-variant">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/40"
                  value={item.price}
                  onChange={(e) =>
                    setItem({ ...item, price: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-semibold text-on-surface-variant">
                  Description
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/40"
                  value={item.description}
                  onChange={(e) => setItem({ ...item, description: e.target.value })}
                />
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-2xl p-8 space-y-6 shadow-[var(--shadow-ambient)]">
            <h2 className="text-xl font-headline text-primary pb-4 border-b border-outline-variant/20">
              Ingredients & preparation
            </h2>
            <textarea
              rows={3}
              placeholder="Ingredients separated by commas…"
              className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/40"
              value={item.ingredients}
              onChange={(e) => setItem({ ...item, ingredients: e.target.value })}
            />
            <p className="text-xs text-on-surface-variant italic">
              Used for kitchen tracking and smart allergen hints (mock).
            </p>
          </section>

          <section className="bg-surface-container-lowest rounded-2xl p-8 space-y-6 shadow-[var(--shadow-ambient)]">
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant/20">
              <h2 className="text-xl font-headline text-primary">Allergens & dietary</h2>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-secondary-fixed text-on-secondary-fixed-variant px-2 py-1 rounded-full">
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-colors ${
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
                className={`px-4 py-2 rounded-full text-xs font-medium ${
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

        <div className="lg:col-span-4 space-y-8">
          <section className="bg-surface-container-lowest rounded-2xl p-6 space-y-4 shadow-[var(--shadow-ambient)]">
            <h2 className="text-lg font-headline text-primary">Item photography</h2>
            <div className="relative rounded-xl overflow-hidden aspect-square bg-surface-container-low">
              <img
                src={item.image}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-full">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 text-xs font-semibold py-2 rounded-lg bg-surface-container-high text-on-surface-variant"
              >
                Replace image
              </button>
              <button
                type="button"
                className="p-2 rounded-lg text-error hover:bg-error-container/40"
                aria-label="Remove image"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] text-on-surface-variant text-center">
              Mock: single placeholder image for all items.
            </p>
          </section>

          <section className="bg-surface-container-lowest rounded-2xl p-6 space-y-6 shadow-[var(--shadow-ambient)]">
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
                className={`relative w-11 h-7 rounded-full transition-colors ${
                  item.visibleOnMenu ? "bg-primary" : "bg-surface-container-high"
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${
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
                className={`relative w-11 h-7 rounded-full transition-colors ${
                  item.featured ? "bg-primary" : "bg-surface-container-high"
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${
                    item.featured ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>
            <div className="pt-4 border-t border-outline-variant/10 space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant">SKU</label>
              <input
                className="w-full bg-surface-container-low border-none rounded-lg px-3 py-2 text-sm font-mono"
                value={item.sku}
                onChange={(e) => setItem({ ...item, sku: e.target.value })}
              />
              <p className="text-sm font-semibold text-emerald-700 mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
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
    </div>
  );
}
