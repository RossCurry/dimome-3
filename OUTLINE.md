# DiMoMe v3 — starting outline

Incremental plan; extend this once product designs are ready.

---

## Product (high level)

- **DiMoMe** — digital, mobile-friendly menus for venues (restaurants, bars, cafés).
- **Customer value** — easy browsing on phones; **allergen-aware** browsing/filtering; less reliance on printed menus.
- **Owner value** — lower print churn; hygiene / shared-menu angle still relevant as a story.
- **Flows to validate in designs** — public guest menu; owner **create/edit** menu, categories, products; **upload dish images**; **optional: scan/photo of paper menu → draft import → review/edit**.

---

## Technical direction (attempt 3)

- **Repo shape** — **monorepo**, **two packages** (not a single Next-style runtime monolith).
- **Client** — **Vite**, **React (current)**, **TypeScript**, **Tailwind**.
- **Server** — **Express**, **MongoDB** (driver/ODM TBD when implementing).
- **API** — **REST**, versioned prefix (e.g. `/api/v1/...`), consistent JSON errors (decide shape later).
- **Auth** — **JWT** (access + refresh strategy TBD); suited for web + future non-web clients; decide storage/transport for web (e.g. Bearer vs cookies) when implementing.

---

## Images & media

- **Dish / item images** — **Cloudflare R2** for storage; **CDN-style delivery**; DB stores **key or public URL**; **presigned upload** pattern likely (details when wiring).
- **Menu photo → structured data** — **AI-assisted parser** (vision/OCR + structuring); **runs on server** with secrets; treat output as **draft** until user confirms; expect **validation + edit UI**.

---

## Environment & shared code

- **Env** — **one env file (or env convention) per package**.
- **Optional later** — small **`packages/shared`** (or `types`) for **shared TypeScript types** / API contracts.

---

## Open decisions (park until designs + build)

- Deploy targets (static host + API host vs Express serving built client).
- Exact **JWT refresh** and revocation story.
- Which **vision/OCR/LLM** provider(s) for menu parsing and cost limits.
- MongoDB modeling (reuse ideas from Dimome2 models vs simplify for v3).

---

## Sequencing

1. **Product / UX designs** — screens, flows, edge cases (guest vs owner, parse review, allergens).
2. **Lock MVP scope** — what ships first vs later.
3. **Then** — package layout, endpoint list, schemas, and implementation order.

When designs are ready, turn this into a concrete **route list + data model + package checklist**.
