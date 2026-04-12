# Client ↔ API mapping (DiMoMe v3)

**Last updated:** 2026-04-12 (CSV import jobs + nested client routes; see matrix below).

Single source of truth for which HTTP routes power which UI areas. Planning docs live under [`documentation/`](documentation/). Canonical route summary: [packages/server/README.md](packages/server/README.md). Product types on the client: [packages/client/src/types/index.ts](packages/client/src/types/index.ts). Server DTOs: [packages/server/src/domain/menu.ts](packages/server/src/domain/menu.ts).

---

## Base URL and environment

- All API routes are under **`/api/v1/`** (see [createApp.ts](packages/server/src/createApp.ts)).
- **Local client:** use Vite dev server with optional **`server.proxy`** so requests to `/api/v1/...` forward to the API (default `http://localhost:3000`), **or** set **`VITE_API_URL`** (e.g. `http://localhost:3000`) and call the API directly (CORS allows `http://localhost:5173` by default — [config.ts](packages/server/src/config.ts)).
- **Mocks:** set **`VITE_USE_MOCK_API=true`** in [packages/client/.env.example](packages/client/.env.example) to keep in-memory owner/guest menu data. **CSV** still uses nested wizard URLs; step 3 uses fixture **`readCsvPreview()`** in mock mode (no job HTTP). **Scan** remains mock-only.

---

## Authentication

| Item | Detail |
|------|--------|
| Login | `POST /api/v1/auth/login` — JSON body `{ "email": string, "password": string }` |
| Success | `{ "token": string, "userId": string, "venueId": string }` ([auth.ts](packages/server/src/routes/v1/auth.ts)) |
| Owner routes | Header `Authorization: Bearer <token>` |
| Dev seed user | `dev@dimome.local` / `password` ([server README](packages/server/README.md)) |

---

## Error envelope

Non-2xx responses use JSON:

```json
{ "error": { "code": "string", "message": "string" } }
```

See [errors.ts](packages/server/src/http/errors.ts).

On the **client**, `apiJson` throws **`ApiError`** with the same `code` / `message` and, when **`showErrorSnack`** is not `false`, triggers a global **`GuestFilterSnackbar`** (see `packages/client/src/context/SnackbarContext.tsx`, `api/errorNotifier.ts`). **`POST /auth/login`** uses **`showErrorSnack: false`** so **`LoginPage`** can show a single inline error. **`fetch`** failures show a short network hint.

---

## Route table (machine-oriented)

| Method | Path | Auth | Response (conceptual) |
|--------|------|------|------------------------|
| GET | `/api/v1/health` | No | `{ ok, db }` |
| GET | `/api/v1/public/menus/:menuId` | No | `PublicMenuData` / `PublicMenuDto` — **404** if menu missing or not published |
| POST | `/api/v1/auth/login` | No | `{ token, userId, venueId }` |
| GET | `/api/v1/owner/menus` | JWT | `OwnerMenuSummary[]` |
| POST | `/api/v1/owner/menus` | JWT | created menu |
| PATCH | `/api/v1/owner/menus/:menuId` | JWT | updated menu |
| GET | `/api/v1/owner/categories` | JWT | `{ venueName, categories: CategorySummary[] }` |
| GET | `/api/v1/owner/menus/:menuId/categories` | JWT | `CategorySummary[]` |
| POST | `/api/v1/owner/menus/:menuId/categories` | JWT | created category |
| PATCH | `/api/v1/owner/menus/:menuId/categories/:categoryId` | JWT | updated category |
| GET | `/api/v1/owner/menus/:menuId/items` | JWT | `MenuItem[]` — optional query `categoryPublicId` filters by category; **404** if menu not found for venue |
| GET | `/api/v1/owner/menus/:menuId/items/:itemId` | JWT | `MenuItemEditor` |
| POST | `/api/v1/owner/menus/:menuId/items` | JWT | created item |
| PATCH | `/api/v1/owner/menus/:menuId/items/:itemId` | JWT | updated item |
| POST | `/api/v1/owner/menus/:menuId/csv-import-jobs` | JWT | multipart field **`file`** → `{ id }` job id ([csvImportJobs.ts](packages/server/src/routes/v1/csvImportJobs.ts)) |
| GET | `/api/v1/owner/menus/:menuId/csv-import-jobs/:jobId` | JWT | CSV job JSON (poll); see [CSV_IMPORT_IMPLEMENTATION.md](documentation/CSV_IMPORT_IMPLEMENTATION.md) |
| PATCH | `/api/v1/owner/menus/:menuId/csv-import-jobs/:jobId` | JWT | body `{ mapping }` → worker validates → `ready_for_review` |
| POST | `/api/v1/owner/menus/:menuId/csv-import-jobs/:jobId/commit` | JWT | enqueue commit (`202`); worker creates categories/items |

---

## UI ↔ API matrix (page-level)

