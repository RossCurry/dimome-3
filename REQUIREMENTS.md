# DiMoMe v3 — project requirements

Living document. Derived from `OUTLINE.md`, `design/emerald_hearth/DESIGN.md`, and HTML mocks under `design/*/code.html`. Product naming in mocks varies (“Digital Maître d’”, etc.); **DiMoMe** is the working code name until branding is final.

---

## 1. Vision and goals

- **Product**: Digital menus for hospitality venues, **mobile-first**, with **EU-aligned allergen** transparency and filtering.
- **Owner goals**: Create and maintain menus via **manual entry**, **CSV import**, and **AI menu photo** parsing; reduce reliance on printed menus.
- **Guest goals**: Browse by category, **search** dishes, **filter allergens/intolerances**, view item detail. Mocks also show **table context**, **QR**, and **My order → Place order** — scope explicitly for MVP vs later (see §8).

---

## 2. User modes

| Mode | Description |
|------|-------------|
| **Owner / staff (authenticated)** | Dashboard, menu management, item editor, imports, AI scan pipeline, settings (some nav may be stubbed). |
| **Guest (public)** | Read-only menu for a venue; search, categories, allergen filters; optional ordering flow if in MVP. |

- **Auth**: **JWT** for owner/staff APIs; suitable for non-web clients later.
- **Public menu**: Accessible **without** JWT (venue slug or id; optional table/session if ordering is in scope).

---

## 3. Information architecture (from mocks)

### Owner shell

- **Top nav**: Dashboard, Analytics, Settings (Analytics/Settings may be **stub or hidden** in MVP).
- **Actions**: Add Menu, notifications, help, profile.
- **Side nav** (where shown): Home, Menus, **AI Scans**, Staff, Insights, Help, Logout — **Staff / Insights / upgrade upsell** are natural **phase-2** items.

### Dashboard

- List **menus** with thumbnail, name, last updated, item count.
- Per menu: **open customer view**, **edit**, **delete**.
- **Quick actions — Create new menu**: (1) Build via form, (2) Upload CSV, (3) Scan image (AI OCR).
- **Recent activity** (optional MVP): feed with actions such as Review / Accept (price edits, draft requests, backup events).

### Menu management (browse)

- Sidebar: venue branding; navigation to Menus, Items, Categories, Import Data, Settings (exact set TBD).
- Main: browse/filter menu items with actions (edit, visibility, etc.).

### Item editor (comprehensive)

- **General**: Item name, category (select), price, description.
- **Ingredients & prep**: Free-text ingredients; support note: may feed **smart allergen** suggestions.
- **Allergens & dietary**: Selectable chips for **EU-style allergens** (e.g. gluten, dairy, eggs, nuts, fish, celery, crustaceans, lupin, molluscs, mustard, peanuts, sesame, soybeans, sulphites) plus **dietary** flags (e.g. vegan). **Smart scan**: system may **pre-select** allergens; user **confirms** before publish.
- **Item photography**: Upload / replace / delete; recommended dimensions in UI; storage on **Cloudflare R2**; DB stores **object key or public URL**.
- **Publishing**: **Visible on menu**, **Featured item** toggles.
- **Inventory**: SKU / item code, stock status.
- **Multi-location sync** (“Sync now”, “N locations”): treat as **phase 2** unless explicitly pulled into MVP.
- **Archive** menu item (soft delete).

### CSV import — three steps

1. **Select file**: `.csv` only; **download template**; navigation back to dashboard.
2. **Map columns**: Map source columns → **Item name** (required), **Price** (required), **Description** (recommended), **Allergens** (recommended); **data preview** table.
3. **Review import**: Tabular review; **highlight rows** needing attention; progress indicator; **Complete import** commits validated rows.

### AI menu scan — three steps

1. **Upload**: Photo of physical menu; secure upload messaging.
2. **Extraction**: Progress / status UI (“live” extraction steps); backend may be **async** (polling or future SSE/WebSocket).
3. **Review & verify**: Editable **extracted items**; user must **confirm** before persisting — no silent publish.

### Guest — customer menu

- Header: venue name; **QR** affordance.
- **Search** dishes.
- **Category** chips (e.g. All, Starters, Mains, Desserts, Drinks).
- Entry point to **filter allergens**.
- Dish list → item detail (flows as in mocks).

