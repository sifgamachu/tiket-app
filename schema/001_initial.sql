-- ============================================================
-- Tikēt — Initial schema
-- Postgres 14+
-- ============================================================

BEGIN;

-- ───────────────────────────────────────────────────────────
-- Reference / static tables
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bus_operators (
  id           text PRIMARY KEY,
  name         text NOT NULL,
  amh          text,
  color        text,
  accent       text,
  tier         text NOT NULL CHECK (tier IN ('premium', 'mid', 'basic')),
  rating       numeric(2, 1) DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cities (
  id           text PRIMARY KEY,
  name         text NOT NULL,
  amh          text,
  region       text,
  altitude_m   integer,
  lat          numeric,
  lng          numeric,
  created_at   timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rail_stations (
  id           text PRIMARY KEY,
  name         text NOT NULL,
  amh          text,
  country      text NOT NULL CHECK (country IN ('ET', 'DJ')),
  km           integer NOT NULL,
  is_stop      boolean NOT NULL DEFAULT TRUE,
  is_major     boolean NOT NULL DEFAULT FALSE,
  is_border    boolean NOT NULL DEFAULT FALSE,
  created_at   timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rail_classes (
  id            text PRIMARY KEY,
  name          text NOT NULL,
  amh           text,
  layout        text NOT NULL CHECK (layout IN ('rows-2-2', 'cabins')),
  total_seats   integer NOT NULL,
  base_price    numeric NOT NULL,
  color         text,
  description   text
);

-- ───────────────────────────────────────────────────────────
-- Users
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id                 text PRIMARY KEY,
  name               text NOT NULL,
  phone              text NOT NULL,
  email              text,
  preferred_payment  text DEFAULT 'telebirr',
  language           text DEFAULT 'en',
  telegram_user_id   bigint UNIQUE,
  created_at         timestamptz NOT NULL DEFAULT NOW(),
  updated_at         timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users (phone);
CREATE INDEX IF NOT EXISTS idx_users_tg ON users (telegram_user_id);

-- ───────────────────────────────────────────────────────────
-- Inventory (buses, trains, events)
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS buses (
  id            text PRIMARY KEY,
  operator_id   text NOT NULL REFERENCES bus_operators(id),
  bus_number    text NOT NULL,
  from_city     text NOT NULL REFERENCES cities(id),
  to_city       text NOT NULL REFERENCES cities(id),
  travel_date   date NOT NULL,
  dep_hhmm      numeric NOT NULL,        -- decimal hours, e.g. 4.5 = 04:30
  duration_hr   numeric NOT NULL,
  total_seats   integer NOT NULL DEFAULT 49,
  seat_states   jsonb NOT NULL DEFAULT '[]'::jsonb,
  base_price    numeric NOT NULL,
  amenities     text[] DEFAULT '{}',
  status        text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','boarding','departed','arrived','cancelled')),
  created_at    timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buses_route_date ON buses (from_city, to_city, travel_date);
CREATE INDEX IF NOT EXISTS idx_buses_operator ON buses (operator_id);

CREATE TABLE IF NOT EXISTS trains (
  id             text PRIMARY KEY,
  number         text NOT NULL,
  name           text NOT NULL,
  travel_date    date NOT NULL,
  dep_hhmm       numeric NOT NULL,
  duration_hr    numeric NOT NULL,
  direction      text NOT NULL CHECK (direction IN ('eastbound','westbound')),
  status         text NOT NULL DEFAULT 'scheduled',
  created_at     timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trains_date ON trains (travel_date);

CREATE TABLE IF NOT EXISTS train_carriages (
  id             text PRIMARY KEY,
  train_id       text NOT NULL REFERENCES trains(id) ON DELETE CASCADE,
  class_id       text NOT NULL REFERENCES rail_classes(id),
  seat_states    jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_carriages_train ON train_carriages (train_id);

CREATE TABLE IF NOT EXISTS events (
  id             text PRIMARY KEY,
  title          text NOT NULL,
  amh            text,
  category       text NOT NULL CHECK (category IN ('sports','concert','cinema','theatre','community')),
  venue          text NOT NULL,
  city           text,
  event_date     timestamptz NOT NULL,
  poster_url     text,
  description    text,
  organizer      text NOT NULL,
  capacity       integer NOT NULL,
  sold           integer NOT NULL DEFAULT 0,
  status         text NOT NULL DEFAULT 'on_sale' CHECK (status IN ('draft','on_sale','sold_out','closed','cancelled')),
  created_at     timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events (event_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events (category);

CREATE TABLE IF NOT EXISTS event_tiers (
  id             text PRIMARY KEY,
  event_id       text NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name           text NOT NULL,
  amh            text,
  description    text,
  price          numeric NOT NULL,
  capacity       integer NOT NULL,
  available      integer NOT NULL,
  color          text
);

CREATE INDEX IF NOT EXISTS idx_tiers_event ON event_tiers (event_id);

-- ───────────────────────────────────────────────────────────
-- Tickets — one row per issued ticket
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tickets (
  id                 text PRIMARY KEY,
  buyer_id           text NOT NULL REFERENCES users(id),
  mode               text NOT NULL CHECK (mode IN ('bus','rail','event')),
  payload            jsonb NOT NULL,         -- mode-specific details (route/class/seats/etc)
  total_paid_cents   bigint NOT NULL,        -- ETB cents (or USD cents for diaspora)
  currency           text NOT NULL DEFAULT 'ETB',
  payment_method     text NOT NULL,
  status             text NOT NULL DEFAULT 'locked' CHECK (status IN ('locked','active','used','expired','refunded')),
  unlock_at          timestamptz NOT NULL,
  expires_at         timestamptz NOT NULL,
  qr_payload         text NOT NULL UNIQUE,   -- Ed25519-signed JWT-like
  used_at            timestamptz,
  created_at         timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_buyer ON tickets (buyer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_qr ON tickets (qr_payload);
CREATE INDEX IF NOT EXISTS idx_tickets_mode_status ON tickets (mode, status);

-- ───────────────────────────────────────────────────────────
-- Payments
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_ref    text UNIQUE NOT NULL,
  provider        text NOT NULL DEFAULT 'chapa' CHECK (provider IN ('chapa','telebirr','stars','manual')),
  ticket_id       text REFERENCES tickets(id),
  mode            text,
  amount_cents    bigint NOT NULL,
  currency        text NOT NULL DEFAULT 'ETB',
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','succeeded','failed','refunded')),
  payload         jsonb,
  created_at      timestamptz NOT NULL DEFAULT NOW(),
  completed_at    timestamptz
);

CREATE INDEX IF NOT EXISTS idx_payments_ref ON payments (provider_ref);
CREATE INDEX IF NOT EXISTS idx_payments_ticket ON payments (ticket_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);

-- ───────────────────────────────────────────────────────────
-- Scan events — one row per gate scan attempt
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS scan_events (
  id              bigserial PRIMARY KEY,
  ticket_id       text NOT NULL REFERENCES tickets(id),
  scanner_id      text NOT NULL,
  gate_id         text,
  result          text NOT NULL DEFAULT 'valid' CHECK (result IN ('valid','invalid','duplicate','expired','locked','revoked')),
  scanned_at      timestamptz NOT NULL DEFAULT NOW(),
  -- Lamport clock for offline reconciliation across multiple scanner devices
  lamport_clock   bigint NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_scans_ticket ON scan_events (ticket_id);
CREATE INDEX IF NOT EXISTS idx_scans_scanner ON scan_events (scanner_id, scanned_at DESC);

-- ───────────────────────────────────────────────────────────
-- Refunds
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS refunds (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id       text NOT NULL REFERENCES tickets(id),
  amount_cents    bigint NOT NULL,
  reason          text,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','denied','processed')),
  initiated_by    text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT NOW(),
  processed_at    timestamptz
);

-- ============================================================
-- SEED DATA — reference tables
-- ============================================================

INSERT INTO bus_operators (id, name, amh, color, accent, tier, rating) VALUES
  ('selam', 'Selam Bus',     'ሰላም አውቶቡስ',   '#1E40AF', '#FCD34D', 'premium', 4.7),
  ('odaa',  'Odaa Transport','ኦዳ ትራንስፖርት', '#15803D', '#86EFAC', 'premium', 4.6),
  ('gadaa', 'Gadaa Bus',     'ገዳ አውቶቡስ',    '#9A3412', '#FED7AA', 'premium', 4.5),
  ('sky',   'Sky Bus',       'ስካይ አውቶቡስ',   '#0891B2', '#67E8F9', 'premium', 4.5),
  ('ethio', 'Ethio Bus',     'ኢትዮ አውቶቡስ',   '#365314', '#BEF264', 'premium', 4.4),
  ('walia', 'Walia Bus',     'ዋልያ አውቶቡስ',   '#7C2D12', '#FED7AA', 'mid',     4.2),
  ('lima',  'Limalimo',      'ሊማሊሞ',         '#166534', '#86EFAC', 'premium', 4.6),
  ('gold',  'Golden Bus',    'ጎልደን አውቶቡስ',  '#A16207', '#FCD34D', 'mid',     4.0),
  ('shgr',  'Sheger Bus',    'ሸገር አውቶቡስ',   '#581C87', '#D8B4FE', 'mid',     4.1),
  ('haba',  'Habesha',       'ሀበሻ አውቶቡስ',   '#9F1239', '#FCA5A5', 'mid',     4.3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO cities (id, name, amh, region, altitude_m) VALUES
  ('AA', 'Addis Ababa',  'አዲስ አበባ', 'Federal',   2355),
  ('BD', 'Bahir Dar',    'ባህር ዳር',   'Amhara',    1820),
  ('HW', 'Hawassa',      'ሐዋሳ',      'Sidama',    1700),
  ('MK', 'Mekelle',      'መቐለ',       'Tigray',    2080),
  ('GD', 'Gondar',       'ጎንደር',      'Amhara',    2133),
  ('DD', 'Dire Dawa',    'ድሬዳዋ',     'Federal',   1276),
  ('JM', 'Jimma',        'ጅማ',       'Oromia',    1780),
  ('AD', 'Adama',        'አዳማ',      'Oromia',    1712),
  ('AM', 'Arba Minch',   'አርባ ምንጭ',   'SNNP',      1285),
  ('DS', 'Dessie',       'ደሴ',       'Amhara',    2470),
  ('HR', 'Harar',        'ሐረር',      'Harari',    1885),
  ('DB', 'Debre Birhan', 'ደብረ ብርሃን',  'Amhara',    2840)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rail_stations (id, name, amh, country, km, is_stop, is_major, is_border) VALUES
  ('AAL', 'Addis Ababa Lebu',  'አዲስ አበባ ለቡ', 'ET', 0,   TRUE, TRUE,  FALSE),
  ('BSF', 'Bishoftu',          'ቢሾፍቱ',       'ET', 47,  TRUE, FALSE, FALSE),
  ('MOJ', 'Mojo',              'ሞጆ',         'ET', 75,  TRUE, FALSE, FALSE),
  ('ADM', 'Adama',             'አዳማ',        'ET', 99,  TRUE, TRUE,  FALSE),
  ('AWS', 'Awash',             'አዋሽ',        'ET', 215, TRUE, TRUE,  FALSE),
  ('MIE', 'Mieso',             'ምሶ',         'ET', 350, TRUE, FALSE, FALSE),
  ('DRW', 'Dire Dawa',         'ድሬዳዋ',      'ET', 446, TRUE, TRUE,  FALSE),
  ('DEW', 'Dewele',            'ደወሌ',        'ET', 600, TRUE, FALSE, TRUE),
  ('ASB', 'Ali Sabieh',        'አሊ ሰቢሕ',    'DJ', 660, TRUE, FALSE, FALSE),
  ('NGD', 'Nagad · Djibouti',  'ናጋድ',        'DJ', 752, TRUE, TRUE,  FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rail_classes (id, name, amh, layout, total_seats, base_price, color, description) VALUES
  ('standard', 'Standard Coach', 'መደበኛ',     'rows-2-2', 64, 1500, '#0F766E', 'Reclining seats · A/C · Economy fare'),
  ('business', 'Business Class', 'ቢዝነስ',     'rows-2-2', 48, 2800, '#1E40AF', 'Wider seats · power outlets · meal included'),
  ('sleeper',  'Sleeper Berths', 'መኝታ ካቢን', 'cabins',   32, 4500, '#581C87', '4-berth private cabin · bedding included · WC')
ON CONFLICT (id) DO NOTHING;

COMMIT;
