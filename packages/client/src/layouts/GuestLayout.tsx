import { Navigate, Outlet, useParams } from "react-router-dom";
import { GuestPreferencesProvider } from "@/context/GuestPreferencesContext";

/**
 * Guest (mobile) experience under `/menu/:menuId` or QR path `/qr/:menuId`.
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
