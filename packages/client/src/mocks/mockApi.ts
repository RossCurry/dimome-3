import type {
  CsvPreviewData,
  MenuItemEditor,
  OwnerCategoriesData,
  OwnerMenuCategoriesData,
  OwnerMenuSummary,
  PublicMenuData,
  ScanDraftData,
} from "@/types";
import { fetchItemEditor, fetchOwnerCategories, fetchOwnerCategoryPage, fetchOwnerMenuCategoriesData, fetchOwnerMenus } from "@/api/owner";
import { fetchPublicMenu } from "@/api/publicMenu";
import { ApiError } from "@/api/client";
import { useMocks } from "@/lib/env";
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

export type { OwnerCategoryPageData } from "@/api/owner";

function cachedPromise<T>(factory: () => Promise<T>): () => Promise<T> {
  let p: Promise<T> | null = null;
  return () => {
    if (!p) p = factory();
    return p;
  };
}

const publicMenuCache = new Map<string, Promise<PublicMenuData>>();
const ownerMenuCategoriesCache = new Map<string, Promise<OwnerMenuCategoriesData | null>>();
const ownerCategoryPageCache = new Map<string, Promise<import("@/api/owner").OwnerCategoryPageData | null>>();
const itemEditorCache = new Map<string, Promise<MenuItemEditor | null>>();

const liveOwnerMenusCache = { p: null as Promise<OwnerMenuSummary[]> | null };
const liveOwnerCategoriesCache = { p: null as Promise<OwnerCategoriesData> | null };

/** Call on logout and after login so cached reads refetch. */
export function clearReadCaches(): void {
  publicMenuCache.clear();
  ownerMenuCategoriesCache.clear();
  ownerCategoryPageCache.clear();
  itemEditorCache.clear();
  liveOwnerMenusCache.p = null;
  liveOwnerCategoriesCache.p = null;
}

const mockReadOwnerMenus = cachedPromise(async (): Promise<OwnerMenuSummary[]> => {
  await delay(420);
  return structuredClone(FIXTURE_OWNER_MENUS);
});

const mockReadOwnerCategories = cachedPromise(async (): Promise<OwnerCategoriesData> => {
  await delay(500);
  return structuredClone(FIXTURE_OWNER_CATEGORIES);
});

/**
 * Guest menu for `/qr/:menuId` or `/menu/:menuId` — use with React `use()` inside `<Suspense>`.
 * Cached per `menuId` (QR / deep link).
 */
export function readPublicMenu(menuId: string): Promise<PublicMenuData> {
  if (useMocks()) {
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

  let p = publicMenuCache.get(menuId);
  if (!p) {
    p = fetchPublicMenu(menuId).catch((e) => {
      publicMenuCache.delete(menuId);
      throw e;
    });
    publicMenuCache.set(menuId, p);
  }
  return p;
}

/** Owner overview + `/menus` — menu summaries. */
export function readOwnerMenus(): Promise<OwnerMenuSummary[]> {
  if (useMocks()) {
    return mockReadOwnerMenus();
  }
  if (!liveOwnerMenusCache.p) {
    liveOwnerMenusCache.p = fetchOwnerMenus().catch((e) => {
      liveOwnerMenusCache.p = null;
      throw e;
    });
  }
  return liveOwnerMenusCache.p;
}

/** Owner `/categories` page — venue + category rows. */
export function readOwnerCategories(): Promise<OwnerCategoriesData> {
  if (useMocks()) {
    return mockReadOwnerCategories();
  }
  if (!liveOwnerCategoriesCache.p) {
    liveOwnerCategoriesCache.p = fetchOwnerCategories().catch((e) => {
      liveOwnerCategoriesCache.p = null;
      throw e;
    });
  }
  return liveOwnerCategoriesCache.p;
}

/**
 * Owner menu hub `/menus/:menuId` — categories belonging to that menu only.
 * `null` if the menu id is unknown to the owner.
 */
export function readOwnerMenuCategories(menuId: string): Promise<OwnerMenuCategoriesData | null> {
  let p = ownerMenuCategoriesCache.get(menuId);
  if (!p) {
    p = (async () => {
      if (useMocks()) {
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
      }
      return fetchOwnerMenuCategoriesData(menuId);
    })().catch((e) => {
      ownerMenuCategoriesCache.delete(menuId);
      throw e;
    });
    ownerMenuCategoriesCache.set(menuId, p);
  }
  return p;
}

/**
 * Owner category page: items in one category of a menu. Resolves `null` if unknown menu/category.
 */
export function readOwnerCategoryPage(
  menuId: string,
  categoryId: string,
): Promise<import("@/api/owner").OwnerCategoryPageData | null> {
  const key = `${menuId}:${categoryId}`;
  let p = ownerCategoryPageCache.get(key);
  if (!p) {
    p = (async () => {
      if (useMocks()) {
        await delay(450);
        const menu = getPublicMenuForMenuId(menuId);
        const cat = menu.categories.find((c) => c.id === categoryId);
        if (!cat || categoryId === "cat-0") return null;
        const items = cat.itemIds
          .map((id) => menu.itemsById[id])
          .filter((row): row is import("@/types").MenuItem => row != null);
        return { categoryName: cat.name, items };
      }
      return fetchOwnerCategoryPage(menuId, categoryId);
    })().catch((e) => {
      ownerCategoryPageCache.delete(key);
      throw e;
    });
    ownerCategoryPageCache.set(key, p);
  }
  return p;
}

export function readItemEditor(menuId: string, itemId: string): Promise<MenuItemEditor | null> {
  const key = `${menuId}:${itemId}`;
  let p = itemEditorCache.get(key);
  if (!p) {
    p = (async () => {
      if (useMocks()) {
        await delay(480);
        return getFixtureItemEditor(itemId);
      }
      try {
        return await fetchItemEditor(menuId, itemId);
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }
    })().catch((e) => {
      itemEditorCache.delete(key);
      throw e;
    });
    itemEditorCache.set(key, p);
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
