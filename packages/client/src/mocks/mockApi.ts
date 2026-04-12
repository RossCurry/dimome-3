import type {
  MenuItemEditor,
  OwnerCategoriesData,
  OwnerMenuCategoriesData,
  OwnerMenuSummary,
  PublicMenuData,
  ScanDraftData,
} from "@/types";
import {
  fetchItemEditor,
  fetchOwnerCategories,
  fetchOwnerCategoryPage,
  fetchOwnerMenuCategoriesData,
  fetchOwnerMenus,
} from "@/api/owner";
import { fetchPublicMenu } from "@/api/publicMenu";
import { ApiError } from "@/api/client";
import { delay } from "@/mocks/delay";
import { FIXTURE_SCAN_DRAFT_ROWS } from "@/mocks/fixtures";

export type { OwnerCategoryPageData } from "@/api/owner";

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

/**
 * Guest menu for `/qr/:menuId` or `/menu/:menuId` — use with React `use()` inside `<Suspense>`.
 * Cached per `menuId` (QR / deep link).
 */
export function readPublicMenu(menuId: string): Promise<PublicMenuData> {
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
    p = fetchOwnerMenuCategoriesData(menuId)
      .catch((e) => {
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
    p = fetchOwnerCategoryPage(menuId, categoryId)
      .catch((e) => {
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

function cachedPromise<T>(factory: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | null = null;
  return () => {
    if (!promise) promise = factory();
    return promise;
  };
}

/**
 * Simulated AI extraction for scan import (no server API yet).
 */
export const readScanDraft = cachedPromise(async (): Promise<ScanDraftData> => {
  await delay(400);
  return {
    rows: FIXTURE_SCAN_DRAFT_ROWS.map((r) => ({ ...r })),
    imagePreviewUrl: null,
  };
});
