import type {
  CsvPreviewData,
  MenuItem,
  MenuItemEditor,
  OwnerCategoriesData,
  OwnerMenuCategoriesData,
  OwnerMenuSummary,
  PublicMenuData,
  ScanDraftData,
} from "@/types";
import { delay } from "@/mocks/delay";
import {
  FIXTURE_CSV_HEADERS,
  FIXTURE_CSV_PREVIEW_ROWS,
  FIXTURE_OWNER_CATEGORIES,
  FIXTURE_OWNER_MENUS,
  FIXTURE_SCAN_DRAFT_ROWS,
  getFixtureItemEditor,
  getPublicMenuForMenuId,
} from "@/mocks/fixtures";

function cachedPromise<T>(factory: () => Promise<T>): () => Promise<T> {
  let p: Promise<T> | null = null;
  return () => {
    if (!p) p = factory();
    return p;
  };
}

const publicMenuCache = new Map<string, Promise<PublicMenuData>>();

/**
 * Guest menu for `/qr/:menuId` or `/menu/:menuId` — use with React `use()` inside `<Suspense>`.
 * Cached per `menuId` (QR / deep link).
 */
export function readPublicMenu(menuId: string): Promise<PublicMenuData> {
  let p = publicMenuCache.get(menuId);
  if (!p) {
    p = (async () => {
      await delay(600);
      return getPublicMenuForMenuId(menuId);
    })();
    publicMenuCache.set(menuId, p);
  }
  return p;
}

/** Owner `/categories` page — venue + category rows. */
export const readOwnerCategories = cachedPromise(async (): Promise<OwnerCategoriesData> => {
  await delay(500);
  return structuredClone(FIXTURE_OWNER_CATEGORIES);
});

/** Owner menus for overview + `/menus` list. */
export const readOwnerMenus = cachedPromise(async (): Promise<OwnerMenuSummary[]> => {
  await delay(420);
  return structuredClone(FIXTURE_OWNER_MENUS);
});

const ownerMenuCategoriesCache = new Map<string, Promise<OwnerMenuCategoriesData | null>>();

/**
 * Owner menu hub `/menus/:menuId` — categories belonging to that menu only.
 * `null` if the menu id is unknown to the owner mock.
 */
export function readOwnerMenuCategories(menuId: string): Promise<OwnerMenuCategoriesData | null> {
  let p = ownerMenuCategoriesCache.get(menuId);
  if (!p) {
    p = (async () => {
      await delay(480);
      const menuMeta = FIXTURE_OWNER_MENUS.find((m) => m.id === menuId);
      if (!menuMeta) return null;
      const base = structuredClone(FIXTURE_OWNER_CATEGORIES);
      const categories = base.categories.filter((c) => c.menuId === menuId);
      return {
        menuId,
        menuName: menuMeta.name,
        venueName: base.venueName,
        categories,
      };
    })();
    ownerMenuCategoriesCache.set(menuId, p);
  }
  return p;
}

export type OwnerCategoryPageData = {
  categoryName: string;
  items: MenuItem[];
};

const ownerCategoryPageCache = new Map<string, Promise<OwnerCategoryPageData | null>>();

/**
 * Owner category page: items in one category of a menu. Resolves `null` if unknown menu/category.
 */
export function readOwnerCategoryPage(
  menuId: string,
  categoryId: string,
): Promise<OwnerCategoryPageData | null> {
  const key = `${menuId}:${categoryId}`;
  let p = ownerCategoryPageCache.get(key);
  if (!p) {
    p = (async () => {
      await delay(450);
      const menu = getPublicMenuForMenuId(menuId);
      const cat = menu.categories.find((c) => c.id === categoryId);
      if (!cat || categoryId === "cat-0") return null;
      const items = cat.itemIds
        .map((id) => menu.itemsById[id])
        .filter((row): row is MenuItem => row != null);
      return { categoryName: cat.name, items };
    })();
    ownerCategoryPageCache.set(key, p);
  }
  return p;
}

const itemEditorCache = new Map<string, Promise<MenuItemEditor | null>>();

export function readItemEditor(itemId: string): Promise<MenuItemEditor | null> {
  let p = itemEditorCache.get(itemId);
  if (!p) {
    p = (async () => {
      await delay(480);
      return getFixtureItemEditor(itemId);
    })();
    itemEditorCache.set(itemId, p);
  }
  return p;
}

/** CSV preview after “upload” — canned rows. */
export const readCsvPreview = cachedPromise(async (): Promise<CsvPreviewData> => {
  await delay(400);
  return {
    headers: [...FIXTURE_CSV_HEADERS],
    rows: FIXTURE_CSV_PREVIEW_ROWS.map((r) => ({ ...r })),
  };
});

/** Simulated AI extraction result. */
export const readScanDraft = cachedPromise(async (): Promise<ScanDraftData> => {
  await delay(700);
  return {
    rows: FIXTURE_SCAN_DRAFT_ROWS.map((r) => ({ ...r })),
    imagePreviewUrl: null,
  };
});
