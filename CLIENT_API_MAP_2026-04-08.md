# Client ↔ API mapping (DiMoMe v3)

**Last updated:** 2026-04-08

Single source of truth for which HTTP routes power which UI areas. Canonical route summary: [packages/server/README.md](packages/server/README.md). Product types on the client: [packages/client/src/types/index.ts](packages/client/src/types/index.ts). Server DTOs: [packages/server/src/domain/menu.ts](packages/server/src/domain/menu.ts).

---

## Base URL and environment

- All API routes are under **`/api/v1/`** (see [createApp.ts](packages/server/src/createApp.ts)).
- **Local client:** use Vite dev server with optional **`server.proxy`** so requests to `/api/v1/...` forward to the API (default `http://localhost:3000`), **or** set **`VITE_API_URL`** (e.g. `http://localhost:3000`) and call the API directly (CORS allows `http://localhost:5173` by default — [config.ts](packages/server/src/config.ts)).
- **Mocks:** set **`VITE_USE_MOCK_API=true`** in [packages/client/.env.example](packages/client/.env.example) to keep in-memory data (CSV/scan steps always mock until backends exist).

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

---

## UI ↔ API matrix (page-level)

| Client route / area | Data helper (client) | API (live mode) | Notes |
|---------------------|----------------------|-----------------|-------|
| `/qr/:menuId`, `/menu/:menuId` (guest menu) | `readPublicMenu(menuId)` | `GET /api/v1/public/menus/:menuId` | No JWT. Published menus only; guest payload excludes non–`visibleOnMenu` items ([mongoPublicMenuReadAdapter.ts](packages/server/src/adapters/persistence/mongo/mongoPublicMenuReadAdapter.ts)). |
| `…/filters`, `…/order` | — | — | Filters use React context only; order stub. |
| `/login` | — | `POST /api/v1/auth/login` | Owner shell redirects here when unauthenticated. |
| `/`, `/menus` | `readOwnerMenus()` | `GET /api/v1/owner/menus` | JWT. |
| `/menus/:menuId` | `readOwnerMenuCategories(menuId)` | `GET /api/v1/owner/menus/:menuId/categories` + `GET /api/v1/owner/menus` + `GET /api/v1/owner/categories` (for `venueName`) | Categories endpoint returns an array only; client composes `OwnerMenuCategoriesData` (`menuName` from menus list, `venueName` from `/owner/categories`). |
| `/categories` | `readOwnerCategories()` | `GET /api/v1/owner/categories` | Matches `OwnerCategoriesData`. |
| `/menus/:menuId/category/:categoryId` | `readOwnerCategoryPage(menuId, categoryId)` | `GET .../menus/:menuId/categories` (find row) + `GET .../menus/:menuId/items?categoryPublicId=:categoryId` | Owner item list includes **all** visibility states; avoids using the public menu for staff tables. |
| `/menus/:menuId/items/:itemId/edit` | `readItemEditor(menuId, itemId)` | `GET /api/v1/owner/menus/:menuId/items/:itemId` | JWT. |
| `/items/new` | local empty state | `POST /api/v1/owner/menus/:menuId/items` | Wire on save when mutations are implemented. |
| CSV steps 1–3 | `readCsvPreview()` | — | No backend yet ([BACKEND_REQUIREMENTS.md](BACKEND_REQUIREMENTS.md) §7). |
| Scan steps 1–3 | `readScanDraft()` | — | Same. |

---

## Owner category page (historical gap)

Previously the mock built the category table from the **public** menu shape. The public API only returns items with **`visibleOnMenu: true`**, so it was unsuitable for a true owner listing.

**Resolution (2026-04-08):** `GET /api/v1/owner/menus/:menuId/items?categoryPublicId=...` returns full menu rows for that category (and venue), including hidden items.

---

## Related docs

- [packages/server/README.md](packages/server/README.md) — run, seed, env, route summary.
- [packages/client/README.md](packages/client/README.md) — dev, `VITE_*`, link back here.
- [STATUS.md](STATUS.md) — high-level monorepo status.
