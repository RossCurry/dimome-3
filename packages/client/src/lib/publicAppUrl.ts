/** Strip trailing slashes for consistent URL joining. */
function normalizePublicBase(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Origin used in QR codes and other links meant to be opened by guests (phones).
 * Prefer `VITE_PUBLIC_APP_URL` when set (e.g. canonical https URL behind a proxy);
 * otherwise the current browser origin.
 */
export function getPublicAppOrigin(): string {
  const fromEnv = import.meta.env.VITE_PUBLIC_APP_URL?.trim();
  if (fromEnv) {
    return normalizePublicBase(fromEnv);
  }
  if (typeof globalThis !== "undefined" && "location" in globalThis) {
    const loc = (globalThis as { location?: { origin?: string } }).location;
    if (loc?.origin) return loc.origin;
  }
  return "";
}

/** Absolute URL for the guest menu route encoded in menu QR codes. */
export function guestMenuQrUrl(menuId: string): string {
  const origin = getPublicAppOrigin();
  return `${origin}/qr/${encodeURIComponent(menuId)}`;
}
