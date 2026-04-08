import type { PublicMenuData } from "@/types";
import { apiJson } from "@/api/client";

export function fetchPublicMenu(menuId: string): Promise<PublicMenuData> {
  return apiJson<PublicMenuData>(`/public/menus/${encodeURIComponent(menuId)}`);
}
