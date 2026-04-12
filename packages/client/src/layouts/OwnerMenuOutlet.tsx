import { Outlet } from "react-router-dom";

/** Nests `/menus/:menuId` index (menu hub) and `/menus/:menuId/import/csv/*`. */
export function OwnerMenuOutlet() {
  return <Outlet />;
}
