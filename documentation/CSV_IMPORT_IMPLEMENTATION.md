# CSV import (job-based) — implementation spec

**Status:** Implemented in `dimome3` (2026-04-12).  
**Related:** [REQUIREMENTS.md](./REQUIREMENTS.md) (CSV §3), [BACKEND_REQUIREMENTS.md](./BACKEND_REQUIREMENTS.md) §7 (polling), [CLIENT_API_MAP_2026-04-08.md](../CLIENT_API_MAP_2026-04-08.md) (update row for CSV).

---

## Goals

- **New menu first:** “Upload CSV” from the create-menu hub creates a draft menu (live) or uses fixture menu `menu-1` (mock), then opens `/menus/:menuId/import/csv`.
- **No R2 for MVP:** CSV bytes are uploaded as **multipart/form-data** to the API, stored temporarily on the **job document** (`rawCsvUtf8`), then **removed** after parse (`$unset`).
- **Async jobs in Mongo:** Job document is the source of truth; an in-process **worker loop** advances `pending_parse` → `awaiting_mapping` → … → `committed` / `failed`.
- **Client polling:** `GET` job until the UI can proceed (step 2: `awaiting_mapping`; step 3: `ready_for_review`).
- **Category column:** Client mapping includes **category** (optional CSV column). Empty category **cell** → server uses **`Uncategorised`** per row.
- **Allergens:** Comma-separated tokens in the mapped column; normalized to **EU-style canonical labels** where possible; unknown tokens add **row issues** but do **not** block import.
- **Commit:** Rows with **blocking** validation (`flagged`) are **skipped**; valid rows create categories/items.

---

## Packages

| Package | Role |
|---------|------|
| [`packages/jobs`](../packages/jobs/) | `CsvImportJob*` types, `MongoCsvImportJobStore`, `startWorkerLoop` (generic interval runner). |
| [`packages/server`](../packages/server/) | `csv-parse`, `multer`, REST routes, `processCsvImportTick` (parse / validate / commit), worker started from [`index.ts`](../packages/server/src/index.ts). |
| [`packages/client`](../packages/client/) | Nested routes under `/menus/:menuId/import/csv`, [`csvImportJobs.ts`](../packages/client/src/api/csvImportJobs.ts), wizard pages. |

---

## Limits (MVP)

| Limit | Value | Notes |
|-------|--------|--------|
| Max upload size | `2 * 1024 * 1024` bytes | Matches multer `limits.fileSize` and server string length check. |
| Max rows stored after parse | `5000` | [`MAX_CSV_ROWS`](../packages/server/src/services/csvImport/csvConstants.ts); keeps BSON under practical size. |
| Sample rows in API | First `8` | [`SAMPLE_ROW_LIMIT`](../packages/jobs/src/csvImportTypes.ts) for `GET` payload `sampleRows`. |

---

## Job state machine

| Status | Meaning |
|--------|---------|
| `pending_parse` | Job inserted; worker will claim and parse CSV. |
| `parsing` | Worker owns parse (short-lived). |
| `awaiting_mapping` | Parse done; `headers` + `records` populated; client step 2. |
| `mapping_submitted` | Client `PATCH` applied mapping; worker will validate. |
| `validating` | Worker owns validation. |
| `ready_for_review` | `previewRows` populated; client step 3. |
| `commit_pending` | Client `POST …/commit`; worker will import rows. |
| `committing` | Worker owns DB writes. |
| `committed` | `commitResult` set. |
| `failed` | `errorMessage` set. |

Worker **claims** with `findOneAndUpdate` on status transitions so two API instances would still be safe for single-field atomicity (best-effort for hobby scale).

---

## REST API (JWT)

Base: `/api/v1/owner`

| Method | Path | Body | Response |
|--------|------|------|------------|
| `POST` | `/menus/:menuId/csv-import-jobs` | `multipart/form-data` field **`file`** | `{ "id": "<jobId>" }` (201) |
| `GET` | `/menus/:menuId/csv-import-jobs/:jobId` | — | `CsvImportJob` JSON |
| `PATCH` | `/menus/:menuId/csv-import-jobs/:jobId` | `{ "mapping": { "name", "price", "category", "description", "allergens" } }` (CSV header names) | Updated job |
| `POST` | `/menus/:menuId/csv-import-jobs/:jobId/commit` | — | `202` + job snapshot (or `200` if already `committed`) |

Menu ownership: `POST` checks `listMenusForVenue` contains `menuId`.

---

## Parsing

- Library: **`csv-parse`** sync API in [`csvImportProcessor.ts`](../packages/server/src/services/csvImport/csvImportProcessor.ts) with `columns: true`, `skip_empty_lines: true`, `trim: true`, `relax_column_count: true`.
- Price parsing: strips `€$£` and whitespace; comma→dot for decimals (MVP heuristic).

---

## Allergens

- Resolver: [`euAllergens.ts`](../packages/server/src/services/csvImport/euAllergens.ts) — canonical list aligned with client `EU_ALLERGEN_LABELS` / [`constants.ts`](../packages/client/src/mocks/constants.ts).
- Unknown token → row `issues` entry `Unknown allergen: …`; row remains importable if not otherwise flagged.

---

## Worker process

- Started via [`startWorkerLoop`](../packages/jobs/src/workerLoop.ts) from server [`index.ts`](../packages/server/src/index.ts) (`intervalMs: 450`).
- Each tick runs [`processCsvImportTick`](../packages/server/src/services/csvImport/csvImportProcessor.ts) in a **drain loop** (parse → validate → commit) so a single tick can advance multiple stages when work is queued.
- **Shutdown:** `csvWorker.stop()` in the same `SIGINT` / `SIGTERM` handler that closes HTTP + Mongo.

---

## Client routes

| URL | Step |
|-----|------|
| `/menus/:menuId/import/csv` | Upload |
| `/menus/:menuId/import/csv/:jobId/map` | Column mapping |
| `/menus/:menuId/import/csv/:jobId/review` | Review + commit |

Legacy `/import/csv` redirects to **`/menus/create`**.

**Mock mode (`VITE_USE_MOCK_API=true`):** Uses job id literal **`local`** and existing fixture preview for step 3 (`readCsvPreview`); no HTTP for job APIs.

---

## Mongo indexes

Collection: `csv_import_jobs` (constant `CSV_IMPORT_JOBS_COLLECTION` in `jobs` package).  
Indexes created in [`ensureIndexes.ts`](../packages/server/src/adapters/persistence/mongo/ensureIndexes.ts): `{ status: 1, createdAt: 1 }`, `{ venueId: 1, menuPublicId: 1 }`.

---

## Future (not in this MVP)

- R2 presigned uploads for large CSVs.
- SSE / Redis (per BACKEND_REQUIREMENTS §7.3).
- Stronger idempotency / resume for `committing` partial failures.
- Stricter CSV preview rendering on step 2 (server-provided row matrix instead of client-side split for mocks).
