import { getStoredToken } from "@/auth/tokenStorage";
import { ApiError, apiJson, apiUrl } from "@/api/client";
import { notifyApiError } from "@/api/errorNotifier";

export type CsvColumnMapping = {
  name: string;
  price: string;
  category: string;
  description: string;
  allergens: string;
};

export type CsvPreviewRow = {
  rowIndex: number;
  name: string;
  price: string;
  category: string;
  description: string;
  allergenLabels: string[];
  allergensDisplay: string;
  flagged: boolean;
  issues: string[];
};

export type CsvImportJob = {
  id: string;
  menuId: string;
  status: string;
  fileName: string;
  errorMessage?: string;
  headers: string[];
  sampleRows: Record<string, string>[];
  mapping: CsvColumnMapping | null;
  previewRows: CsvPreviewRow[] | null;
  commitResult: { imported: number; skipped: number; messages: string[] } | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Bearer token from storage, or throws `ApiError` unauthorized.
 */
function tokenOrThrow(): string {
  const t = getStoredToken();
  if (!t) throw new ApiError("unauthorized", "Not signed in", 401);
  return t;
}

/**
 * Start a CSV import job for a menu (multipart upload); returns new job id.
 */
export async function createCsvImportJob(menuId: string, file: File): Promise<{ id: string }> {
  const token = tokenOrThrow();
  const fd = new FormData();
  fd.append("file", file);
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(
    apiUrl(`/owner/menus/${encodeURIComponent(menuId)}/csv-import-jobs`),
    { method: "POST", body: fd, headers },
  );
  if (!res.ok) {
    const ct = res.headers.get("content-type");
    const isJson = ct?.includes("application/json");
    if (isJson) {
      const body = (await res.json()) as { error?: { code?: string; message?: string } };
      const message = body.error?.message ?? res.statusText;
      notifyApiError(message);
      throw new ApiError(body.error?.code ?? "http_error", message, res.status);
    }
    notifyApiError(res.statusText);
    throw new ApiError("http_error", res.statusText, res.status);
  }
  return res.json() as Promise<{ id: string }>;
}

/**
 * Load one import job (headers, mapping, preview, status, commit result).
 */
export function fetchCsvImportJob(menuId: string, jobId: string): Promise<CsvImportJob> {
  return apiJson<CsvImportJob>(
    `/owner/menus/${encodeURIComponent(menuId)}/csv-import-jobs/${encodeURIComponent(jobId)}`,
    { token: tokenOrThrow() },
  );
}

/**
 * Save CSV column → dish field mapping and refresh server-side preview.
 */
export function patchCsvImportMapping(
  menuId: string,
  jobId: string,
  mapping: CsvColumnMapping,
): Promise<CsvImportJob> {
  return apiJson<CsvImportJob>(
    `/owner/menus/${encodeURIComponent(menuId)}/csv-import-jobs/${encodeURIComponent(jobId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ mapping }),
      token: tokenOrThrow(),
    },
  );
}

/**
 * Apply validated preview rows to the menu (import); job returns commit counts/messages.
 */
export function commitCsvImportJob(menuId: string, jobId: string): Promise<CsvImportJob> {
  return apiJson<CsvImportJob>(
    `/owner/menus/${encodeURIComponent(menuId)}/csv-import-jobs/${encodeURIComponent(jobId)}/commit`,
    { method: "POST", token: tokenOrThrow() },
  );
}
