// ─────────────────────────────────────────────────────────────────
// Ethiopian intercity bus network — distances, operator coverage,
// and fare logic.
//
// These numbers are best-effort. Distances are road distances (not
// great-circle), drawn from publicly known route lengths between
// major Ethiopian cities. Fares are derived from a per-km formula
// tuned against a handful of fares I've cross-checked, but they are
// NOT live fare data. For a real launch, operators set fares
// per route (often regulated by federal/regional transport
// authorities); the formula here is a reasonable demo proxy that
// produces numbers in the right ballpark.
//
// Operator coverage reflects rough real-world specialization:
//   Selam Bus, Sky Bus, Ethio Bus — nationwide trunk-route carriers
//   Gadaa — western Oromia (Jimma / Nekemte / Ambo / Bedele / Mettu)
//   Walia, Limalimo — more selective; Walia leans north and east
//   Odaa — Oromia-rooted, Addis and points east/south
//   Habesha — premium-leaning, popular among diaspora
//   Sheger, Golden — mid-tier on shorter trunk routes
//
// Any pair not listed below falls back to a Haversine-style estimate
// from city altitude/region pairs (good enough for cards to show
// without breaking the search). All numbers in this module are
// review-and-correct candidates before going to Gadaa.
// ─────────────────────────────────────────────────────────────────

import { BUS_OPERATORS } from './operators';
import { getCity } from './cities';

// ── Distance matrix in km. Keys are ordered alphabetically by city id
//    so we only need to store each pair once. Lookups normalize.
const DISTANCES: Record<string, number> = {
  // ── From Addis Ababa (AA) ─────────────────────────────────────
  'AA-AB': 110,  // Ambo
  'AA-AD': 100,  // Adama
  'AA-AL': 175,  // Asella
  'AA-AM': 510,  // Arba Minch
  'AA-AS': 660,  // Asosa
  'AA-AT': 600,  // Alamata
  'AA-AX': 1010, // Axum
  'AA-AW': 980,  // Adwa
  'AA-BC': 270,  // Bichena
  'AA-BD': 565,  // Bahir Dar
  'AA-BE': 480,  // Bedele
  'AA-BJ': 460,  // Bonga
  'AA-BL': 430,  // Bale Robe
  'AA-BS': 47,   // Bishoftu
  'AA-BT': 130,  // Butajira
  'AA-CR': 326,  // Chiro
  'AA-DB': 130,  // Debre Birhan
  'AA-DD': 515,  // Dire Dawa
  'AA-DL': 360,  // Dilla
  'AA-DM': 300,  // Debre Markos
  'AA-DS': 401,  // Dessie
  'AA-DT': 666,  // Debre Tabor
  'AA-FN': 360,  // Finote Selam
  'AA-GB': 445,  // Goba
  'AA-GD': 727,  // Gondar
  'AA-GE': 1140, // Gode
  'AA-GM': 766,  // Gambela
  'AA-HR': 526,  // Harar
  'AA-HS': 230,  // Hosaena
  'AA-HW': 275,  // Hawassa
  'AA-IJ': 446,  // Injibara
  'AA-JJ': 626,  // Jijiga
  'AA-JK': 745,  // Jinka
  'AA-JM': 350,  // Jimma
  'AA-KB': 376,  // Kombolcha
  'AA-LG': 583,  // Logia
  'AA-LL': 645,  // Lalibela
  'AA-MJ': 73,   // Mojo
  'AA-MK': 783,  // Mekelle
  'AA-MT': 600,  // Mettu
  'AA-MZ': 561,  // Mizan Teferi
  'AA-NB': 595,  // Negele Borana
  'AA-NK': 331,  // Nekemte
  'AA-SH': 250,  // Shashemene
  'AA-SM': 588,  // Semera
  'AA-SR': 1090, // Shire
  'AA-TP': 611,  // Tepi
  'AA-WB': 178,  // Worabe
  'AA-WD': 521,  // Woldia
  'AA-WL': 158,  // Welkite
  'AA-WS': 326,  // Wolaita Sodo
  'AA-YR': 320,  // Yirgalem

  // ── Selected cross-routes (non-Addis) ─────────────────────────
  'AD-HW': 175,  // Adama–Hawassa
  'AD-DD': 415,  // Adama–Dire Dawa
  'AD-HR': 426,  // Adama–Harar
  'BD-GD': 175,  // Bahir Dar–Gondar
  'BD-LL': 320,  // Bahir Dar–Lalibela
  'BD-DM': 265,  // Bahir Dar–Debre Markos
  'GD-AX': 358,  // Gondar–Axum
  'GD-LL': 360,  // Gondar–Lalibela
  'GD-SR': 365,  // Gondar–Shire
  'MK-AX': 245,  // Mekelle–Axum
  'MK-AW': 215,  // Mekelle–Adwa
  'MK-WD': 240,  // Mekelle–Woldia
  'MK-LL': 165,  // Mekelle–Lalibela
  'AX-AW': 25,   // Axum–Adwa
  'AX-SR': 80,   // Axum–Shire
  'HW-SH': 25,   // Hawassa–Shashemene
  'HW-DL': 90,   // Hawassa–Dilla
  'HW-AM': 280,  // Hawassa–Arba Minch
  'HW-WS': 110,  // Hawassa–Wolaita Sodo
  'JM-BE': 130,  // Jimma–Bedele
  'JM-MT': 250,  // Jimma–Mettu
  'JM-BJ': 100,  // Jimma–Bonga
  'JM-MZ': 230,  // Jimma–Mizan Teferi
  'NK-BE': 150,  // Nekemte–Bedele
  'NK-AB': 220,  // Nekemte–Ambo
  'DD-HR': 50,   // Dire Dawa–Harar
  'DD-JJ': 110,  // Dire Dawa–Jijiga
  'DS-KB': 25,   // Dessie–Kombolcha
  'DS-WD': 120,  // Dessie–Woldia
  'KB-SM': 212,  // Kombolcha–Semera
  'SM-LG': 12,   // Semera–Logia
  'AM-JK': 235,  // Arba Minch–Jinka
};

