/** Guest public menu — mirrors client `PublicMenuData`. */
export interface MenuItemDto {
  id: string;
  name: string;
  price: number;
  description: string;
  allergens: string[];
  image: string;
  category: string;
}

export interface MenuCategoryDto {
  id: string;
  name: string;
  itemIds: string[];
}

export interface PublicMenuDto {
  menuId: string;
  venueName: string;
  categories: MenuCategoryDto[];
  itemsById: Record<string, MenuItemDto>;
}

/** Owner dashboard menu row — mirrors client `OwnerMenuSummary`. */
export interface OwnerMenuSummaryDto {
  id: string;
  name: string;
  contextLabel: string;
  lastUpdatedLabel: string;
  categoryCount: number;
  itemCount: number;
  thumbnail: string;
  isActive: boolean;
}

export interface CategorySummaryDto {
  menuId: string;
  categoryId: string;
  menuName: string;
  name: string;
  thumbnail: string;
  lastUpdatedLabel: string;
  itemCount: number;
}

export interface MenuItemEditorDto extends MenuItemDto {
  ingredients: string;
  visibleOnMenu: boolean;
  featured: boolean;
  sku: string;
  stockStatus: "in_stock" | "low" | "out";
  dietaryTags: string[];
}
