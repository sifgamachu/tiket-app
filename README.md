# Tikēt — ቲኬት

> The ticketing platform for Ethiopia. Buses, trains, and live events — one app, Telegram-native, diaspora-aware.

This is the **runnable foundation** for Tikēt. It contains a polished buyer app (Vite + React + TypeScript + Tailwind), a Node/Express + Postgres backend skeleton, the data schema, and the integration shape for Telebirr, Chapa, and Telegram Stars.

```
tiket-app/
├── frontend/         Buyer app — Vite + React + TS + Tailwind, Telegram-Mini-App ready
├── backend/          API skeleton — Express + TS, Postgres, Chapa & Telegram webhooks
├── schema/           SQL migrations and seed data
├── docker-compose.yml  Postgres for local dev
└── README.md         (this file)
```

## What's built

### Frontend (the buyer app) — `frontend/`

A complete, mobile-first ticketing app. All three buyer flows are wired end-to-end against a mock API that mirrors what the real backend will return.

- **Home** — mode picker (Bus / Rail / Events) plus upcoming-tickets widget
- **Bus flow** — search, results with all 10 operators, 49-seat picker (2+2 plus back row of 5), checkout with Telebirr / Stars / Card
- **Rail flow** — Addis–Djibouti corridor with 10 stations, all 3 classes (Standard / Business / Sleeper with 8-cabin layout), passport handling for international segments, fare scaled by distance
- **Events flow** — category filter (Sports / Concert / Cinema / Theatre / Community), tier picker, quantity stepper, checkout
- **Tickets wallet** — locked countdown view with live ticking clock; QR auto-unlocks 30/60/90 minutes before the journey; mode-specific detail panels
- **Profile** — name/phone/email, language toggle (EN/አማ), preferred payment, sign out
- **Persistence** — tickets, user, recent searches saved to localStorage; auto-populates from Telegram Mini App `initData` when launched inside Telegram

### Backend (API skeleton) — `backend/`

Express + TypeScript, with the routes laid out and Postgres queries that match the schema:

- `GET  /api/events` & `GET /api/events/:id` — event listing and detail (with tiers joined)
- `GET  /api/buses/search` & `GET /api/buses/:id` — bus search with route/date filters
- `GET  /api/trains/search` & `GET /api/trains/:id` — rail search with carriage info
- `POST /api/tickets` — create ticket post-payment, returns Ed25519-signed QR
- `GET  /api/tickets/:id` & `POST /api/tickets/:id/scan` — ticket lookup, gate-side scan
- `POST /api/payments/init` — Chapa transaction initialization
- `POST /api/payments/chapa/webhook` — verifies HMAC signature, marks payment succeeded
- `POST /api/telegram/webhook` — bot updates, Stars `pre_checkout_query` and `successful_payment`

Helper libs are in place but not fully wired:

- `lib/qr.ts` — Ed25519 sign/verify for offline-scannable tickets
- `lib/chapa.ts` — Chapa Initialize Transaction + signature verification
- `lib/telegram.ts` — `sendMessage`, `sendInvoice` for Stars, `answerPreCheckoutQuery`

### Schema — `schema/001_initial.sql`

Full Postgres data model: `users`, `bus_operators`, `cities`, `rail_stations`, `rail_classes`, `buses`, `trains`, `train_carriages`, `events`, `event_tiers`, `tickets`, `payments`, `scan_events`, `refunds`. Includes seed data for all reference tables (10 bus operators, 12 cities, 10 rail stations, 3 rail classes). Indexes on the columns you'd actually query: `tickets(buyer_id)`, `tickets(qr_payload)`, `payments(provider_ref)`, `buses(from_city, to_city, travel_date)`. Scan events have a `lamport_clock` column for offline reconciliation across multiple gate scanners.

## Quick start

### Frontend only (mock API mode — quickest)

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`. The mock API runs in-process; you can browse all flows, buy tickets, and watch them appear in the wallet.

### Full stack with Postgres

```bash
# 1. Start Postgres (creates DB and runs schema/001_initial.sql)
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env
npm install
npm run dev

