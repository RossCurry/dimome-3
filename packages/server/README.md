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

**Proxy:** [packages/client/vite.config.ts](../client/vite.config.ts) forwards **`/api`** to `http://localhost:3000`, so the browser can call **`/api/v1/...`** on the Vite origin. Leave **`VITE_API_URL` unset** in the client for that setup (recommended for phones on Wi‑Fi: same origin as `http://<LAN-IP>:5173`, no browser CORS to the API). If you **do** set `VITE_API_URL` to `http://<LAN-IP>:3000`, the API must allow the Vite origin; while **`NODE_ENV` is not `production`**, private LAN origins (e.g. `http://192.168.x.x:5173`) are accepted automatically. Optional env and mock mode are documented in [packages/client/README.md](../client/README.md).

**Scope:** the UI exercises **reads**, **login**, owner **mutations**, and **CSV import jobs** (multipart upload + polling) against this API when not in mock mode. Page ↔ route mapping: [CLIENT_API_MAP_2026-04-08.md](../../CLIENT_API_MAP_2026-04-08.md).

## HTTP surface (summary)

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/health` | No — `{ ok, db }` |
| GET | `/api/v1/public/menus/:menuId` | No — public **published** menu (`PublicMenuData` shape) |
| POST | `/api/v1/auth/login` | No — body `{ email, password }` → `{ token, userId, venueId }` |
| POST | `/api/v1/auth/register` | No — body `{ email, password, businessName }` → **`201`** `{ token, userId, venueId }`; **`409`** `email_taken` if email exists |
| GET | `/api/v1/owner/menus` | Bearer JWT |
| POST / PATCH | `/api/v1/owner/menus`, `/api/v1/owner/menus/:menuId` | JWT |
| GET | `/api/v1/owner/categories` | JWT — `{ venueName, categories }` |
| GET / POST / PATCH | `/api/v1/owner/menus/:menuId/categories` … | JWT |
| GET | `/api/v1/owner/menus/:menuId/items` | JWT — optional `?categoryPublicId=`; `MenuItem[]` |
| GET / POST / PATCH | `/api/v1/owner/menus/:menuId/items/:itemId` | JWT |
| POST | `/api/v1/owner/menus/:menuId/csv-import-jobs` | JWT — multipart field **`file`** → `{ id }` |
| GET / PATCH | `/api/v1/owner/menus/:menuId/csv-import-jobs/:jobId` | JWT — poll job; `PATCH` body `{ mapping }` |
| POST | `/api/v1/owner/menus/:menuId/csv-import-jobs/:jobId/commit` | JWT — enqueue row import (`202`) |

Errors: `{ error: { code, message } }`.

**Worker:** the API process runs a **`startWorkerLoop`** tick (~450ms) from [`packages/jobs`](../jobs/) that advances CSV jobs (parse → validate → commit). See [CSV_IMPORT_IMPLEMENTATION.md](../../documentation/CSV_IMPORT_IMPLEMENTATION.md).

## Not implemented yet

R2 uploads, **AI scan** job workers, SSE/Redis/RabbitMQ, refresh tokens — see [BACKEND_REQUIREMENTS.md](../../documentation/BACKEND_REQUIREMENTS.md) §7 and §9.

**Auth hardening (future):** per-route rate limiting for `/auth/login` and `/auth/register`, and a **shared rate-limit store** (e.g. Redis) when running **multiple API instances** (in-memory limits are per process only).

## Client integration

See **[CLIENT_API_MAP_2026-04-08.md](../../CLIENT_API_MAP_2026-04-08.md)** for page-level mapping. The Vite app uses the real API unless **`VITE_USE_MOCK_API=true`** ([packages/client/README.md](../client/README.md)).
