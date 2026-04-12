import type { PublicMenuData } from "@/types";
import { apiJson } from "@/api/client";

/**
 * Guest-facing menu payload (categories and items) for public menu routes; no auth.
 */
export function fetchPublicMenu(menuId: string): Promise<PublicMenuData> {
  return apiJson<PublicMenuData>(`/public/menus/${encodeURIComponent(menuId)}`);
}
