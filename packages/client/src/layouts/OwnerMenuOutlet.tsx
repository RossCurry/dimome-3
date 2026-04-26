import { Outlet } from "react-router-dom";

/** Nests `/menus/:menuId` index, `/menus/:menuId/qr`, and `/menus/:menuId/import/csv/*`. */
export function OwnerMenuOutlet() {
  return <Outlet />;
}
