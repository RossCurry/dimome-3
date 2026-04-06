import type { CategorySummaryDto } from "../domain/menu.js";

export type CreateCategoryInput = {
  name: string;
  thumbnail: string;
  publicId?: string;
  itemIds?: string[];
};

export type UpdateCategoryInput = Partial<{
  name: string;
  thumbnail: string;
  itemIds: string[];
}>;

export interface OwnerCategoriesPort {
  listAllForVenue(venueId: string): Promise<CategorySummaryDto[]>;
  listForMenu(venueId: string, menuPublicId: string): Promise<CategorySummaryDto[]>;
  createCategory(
    venueId: string,
    menuPublicId: string,
    input: CreateCategoryInput,
  ): Promise<CategorySummaryDto>;
  updateCategory(
    venueId: string,
    menuPublicId: string,
    categoryPublicId: string,
    input: UpdateCategoryInput,
  ): Promise<CategorySummaryDto | null>;
}
