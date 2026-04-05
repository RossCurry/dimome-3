# DiMoMe — `packages/client`

Vite + React 19 + TypeScript + Tailwind v4 + React Router 7 (`react-router-dom`). Owner and guest flows use **in-memory mocks** (`src/mocks/`) with artificial delays; swap `mockApi.ts` for real `fetch` calls when the Express API exists.

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

- **Owner dashboard (MVP home):** [http://localhost:5173/](http://localhost:5173/)
- **Guest menu (QR URL):** [http://localhost:5173/qr/menu-1](http://localhost:5173/qr/menu-1) — replace `menu-1` with the published menu id. Readable alias: `/menu/menu-1`.

Old `/owner/...` links redirect to the same path without `/owner`.

## Placeholder image

All mock dishes use `public/images/placeholder-dish.jpg` (see `src/mocks/constants.ts` `PLACEHOLDER_IMAGE`). Replace that file to change the shared photo.

## Suspense

- **Route-level:** lazy-loaded pages with skeleton fallbacks in `src/router.tsx`.
- **Data-level:** `React.use()` + `Suspense` around `readPublicMenu(menuId)`, `readCsvPreview()`, `readScanDraft()`, etc., in page components.

## Design tokens

Semantic colors and fonts follow `../../design/emerald_hearth/DESIGN.md` (see `src/index.css` `@theme`).