### Guest — allergen filters (mobile)

- Search allergens.
- **Common intolerances** (e.g. gluten, dairy-free, nuts, shellfish).
- **All mandatory allergens (EU)** with toggles; **include/exclude semantics** and copy to be finalized in UX.

### Guest — My order

- Table identifier (e.g. “Table 12”).
- Line items, quantities, **Place order** CTA.
- **Open decision**: Real ordering (POS / kitchen / payment) vs **UI-only prototype** for MVP — must be explicit before build.

---

## 4. Data model (requirements level)

Entities implied by mocks (names may differ in implementation):

- **User** (owner/staff) — JWT subject; profile as needed.
- **Venue** — branding, slug, logo.
- **Menu** — belongs to venue; metadata (e.g. updated at, item count).
- **Category** — belongs to menu or venue.
- **Menu item** — name, description, price, category, allergens[], dietary flags, image ref (R2), visibility, featured, SKU, stock status, ingredients text.
- **CSV import job** — file metadata, column mapping, status, row-level errors.
- **AI scan job** — image ref, status, draft extraction payload, confirmation timestamp.
- **Order** — only if ordering is in scope: table ref, items, status.

**Allergens**: Canonical set aligned with **EU mandatory 14**; guest filters and item tags must use the same vocabulary.

---

## 5. Backend and API

- **REST**, versioned prefix (e.g. `/api/v1/`), consistent JSON error shape (define at implementation).
- **JWT** access token; **refresh** and revocation strategy TBD (`OUTLINE.md`).
- **MongoDB** with Express; **native driver** for v1 (see [BACKEND_REQUIREMENTS.md](./BACKEND_REQUIREMENTS.md)).
- **R2**: Prefer **presigned uploads** for item and scan images; server validates type/size; public vs signed read policy TBD.
- **AI menu parser**: Runs **only on server**; returns **draft** structured data; persisted only after **review** step.
- **CSV**: Parse upload; return headers + sample rows for mapping; apply mapping; validate; commit or return issues per row.
- **Local development (infra):** **Docker** and **Docker Compose** at **`dimome3/`** run **backing services** (**MongoDB** first; **Redis** / **RabbitMQ** later behind optional profiles). The **Express API** runs **on the host** for v1 (not containerised with Compose). Production may use **managed** databases/queues with the same env-style connection settings — see [BACKEND_REQUIREMENTS.md §3](./BACKEND_REQUIREMENTS.md).

---

## 6. Client application

- **Vite**, **React** (current stable), **TypeScript**, **Tailwind**.
- **Design system**: Implement tokens and rules from `design/emerald_hearth/DESIGN.md` (e.g. Epilogue + Inter, surface hierarchy, no loud borders, glass nav, primary gradient CTAs, allergen chips, floating mobile dock, tap targets).

---

## 7. Non-functional

- **Mobile-first** for guest; owner flows responsive per mocks.
- **Accessibility**: Minimum tap targets (e.g. 48px) where specified; input focus states per design spec.
- **Security**: No AI or storage secrets in the browser; rate-limit auth and expensive endpoints in production.

---

## 8. MVP scoping suggestions

**Likely MVP**

- Auth, venue, menu, category, item CRUD; R2 images; **public guest menu** with search, categories, allergen filters; CSV import (3 steps); AI scan (3 steps) with review.

**Defer unless required on day one**

- Analytics, Staff area, Insights, upgrade monetization UI, multi-location sync, full notifications, production **Place order** with payments/POS.

---

## 9. Open decisions (product + tech)

- Ordering: **in MVP or phase 2**?
- **Smart allergen** on item editor: always-on vs triggered (e.g. when ingredients change).
- Multi-venue / locations: **in or out** of MVP.
- Final **branding** and deploy topology (static + API vs single host) — see `OUTLINE.md`.

---

## See also

- [`BACKEND_REQUIREMENTS.md`](./BACKEND_REQUIREMENTS.md) — server stack, native Mongo driver, persistence ports/adapters, async jobs, **Docker Compose** for local deps (**§3**).
- [`OUTLINE.md`](./OUTLINE.md) — monorepo layout, stack, env per package.
- [`design/emerald_hearth/DESIGN.md`](./design/emerald_hearth/DESIGN.md) — UI specification.
- `design/*/code.html` — screen-level reference implementations.
