# DiMoMe v3 — what has been done

Snapshot of work completed in `dimome3` (product planning + **client + initial API**). **Planning docs** (this file, BE_PLAN, BACKEND_REQUIREMENTS, etc.) live under [`documentation/`](./). The dated **UI ↔ API** map is at the workspace root: [`CLIENT_API_MAP_2026-04-08.md`](../CLIENT_API_MAP_2026-04-08.md).

For full requirements and future scope, see [REQUIREMENTS.md](./REQUIREMENTS.md) and [OUTLINE.md](./OUTLINE.md).

---

## Repository layout

| Path | Purpose |
|------|--------|
| [`package.json`](../package.json) | npm **workspaces** (`packages/*`): `dev` / `build` / `lint` run **jobs + client + server**; also `dev:server`, `db:seed`, etc. |
| [`packages/jobs/`](../packages/jobs/) | **CSV import job** persistence (`MongoCsvImportJobStore`) + generic **`startWorkerLoop`** (used by the API process) |
| [`docker-compose.yml`](../docker-compose.yml) | **MongoDB 7** for local dev (port 27017, named volume, healthcheck) |
| [`.env.example`](../.env.example) | Template for `dimome3/.env` (`MONGODB_URI`, `JWT_SECRET`, `PORT`, …) |
| [`.nvmrc`](../.nvmrc) / [`.node-version`](../.node-version) | **Node.js 24** (major pin) |
| [`packages/client/`](../packages/client/) | Canonical **Vite + React** app — **API-backed** by default; optional `VITE_USE_MOCK_API=true` for fixtures ([CLIENT_API_MAP_2026-04-08.md](../CLIENT_API_MAP_2026-04-08.md)) |
| [`packages/server/`](../packages/server/) | **Express** API — see [packages/server/README.md](../packages/server/README.md) |
| [`prototype/`](../prototype/) | Earlier experiment; **unchanged** — not the active client |
| [`design/`](../design/) | HTML references + [`design/emerald_hearth/DESIGN.md`](../design/emerald_hearth/DESIGN.md) (design system spec) |

---

## Planning documents

- **[OUTLINE.md](./OUTLINE.md)** — Monorepo direction, stack choices (Express + Mongo later, R2, JWT, REST, AI menu parse, etc.).
- **[REQUIREMENTS.md](./REQUIREMENTS.md)** — Product requirements derived from outline + design mocks (guest vs owner, CSV/AI flows, allergens, MVP hints).
- **[BACKEND_REQUIREMENTS.md](./BACKEND_REQUIREMENTS.md)** — Server stack (Express, **native Mongo driver**, no Mongoose v1), REST `/api/v1/`, ports/adapters, async jobs (polling → SSE/Redis → optional RabbitMQ), **Docker Compose** for **Mongo** (and later Redis/RabbitMQ) with **API on host** for local dev.
- **[BE_PLAN.md](./BE_PLAN.md)** — Step-by-step backend build checklist (Phases A–F + CSV jobs) before/during implementation.
- **[CSV_IMPORT_IMPLEMENTATION.md](./CSV_IMPORT_IMPLEMENTATION.md)** — CSV job state machine, REST routes, limits, worker.
- **[CLIENT_API_MAP_2026-04-08.md](../CLIENT_API_MAP_2026-04-08.md)** — UI routes ↔ REST endpoints (client integration).
- **[2026-04-08-BE.md](./2026-04-08-BE.md)** — same-day work log (integration + snackbar + doc layout).

---

## `packages/client` — implemented

### Stack

- **Vite 6**, **React 19**, **TypeScript**, **Tailwind CSS v4** (`@tailwindcss/vite`)
- **React Router 7** (`react-router-dom`)
- **lucide-react** for icons
- **`engines.node`**: `>=24.0.0 <25` (mirrors workspace expectation)
- **`@types/node`**: ^24

### Styling

- [`src/index.css`](../packages/client/src/index.css) — `@theme` tokens aligned with **Emerald Hearth** / DESIGN.md (surfaces, primary, tertiary, fonts **Inter** + **Epilogue** via `index.html`).

### Data (API + optional mocks)

