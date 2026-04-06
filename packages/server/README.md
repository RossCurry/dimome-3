# DiMoMe — `packages/server`

Express + TypeScript + **native MongoDB driver** (`mongodb`). REST API under **`/api/v1/`**. Persistence follows **ports** (`src/ports/`) and **Mongo adapters** (`src/adapters/persistence/mongo/`). See [BACKEND_REQUIREMENTS.md](../../BACKEND_REQUIREMENTS.md) and [BE_PLAN.md](../../BE_PLAN.md).

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
| GET / POST / PATCH | `/api/v1/owner/menus/:menuId/items` … | JWT |

Errors: `{ error: { code, message } }`.

## Not implemented yet

R2 uploads, CSV/AI **job** workers, SSE/Redis/RabbitMQ, refresh tokens — see [BACKEND_REQUIREMENTS.md](../../BACKEND_REQUIREMENTS.md) §7 and §9.

## Client integration

The Vite app still uses **mocks** by default. Wiring `fetch` + proxy/`VITE_API_URL` is a follow-up.
