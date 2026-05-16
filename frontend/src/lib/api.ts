// ─────────────────────────────────────────────────────────────────
// API client. In dev/demo mode, returns mock data with simulated
// network latency. In production, hits the real Express backend
// at /api/* (proxied through Vite during dev, or same-origin in prod).
// ─────────────────────────────────────────────────────────────────

import type { Bus, Train, EventItem, Ticket, BaseTicket, BusTicket, RailTicket, EventTicket, RailClass, PaymentMethod } from '@/types';
import { CITIES } from '@/data/cities';
import { BUS_OPERATORS, getBusOperator } from '@/data/operators';
import { getRouteDistance, getOperatorsForRoute, computeBusFare, getDeparturesForRoute } from '@/data/routes';
import { RAIL_STATIONS, RAIL_CLASSES, railSeatLabel } from '@/data/rail';
import { EVENTS } from '@/data/events';
import { busTicketId, railTicketId, eventTicketId, buildQrPayload } from './ticket-id';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') !== 'false';
const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// Deterministic-ish PRNG seeded by a string (for stable mock data per session)
function seedFor(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h = (h ^ s.charCodeAt(i)) * 16777619;
  }
  return (h >>> 0) / 2 ** 32;
}

// ── Bus search ────────────────────────────────────────────────────
export async function searchBuses(params: {
  from: string;
  to: string;
  date: string;
}): Promise<Bus[]> {
  if (!USE_MOCK) {
    const url = new URL(`${API_BASE}/buses/search`, window.location.origin);
    url.searchParams.set('from', params.from);
    url.searchParams.set('to', params.to);
    url.searchParams.set('date', params.date);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to search buses');
    return (await res.json()).results as Bus[];
  }
  await sleep(280);
  return generateMockBuses(params);
}

function generateMockBuses({ from, to, date }: { from: string; to: string; date: string }): Bus[] {
  const km = getRouteDistance(from, to);
  if (km === 0) return [];
  const durHr = km / 60;

  // Real-world: which operators actually run this corridor?
  const operatorIds = getOperatorsForRoute(from, to);
  // Real-world: how many departures per day for a route of this length?
  const departures = getDeparturesForRoute(km);

  // Pair operators with departure slots. If we have more departures
  // than operators, an operator can repeat (real operators run
  // multiple times per day on busy routes).
  const buses: Bus[] = [];
  departures.forEach((dep, i) => {
    const opId = operatorIds[i % operatorIds.length];
    const op = getBusOperator(opId);
    if (!op) return;

    const seedKey = `${from}-${to}-${date}-${i}-${opId}`;
    const r = seedFor(seedKey);
    const sold = Math.floor(49 * (0.3 + r * 0.6));
    const seatStates = Array.from({ length: 49 }, (_, idx) => {
      if (idx < sold) return 1;
      if (idx < sold + 2 && r > 0.5) return 2;
      return 0;
    });
    buses.push({
      id: `${op.id}-${from}-${to}-${date}-${dep}`.replace(/\./g, ''),
      operatorId: op.id,
      busNumber: `${op.id.toUpperCase().slice(0, 3)}-${100 + i * 7}`,
      from, to,
      depHHMM: dep,
      durationHr: durHr * (0.9 + r * 0.2),
      totalSeats: 49,
      seatStates,
      basePrice: computeBusFare(km, op.tier),
      amenities: op.tier === 'premium' ? ['wifi', 'ac', 'snack', 'water', 'usb'] : ['ac', 'water'],
      date,
    });
  });
  return buses;
}

