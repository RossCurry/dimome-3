import type { PublicMenuDto } from "../domain/menu.js";

export interface PublicMenuReadPort {
  getPublishedMenuByPublicId(menuPublicId: string): Promise<PublicMenuDto | null>;
}
