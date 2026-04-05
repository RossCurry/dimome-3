/** Single shared image for all mock menu items (see public/images/placeholder-dish.jpg). */
export const PLACEHOLDER_IMAGE = `${import.meta.env.BASE_URL}images/placeholder-dish.jpg`;

/** EU mandatory allergens + common dietary tag (labels for chips / filters). */
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

export const DIETARY_VEGAN = "Vegan";

export const GUEST_FILTER_SHORTLIST = [
  { id: "gluten", label: "Gluten", hint: "Wheat & barley" },
  { id: "dairy", label: "Dairy-free", hint: "Lactose intolerant" },
  { id: "nuts", label: "Nuts", hint: "Peanuts & tree nuts" },
  { id: "shellfish", label: "Shellfish", hint: "Crustaceans" },
] as const;
