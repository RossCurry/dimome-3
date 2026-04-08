# DiMoMe v3 — backend requirements

Backend-specific requirements and implementation choices for **`packages/server`** (to be added under the `dimome3` workspace). Product flows, entities, and MVP scope stay aligned with [REQUIREMENTS.md](./REQUIREMENTS.md); monorepo direction in [OUTLINE.md](./OUTLINE.md).

This document is a **living** companion to the product spec: update it when API shapes, auth, or persistence decisions are locked in.

---

## 1. Goals

- Serve the **owner** app (JWT) and **public guest menu** (no auth) per [REQUIREMENTS.md §2](./REQUIREMENTS.md).
- Support **CSV import** and **AI menu scan** pipelines on the server only (secrets, heavy work).
- Use **MongoDB** first, with a **persistence abstraction** so a later experiment (e.g. **SQL**) can swap the database without rewriting HTTP handlers or domain logic wholesale.
- Keep the stack **maintainable for a hobby project**: prefer clarity over maximum abstraction.

---

## 2. Stack (initial)

| Layer | Choice |
|--------|--------|
| Runtime | **Node.js** — same major as workspace ([`engines` in `package.json`](./package.json), e.g. **24.x**) |
| HTTP | **Express** |
| API style | **REST**, versioned prefix **`/api/v1/`** |
| Database | **MongoDB** via the **official native driver** (`mongodb`) — **not Mongoose** for v1 |
| Auth | **JWT** for owner/staff; access vs refresh and transport (Bearer vs cookie) **TBD** |
| Object storage | **Cloudflare R2** — **presigned uploads** for item and scan images where possible |
| AI / OCR | **Server-only**; provider(s) and cost limits **TBD** ([OUTLINE.md](./OUTLINE.md)) |

---

## 3. Local infrastructure (Docker Compose)

**Approach:** **Containerise backing services** for local development; run the **Node API on the host** (e.g. `npm run dev` in `packages/server`) — no requirement to dockerise the Express app for v1.

| Topic | Decision |
|--------|-----------|
| **Compose file** | **`docker-compose.yml`** at **`dimome3/`** (next to workspace root `package.json`) so one directory owns “run deps for this app.” |
| **Services (phased)** | **MongoDB** from day one; **Redis** and **RabbitMQ** when async job phases **§7.3–§7.4** (SSE/Redis, optional RabbitMQ) are implemented — use **Compose profiles** so `docker compose up` stays minimal until those profiles are enabled. |
| **Persistence** | **Named volumes** for Mongo (and others as added) so data survives `docker compose down` without `-v`. |
| **Readiness** | **Healthchecks** on dependency services; API or scripts can wait for **healthy** before connecting. |
| **Configuration** | **`MONGODB_URI`** (and later `REDIS_URL`, `RABBITMQ_URL`) via **`.env` / `.env.example`** — use **`localhost`** + published ports when the API runs **on the host** (e.g. `mongodb://localhost:27017/dimome`). Same variable names can point at **managed** services in production (Atlas, ElastiCache, etc.). |

**Production:** Compose is primarily **local** (and optional small VPS); production often uses **managed** databases and queues — keep env-driven URLs so the app does not depend on Docker at runtime.

---

## 4. Data access layer (ports and adapters)

**Requirement:** Application code depends on **TypeScript interfaces** (“ports”) for persistence — e.g. menu, category, item, venue, user, import jobs — not on Mongo APIs directly in route handlers or use-cases.

**Implementation:**

- **Ports** describe operations in **domain terms** (e.g. `getPublishedMenuByPublicId`, `saveItem`), using **plain types** and **string IDs** at the boundary (avoid leaking `ObjectId` outside adapters).
- **Adapters** live under something like `adapters/persistence/mongo/` and implement those ports with the **native driver** (collections, `findOne`, `insertOne`, etc.).
- **Mapping** between BSON documents and domain objects happens **inside** the Mongo adapter (e.g. `toDomain` / `toDocument`).
- A future **SQL** (or other) database is a **second adapter** implementing the same ports; no requirement to share an ORM across both stores.

**Non-goals for v1:** A generic “repository for any entity” framework, or a single library that must support both Mongo and SQL. Prefer **explicit, small interfaces** per aggregate or use case until duplication hurts.

---

## 5. Entities (persistence-oriented)

Aligned with [REQUIREMENTS.md §4](./REQUIREMENTS.md). Names and collection layout are implementation details; behavior and relationships should match the product doc.

| Concept | Notes |
|---------|--------|
| **User** | Owner/staff; JWT subject; profile fields as needed |
| **Venue** | Branding, slug, logo ref |
| **Menu** | Belongs to venue; public identifier for guest URLs (e.g. slug or id aligned with `/qr/:menuId`) |
| **Category** | Belongs to menu (or venue — match product rules) |
| **Menu item** | Name, description, price, category, allergens[], dietary flags, image ref (R2 key/URL), visibility, featured, SKU, stock, ingredients text |
| **CSV import job** | File metadata, column mapping, status, row-level errors |
| **AI scan job** | Image ref, status, draft payload, confirmation timestamp |
| **Order** | Only if ordering is in MVP — table ref, line items, status |

**Allergens:** Canonical set aligned with **EU mandatory 14**; same vocabulary for stored item tags and guest filter semantics.

---

## 6. API surface (areas, not final paths)

