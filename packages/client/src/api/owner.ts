import { getStoredToken } from "@/auth/tokenStorage";
import { ApiError, apiJson } from "@/api/client";
import type {
  CategorySummary,
  MenuItem,
  MenuItemEditor,
  OwnerCategoriesData,
  OwnerMenuCategoriesData,
  OwnerMenuSummary,
} from "@/types";

/**
 * Bearer token from storage, or throws `ApiError` unauthorized.
 */
function tokenOrThrow(): string {
  const t = getStoredToken();
  if (!t) {
    throw new ApiError("unauthorized", "Not signed in", 401);
  }
  return t;
}

/**
 * List all menus for the signed-in owner’s venue.
 */
export function fetchOwnerMenus(): Promise<OwnerMenuSummary[]> {
  return apiJson<OwnerMenuSummary[]>("/owner/menus", { token: tokenOrThrow() });
}

/**
 * Venue-level category palette and display name (not per-menu ordering).
 */
export function fetchOwnerCategories(): Promise<OwnerCategoriesData> {
  return apiJson<OwnerCategoriesData>("/owner/categories", { token: tokenOrThrow() });
}

/**
 * Parallel fetch of menu list, categories on a menu, and venue meta; null if menu id missing from list.
 */
export async function fetchOwnerMenuCategoriesData(
  menuId: string,
): Promise<OwnerMenuCategoriesData | null> {
  const token = tokenOrThrow();
  const [menus, categories, meta] = await Promise.all([
    apiJson<OwnerMenuSummary[]>("/owner/menus", { token }),
    apiJson<CategorySummary[]>(`/owner/menus/${encodeURIComponent(menuId)}/categories`, {
      token,
    }),
    apiJson<OwnerCategoriesData>("/owner/categories", { token }),
  ]);
  const menuMeta = menus.find((m) => m.id === menuId);
  if (!menuMeta) return null;
  return {
    menuId,
    menuName: menuMeta.name,
    venueName: meta.venueName,
    categories,
  };
}

export type OwnerCategoryPageData = {
  categoryName: string;
  items: MenuItem[];
};

/**
 * Load one category’s items for editor navigation; null if category not on menu.
 */
export async function fetchOwnerCategoryPage(
  menuId: string,
  categoryId: string,
): Promise<OwnerCategoryPageData | null> {
  const token = tokenOrThrow();
  const categories = await apiJson<CategorySummary[]>(
    `/owner/menus/${encodeURIComponent(menuId)}/categories`,
    { token },
  );
  const cat = categories.find((c) => c.categoryId === categoryId);
  if (!cat) return null;
  const items = await apiJson<MenuItem[]>(
    `/owner/menus/${encodeURIComponent(menuId)}/items?categoryPublicId=${encodeURIComponent(categoryId)}`,
    { token },
  );
  return { categoryName: cat.name, items };
}

/**
 * Full item payload for the owner item editor screen.
 */
export function fetchItemEditor(menuId: string, itemId: string): Promise<MenuItemEditor> {
  return apiJson<MenuItemEditor>(
    `/owner/menus/${encodeURIComponent(menuId)}/items/${encodeURIComponent(itemId)}`,
    { token: tokenOrThrow() },
  );
}

export type PatchItemBody = Partial<{
  categoryPublicId: string;
  name: string;
  price: number;
  description: string;
  allergens: string[];
  image: string;
  ingredients: string;
  visibleOnMenu: boolean;
  featured: boolean;
  sku: string;
  stockStatus: "in_stock" | "low" | "out";
  dietaryTags: string[];
}>;

/**
 * Partial update of a menu item (fields omitted are left unchanged server-side).
 */
