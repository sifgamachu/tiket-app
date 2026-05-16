// ─────────────────────────────────────────────────────────────────
// Mock data for the operator dashboard demo. Shaped like Gadaa
// Transport's actual operation: Addis-centered hub serving western
// Oromia (Jimma, Nekemte, Ambo, Bedele, Mettu) plus a few corridor
// routes (Adama, Mojo, Bishoftu).
//
// Everything here is in-memory — resets on reload. Fine for a demo
// whose job is to start a conversation, not to run a business.
// ─────────────────────────────────────────────────────────────────

import { computeBusFare } from './routes';

export interface OperatorDeparture {
  id: string;
  busNumber: string;
  from: string;          // city id
  to: string;            // city id
  date: string;          // ISO date
  depHHMM: number;       // decimal hours
  durationHr: number;
  totalSeats: number;
  seatsSold: number;
  pricePerSeat: number;  // ETB
  status: 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'cancelled';
  driverName: string;
  driverPhone: string;
}

export interface OperatorTicket {
  id: string;
  departureId: string;
  buyerName: string;
  buyerPhone: string;
  seatLabels: string[];
  amount: number;        // ETB
  paymentMethod: 'telebirr' | 'stars' | 'card' | 'cash';
  channel: 'app' | 'agent' | 'walkin';
  purchasedAt: string;   // ISO datetime
  status: 'active' | 'used' | 'refunded';
}

const todayIso = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

// Western Oromia + corridor routes that Gadaa actually serves
const GADAA_ROUTES = [
  { from: 'AA', to: 'JM', km: 350, name: 'Addis–Jimma' },
  { from: 'AA', to: 'NK', km: 331, name: 'Addis–Nekemte' },
  { from: 'AA', to: 'AB', km: 110, name: 'Addis–Ambo' },
  { from: 'AA', to: 'BE', km: 480, name: 'Addis–Bedele' },
  { from: 'AA', to: 'MT', km: 600, name: 'Addis–Mettu' },
  { from: 'AA', to: 'AD', km: 100, name: 'Addis–Adama' },
  { from: 'AA', to: 'BS', km: 47,  name: 'Addis–Bishoftu' },
] as const;

const DRIVERS = [
  { name: 'Tolosa Bekele',    phone: '+251 911 234 567' },
  { name: 'Diriba Worku',     phone: '+251 911 555 234' },
  { name: 'Lemma Megersa',    phone: '+251 912 871 002' },
  { name: 'Gemechu Tafese',   phone: '+251 911 339 884' },
  { name: 'Kebede Birhanu',   phone: '+251 912 446 991' },
  { name: 'Abebe Tessema',    phone: '+251 911 728 305' },
] as const;

function generateDepartures(): OperatorDeparture[] {
  const result: OperatorDeparture[] = [];
  let counter = 100;

  // For today: 6 active routes, mix of statuses
  for (let i = 0; i < 6; i++) {
    const route = GADAA_ROUTES[i];
    const driver = DRIVERS[i];
    const dep = 5.5 + i * 1.5; // 05:30, 07:00, 08:30, 10:00, 11:30, 13:00
    const totalSeats = 49;
    const seatsSold = Math.floor(totalSeats * (0.45 + Math.random() * 0.5));
    let status: OperatorDeparture['status'] = 'scheduled';
    const nowHr = new Date().getHours() + new Date().getMinutes() / 60;
    if (dep + 0.5 < nowHr - route.km / 60) status = 'arrived';
    else if (dep < nowHr) status = 'departed';
    else if (dep - 0.25 < nowHr) status = 'boarding';

    result.push({
      id: `gadaa-${counter++}`,
      busNumber: `GAD-${100 + i * 7}`,
      from: route.from,
      to: route.to,
      date: todayIso(),
      depHHMM: dep,
      durationHr: route.km / 60,
      totalSeats,
      seatsSold,
      pricePerSeat: computeBusFare(route.km, 'premium'),
      status,
      driverName: driver.name,
      driverPhone: driver.phone,
    });
  }

  // Tomorrow: 5 scheduled departures
  for (let i = 0; i < 5; i++) {
    const route = GADAA_ROUTES[i];
    const driver = DRIVERS[(i + 2) % DRIVERS.length];
    const dep = 5.5 + i * 2;
    result.push({
      id: `gadaa-${counter++}`,
      busNumber: `GAD-${200 + i * 7}`,
      from: route.from,
      to: route.to,
      date: todayIso(1),
      depHHMM: dep,
      durationHr: route.km / 60,
      totalSeats: 49,
      seatsSold: Math.floor(49 * (0.15 + Math.random() * 0.4)),
      pricePerSeat: computeBusFare(route.km, 'premium'),
      status: 'scheduled',
      driverName: driver.name,
      driverPhone: driver.phone,
    });
  }

  // Day after: 3 departures, fewer sold
  for (let i = 0; i < 3; i++) {
    const route = GADAA_ROUTES[i];
    const driver = DRIVERS[(i + 4) % DRIVERS.length];
    const dep = 6 + i * 2.5;
    result.push({
      id: `gadaa-${counter++}`,
      busNumber: `GAD-${300 + i * 7}`,
      from: route.from,
      to: route.to,
      date: todayIso(2),
      depHHMM: dep,
      durationHr: route.km / 60,
      totalSeats: 49,
      seatsSold: Math.floor(49 * (0.05 + Math.random() * 0.25)),
      pricePerSeat: computeBusFare(route.km, 'premium'),
      status: 'scheduled',
      driverName: driver.name,
      driverPhone: driver.phone,
    });
  }

  return result;
}

