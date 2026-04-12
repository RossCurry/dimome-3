/** API origin without trailing slash, or empty string to use same-origin `/api` (Vite proxy in dev). */
export function getApiOrigin(): string {
  const raw = import.meta.env.VITE_API_URL?.trim() ?? "";
  return raw.replace(/\/$/, "");
}