export function patchItem(
  menuId: string,
  itemId: string,
  body: PatchItemBody,
): Promise<MenuItemEditor> {
  return apiJson<MenuItemEditor>(
    `/owner/menus/${encodeURIComponent(menuId)}/items/${encodeURIComponent(itemId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
      token: tokenOrThrow(),
    },
  );
}

export type CreateItemBody = {
  categoryPublicId: string;
  name: string;
  price: number;
  description?: string;
  allergens?: string[];
  image?: string;
  ingredients?: string;
  visibleOnMenu?: boolean;
  featured?: boolean;
  sku?: string;
  stockStatus?: "in_stock" | "low" | "out";
  dietaryTags?: string[];
};

/**
 * Create a new dish under a category; returns editor-shaped item.
 */
export function createItem(menuId: string, body: CreateItemBody): Promise<MenuItemEditor> {
  return apiJson<MenuItemEditor>(`/owner/menus/${encodeURIComponent(menuId)}/items`, {
    method: "POST",
    body: JSON.stringify({
      categoryPublicId: body.categoryPublicId,
      name: body.name,
      price: body.price,
      description: body.description ?? "",
      allergens: body.allergens ?? [],
      image: body.image ?? "/images/placeholder-dish.jpg",
      ingredients: body.ingredients,
      visibleOnMenu: body.visibleOnMenu,
      featured: body.featured,
      sku: body.sku,
      stockStatus: body.stockStatus,
      dietaryTags: body.dietaryTags,
    }),
    token: tokenOrThrow(),
  });
}

/**
 * Add a category tab/section to a specific menu.
 */
export function createCategory(
  menuId: string,
  input: { name: string; thumbnail?: string },
): Promise<CategorySummary> {
  return apiJson<CategorySummary>(`/owner/menus/${encodeURIComponent(menuId)}/categories`, {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      thumbnail: input.thumbnail ?? "/images/placeholder-dish.jpg",
    }),
    token: tokenOrThrow(),
  });
}

export type PatchMenuBody = Partial<{
  name: string;
  contextLabel: string;
  thumbnail: string;
  isActive: boolean;
  isPublished: boolean;
  guestVenueName: string;
}>;

/**
 * Update menu metadata (name, publish flags, thumbnail, guest label, etc.).
 */
export function patchMenu(menuId: string, body: PatchMenuBody): Promise<OwnerMenuSummary> {
  return apiJson<OwnerMenuSummary>(`/owner/menus/${encodeURIComponent(menuId)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    token: tokenOrThrow(),
  });
}

/**
 * Permanently delete a menu and its categories, items, and CSV import jobs.
 */
export function deleteMenu(menuId: string): Promise<void> {
  return apiJson<void>(`/owner/menus/${encodeURIComponent(menuId)}`, {
    method: "DELETE",
    token: tokenOrThrow(),
  });
}

/**
 * Permanently delete a category and all items in that category.
 */
export function deleteCategory(menuId: string, categoryPublicId: string): Promise<void> {
  return apiJson<void>(
    `/owner/menus/${encodeURIComponent(menuId)}/categories/${encodeURIComponent(categoryPublicId)}`,
    { method: "DELETE", token: tokenOrThrow() },
  );
}

/**
 * Permanently delete one dish from a menu category.
 */
export function deleteItem(menuId: string, itemId: string): Promise<void> {
  return apiJson<void>(
    `/owner/menus/${encodeURIComponent(menuId)}/items/${encodeURIComponent(itemId)}`,
    { method: "DELETE", token: tokenOrThrow() },
  );
}

export type CreateMenuBody = {
  name: string;
  contextLabel?: string;
  thumbnail?: string;
  isActive?: boolean;
  isPublished?: boolean;
  guestVenueName?: string;
};

/**
 * Create a new draft/active menu for the venue.
 */
export function createMenu(body: CreateMenuBody): Promise<OwnerMenuSummary> {
  return apiJson<OwnerMenuSummary>("/owner/menus", {
    method: "POST",
    body: JSON.stringify({
      name: body.name,
      contextLabel: body.contextLabel,
      thumbnail: body.thumbnail,
      isActive: body.isActive,
      isPublished: body.isPublished,
      guestVenueName: body.guestVenueName,
    }),
    token: tokenOrThrow(),
  });
}