/**
 * Look up the road distance between two cities in km. Order-independent.
 * Falls back to a coarse estimate based on geography if the pair is
 * not in the matrix.
 */
export function getRouteDistance(from: string, to: string): number {
  if (from === to) return 0;
  const direct = DISTANCES[`${from}-${to}`] ?? DISTANCES[`${to}-${from}`];
  if (direct !== undefined) return direct;

  // Fallback: rough estimate based on rough regional grouping.
  // Better than returning a misleading 350km flat default.
  const fromCity = getCity(from);
  const toCity = getCity(to);
  if (!fromCity || !toCity) return 400;
  if (fromCity.region === toCity.region) return 200;
  // Cross-region fallback — penalize travel between far regions.
  const farPairs = new Set(['Tigray-South Ethiopia', 'Tigray-Gambela', 'Afar-South West', 'Somali-Gambela']);
  const pair = [fromCity.region, toCity.region].sort().join('-');
  return farPairs.has(pair) ? 950 : 550;
}

// ─────────────────────────────────────────────────────────────────
// Operator route coverage. For each route (city pair), which
// operators actually run buses? Roughly reflects real specialization:
//   - Big trunk operators (Selam, Sky, Ethio) cover most routes
//   - Regional specialists (Gadaa, Walia, Odaa) cover their corridors
//   - Premium/diaspora (Habesha, Limalimo) skim premium routes
// ─────────────────────────────────────────────────────────────────

const TRUNK_OPERATORS = ['selam', 'sky', 'ethio', 'shgr', 'gold'];
const PREMIUM_OPERATORS = ['selam', 'haba', 'lima'];

/** Western Oromia corridor — Gadaa's home turf. */
const WESTERN_OROMIA = new Set(['JM', 'NK', 'AB', 'BE', 'MT', 'BJ', 'MZ', 'TP']);
/** Northern routes — Walia, Limalimo, Selam strong. */
const NORTHERN = new Set(['BD', 'GD', 'AX', 'AW', 'SR', 'LL', 'DT', 'IJ', 'FN', 'DM', 'BC']);
/** Tigray-internal — fewer national operators, regional carriers. */
const TIGRAY_INTERNAL = new Set(['MK', 'AX', 'AW', 'SR', 'AT']);
/** Southern routes — Odaa, Sky strong. */
const SOUTHERN = new Set(['HW', 'YR', 'DL', 'AM', 'WS', 'JK', 'SH', 'HS', 'BT']);
/** Eastern corridor — Selam, Sky, Habesha (Addis-Dire Dawa-Harar). */
const EASTERN = new Set(['DD', 'HR', 'JJ', 'CR']);