| Client route / area | Data helper (client) | API (live mode) | Notes |
|---------------------|----------------------|-----------------|-------|
| `/qr/:menuId`, `/menu/:menuId` (guest menu) | `readPublicMenu(menuId)` | `GET /api/v1/public/menus/:menuId` | No JWT. Published menus only; guest payload excludes non–`visibleOnMenu` items ([mongoPublicMenuReadAdapter.ts](packages/server/src/adapters/persistence/mongo/mongoPublicMenuReadAdapter.ts)). |
| `…/filters` | — | — | Filters use React context only. |
| `…/order` | `readPublicMenu(menuId)` | `GET /api/v1/public/menus/:menuId` | Cart line labels/prices match the same published menu as the guest menu route (`Suspense` + `use()`). |
| `/login` | — | `POST /api/v1/auth/login` | Owner shell redirects here when unauthenticated. |
| `/`, `/menus` | `readOwnerMenus()` | `GET /api/v1/owner/menus` | JWT. **Archive / Restore** (live): `patchMenu` → `PATCH .../owner/menus/:menuId` (`isActive`), then `clearReadCaches()` + Suspense remount. **Overview — Create menu** (live): `createMenu` → `POST /api/v1/owner/menus`. |
| `/menus/:menuId` | `readOwnerMenuCategories(menuId)` | `GET /api/v1/owner/menus/:menuId/categories` + `GET /api/v1/owner/menus` + `GET /api/v1/owner/categories` (for `venueName`) | Categories endpoint returns an array only; client composes `OwnerMenuCategoriesData` (`menuName` from menus list, `venueName` from `/owner/categories`). |
| `/categories` | `readOwnerCategories()` | `GET /api/v1/owner/categories` | Matches `OwnerCategoriesData`. |
| `/menus/:menuId/category/:categoryId` | `readOwnerCategoryPage(menuId, categoryId)` | `GET .../menus/:menuId/categories` (find row) + `GET .../menus/:menuId/items?categoryPublicId=:categoryId` | Owner item list includes **all** visibility states. **Row visibility toggle** (live): `patchItem` → `PATCH .../items/:itemId` (`visibleOnMenu`). |
| `/menus/:menuId/items/:itemId/edit` | `readItemEditor(menuId, itemId)` | `GET /api/v1/owner/menus/:menuId/items/:itemId` | JWT. **Save / hide from guest menu** (live): `patchItem` → `PATCH .../items/:itemId`, then `clearReadCaches()` + navigate. |
| `/items/new` | local empty editor | `POST /api/v1/owner/menus/:menuId/items` | Live: **Add menu item** calls `createItem` (requires `menuId` + `categoryPublicId` in location state). |
| Add Category modal | — | `POST /api/v1/owner/menus/:menuId/categories` | Live: `createCategory` from `CategoryCreateModalContext`; `/menus/:menuId` passes `menuId`; `/categories` opens a **menu** picker then posts. |
| `/menus/:menuId/import/csv` | `createCsvImportJob` after file pick (live) | `POST .../csv-import-jobs` (multipart) | Then navigate to `.../:jobId/map`. Mock: navigate to `.../local/map` with client-parsed headers ([CsvStep1Page](packages/client/src/pages/owner/csv/CsvStep1Page.tsx)). |
| `/menus/:menuId/import/csv/:jobId/map` | `fetchCsvImportJob` (poll), `patchCsvImportMapping` | `GET` / `PATCH .../csv-import-jobs/:jobId` | Poll until `awaiting_mapping`. |
| `/menus/:menuId/import/csv/:jobId/review` | `fetchCsvImportJob` (poll), `commitCsvImportJob`, `clearReadCaches` | `GET` / `POST .../commit` | Poll until `ready_for_review`. Mock step 3: `readCsvPreview()` only. |
| Legacy `/import/csv` | — | — | Redirects to **`/menus/create`**. |
| Scan steps 1–3 | `readScanDraft()` | — | Same. |

---

## Owner category page (historical gap)

Previously the mock built the category table from the **public** menu shape. The public API only returns items with **`visibleOnMenu: true`**, so it was unsuitable for a true owner listing.

**Resolution (2026-04-08):** `GET /api/v1/owner/menus/:menuId/items?categoryPublicId=...` returns full menu rows for that category (and venue), including hidden items.

---

## Related docs

- [packages/server/README.md](packages/server/README.md) — run, seed, env, route summary, **two-terminal** local flow.
- [packages/client/README.md](packages/client/README.md) — dev, `VITE_*`, **Using the real API**, link back here.
- [documentation/STATUS.md](documentation/STATUS.md) — high-level monorepo status (planning docs in `documentation/`).
- [documentation/CSV_IMPORT_IMPLEMENTATION.md](documentation/CSV_IMPORT_IMPLEMENTATION.md) — CSV job state machine and limits.
