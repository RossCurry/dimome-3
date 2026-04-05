import type {
  MenuItem,
  MenuItemEditor,
  OwnerDashboardData,
  PublicMenuData,
  ScanDraftRow,
} from "@/types";
import { PLACEHOLDER_IMAGE } from "@/mocks/constants";

const img = PLACEHOLDER_IMAGE;

const items: Record<string, MenuItem> = {
  "101": {
    id: "101",
    name: "Truffle Arancini",
    price: 12,
    description: "Crispy risotto balls with truffle oil and parmesan.",
    allergens: ["Milk (including lactose)", "Cereals containing gluten"],
    image: img,
    category: "cat-1",
  },
  "102": {
    id: "102",
    name: "Burrata & Heirloom Tomato",
    price: 14,
    description: "Fresh burrata with basil oil and aged balsamic.",
    allergens: ["Milk (including lactose)"],
    image: img,
    category: "cat-1",
  },
  "201": {
    id: "201",
    name: "Wild Mushroom Risotto",
    price: 22,
    description: "Creamy arborio rice with seasonal mushrooms.",
    allergens: ["Milk (including lactose)", "Cereals containing gluten"],
    image: img,
    category: "cat-2",
  },
  "202": {
    id: "202",
    name: "Grilled Salmon",
    price: 28.5,
    description:
      "Atlantic salmon with lemon-butter glaze, jasmine rice, asparagus.",
    allergens: ["Fish", "Milk (including lactose)"],
    image: img,
    category: "cat-2",
  },
  "301": {
    id: "301",
    name: "Dark Chocolate Torte",
    price: 9,
    description: "Flourless chocolate with sea salt.",
    allergens: ["Eggs", "Milk (including lactose)"],
    image: img,
    category: "cat-3",
  },
  "401": {
    id: "401",
    name: "Seasonal Spritz",
    price: 11,
    description: "Aperitivo, prosecco, soda, citrus.",
    allergens: ["Sulphur dioxide and sulphites"],
    image: img,
    category: "cat-4",
  },
};

export const FIXTURE_PUBLIC_MENU: PublicMenuData = {
  menuId: "menu-1",
  venueName: "The Green Table",
  categories: [
    { id: "cat-0", name: "All", itemIds: Object.keys(items) },
    { id: "cat-1", name: "Starters", itemIds: ["101", "102"] },
    { id: "cat-2", name: "Mains", itemIds: ["201", "202"] },
    { id: "cat-3", name: "Desserts", itemIds: ["301"] },
    { id: "cat-4", name: "Drinks", itemIds: ["401"] },
  ],
  itemsById: items,
};

/** Guest-facing menu for a given menu id (mock: same catalog; real API will scope by id). */
export function getPublicMenuForMenuId(menuId: string): PublicMenuData {
  return {
    ...structuredClone(FIXTURE_PUBLIC_MENU),
    menuId,
  };
}

export const FIXTURE_OWNER_DASHBOARD: OwnerDashboardData = {
  venueName: "Emerald Hearth",
  menus: [
    {
      id: "menu-1",
      name: "Dinner Service",
      thumbnail: img,
      lastUpdatedLabel: "Today, 10:24 AM",
      itemCount: 42,
    },
    {
      id: "menu-2",
      name: "Seasonal Brunch",
      thumbnail: img,
      lastUpdatedLabel: "2 days ago",
      itemCount: 18,
    },
  ],
};

/** Same items as public menu for browse (menu-1). */
export function getFixtureItemsList(): MenuItem[] {
  return Object.values(items);
}

export function getFixtureItemEditor(id: string): MenuItemEditor | null {
  const base = items[id];
  if (!base) return null;
  return {
    ...base,
    ingredients:
      "Sample ingredients list for kitchen tracking and allergen hints.",
    visibleOnMenu: true,
    featured: id === "202",
    sku: `SKU-${id}`,
    stockStatus: "in_stock",
    dietaryTags: id === "301" ? ["Vegan"] : [],
  };
}

export const FIXTURE_SCAN_DRAFT_ROWS: ScanDraftRow[] = [
  {
    id: "s1",
    name: "Chef's Soup",
    price: 9.5,
    description: "Daily soup with herbs.",
    allergens: "Celery, Milk (including lactose)",
  },
  {
    id: "s2",
    name: "Ribeye 300g",
    price: 38,
    description: "Grass-fed with peppercorn sauce.",
    allergens: "Milk (including lactose), Sulphur dioxide and sulphites",
  },
  {
    id: "s3",
    name: "Lemon Sorbet",
    price: 7,
    description: "Palate cleanser.",
    allergens: "None noted",
  },
];

export const FIXTURE_CSV_HEADERS = [
  "Dish Name",
  "Price_USD",
  "Details",
  "Allergen Info",
];

export const FIXTURE_CSV_PREVIEW_ROWS = [
  {
    name: "Wild Mushroom Risotto",
    price: "24.50",
    description: "Creamy arborio rice",
    allergens: "Milk (including lactose)",
    flagged: false,
  },
  {
    name: "Pan-Seared Scallops",
    price: "32.00",
    description: "",
    allergens: "Molluscs",
    flagged: true,
  },
];
