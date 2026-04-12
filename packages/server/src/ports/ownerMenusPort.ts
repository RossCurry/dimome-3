import type { OwnerMenuSummaryDto } from "../domain/menu.js";

export type CreateMenuInput = {
  name: string;
  contextLabel: string;
  thumbnail: string;
  isActive?: boolean;
  isPublished?: boolean;
  guestVenueName?: string;
};

export type UpdateMenuInput = Partial<{
  name: string;
  contextLabel: string;
  thumbnail: string;
  isActive: boolean;
  isPublished: boolean;
  guestVenueName: string;
}>;

export interface OwnerMenusPort {
  listMenusForVenue(venueId: string): Promise<OwnerMenuSummaryDto[]>;
  createMenu(venueId: string, input: CreateMenuInput): Promise<OwnerMenuSummaryDto>;
  updateMenu(
    venueId: string,
    menuPublicId: string,
    input: UpdateMenuInput,
  ): Promise<OwnerMenuSummaryDto | null>;
  /** Permanently remove menu and its categories, items, and CSV import jobs for this venue. */
  deleteMenu(venueId: string, menuPublicId: string): Promise<boolean>;
}
