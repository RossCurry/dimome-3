# DiMoMe — `packages/client`

Vite + React 19 + TypeScript + Tailwind v4 + React Router 7 (`react-router-dom`). Owner and guest flows still use **in-memory mocks** (`src/mocks/`) with artificial delays. An Express API now lives in **`packages/server`** — see [`../server/README.md`](../server/README.md). Wiring `fetch` + proxy / `VITE_API_URL` is the next step.

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

- **Owner app (MVP home — overview):** [http://localhost:5173/](http://localhost:5173/) — also `/menus`, `/categories`, `/menus/:menuId`, etc.
- **Guest menu (QR URL):** [http://localhost:5173/qr/menu-1](http://localhost:5173/qr/menu-1) — replace `menu-1` with the published menu id. Readable alias: `/menu/menu-1`.

Old `/owner/...` links redirect to the same path without `/owner`.

## Placeholder image

All mock dishes use `public/images/placeholder-dish.jpg` (see `src/mocks/constants.ts` `PLACEHOLDER_IMAGE`). Replace that file to change the shared photo.

## Suspense

- **Route-level:** lazy-loaded pages with skeleton fallbacks in `src/router.tsx`.
- **Data-level:** `React.use()` + `Suspense` around `readPublicMenu(menuId)`, `readCsvPreview()`, `readScanDraft()`, etc., in page components.

## Design tokens

Semantic colors and fonts follow `../../design/emerald_hearth/DESIGN.md` (see `src/index.css` `@theme`).

## Product notes (recent)

Documented in detail in [`../../STATUS.md`](../../STATUS.md). Short list:

- **Guest menu:** empty card when filters hide every dish that would otherwise appear for the current search/category; different messaging for empty search vs empty category.
- **Guest filters:** header **Clear filters** / **Save choices**; in-page notification **logic** (`showSnack`, timers) without a visible snackbar for now — see `GuestFilterSnackbar.tsx` to re-enable.
- **Owner:** below the `md` breakpoint, a **menu** icon in the top bar opens the **sidebar as a left drawer** (scrim, slide transition, Escape closes).
