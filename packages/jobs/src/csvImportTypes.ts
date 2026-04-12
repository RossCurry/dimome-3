/** Persisted CSV import job lifecycle (Mongo is source of truth). */
export type CsvImportJobStatus =
  | "pending_parse"
  | "parsing"
  | "awaiting_mapping"
  | "mapping_submitted"
  | "validating"
  | "ready_for_review"
  | "commit_pending"
  | "committing"
  | "committed"
  | "failed";

/** Maps logical fields to source CSV header names (empty string = unmapped). */
export type CsvColumnMapping = {
  name: string;
  price: string;
  category: string;
  description: string;
  allergens: string;
};

export type CsvPreviewRowPublic = {
  rowIndex: number;
  name: string;
  price: string;
  category: string;
  description: string;
  /** Canonical EU labels for this row (import). */
  allergenLabels: string[];
  /** Joined display string for tables. */
  allergensDisplay: string;
  flagged: boolean;
  issues: string[];
};

export type CsvImportCommitResultPublic = {
  imported: number;
  skipped: number;
  messages: string[];
};

/** API / polling payload (no raw file bytes after parse). */
export type CsvImportJobPublic = {
  id: string;
  menuId: string;
  status: CsvImportJobStatus;
  fileName: string;
  errorMessage?: string;
  headers: string[];
  sampleRows: Record<string, string>[];
  mapping: CsvColumnMapping | null;
  previewRows: CsvPreviewRowPublic[] | null;
  commitResult: CsvImportCommitResultPublic | null;
  createdAt: string;
  updatedAt: string;
};

export type CsvImportJobBson = {
  _id: import("mongodb").ObjectId;
  venueId: string;
  menuPublicId: string;
  status: CsvImportJobStatus;
  fileName: string;
  errorMessage?: string;
  rawCsvUtf8?: string;
  headers: string[];
  /** Full parsed rows as objects keyed by CSV header (capped server-side). */
  records: Record<string, string>[];
  mapping: CsvColumnMapping | null;
  previewRows: CsvPreviewRowPublic[] | null;
  commitResult: CsvImportCommitResultPublic | null;
  createdAt: Date;
  updatedAt: Date;
};

export const CSV_IMPORT_JOBS_COLLECTION = "csv_import_jobs";

export const SAMPLE_ROW_LIMIT = 8;
