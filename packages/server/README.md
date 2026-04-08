# DiMoMe — `packages/server`

Express + TypeScript + **native MongoDB driver** (`mongodb`). REST API under **`/api/v1/`**. Persistence follows **ports** (`src/ports/`) and **Mongo adapters** (`src/adapters/persistence/mongo/`). See [BACKEND_REQUIREMENTS.md](../../documentation/BACKEND_REQUIREMENTS.md) and [BE_PLAN.md](../../documentation/BE_PLAN.md).

## Prerequisites

- **Node.js 24** (same as workspace).
- **MongoDB** — local Docker: from `dimome3/` run `docker compose up -d` (see root [docker-compose.yml](../../docker-compose.yml)).

## Environment

Copy [`.env.example`](../../.env.example) to **`dimome3/.env`** (workspace root). Minimum for the API:

- `MONGODB_URI` — e.g. `mongodb://localhost:27017/dimome`
- `JWT_SECRET` — any non-empty string in dev
- `PORT` — optional, default `3000`

`loadEnv` resolves **`dimome3/.env`** when you run the server from the workspace.

## Scripts (from `dimome3/`)

```bash
npm run dev:server      # tsx watch
npm run build:server    # tsc → dist/
npm run lint:server
npm run db:seed         # reset collections + seed demo data (needs Mongo only)
```

Or from this package: `npm run dev`, `npm run db:seed`, etc.

## Seed data

`npm run db:seed` clears `venues`, `users`, `menus`, `categories`, `items` and inserts fixture-aligned data (including **`menu-1`** for guest parity with client mocks).

- **Login (owner):** `dev@dimome.local` / `password`

## Run API + Vite client together (local smoke test)

Do this from **`dimome3/`** (the workspace root that contains `package.json` and `docker-compose.yml`).

1. **MongoDB:** `docker compose up -d`
2. **Environment:** copy [`.env.example`](../../.env.example) to **`.env`** in the same directory and set at least `MONGODB_URI` and `JWT_SECRET` (see [Environment](#environment) above).
3. **Seed (recommended):** `npm run db:seed` — loads **`menu-1`**, demo venue, and the owner user above.
4. **Terminal 1 — API:** `npm run dev:server` — Express on **http://localhost:3000** by default (`PORT` in `.env` overrides).
5. **Terminal 2 — SPA:** `npm run dev` — Vite client on **http://localhost:5173** (root script runs the `client` workspace only).

With both running:

- **Guest menu (published data):** [http://localhost:5173/qr/menu-1](http://localhost:5173/qr/menu-1) (alias: `/menu/menu-1`).
- **Owner app:** [http://localhost:5173/](http://localhost:5173/) — you are sent to **`/login`** until you sign in; use the seed email and password.

**Proxy:** [packages/client/vite.config.ts](../client/vite.config.ts) forwards **`/api`** to `http://localhost:3000`, so the browser can call **`/api/v1/...`** on the Vite origin. Leave **`VITE_API_URL` unset** in the client for that setup. Optional env and mock mode are documented in [packages/client/README.md](../client/README.md).

**Scope:** the UI exercises **reads** and **login** against this API; owner **mutations** (e.g. persisting item Save) are not fully wired yet. Page ↔ route mapping: [CLIENT_API_MAP_2026-04-08.md](../../CLIENT_API_MAP_2026-04-08.md).

## HTTP surface (summary)

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/health` | No — `{ ok, db }` |
| GET | `/api/v1/public/menus/:menuId` | No — public **published** menu (`PublicMenuData` shape) |
| POST | `/api/v1/auth/login` | No — body `{ email, password }` → `{ token, userId, venueId }` |
| GET | `/api/v1/owner/menus` | Bearer JWT |
| POST / PATCH | `/api/v1/owner/menus`, `/api/v1/owner/menus/:menuId` | JWT |
| GET | `/api/v1/owner/categories` | JWT — `{ venueName, categories }` |
| GET / POST / PATCH | `/api/v1/owner/menus/:menuId/categories` … | JWT |
| GET | `/api/v1/owner/menus/:menuId/items` | JWT — optional `?categoryPublicId=`; `MenuItem[]` |
| GET / POST / PATCH | `/api/v1/owner/menus/:menuId/items/:itemId` | JWT |

Errors: `{ error: { code, message } }`.

## Not implemented yet

R2 uploads, CSV/AI **job** workers, SSE/Redis/RabbitMQ, refresh tokens — see [BACKEND_REQUIREMENTS.md](../../documentation/BACKEND_REQUIREMENTS.md) §7 and §9.

## Client integration

See **[CLIENT_API_MAP_2026-04-08.md](../../CLIENT_API_MAP_2026-04-08.md)** for page-level mapping. The Vite app uses the real API unless **`VITE_USE_MOCK_API=true`** ([packages/client/README.md](../client/README.md)).
