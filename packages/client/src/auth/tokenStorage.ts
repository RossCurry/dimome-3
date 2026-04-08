const STORAGE_KEY = "dimome.auth.token";

export function getStoredToken(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  sessionStorage.setItem(STORAGE_KEY, token);
}

export function clearStoredToken(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
