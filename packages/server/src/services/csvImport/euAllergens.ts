/** Canonical labels aligned with client `EU_ALLERGEN_LABELS` / guest filters. */
export const EU_ALLERGEN_LABELS = [
  "Cereals containing gluten",
  "Crustaceans",
  "Eggs",
  "Fish",
  "Peanuts",
  "Soybeans",
  "Milk (including lactose)",
  "Nuts",
  "Celery",
  "Mustard",
  "Sesame seeds",
  "Sulphur dioxide and sulphites",
  "Lupin",
  "Molluscs",
] as const;

const LABEL_LOWER = new Map<string, string>(
  EU_ALLERGEN_LABELS.map((l) => [l.toLowerCase(), l] as const),
);

/** Common CSV / shorthand tokens → canonical label (lowercase key). */
const TOKEN_ALIASES: Record<string, string> = {
  gluten: "Cereals containing gluten",
  wheat: "Cereals containing gluten",
  barley: "Cereals containing gluten",
  dairy: "Milk (including lactose)",
  milk: "Milk (including lactose)",
  lactose: "Milk (including lactose)",
  egg: "Eggs",
  eggs: "Eggs",
  nuts: "Nuts",
  tree: "Nuts",
  peanut: "Peanuts",
  peanuts: "Peanuts",
  soy: "Soybeans",
  soya: "Soybeans",
  fish: "Fish",
  shellfish: "Crustaceans",
  crustacean: "Crustaceans",
  mollusc: "Molluscs",
  mollusks: "Molluscs",
  celery: "Celery",
  mustard: "Mustard",
  sesame: "Sesame seeds",
  lupin: "Lupin",
  sulphites: "Sulphur dioxide and sulphites",
  sulfites: "Sulphur dioxide and sulphites",
  "sulphur dioxide": "Sulphur dioxide and sulphites",
};

/**
 * Returns canonical EU label or null if unknown.
 * Unknown tokens are surfaced as row issues on import (not silently dropped without trace).
 */
export function resolveAllergenToken(raw: string): string | null {
  const t = raw.trim().toLowerCase();
  if (!t || t === "none" || t === "none noted" || t === "n/a") return null;
  if (TOKEN_ALIASES[t]) return TOKEN_ALIASES[t];
  if (LABEL_LOWER.has(t)) return LABEL_LOWER.get(t)!;
  for (const label of EU_ALLERGEN_LABELS) {
    if (label.toLowerCase() === t) return label;
  }
  return null;
}
