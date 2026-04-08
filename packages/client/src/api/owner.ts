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

function tokenOrThrow(): string {
  const t = getStoredToken();
  if (!t) {
    throw new ApiError("unauthorized", "Not signed in", 401);
  }
  return t;
}

export function fetchOwnerMenus(): Promise<OwnerMenuSummary[]> {
  return apiJson<OwnerMenuSummary[]>("/owner/menus", { token: tokenOrThrow() });
}

export function fetchOwnerCategories(): Promise<OwnerCategoriesData> {
  return apiJson<OwnerCategoriesData>("/owner/categories", { token: tokenOrThrow() });
}

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

export function fetchItemEditor(menuId: string, itemId: string): Promise<MenuItemEditor> {
  return apiJson<MenuItemEditor>(
    `/owner/menus/${encodeURIComponent(menuId)}/items/${encodeURIComponent(itemId)}`,
    { token: tokenOrThrow() },
  );
}
