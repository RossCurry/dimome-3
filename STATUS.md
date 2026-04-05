# DiMoMe v3 — what has been done

Snapshot of work completed in `dimome3` (product planning + frontend client scaffold). For full requirements and future scope, see [REQUIREMENTS.md](./REQUIREMENTS.md) and [OUTLINE.md](./OUTLINE.md).

---

## Repository layout

| Path | Purpose |
|------|--------|
| [`package.json`](./package.json) | npm **workspaces** (`packages/*`), scripts: `dev`, `build`, `lint` (all target the client) |
| [`.nvmrc`](./.nvmrc) / [`.node-version`](./.node-version) | **Node.js 24** (major pin) |
| [`packages/client/`](./packages/client/) | Canonical **Vite + React** app |
| [`prototype/`](./prototype/) | Earlier experiment; **unchanged** — not the active client |
| [`design/`](./design/) | HTML references + [`design/emerald_hearth/DESIGN.md`](./design/emerald_hearth/DESIGN.md) (design system spec) |

---

## Planning documents

- **[OUTLINE.md](./OUTLINE.md)** — Monorepo direction, stack choices (Express + Mongo later, R2, JWT, REST, AI menu parse, etc.).
- **[REQUIREMENTS.md](./REQUIREMENTS.md)** — Product requirements derived from outline + design mocks (guest vs owner, CSV/AI flows, allergens, MVP hints).

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

**Owner** (`OwnerLayout` at `/` — **sidebar** on `md+`: Overview, Menus, Categories, …):

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
| `/qr/:menuId`, `/menu/:menuId` | Menu — search, categories, filters, add to order |
| `…/filters` | Allergen filters |
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

## Build & run

From `dimome3` (with Node 24 active):

```bash
npm install
npm run dev        # client dev server
npm run build      # client production build
```

---

## Not done yet (by design / later)

- **`packages/server`** (Express, MongoDB, JWT, REST, R2 presigns, real CSV/AI pipelines).
- **Shared `packages/types`** package (optional).
- **Production deploy**, auth against a backend, persistence of edits/imports.
- **Removing or merging** `prototype/` — left as reference only.

---

*Last updated: owner shell with sidebar + routes above; guest QR `/qr/:menuId` (+ `/menu/:menuId` alias); legacy `/owner/*` redirect.*
