# DiMoMe v3 — what has been done

Snapshot of work completed in `dimome3` (product planning + **client + initial API**). For full requirements and future scope, see [REQUIREMENTS.md](./REQUIREMENTS.md) and [OUTLINE.md](./OUTLINE.md).

---

## Repository layout

| Path | Purpose |
|------|--------|
| [`package.json`](./package.json) | npm **workspaces** (`packages/*`): `dev` / `build` / `lint` run **client + server**; also `dev:server`, `db:seed`, etc. |
| [`docker-compose.yml`](./docker-compose.yml) | **MongoDB 7** for local dev (port 27017, named volume, healthcheck) |
| [`.env.example`](./.env.example) | Template for `dimome3/.env` (`MONGODB_URI`, `JWT_SECRET`, `PORT`, …) |
| [`.nvmrc`](./.nvmrc) / [`.node-version`](./.node-version) | **Node.js 24** (major pin) |
| [`packages/client/`](./packages/client/) | Canonical **Vite + React** app (still backed by **mocks**; API not wired in UI yet) |
| [`packages/server/`](./packages/server/) | **Express** API — see [packages/server/README.md](./packages/server/README.md) |
| [`prototype/`](./prototype/) | Earlier experiment; **unchanged** — not the active client |
| [`design/`](./design/) | HTML references + [`design/emerald_hearth/DESIGN.md`](./design/emerald_hearth/DESIGN.md) (design system spec) |

---

## Planning documents

- **[OUTLINE.md](./OUTLINE.md)** — Monorepo direction, stack choices (Express + Mongo later, R2, JWT, REST, AI menu parse, etc.).
- **[REQUIREMENTS.md](./REQUIREMENTS.md)** — Product requirements derived from outline + design mocks (guest vs owner, CSV/AI flows, allergens, MVP hints).
- **[BACKEND_REQUIREMENTS.md](./BACKEND_REQUIREMENTS.md)** — Server stack (Express, **native Mongo driver**, no Mongoose v1), REST `/api/v1/`, ports/adapters, async jobs (polling → SSE/Redis → optional RabbitMQ), **Docker Compose** for **Mongo** (and later Redis/RabbitMQ) with **API on host** for local dev.
- **[BE_PLAN.md](./BE_PLAN.md)** — Step-by-step backend build checklist (Phases A–F) before/during implementation.

---

## `packages/client` — implemented

### Stack

- **Vite 6**, **React 19**, **TypeScript**, **Tailwind CSS v4** (`@tailwindcss/vite`)
- **React Router 7** (`react-router-dom`)
- **lucide-react** for icons
- **`engines.node`**: `>=24.0.0 <25` (mirrors workspace expectation)
- **`@types/node`**: ^24

### Styling

- [`src/index.css`](./packages/client/src/index.css) — `@theme` tokens aligned with **Emerald Hearth** / DESIGN.md (surfaces, primary, tertiary, fonts **Inter** + **Epilogue** via `index.html`).

### Data (all mocked)

- No Express server in this package; **no real API**.
- [`src/mocks/`](./packages/client/src/mocks/) — `delay.ts`, `fixtures.ts`, `constants.ts` (EU allergen labels, `PLACEHOLDER_IMAGE`), `mockApi.ts` (promises for `React.use()` + caching where useful).
- **One shared dish image** for every mock item: [`public/images/placeholder-dish.jpg`](./packages/client/public/images/placeholder-dish.jpg).
- **Public menu** is loaded by **`readPublicMenu(menuId)`** — same catalog in mocks for any id today; QR URLs carry the id for future API scoping.

### Routing (`createBrowserRouter`)

**MVP default:** `/` is the **owner** app (dashboard). **Guest** routes use **`/qr/:menuId`** for QR (`https://<host>/qr/<menuId>`) and **`/menu/:menuId`** as a readable alias.

**Owner** (`OwnerLayout` at `/` — **sidebar** on `md+`: Overview, Menus, Categories, …; **below `md`** the sidebar is hidden and a **header menu icon** opens a **slide-in drawer** from the left with scrim, close control, **Escape** to dismiss, and **body scroll lock** while open):

| Route | Page |
|-------|------|
| `/` | Overview — active (+ archived) menus, quick actions |
| `/menus` | All menus list (active / archived) |
| `/menus/:menuId` | Menu hub — categories for that menu only |
| `/menus/:menuId/category/:categoryId` | Category — item table; visibility toggle (mock local state) |
| `/categories` | All categories across menus + Add Category modal |
| `/items/new` | New menu item (from modal or category page) |
| `/items/:itemId/edit` | Item editor + **sliding action footer** (Save → mock persist + back to category) |
| `/import/csv` | CSV wizard step 1 |
| `/import/csv/map` | Step 2 — column mapping + preview (`CsvImportContext`) |
| `/import/csv/review` | Step 3 — mock rows + `readCsvPreview()` |
| `/import/scan` | AI scan step 1 |
| `/import/scan/progress` | Step 2 — fake progress → auto navigate |
| `/import/scan/review` | Step 3 — editable table from `readScanDraft()` |

**Owner UI primitives (for reuse):** `OwnerSlidingActionFooter`, `OwnerConfirmDialog` (dialog **not** wired yet — reserved for confirm/summary flows).

**Guest** (`GuestLayout` at **`/qr/:menuId`** or **`/menu/:menuId`** — same subtree; `GuestPreferencesProvider` keyed by `menuId`):

