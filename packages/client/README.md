# DiMoMe — `packages/client`

Vite + React 19 + TypeScript + Tailwind v4 + React Router. Owner and guest flows use **in-memory mocks** (`src/mocks/`) with artificial delays; swap `mockApi.ts` for real `fetch` calls when the Express API exists.

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

- **Guest menu:** [http://localhost:5173/](http://localhost:5173/)
- **Owner dashboard:** [http://localhost:5173/owner](http://localhost:5173/owner)

## Placeholder image

All mock dishes use `public/images/placeholder-dish.jpg` (see `src/mocks/constants.ts` `PLACEHOLDER_IMAGE`). Replace that file to change the shared photo.

## Suspense

- **Route-level:** lazy-loaded pages with skeleton fallbacks in `src/router.tsx`.
- **Data-level:** `React.use()` + `Suspense` around `readPublicMenu()`, `readCsvPreview()`, `readScanDraft()`, etc., in page components.

## Design tokens

Semantic colors and fonts follow `../../design/emerald_hearth/DESIGN.md` (see `src/index.css` `@theme`).