# 3. Frontend (in another terminal)
cd frontend
cp .env.example .env
# Set VITE_USE_MOCK_API=false in .env
npm install
npm run dev
```

The Vite dev server proxies `/api/*` to `localhost:3001`, so the frontend will hit your real backend.

## What's stubbed vs. real

| Area                       | Status            | Notes                                                                 |
|----------------------------|-------------------|-----------------------------------------------------------------------|
| Buyer UI (all flows)       | ✅ Complete       | Production-quality components, design system applied                  |
| Mock API layer             | ✅ Complete       | Deterministic seat states, realistic latency                          |
| Backend route shape        | ✅ Complete       | Wired to Postgres schema                                              |
| Database schema            | ✅ Complete       | Full data model + seed                                                |
| Ed25519 QR signing         | 🟡 Code complete  | Needs key generation step                                             |
| Chapa integration          | 🟡 Webhook + init | Needs real account + credentials in `.env`                            |
| Telegram bot               | 🟡 Code complete  | Needs bot creation via @BotFather, webhook URL, mini-app registration |
| Telegram Stars             | 🟡 Code complete  | Same — needs bot, plus invoice provider configuration                 |
| Authentication             | 🔴 Stubbed        | No JWT/session logic yet — buyers identified by phone                 |
| Operator dashboard         | 🔴 Not started    | The triptych prototype shows the shape; build as separate Vite app    |
| Scanner PWA                | 🔴 Not started    | Build as offline-first PWA — pinned Ed25519 public key, IndexedDB     |
| Anti-fraud (rate limit)    | 🔴 Not started    | Add Redis-backed sliding window on `/api/payments/init`               |

## Roadmap to launch

**Pre-launch (8–12 weeks)**
1. Implement Chapa init + webhook end-to-end against a real test account
2. Generate Ed25519 keypair, wire QR signing into ticket creation
3. Build the operator dashboard (separate Vite app — port the prototype components)
4. Build the scanner PWA (separate Vite app — IndexedDB ticket cache, pinned public key, Lamport clock)
5. Telegram Bot + Mini App registration; deep-link from chat to ticket detail
6. Auth: phone OTP via Afromessage SMS or Telegram-only login
7. SEO + landing page at `tiket.app`

**Anchor partner integration (overlapping)**
- Saint George SC — pilot organizer for Sheger Derby
- Selam Bus — pilot operator for Addis–Bahir Dar
- EDR — diplomatic engagement for rail integration

**Geographic expansion**
- Addis Ababa initial launch → tier-1 cities (Bahir Dar, Hawassa, Mekelle, Gondar, Dire Dawa) → cross-border (Djibouti via rail)

## Design tokens

Colors and typography are defined in `frontend/tailwind.config.js`:

- `--tiket-green` `#1A6B3A` — primary
- `--tiket-gold` `#D4A33B` — accent (muted, intentionally not flag-yellow)
- `--telebirr` `#1B3A8C` — Telebirr's official post-2023 dark blue
- Inter for Latin, Noto Sans Ethiopic for Amharic
- 4px telet stripe (green/gold/red) used as a decorative band throughout

ETB ≈ 145/USD (May 2026 reference rate; update in `frontend/src/lib/format.ts` as needed).

## Architecture notes

- The mock API in `frontend/src/lib/api.ts` is the contract. When `VITE_USE_MOCK_API=false`, it falls through to real `fetch('/api/...')` calls — same shape, same types, no other changes needed in the UI.
- The store (`frontend/src/store/AppStore.tsx`) is a Context + reducer with selective localStorage persistence. Tickets, user profile, and recent searches survive reload; everything else is session-scoped.
- The QR rendered in the wallet is deterministic (seeded by ticket ID) so it's stable across reloads but doesn't actually encode anything — the real signed payload lives in the data layer. Wire the real QR by passing `ticket.qrPayload` to a real QR generator like `qrcode-svg`.
- The unlock countdown is pure client-side time; in production the server is authoritative on `unlock_at` and the backend rejects scans before that point regardless of what the client thinks.

## License

Copyright © 2026. All rights reserved.