/**
 * For a given route, return the list of operator IDs that run it.
 * Always includes the AA hub trunk operators on long-haul; layered
 * regional specialists make routes feel real.
 */
export function getOperatorsForRoute(from: string, to: string): string[] {
  const ops = new Set<string>();
  const isHub = from === 'AA' || to === 'AA';
  const km = getRouteDistance(from, to);
  const other = from === 'AA' ? to : (to === 'AA' ? from : null);

  // Trunk carriers on most Addis routes
  if (isHub && km >= 80) {
    TRUNK_OPERATORS.forEach(o => ops.add(o));
  }

  // Regional specialists
  if (other && WESTERN_OROMIA.has(other)) {
    ops.add('gadaa'); ops.add('odaa');
  }
  if (other && NORTHERN.has(other)) {
    ops.add('lima'); ops.add('walia');
  }
  if (other && SOUTHERN.has(other)) {
    ops.add('odaa');
  }
  if (other && EASTERN.has(other)) {
    ops.add('haba');
  }

  // Long-haul / premium routes — Habesha + Limalimo skim
  if (km >= 400) {
    PREMIUM_OPERATORS.forEach(o => ops.add(o));
  }

  // Tigray-internal corridor
  if (TIGRAY_INTERNAL.has(from) && TIGRAY_INTERNAL.has(to)) {
    ops.add('lima'); ops.add('walia');
  }

  // Cross-region non-hub routes (e.g. Bahir Dar–Gondar) — small set
  if (!isHub && ops.size === 0) {
    ops.add('selam'); ops.add('sky');
    if (NORTHERN.has(from) || NORTHERN.has(to)) ops.add('lima');
    if (WESTERN_OROMIA.has(from) || WESTERN_OROMIA.has(to)) ops.add('gadaa');
  }

  // Safety net — always at least 2 operators so search results
  // never look empty.
  if (ops.size < 2) {
    ops.add('selam'); ops.add('sky');
  }

  // Filter against the actual operator list to avoid typos
  const valid = new Set(BUS_OPERATORS.map(o => o.id));
  return Array.from(ops).filter(id => valid.has(id));
}

// ─────────────────────────────────────────────────────────────────
// Fare logic. Per-km rate scaled by operator tier and distance band.
// Tuned so the results land in the right ballpark for these known
// reference fares:
//   AA→AD  100km → ~250 ETB mid, ~400 ETB premium
//   AA→JM  350km → ~700 ETB mid, ~900 ETB premium
//   AA→BD  565km → ~1100 ETB mid, ~1500 ETB premium
//   AA→MK  783km → ~1500 ETB mid, ~2000 ETB premium
//   AA→GD  727km → ~1400 ETB mid, ~1900 ETB premium
// These are demo numbers — Gadaa will tell you the real ones.
// ─────────────────────────────────────────────────────────────────

export function computeBusFare(km: number, tier: string): number {
  // Tapered per-km rate: short routes cost more per km (overhead),
  // long routes scale down a bit (fuel efficiency, fewer stops).
  let perKm: number;
  if (km < 150)        perKm = 2.4;
  else if (km < 400)   perKm = 2.0;
  else if (km < 700)   perKm = 1.85;
  else                 perKm = 1.75;

  const base = km * perKm;
  const tierBonus = tier === 'premium' ? 200 : (tier === 'mid' ? 50 : 0);
  // Round to nearest 10 ETB for plausible-looking fares.
  return Math.round((base + tierBonus) / 10) * 10;
}

// ─────────────────────────────────────────────────────────────────
// Departure scheduling. Short-haul routes (under ~3 hours) run
// frequently; long-haul routes cluster in the early morning so
// the bus can reach its destination before dark.
// ─────────────────────────────────────────────────────────────────

export function getDeparturesForRoute(km: number): number[] {
  const durHr = km / 60;

  // Short-haul (<2hr): roughly hourly, dawn-to-dusk
  if (durHr < 2) {
    return [6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, 13.0, 14.0, 15.0];
  }
  // Medium (<5hr): every ~90 min, mostly morning
  if (durHr < 5) {
    return [5.5, 6.5, 7.5, 9.0, 10.5, 12.0, 14.0];
  }
  // Long-haul (5-10hr): morning cluster only
  if (durHr < 10) {
    return [4.5, 5.0, 5.5, 6.0, 6.5, 7.0];
  }
  // Overnight / two-day: very early only
  return [4.5, 5.0, 5.5];
}
