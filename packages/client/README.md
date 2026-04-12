# DiMoMe — `packages/client`

Vite + React 19 + TypeScript + Tailwind v4 + React Router 7 (`react-router-dom`). The owner app and guest menu call the **Express API** via `src/api/` and cached readers in `src/mocks/mockApi.ts`. **CSV import** uses **`/menus/:menuId/import/csv/...`** and [`src/api/csvImportJobs.ts`](src/api/csvImportJobs.ts) against **`csv-import-jobs`** endpoints. **AI scan** steps use **fixture data** in `mockApi` until a scan API exists.

## Using the real API

1. From `dimome3/`: `docker compose up -d`, copy `.env.example` → `.env`, run `npm run db:seed`, then `npm run dev:server` (API on `:3000`) and `npm run dev --workspace=client` (Vite on `:5173`).
2. **Proxy:** Vite forwards `/api` → `http://localhost:3000`, so the browser can use same-origin `/api/v1/...` when **`VITE_API_URL` is unset** (see [`vite.config.ts`](vite.config.ts)).
3. Optional **`VITE_API_URL`** (e.g. `http://localhost:3000`) if you prefer calling the API origin directly (CORS already allows the dev client).
4. **UI ↔ routes:** [CLIENT_API_MAP_2026-04-08.md](../../CLIENT_API_MAP_2026-04-08.md) (includes CSV job routes). **Sign in:** `/login` — seed user `dev@dimome.local` / `password` after `db:seed`.
5. **CSV details:** [CSV_IMPORT_IMPLEMENTATION.md](../../documentation/CSV_IMPORT_IMPLEMENTATION.md).

## Run

Use **Node.js 24** (see `../../.nvmrc` and `../../.node-version`; run `nvm use` / `fnm use` in `dimome3`).

From repo root:

```bash
cd dimome3 && npm install
npm run dev --workspace=client
```

Or from this package:

```bash
npm run dev
```

- **Owner app (MVP home — overview):** [http://localhost:5173/](http://localhost:5173/) redirects to **`/login`** until you sign in; then `/`, `/menus`, `/categories`, `/menus/:menuId`, etc.
- **Guest menu (QR URL):** [http://localhost:5173/qr/menu-1](http://localhost:5173/qr/menu-1) — replace `menu-1` with the published menu id. Readable alias: `/menu/menu-1`.

Old `/owner/...` links redirect to the same path without `/owner`.

## Placeholder image

Default dish images use `public/images/placeholder-dish.jpg` (see `src/mocks/constants.ts` `PLACEHOLDER_IMAGE`). Replace that file to change the shared photo.

## Suspense

- **Route-level:** lazy-loaded pages with skeleton fallbacks in `src/router.tsx`.
- **Data-level:** `React.use()` + `Suspense` around `readPublicMenu(menuId)`, `readOwnerMenus()`, `readScanDraft()`, etc., in page components.

## Design tokens

Semantic colors and fonts follow `../../design/emerald_hearth/DESIGN.md` (see `src/index.css` `@theme`).

## Product notes (recent)

Documented in detail in [`../../documentation/STATUS.md`](../../documentation/STATUS.md). Short list:

- **Guest menu:** empty card when filters hide every dish that would otherwise appear for the current search/category; different messaging for empty search vs empty category.
- **Guest filters:** header **Clear filters** / **Save choices**; in-page notification **logic** (`showSnack`, timers) without a visible snackbar for now — see `GuestFilterSnackbar.tsx` to re-enable.
- **Owner:** below the `md` breakpoint, a **menu** icon in the top bar opens the **sidebar as a left drawer** (scrim, slide transition, Escape closes).
