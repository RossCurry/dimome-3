/**
 * Passed when navigating to `/items/new` (create item).
 * From category page: include `menuId` so back/save returns to that category list.
 */
export type NewMenuItemLocationState = {
  categoryName: string;
  categoryId: string;
  menuId?: string;
};
