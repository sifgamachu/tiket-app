// ─────────────────────────────────────────────────────────────────
// Shared types — these mirror what the backend will return
// ─────────────────────────────────────────────────────────────────

export type Mode = 'bus' | 'rail' | 'event';

export type Tier = 'premium' | 'mid' | 'basic';

export type PaymentMethod = 'telebirr' | 'stars' | 'card' | 'cbe';

export type TicketStatus = 'locked' | 'active' | 'used' | 'expired' | 'refunded';

// ── Operators ────────────────────────────────────────────────────
export interface BusOperator {
  id: string;
  name: string;
  amh: string;
  color: string;
  accent: string;
  tier: Tier;
  rating: number;
}

export interface RailOperator {
  id: string;
  name: string;
  amh: string;
  short: string;
  color: string;
  accent: string;
}

// ── Geo ──────────────────────────────────────────────────────────
export interface City {
  id: string;
  name: string;
  amh: string;
  region: string;
  altitude: number;
}

export interface RailStation {
  id: string;
  name: string;
  amh: string;
  country: 'ET' | 'DJ';
  km: number;
  isStop: boolean;
  isMajor: boolean;
  border?: boolean;
}

// ── Bus ──────────────────────────────────────────────────────────
export interface Bus {
  id: string;
  operatorId: string;
  busNumber: string;
  from: string;        // city id
  to: string;          // city id
  depHHMM: number;     // decimal hours: 4.5 = 04:30
  durationHr: number;
  totalSeats: number;  // 49
  seatStates: number[]; // 0=avail, 1=sold, 2=held, 3=blocked
  basePrice: number;   // ETB
  amenities: string[]; // 'wifi', 'ac', 'snack', 'water', 'usb'
  date: string;        // ISO date
}

// ── Rail ─────────────────────────────────────────────────────────
export interface RailClass {
  id: 'standard' | 'business' | 'sleeper';
  name: string;
  amh: string;
  layout: 'rows-2-2' | 'cabins';
  rows: number;
  cols: number;
  totalSeats: number;
  basePrice: number;
  color: string;
  accent: string;
  desc: string;
}

export interface Train {
  id: string;
  number: string;
  name: string;
  depDay: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  depHHMM: number;
  durationHr: number;
  direction: 'eastbound' | 'westbound';
  date: string; // ISO date
  carriages: TrainCarriage[];
}

export interface TrainCarriage {
  id: string;
  classId: RailClass['id'];
  seatStates: number[];
}

// ── Events ───────────────────────────────────────────────────────
export interface EventCategory {
  id: 'sports' | 'concert' | 'cinema' | 'theatre' | 'community';
  name: string;
  amh: string;
}

export interface TicketTier {
  id: string;
  name: string;
  amh?: string;
  price: number;
  available: number;
  capacity: number;
  description?: string;
  color?: string;
}

export interface EventItem {
  id: string;
  title: string;
  amh?: string;
  category: EventCategory['id'];
  venue: string;
  city: string;
  date: string;     // ISO datetime
  posterUrl?: string;
  description?: string;
  organizer: string;
  tiers: TicketTier[];
  capacity: number;
  sold: number;
}

// ── Tickets (the unified ticket type) ────────────────────────────
export type Ticket =
  | BusTicket
  | RailTicket
  | EventTicket;

export interface BaseTicket {
  id: string;
  mode: Mode;
  buyerName: string;     // recipient (whoever travels / shows the ticket)
  buyerPhone: string;
  status: TicketStatus;
  totalPaid: number;     // ETB (always — for revenue accounting)
  paymentMethod: PaymentMethod;
  purchasedAt: string;   // ISO
  unlockAt: string;      // ISO — when QR unlocks
  expiresAt: string;     // ISO
  qrPayload: string;     // signed token (Ed25519)

  // Diaspora-purchase fields. When set, this ticket was bought from
  // abroad and delivered to the buyer. The sender stays attached for
  // refund routing and customer support.
  isDiaspora?: boolean;
  senderName?: string;
  senderPhone?: string;
  paidCurrency?: 'ETB' | 'USD';
  paidAmount?: number;   // amount in paidCurrency (USD if isDiaspora)
}

export interface BusTicket extends BaseTicket {
  mode: 'bus';
  busId: string;
  operatorId: string;
  from: string;
  to: string;
  depHHMM: number;
  date: string;
  seats: number[];      // seat indices
  seatLabels: string[]; // human labels
}

export interface RailTicket extends BaseTicket {
  mode: 'rail';
  trainId: string;
  classId: RailClass['id'];
  from: string;
  to: string;
  seats: number[];
  seatLabels: string[];
  passportNumber?: string;
}

export interface EventTicket extends BaseTicket {
  mode: 'event';
  eventId: string;
  tierId: string;
  tierName: string;
  zone?: string;       // e.g., "Stand A — Kemeneshe"
  rowSeat?: string;    // e.g., "Row 12, Seat 4"
  quantity: number;
}

// ── User ─────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  preferredPayment: PaymentMethod;
  language: 'en' | 'am';
  telegramUserId?: number;
}

// ── API responses ───────────────────────────────────────────────
export interface SearchResults<T> {
  results: T[];
  count: number;
  filters?: Record<string, unknown>;
}

export interface ApiError {
  error: string;
  message: string;
  code?: number;
}