- **Live:** [`src/api/`](../packages/client/src/api/) (`apiJson`, `ApiError`, public + owner helpers), JWT in `sessionStorage`, [`AuthContext`](../packages/client/src/context/AuthContext.tsx), [`RequireAuth`](../packages/client/src/components/owner/RequireAuth.tsx), [`SnackbarProvider`](../packages/client/src/context/SnackbarContext.tsx) + [`errorNotifier`](../packages/client/src/api/errorNotifier.ts) — failed API responses show [`GuestFilterSnackbar`](../packages/client/src/components/guest/GuestFilterSnackbar.tsx) (login uses `showErrorSnack: false` to avoid duplicate with inline form error). [`mockApi.ts`](../packages/client/src/mocks/mockApi.ts) calls the API unless **`VITE_USE_MOCK_API=true`**.
- **Fixtures:** [`src/mocks/`](../packages/client/src/mocks/) — `fixtures.ts`, `constants.ts`, artificial delays when mocks are on. **CSV** uses **live job APIs** when mocks are off; with **`VITE_USE_MOCK_API=true`**, CSV step 3 still uses fixture preview (`readCsvPreview`). **AI scan** remains mock-only until scan job APIs exist.
- **One shared dish image** for seeded/mock items: [`public/images/placeholder-dish.jpg`](../packages/client/public/images/placeholder-dish.jpg).
- **Mapping:** [CLIENT_API_MAP_2026-04-08.md](../CLIENT_API_MAP_2026-04-08.md).

### Routing (`createBrowserRouter`)

**MVP default:** `/` is the **owner** app (dashboard), **JWT required** (redirect to `/login`). **Guest** routes use **`/qr/:menuId`** for QR (`https://<host>/qr/<menuId>`) and **`/menu/:menuId`** as a readable alias.

**Owner** (`OwnerLayout` at `/` — **sidebar** on `md+`: Overview, Menus, Categories, …; **below `md`** the sidebar is hidden and a **header menu icon** opens a **slide-in drawer** from the left with scrim, close control, **Escape** to dismiss, and **body scroll lock** while open):

| Route | Page |
|-------|------|
| `/login` | Owner sign-in (`POST /api/v1/auth/login`) |
| `/` | Overview — active (+ archived) menus, quick actions |
| `/menus` | All menus list (active / archived) |
| `/menus/:menuId` | Menu hub — categories for that menu only |
| `/menus/:menuId/category/:categoryId` | Category — item table; visibility from API when live |
| `/categories` | All categories across menus + Add Category modal |
| `/items/new` | New menu item (from modal or category page) |
| `/menus/:menuId/items/:itemId/edit` | Item editor + **sliding action footer** — live API: **Save** / **hide** use `PATCH .../items/:itemId` |
| `/menus/:menuId/import/csv` | CSV step 1 — `POST` job + upload (live) or mock entry |
| `/menus/:menuId/import/csv/:jobId/map` | Step 2 — column mapping (polls `GET` job until `awaiting_mapping`) |
| `/menus/:menuId/import/csv/:jobId/review` | Step 3 — review + `POST …/commit` (live) or `readCsvPreview()` (mock) |
| `/import/csv` | Redirects to **`/menus/create`** (legacy bookmark) |
| `/import/scan` | AI scan step 1 |
| `/import/scan/progress` | Step 2 — fake progress → auto navigate |
| `/import/scan/review` | Step 3 — editable table from `readScanDraft()` |

**Owner UI primitives (for reuse):** `OwnerSlidingActionFooter`, `OwnerConfirmDialog` (dialog **not** wired yet — reserved for confirm/summary flows).

**Guest** (`GuestLayout` at **`/qr/:menuId`** or **`/menu/:menuId`** — same subtree; `GuestPreferencesProvider` keyed by `menuId`):

| Route | Page |
|-------|------|
| `/qr/:menuId`, `/menu/:menuId` | Menu — search, categories, filters, add to order; **empty state** when allergen filters hide every visible dish (`GuestMenuFilterEmptyState`); separate copy for no search hits / empty category |
| `…/filters` | Allergen filters — header **Clear filters**, **Save choices** (back to menu); in-page **`showSnack`** logic for filter toggles (optional future UI); **global** API errors use the same `GuestFilterSnackbar` component via `SnackbarProvider` |
| `…/order` | My order — loads **`readPublicMenu(menuId)`** so totals match the guest menu (API or mocks) |

