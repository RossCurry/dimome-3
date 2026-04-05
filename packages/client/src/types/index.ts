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

/**
 * Owner dashboard row: a category inside a published menu.
 * URLs: `/menus/:menuId/category/:categoryId`
 */
export interface CategorySummary {
  /** Published menu id (guest URL `/menu/:menuId`). */
  menuId: string;
  /** Category id within that menu (`MenuCategory.id`, e.g. cat-1). */
  categoryId: string;
  /** Display name of the parent menu (dashboard context). */
  menuName: string;
  /** Category title shown on cards and category page. */
  name: string;
  thumbnail: string;
  lastUpdatedLabel: string;
  itemCount: number;
}

export interface OwnerDashboardData {
  venueName: string;
  categories: CategorySummary[];
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