export async function getBus(id: string): Promise<Bus | null> {
  if (!USE_MOCK) {
    const res = await fetch(`${API_BASE}/buses/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch bus');
    return await res.json();
  }
  await sleep(120);
  // Decode the synthetic id back into search params
  const parts = id.split('-');
  if (parts.length < 5) return null;
  const [opId, from, to, ...rest] = parts;
  const dep = parseFloat(rest[rest.length - 1]) / 10; // since we removed dots — best effort
  void opId; void dep;
  // For demo: regenerate with the date we can extract
  const date = rest.slice(0, -1).join('-');
  const all = generateMockBuses({ from, to, date });
  return all.find(b => b.id === id) ?? null;
}

// ── Rail search ───────────────────────────────────────────────────
export async function searchTrains(params: {
  from: string;
  to: string;
  date: string;
}): Promise<Train[]> {
  if (!USE_MOCK) {
    const url = new URL(`${API_BASE}/trains/search`, window.location.origin);
    url.searchParams.set('from', params.from);
    url.searchParams.set('to', params.to);
    url.searchParams.set('date', params.date);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to search trains');
    return (await res.json()).results as Train[];
  }
  await sleep(280);
  return generateMockTrains(params);
}

function generateMockTrains({ from, to, date }: { from: string; to: string; date: string }): Train[] {
  // Single train per request (real EDR has 2 weekly: Sat eastbound, Tue eastbound, Sun/Wed westbound)
  const fromSt = RAIL_STATIONS.find(s => s.id === from);
  const toSt = RAIL_STATIONS.find(s => s.id === to);
  if (!fromSt || !toSt) return [];

  const direction = (toSt.km > fromSt.km ? 'eastbound' : 'westbound') as 'eastbound' | 'westbound';
  const trainId = direction === 'eastbound' ? 'EDR-501' : 'EDR-502';

  const seedKey = `${trainId}-${date}`;
  const r = seedFor(seedKey);

  return [
    {
      id: `${trainId}-${date}`,
      number: trainId,
      name: direction === 'eastbound' ? 'Addis–Djibouti Express' : 'Djibouti–Addis Express',
      depDay: 'Sat',
      depHHMM: 8.5,
      durationHr: 12,
      direction,
      date,
      carriages: RAIL_CLASSES.map(cls => {
        const fillRate = cls.id === 'sleeper' ? 0.85 + r * 0.1 :
                         cls.id === 'business' ? 0.7 + r * 0.15 :
                         0.75 + r * 0.15;
        const sold = Math.floor(cls.totalSeats * fillRate);
        const seatStates = Array.from({ length: cls.totalSeats }, (_, idx) => {
          if (idx < sold) return 1;
          if (idx < sold + 2 && r > 0.5) return 2;
          return 0;
        });
        return {
          id: `${trainId}-${date}-${cls.id}`,
          classId: cls.id,
          seatStates,
        };
      }),
    },
  ];
}

export async function getTrain(id: string): Promise<Train | null> {
  if (!USE_MOCK) {
    const res = await fetch(`${API_BASE}/trains/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch train');
    return await res.json();
  }
  await sleep(120);
  const date = id.split('-').slice(2).join('-'); // EDR-501-2026-04-18 → 2026-04-18
  const trains = generateMockTrains({ from: 'AAL', to: 'NGD', date });
  return trains[0] ?? null;
}

// ── Events ────────────────────────────────────────────────────────
export async function listEvents(category?: string): Promise<EventItem[]> {
  if (!USE_MOCK) {
    const url = new URL(`${API_BASE}/events`, window.location.origin);
    if (category) url.searchParams.set('category', category);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to list events');
    return (await res.json()).results as EventItem[];
  }
  await sleep(160);
  return category ? EVENTS.filter(e => e.category === category) : EVENTS;
}

export async function getEventApi(id: string): Promise<EventItem | null> {
  if (!USE_MOCK) {
    const res = await fetch(`${API_BASE}/events/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch event');
    return await res.json();
  }
  await sleep(80);
  return EVENTS.find(e => e.id === id) ?? null;
}

// ── Pricing ───────────────────────────────────────────────────────
export function computeRailFare(classId: RailClass['id'], fromKm: number, toKm: number): number {
  const cls = RAIL_CLASSES.find(c => c.id === classId);
  if (!cls) return 0;
  const distance = Math.abs(toKm - fromKm);
  return Math.round(cls.basePrice * (distance / 752));
}

// ── Checkout / Pay ───────────────────────────────────────────────
// Returns the created ticket. In production, this initiates payment
// with the chosen provider (Telebirr, Chapa, Stars), waits for the
// provider's webhook to confirm, and then creates the ticket.

export interface CheckoutBusInput {
  bus: Bus;
  selectedSeats: number[];
  buyerName: string;
  buyerPhone: string;
  paymentMethod: PaymentMethod;
  // Diaspora-purchase fields (optional)
  isDiaspora?: boolean;
  senderName?: string;
  senderPhone?: string;
}

export async function checkoutBus(input: CheckoutBusInput): Promise<BusTicket> {
  await sleep(900);
  const id = busTicketId();
  const now = new Date();
  const dep = new Date(input.bus.date);
  dep.setHours(Math.floor(input.bus.depHHMM), Math.round((input.bus.depHHMM % 1) * 60));
  const seatLabels = input.selectedSeats.map(seatLabelForBus);
  const subtotal = input.bus.basePrice * input.selectedSeats.length;
  const fee = Math.round(subtotal * 0.025);
  const totalEtb = subtotal + fee;
  return {
    id, mode: 'bus',
    busId: input.bus.id,
    operatorId: input.bus.operatorId,
    from: input.bus.from,
    to: input.bus.to,
    depHHMM: input.bus.depHHMM,
    date: input.bus.date,
    seats: input.selectedSeats,
    seatLabels,
    buyerName: input.buyerName,
    buyerPhone: input.buyerPhone,
    status: 'locked',
    totalPaid: totalEtb,
    paymentMethod: input.paymentMethod,
    purchasedAt: now.toISOString(),
    unlockAt: new Date(dep.getTime() - 30 * 60_000).toISOString(),
    expiresAt: new Date(dep.getTime() + 24 * 3600_000).toISOString(),
    qrPayload: buildQrPayload(id),
    ...(input.isDiaspora && {
      isDiaspora: true,
      senderName: input.senderName,
      senderPhone: input.senderPhone,
      paidCurrency: 'USD' as const,
      paidAmount: Math.round((totalEtb / 145) * 100) / 100,
    }),
  };
}

export interface CheckoutRailInput {
  train: Train;
  classId: RailClass['id'];
  selectedSeats: number[];
  fromStation: string;
  toStation: string;
  buyerName: string;
  buyerPhone: string;
  passportNumber?: string;
  paymentMethod: PaymentMethod;
  isDiaspora?: boolean;
  senderName?: string;
  senderPhone?: string;
}

export async function checkoutRail(input: CheckoutRailInput): Promise<RailTicket> {
  await sleep(900);
  const id = railTicketId();
  const now = new Date();
  const fromKm = RAIL_STATIONS.find(s => s.id === input.fromStation)?.km ?? 0;
  const toKm = RAIL_STATIONS.find(s => s.id === input.toStation)?.km ?? 752;
  const fare = computeRailFare(input.classId, fromKm, toKm);
  const subtotal = fare * input.selectedSeats.length;
  const fee = Math.round(subtotal * 0.025);
  const totalEtb = subtotal + fee;
  const dep = new Date(input.train.date);
  dep.setHours(Math.floor(input.train.depHHMM), Math.round((input.train.depHHMM % 1) * 60));
  return {
    id, mode: 'rail',
    trainId: input.train.id,
    classId: input.classId,
    from: input.fromStation,
    to: input.toStation,
    seats: input.selectedSeats,
    seatLabels: input.selectedSeats.map(i => railSeatLabel(i, input.classId)),
    buyerName: input.buyerName,
    buyerPhone: input.buyerPhone,
    passportNumber: input.passportNumber,
    status: 'locked',
    totalPaid: totalEtb,
    paymentMethod: input.paymentMethod,
    purchasedAt: now.toISOString(),
    unlockAt: new Date(dep.getTime() - 60 * 60_000).toISOString(),
    expiresAt: new Date(dep.getTime() + 24 * 3600_000).toISOString(),
    qrPayload: buildQrPayload(id),
    ...(input.isDiaspora && {
      isDiaspora: true,
      senderName: input.senderName,
      senderPhone: input.senderPhone,
      paidCurrency: 'USD' as const,
      paidAmount: Math.round((totalEtb / 145) * 100) / 100,
    }),
  };
}

export interface CheckoutEventInput {
  event: EventItem;
  tierId: string;
  quantity: number;
  buyerName: string;
  buyerPhone: string;
  paymentMethod: PaymentMethod;
  isDiaspora?: boolean;
  senderName?: string;
  senderPhone?: string;
}

export async function checkoutEvent(input: CheckoutEventInput): Promise<EventTicket> {
  await sleep(900);
  const tier = input.event.tiers.find(t => t.id === input.tierId);
  if (!tier) throw new Error('Tier not found');
  const id = eventTicketId();
  const now = new Date();
  const eventDate = new Date(input.event.date);
  const subtotal = tier.price * input.quantity;
  const fee = Math.round(subtotal * 0.025);
  const totalEtb = subtotal + fee;
  return {
    id, mode: 'event',
    eventId: input.event.id,
    tierId: tier.id,
    tierName: tier.name,
    quantity: input.quantity,
    buyerName: input.buyerName,
    buyerPhone: input.buyerPhone,
    status: 'locked',
    totalPaid: totalEtb,
    paymentMethod: input.paymentMethod,
    purchasedAt: now.toISOString(),
    unlockAt: new Date(eventDate.getTime() - 90 * 60_000).toISOString(),
    expiresAt: new Date(eventDate.getTime() + 24 * 3600_000).toISOString(),
    qrPayload: buildQrPayload(id),
    ...(input.isDiaspora && {
      isDiaspora: true,
      senderName: input.senderName,
      senderPhone: input.senderPhone,
      paidCurrency: 'USD' as const,
      paidAmount: Math.round((totalEtb / 145) * 100) / 100,
    }),
  };
}

function seatLabelForBus(idx: number): string {
  // 49 seats: 11 rows of 4 (2+2) plus a back row of 5 = 12 rows total
  if (idx >= 48) return '12E';
  if (idx >= 44) {
    const c = ['A', 'B', 'C', 'D'][idx - 44];
    return `12${c}`;
  }
  const row = Math.floor(idx / 4) + 1;
  const col = ['A', 'B', 'C', 'D'][idx % 4];
  return `${row}${col}`;
}

// Re-export for use elsewhere
export { seatLabelForBus };
