import { Navigate, useParams } from "react-router-dom";
import { getPublicMenuForMenuId } from "@/mocks/fixtures";

/**
 * Old `/menus/:menuId` → first real category in that menu (skips synthetic "All").
 */
export default function MenuLegacyRedirect() {
  const { menuId } = useParams<{ menuId: string }>();
  const id = menuId ?? "menu-1";
  const menu = getPublicMenuForMenuId(id);
  const first =
    menu.categories.find((c) => c.id !== "cat-0") ?? menu.categories[0];
  return <Navigate to={`/menus/${id}/category/${first.id}`} replace />;
}
