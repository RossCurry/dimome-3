/** Public menu payload (guest + mock API). */
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  allergens: string[];
  image: string;
  category: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  itemIds: string[];
}

export interface PublicMenuData {
  /** Menu id from the URL (QR targets `/menu/:menuId`). */
  menuId: string;
  venueName: string;
  categories: MenuCategory[];
  itemsById: Record<string, MenuItem>;
}

/** Owner dashboard menu card */
export interface MenuSummary {
  id: string;
  name: string;
  thumbnail: string;
  lastUpdatedLabel: string;
  itemCount: number;
}

export interface OwnerDashboardData {
  venueName: string;
  menus: MenuSummary[];
}

/** Full item for editor */
export interface MenuItemEditor extends MenuItem {
  ingredients: string;
  visibleOnMenu: boolean;
  featured: boolean;
  sku: string;
  stockStatus: "in_stock" | "low" | "out";
  dietaryTags: string[];
}

export type CsvFieldKey =
  | "name"
  | "price"
  | "description"
  | "allergens";

export interface CsvColumnMapping {
  name: string | null;
  price: string | null;
  description: string | null;
  allergens: string | null;
}

export interface CsvPreviewRow {
  name: string;
  price: string;
  description: string;
  allergens: string;
  flagged?: boolean;
}

export interface CsvPreviewData {
  headers: string[];
  rows: CsvPreviewRow[];
}

/** AI extraction draft row (editable in step 3) */
export interface ScanDraftRow {
  id: string;
  name: string;
  price: number;
  description: string;
  allergens: string;
}

export interface ScanDraftData {
  rows: ScanDraftRow[];
  imagePreviewUrl: string | null;
}
