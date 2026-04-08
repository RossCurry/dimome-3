import { getApiOrigin } from "@/lib/env";

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function apiUrl(apiPath: string): string {
  const path = apiPath.startsWith("/") ? apiPath : `/${apiPath}`;
  const origin = getApiOrigin();
  if (!origin) {
    return `/api/v1${path}`;
  }
  return `${origin}/api/v1${path}`;
}

type ApiJsonOptions = RequestInit & { token?: string | null };

export async function apiJson<T>(path: string, init: ApiJsonOptions = {}): Promise<T> {
  const { token, headers: hdrs, ...rest } = init;
  const headers = new Headers(hdrs);
  if (!headers.has("Content-Type") && rest.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(apiUrl(path), { ...rest, headers });

  const ct = res.headers.get("content-type");
  const isJson = ct?.includes("application/json");

  if (!res.ok) {
    if (isJson) {
      const body = (await res.json()) as { error?: { code?: string; message?: string } };
      const code = body.error?.code ?? "http_error";
      const message = body.error?.message ?? res.statusText;
      throw new ApiError(code, message, res.status);
    }
    throw new ApiError("http_error", res.statusText || String(res.status), res.status);
  }

  if (res.status === 204 || !isJson) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
