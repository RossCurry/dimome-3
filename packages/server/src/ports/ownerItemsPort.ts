import type { MenuItemEditorDto } from "../domain/menu.js";

export type CreateItemInput = {
  publicId?: string;
  categoryPublicId: string;
  name: string;
  price: number;
  description: string;
  allergens: string[];
  image: string;
  ingredients?: string;
  visibleOnMenu?: boolean;
  featured?: boolean;
  sku?: string;
  stockStatus?: "in_stock" | "low" | "out";
  dietaryTags?: string[];
};

export type UpdateItemInput = Partial<{
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

export interface OwnerItemsPort {
  getItem(
    venueId: string,
    menuPublicId: string,
    itemPublicId: string,
  ): Promise<MenuItemEditorDto | null>;
  createItem(
    venueId: string,
    menuPublicId: string,
    input: CreateItemInput,
  ): Promise<MenuItemEditorDto>;
  updateItem(
    venueId: string,
    menuPublicId: string,
    itemPublicId: string,
    input: UpdateItemInput,
  ): Promise<MenuItemEditorDto | null>;
}
