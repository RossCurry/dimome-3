import { Navigate, Outlet, useParams } from "react-router-dom";
import { GuestPreferencesProvider } from "@/context/GuestPreferencesContext";

/**
 * Guest experience is always scoped to `/menu/:menuId` (e.g. QR code URL).
 * Cart + allergen filters reset when `menuId` changes (`key` on provider).
 */
export function GuestLayout() {
  const { menuId } = useParams<{ menuId: string }>();

  if (!menuId?.trim()) {
    return <Navigate to="/" replace />;
  }

  return (
    <GuestPreferencesProvider key={menuId} menuId={menuId}>
      <Outlet />
    </GuestPreferencesProvider>
  );
}
