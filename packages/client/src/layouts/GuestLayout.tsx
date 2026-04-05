import { Outlet } from "react-router-dom";
import { GuestPreferencesProvider } from "@/context/GuestPreferencesContext";

export function GuestLayout() {
  return (
    <GuestPreferencesProvider>
      <Outlet />
    </GuestPreferencesProvider>
  );
}