| Route | Page |
|-------|------|
| `/qr/:menuId`, `/menu/:menuId` | Menu — search, categories, filters, add to order; **empty state** when allergen filters hide every visible dish (`GuestMenuFilterEmptyState`); separate copy for no search hits / empty category |
| `…/filters` | Allergen filters — header **Clear filters**, **Save choices** (back to menu); **notification timing/state** (`showSnack` / dismiss / timers) kept for future UI — `GuestFilterSnackbar` exists but is not mounted |
| `…/order` | My order stub |

**Legacy:** `/owner/*` redirects to the same path **without** the `/owner` prefix (e.g. `/owner/menus/x` → `/menus/x`).

Catch-all `*` → redirect `/`.

Small **Owner** link on the guest menu points to `/` (dashboard).

### Loading / Suspense

- **Route-level:** `React.lazy` pages with **skeleton fallbacks** in [`src/router.tsx`](./packages/client/src/router.tsx).
- **Data-level:** `use()` on delayed mock promises (e.g. `readPublicMenu(menuId)`, `readOwnerMenus`, `readOwnerCategories`, `readOwnerCategoryPage`, item editor); inner **Suspense** + [`TableRowsSkeleton`](./packages/client/src/components/skeletons/TableRowsSkeleton.tsx) for CSV review and scan review tables.
- Reusable primitives under [`src/components/skeletons/`](./packages/client/src/components/skeletons/).

### Types

- [`src/types/index.ts`](./packages/client/src/types/index.ts) — `PublicMenuData` includes **`menuId`**; owner dashboard summary, editor shape, CSV mapping/preview, scan draft rows, etc.

### Docs

- [`packages/client/README.md`](./packages/client/README.md) — how to run, mocks, placeholder image, Suspense notes.

---

## `packages/server` — implemented (initial slice)

- **Stack:** Express, TypeScript (ESM), **native `mongodb`**, `dotenv`, `cors`, `bcryptjs`, `jsonwebtoken`.
- **Layout:** `ports/`, `adapters/persistence/mongo/`, `routes/v1/`, `domain/`, `http/errors`, `middleware/requireAuth`, `services/authService`.
- **Endpoints:** `GET /api/v1/health` (incl. DB ping); **`GET /api/v1/public/menus/:menuId`** (published menus only, `PublicMenuData`-shaped JSON); **`POST /api/v1/auth/login`**; **`/api/v1/owner/*`** (JWT): menus list/create/patch, categories list/create/patch, items get/create/patch.
- **Tooling:** `npm run db:seed` — resets collections and loads data aligned with client fixtures (`menu-1`, demo user **`dev@dimome.local` / `password`**).
- **Docs:** [packages/server/README.md](./packages/server/README.md).

**Still mocked in the SPA:** owner/guest pages continue to use `src/mocks/mockApi.ts` until the client is pointed at the API (proxy / `VITE_API_URL`).

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

- **Client → API:** replace mocks with `fetch`, CORS/proxy, Bearer token for owner routes.
- **R2** presigned uploads, **CSV / AI** job documents + worker + **polling** ([BACKEND_REQUIREMENTS.md §7](./BACKEND_REQUIREMENTS.md)).
- **SSE + Redis**, optional **RabbitMQ**; JWT **refresh** / revocation hardening.
- **Shared `packages/types`** (optional).
- **Production deploy** (managed Mongo, etc.).
- **Removing or merging** `prototype/` — left as reference only.

---

## Changelog (since prior doc refresh)

| Area | Change |
|------|--------|
| **Guest — menu** | `GuestMenuFilterEmptyState` when the current category/search would show dishes but **all are hidden by allergen filters**; other empty states for **no search matches** and **empty section**. |
| **Guest — filters** | Sticky header: **Clear filters** (disabled when none active), **Save choices** (return to parent menu). Snackbar **UI removed**; **`showSnack` / `dismissSnack` / auto-clear timer** still run on toggles for future notifications; **`GuestFilterSnackbar`** component left in repo for reuse. |
| **Owner — responsive** | `OwnerSidebar` is **`mobileOpen` / `onMobileOpenChange`** from `OwnerLayout`; mobile overlay **`z-[80]`** above the sticky header. |
| **Git (repo root)** | Root **`.gitignore`**: `node_modules/`, `dimome1/`, `Dimome2/`. Removed from the index (not from disk): nested **gitlinks** under `dimome1/` + `Dimome2`, and hoisted **`dimome3/node_modules`** (~6k files) so they are no longer pushed to GitHub. |
| **Backend / infra (docs)** | [BACKEND_REQUIREMENTS.md](./BACKEND_REQUIREMENTS.md) **§3**: **Docker Compose** under `dimome3/` for **Mongo** (and later Redis/RabbitMQ via **profiles**); **Express on host** for local dev. [REQUIREMENTS.md](./REQUIREMENTS.md) **§5** cross-reference. |
| **Backend — first code slice** | [packages/server](./packages/server/): **docker-compose.yml** + **.env.example**, Express **`/api/v1/`**, Mongo **ports/adapters**, **JWT** login, **public menu** + **owner CRUD** routes, **`db:seed`**. [BE_PLAN.md](./BE_PLAN.md) Phases **A–F** checked off for shipped work; **R2 / jobs / SSE** remain future. |

---

*Last updated: 2026-04-07 — **`packages/server`** initial API (health, public menu, auth, owner menus/categories/items), **Compose + seed**; client still on mocks until wired to backend.*