// In-memory store, mutable so the "Add Departure" form actually adds something
let DEPARTURES: OperatorDeparture[] = generateDepartures();

export function getDepartures(): OperatorDeparture[] {
  return [...DEPARTURES].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.depHHMM - b.depHHMM;
  });
}

export function addDeparture(d: Omit<OperatorDeparture, 'id' | 'seatsSold' | 'status' | 'driverName' | 'driverPhone'> & {
  driverName: string;
  driverPhone: string;
}): OperatorDeparture {
  const created: OperatorDeparture = {
    ...d,
    id: `gadaa-${Date.now()}`,
    seatsSold: 0,
    status: 'scheduled',
  };
  DEPARTURES = [created, ...DEPARTURES];
  return created;
}

// ── Sales / tickets ──────────────────────────────────────────────

const BUYER_NAMES = [
  'Selamawit Tesfaye',  'Mulugeta Alemu',     'Tigist Hailu',
  'Birhanu Worku',      'Hanna Bekele',       'Yonas Mekuria',
  'Fitsum Gebremariam', 'Eden Tadesse',       'Dawit Asfaw',
  'Marta Kebede',       'Robel Negash',       'Sara Mengistu',
  'Henok Belay',        'Ruth Demissie',      'Kaleb Tilahun',
  'Bethel Solomon',     'Nahom Wolde',        'Liya Girma',
] as const;

function generateTickets(): OperatorTicket[] {
  const tickets: OperatorTicket[] = [];
  let counter = 1000;

  // For each historical departure, generate enough tickets to match seatsSold
  for (const dep of DEPARTURES) {
    if (dep.status === 'cancelled') continue;
    for (let i = 0; i < dep.seatsSold; i++) {
      const buyer = BUYER_NAMES[(counter + i) % BUYER_NAMES.length];
      const channelRoll = Math.random();
      const channel: OperatorTicket['channel'] =
        channelRoll < 0.45 ? 'walkin' : channelRoll < 0.75 ? 'agent' : 'app';
      const methodRoll = Math.random();
      const paymentMethod: OperatorTicket['paymentMethod'] =
        channel === 'walkin' ? (methodRoll < 0.6 ? 'cash' : 'telebirr') :
        channel === 'agent' ? (methodRoll < 0.7 ? 'cash' : 'telebirr') :
        (methodRoll < 0.55 ? 'telebirr' : methodRoll < 0.85 ? 'stars' : 'card');

      const purchasedAt = new Date();
      purchasedAt.setDate(purchasedAt.getDate() - (dep.date === todayIso() ? 0 : Math.floor(Math.random() * 3)));
      purchasedAt.setHours(Math.floor(Math.random() * 14) + 6, Math.floor(Math.random() * 60));

      tickets.push({
        id: `TKT-${String(counter++).padStart(5, '0')}`,
        departureId: dep.id,
        buyerName: buyer,
        buyerPhone: `+251 9${Math.floor(10 + Math.random() * 90)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`,
        seatLabels: [`${Math.floor(i / 4) + 1}${['A','B','C','D'][i % 4]}`],
        amount: dep.pricePerSeat,
        paymentMethod,
        channel,
        purchasedAt: purchasedAt.toISOString(),
        status: dep.status === 'arrived' ? 'used' : 'active',
      });
    }
  }

  return tickets.sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt));
}

let TICKETS: OperatorTicket[] = generateTickets();

export function getTickets(): OperatorTicket[] {
  return TICKETS;
}

export function regenerateTickets(): void {
  TICKETS = generateTickets();
}

// Derived stats for the dashboard header
export function getTodayStats() {
  const today = todayIso();
  const todays = DEPARTURES.filter(d => d.date === today);
  const totalSeats = todays.reduce((s, d) => s + d.totalSeats, 0);
  const seatsSold = todays.reduce((s, d) => s + d.seatsSold, 0);
  const revenue = todays.reduce((s, d) => s + d.seatsSold * d.pricePerSeat, 0);
  return {
    departures: todays.length,
    seatsSold,
    totalSeats,
    fillRate: totalSeats > 0 ? Math.round((seatsSold / totalSeats) * 100) : 0,
    revenue,
  };
}