**Legacy:** `/owner/*` redirects to the same path **without** the `/owner` prefix (e.g. `/owner/menus/x` → `/menus/x`).

Catch-all `*` → redirect `/`.

Small **Owner** link on the guest menu points to `/` (dashboard).

### Loading / Suspense

- **Route-level:** `React.lazy` pages with **skeleton fallbacks** in [`src/router.tsx`](../packages/client/src/router.tsx).
- **Data-level:** `use()` on promises from `mockApi` (API or mock); inner **Suspense** + [`TableRowsSkeleton`](../packages/client/src/components/skeletons/TableRowsSkeleton.tsx) for CSV review and scan review tables.
- Reusable primitives under [`src/components/skeletons/`](../packages/client/src/components/skeletons/).

### Types

- [`src/types/index.ts`](../packages/client/src/types/index.ts) — `PublicMenuData` includes **`menuId`**; owner dashboard summary, editor shape, CSV mapping/preview, scan draft rows, optional **`visibleOnMenu`** on `MenuItem` for owner tables.

### Docs

- [`packages/client/README.md`](../packages/client/README.md) — how to run, **Using the real API**, mocks, placeholder image, Suspense notes.

---

## `packages/server` — implemented (initial slice)

- **Stack:** Express, TypeScript (ESM), **native `mongodb`**, `dotenv`, `cors`, `bcryptjs`, `jsonwebtoken`.
- **Layout:** `ports/`, `adapters/persistence/mongo/`, `routes/v1/`, `domain/`, `http/errors`, `middleware/requireAuth`, `services/authService`.
- **Endpoints:** `GET /api/v1/health` (incl. DB ping); **`GET /api/v1/public/menus/:menuId`** (published menus only, `PublicMenuData`-shaped JSON); **`POST /api/v1/auth/login`**; **`/api/v1/owner/*`** (JWT): menus list/create/patch, categories list/create/patch, items **list** (optional `?categoryPublicId=`), get/create/patch; **CSV import jobs** under **`/api/v1/owner/menus/:menuId/csv-import-jobs`** (multipart create, `GET`/`PATCH`/`POST …/commit`). In-process **worker loop** advances job states (see [CSV_IMPORT_IMPLEMENTATION.md](./CSV_IMPORT_IMPLEMENTATION.md)).
- **Tooling:** `npm run db:seed` — resets collections and loads data aligned with client fixtures (`menu-1`, demo user **`dev@dimome.local` / `password`**).
- **Docs:** [packages/server/README.md](../packages/server/README.md) — includes **Run API + Vite client together** (two terminals, proxy, URLs).

**Client:** default uses the API via `mockApi.ts` + `src/api/`; set **`VITE_USE_MOCK_API=true`** to force fixtures. **CSV** is **API-backed** when mocks are off; **AI scan** steps remain mock-only.

---

## Build & run

From `dimome3` (with Node 24 active):

```bash
docker compose up -d    # Mongo (first time / when DB needed)
cp .env.example .env     # set MONGODB_URI + JWT_SECRET
npm install
npm run db:seed          # optional: demo data
npm run dev              # Vite client
npm run dev:server       # API (default :3000) — separate terminal
npm run build            # client + server
```

---

## Not done yet (by design / later)

- **Client → API:** guest + owner reads + login are wired; **owner mutations** for items, categories, and menus (create/patch/archive) call the API when mocks are off. **CSV import** is wired to **job APIs** when mocks are off ([CSV_IMPORT_IMPLEMENTATION.md](./CSV_IMPORT_IMPLEMENTATION.md)). **AI scan** remains mock-only until scan job APIs exist.
- **R2** presigned uploads; **AI scan** job pipeline; **SSE + Redis** ([BACKEND_REQUIREMENTS.md §7](./BACKEND_REQUIREMENTS.md)).
- **SSE + Redis**, optional **RabbitMQ**; JWT **refresh** / revocation hardening.
- **Shared `packages/types`** (optional).
- **Production deploy** (managed Mongo, etc.).
- **Removing or merging** `prototype/` — left as reference only.