Concrete routes, request/response JSON schemas, and error envelope should be defined in implementation (or a follow-on **API** doc).

| Area | Auth | Purpose |
|------|------|---------|
| **Auth** | Public (login/register/refresh TBD) | Issue and refresh JWTs for owner/staff |
| **Owner — venue / menus / categories / items** | JWT | CRUD and publishing fields per [REQUIREMENTS.md](./REQUIREMENTS.md) |
| **Public menu** | None | Read-only payload suitable for guest menu + filters (by `menuId` or venue slug) |
| **Uploads** | JWT (owner) | Issue presigned URLs or accept upload metadata; validate type/size server-side |
| **CSV import** | JWT | Upload → headers/sample → mapped import → validation / commit ([REQUIREMENTS.md §3](./REQUIREMENTS.md)) |
| **AI scan** | JWT | Upload → async job / progress → draft for review; **no silent publish** |

**Errors:** Consistent JSON error shape for `/api/v1/` (status code + machine-readable code + message); define once and reuse.

---

## 7. Async jobs (CSV / AI): storage and client updates

**Principle:** **Upload / create job** in one request; **heavy work** (CSV parse, external vision API) runs **outside** that request. The client learns outcomes via **durable job state** plus a **client polling strategy** to start; richer push later.

### 7.1 Source of truth: MongoDB

- **CSV import jobs** and **AI scan jobs** are persisted as documents in Mongo (status, stages, errors, draft/preview payloads, timestamps) — see §5.
- Workers (or a background loop) **read** `pending` jobs, run processing, **write** status and results back to Mongo. This record survives restarts and supports debugging and idempotent retries.

### 7.2 Phase 1 (initial): HTTP polling only

- After creating a job, the client uses **`GET /api/v1/…/jobs/:jobId`** (or equivalent) on a **short interval** while `status` is `pending` or `processing`, with backoff when idle or terminal.
- **No SSE, no Redis, no message broker** required for this phase — simplest to ship and test.

### 7.3 Phase 2 (later): SSE + Redis

- Add **Server-Sent Events (SSE)** so the server can **push** lightweight events (e.g. progress, `completed`, `failed`) over a long-lived HTTP connection.
- Use **Redis pub/sub** (or **Redis Streams** if stronger delivery guarantees are needed) so **workers** can signal **API** processes to emit on the right SSE channels, avoiding tight **poll-Mongo-in-a-loop** on every open stream. Mongo remains the **authoritative** job document; Redis is a **coordination / notification** layer, not a replacement for job storage.

### 7.4 Phase 3 (optional / later): RabbitMQ

- **RabbitMQ** (or similar) is a **candidate** when introducing a dedicated **work-queue** topology, multiple worker pools, or clearer separation between “HTTP API” and “job consumers.”
- Treat this as an **evolutionary option** — design job handling so enqueue/consume boundaries are clear; **revisit** when scaling or splitting services, not a requirement for the first backend slice.

---

## 8. Security and operations

- **Secrets** (DB URI, JWT signing, R2, AI keys) only on the server; never exposed to the client ([REQUIREMENTS.md §7](./REQUIREMENTS.md)).
- **Rate limiting** on auth and expensive endpoints in production (deferred acceptable for local dev).
- **CORS** configured explicitly for the Vite dev origin and production client origin(s).

---

## 9. MVP vs later

Mirror [REQUIREMENTS.md §8](./REQUIREMENTS.md):

- **First backend slice (shipped in repo):** [packages/server](./packages/server/) — Docker **Mongo** for local dev, Express **`/api/v1/`**, Mongo **ports + adapters**, **`GET /health`**, **`GET /public/menus/:menuId`**, **`POST /auth/login`**, JWT + **owner** routes for menus / categories / items (CRUD subset), **`db:seed`**. The **Vite client** still uses mocks until pointed at this API ([STATUS.md](./STATUS.md)).
- **Then:** R2 presign flow, CSV and AI job endpoints per product steps; **job state in Mongo** + **client polling** for status (§7.2).
- **Defer:** Full ordering/POS, analytics, multi-location sync, unless product scope changes.

---

## 10. Open decisions (backend)

Carry over from product where relevant ([REQUIREMENTS.md §9](./REQUIREMENTS.md)) plus:

- JWT **refresh** and **revocation** strategy ([OUTLINE.md](./OUTLINE.md)).
- **Public** image delivery: public R2 bucket vs signed URLs and TTL.
- **Deploy:** API host vs static client + API (see OUTLINE).
- **Transactions:** Mongo multi-document transactions vs eventual consistency for imports — document per flow when implemented.

---

## 11. Related documents

| Document | Role |
|----------|------|
| [REQUIREMENTS.md](./REQUIREMENTS.md) | Product requirements, IA, data model at requirements level |
| [OUTLINE.md](./OUTLINE.md) | Monorepo shape, env per package, sequencing |
| [STATUS.md](./STATUS.md) | Current **client** implementation vs mocks |
| [packages/client/README.md](./packages/client/README.md) | How the SPA runs today |
| [BE_PLAN.md](./BE_PLAN.md) | Ordered implementation checklist and phases for **`packages/server`** |

---

*Last updated: **§9** — initial **`packages/server`** slice implemented (health, public menu, JWT auth, owner CRUD, seed). Still **§3** Compose + API on host; **§7** jobs/SSE/Redis/RabbitMQ not built yet.*