---

## Changelog (since prior doc refresh)

| Area | Change |
|------|--------|
| **2026-04-08 — Owner writes (client)** | Guest **`/order`** uses **`readPublicMenu`**. Item editor **`patchItem`**; new item **`createItem`**; category modal **`createCategory`** (menu picker on `/categories`); category table **`visibleOnMenu`** via **`patchItem`**. Overview **Create menu** / menus list **Archive·Restore** via **`createMenu`** / **`patchMenu`**. |
| **2026-04-08 — Client ↔ API** | Vite **`/api` proxy**, `apiJson` / **`ApiError`**, optional **`VITE_API_URL`** / **`VITE_USE_MOCK_API`**. **`/login`**, JWT **`sessionStorage`**, **`RequireAuth`**, owner + guest reads via **`mockApi`** → API. Item editor route **`/menus/:menuId/items/:itemId/edit`**. Server **`GET /api/v1/owner/menus/:menuId/items`** (optional **`categoryPublicId`**). [CLIENT_API_MAP_2026-04-08.md](../CLIENT_API_MAP_2026-04-08.md). |
| **2026-04-08 — API errors UI** | **`SnackbarProvider`** registers **`errorNotifier`**; **`apiJson`** shows **`GuestFilterSnackbar`** on failed requests (login **`showErrorSnack: false`**). Network failures show a short “API running?” message. |
| **2026-04-08 — Docs / repo** | Planning markdown consolidated under **`documentation/`**; root **`.gitignore`** extended with **`dist/`**, **`build/`**, **`out/`**, **`*.tsbuildinfo`**. [packages/server/README.md](../packages/server/README.md) — **Run API + Vite client together**. |
| **Guest — menu** | `GuestMenuFilterEmptyState` when the current category/search would show dishes but **all are hidden by allergen filters**; other empty states for **no search matches** and **empty section**. |
| **Guest — filters** | Sticky header: **Clear filters**, **Save choices**. In-page **`showSnack`** on toggles; **global** snackbar reuse for API errors (see above). |
| **Owner — responsive** | `OwnerSidebar` is **`mobileOpen` / `onMobileOpenChange`** from `OwnerLayout`; mobile overlay **`z-[80]`** above the sticky header. |
| **Git (repo root)** | Root **`.gitignore`**: `node_modules/`, `dimome1/`, `Dimome2/`, build output dirs. (Historical) nested gitlinks / hoisted `node_modules` cleanup. |
| **Backend / infra (docs)** | [BACKEND_REQUIREMENTS.md](./BACKEND_REQUIREMENTS.md) **§3**: **Docker Compose** under `dimome3/` for **Mongo** (and later Redis/RabbitMQ via **profiles**); **Express on host** for local dev. [REQUIREMENTS.md](./REQUIREMENTS.md) **§5** cross-reference. |
| **Backend — first code slice** | [packages/server](../packages/server/): **docker-compose.yml** + **.env.example**, Express **`/api/v1/`**, Mongo **ports/adapters**, **JWT** login, **public menu** + **owner CRUD** routes, **`db:seed`**. [BE_PLAN.md](./BE_PLAN.md) Phases **A–F** checked off; **R2 / jobs / SSE** remain future. |
| **2026-04-12 — CSV import jobs** | New workspace **[`packages/jobs`](../packages/jobs/)** (`MongoCsvImportJobStore`, `startWorkerLoop`). Server: **`csv-parse`**, **`multer`**, owner **`csv-import-jobs`** routes, **`processCsvImportTick`** worker in API process. Client: nested **`/menus/:menuId/import/csv/...`**, [`csvImportJobs.ts`](../packages/client/src/api/csvImportJobs.ts), hub **Upload CSV** creates draft menu then opens import. Docs: [CSV_IMPORT_IMPLEMENTATION.md](./CSV_IMPORT_IMPLEMENTATION.md). |

---

*Last updated: 2026-04-12 — **CSV import (job + polling)** live; **`packages/jobs`**; see [CSV_IMPORT_IMPLEMENTATION.md](./CSV_IMPORT_IMPLEMENTATION.md).*
