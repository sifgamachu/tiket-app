import type { EventItem, EventCategory } from '@/types';

export const EVENT_CATEGORIES: EventCategory[] = [
  { id: 'sports',    name: 'Sports',    amh: 'ስፖርት' },
  { id: 'concert',   name: 'Concerts',  amh: 'ኮንሰርት' },
  { id: 'cinema',    name: 'Cinema',    amh: 'ሲኒማ' },
  { id: 'theatre',   name: 'Theatre',   amh: 'ቲያትር' },
  { id: 'community', name: 'Community', amh: 'ማህበረሰብ' },
];

const FUTURE_DATE = (daysAhead: number, hour = 19): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const EVENTS: EventItem[] = [
  {
    id: 'evt-derby-2026-04',
    title: 'Sheger Derby — Saint George FC vs Ethiopia Coffee FC',
    amh: 'የሸገር ደርቢ',
    category: 'sports',
    venue: 'Abebe Bikila Stadium',
    city: 'Addis Ababa',
    date: FUTURE_DATE(8, 16),
    organizer: 'Ethiopian Premier League',
    description: 'The biggest derby in Ethiopian football. Saint George FC hosts Ethiopia Coffee FC in front of a capacity crowd at Abebe Bikila. Gates open 14:00.',
    capacity: 30000,
    sold: 21450,
    tiers: [
      { id: 'gen',   name: 'General Admission', amh: 'ጠቅላላ',   price: 200,  available: 4200, capacity: 18000, color: '#22C55E' },
      { id: 'kemen', name: 'Kemeneshe Stand',   amh: 'ከመንሸ',   price: 500,  available: 1100, capacity: 8000,  color: '#1A6B3A', description: 'Covered seating, north end' },
      { id: 'fasi',  name: 'Fasika Ber',        amh: 'ፋሲካ በር', price: 800,  available: 350,  capacity: 3000,  color: '#D4A33B', description: 'Premium covered, halfway line' },
      { id: 'vip',   name: 'VIP Box',           amh: 'ቪአይፒ',  price: 2500, available: 24,   capacity: 200,   color: '#581C87', description: 'Catered hospitality, private entry' },
    ],
  },
  {
    id: 'evt-teddy-2026-05',
    title: 'Teddy Afro · Tikur Sew Tour',
    amh: 'ቴዲ አፍሮ · የጥቁር ሰው ጉብኝት',
    category: 'concert',
    venue: 'Millennium Hall',
    city: 'Addis Ababa',
    date: FUTURE_DATE(22, 20),
    organizer: 'Adika Entertainment',
    description: 'A homecoming concert from one of Ethiopia\'s most beloved artists, performing material from Tikur Sew alongside new songs.',
    capacity: 12000,
    sold: 9100,
    tiers: [
      { id: 'reg', name: 'Regular',     price: 1200, available: 1800, capacity: 8000, color: '#22C55E' },
      { id: 'vip', name: 'VIP Standing', price: 3500, available: 280,  capacity: 2500, color: '#D4A33B' },
      { id: 'pit', name: 'Front Pit',   price: 6000, available: 70,   capacity: 1500, color: '#581C87', description: 'Closest to the stage' },
    ],
  },
  {
    id: 'evt-cinema-mavka-1',
    title: 'Edna Mall — Avatar 3 (IMAX)',
    category: 'cinema',
    venue: 'Edna Mall Cinema',
    city: 'Addis Ababa',
    date: FUTURE_DATE(2, 19),
    organizer: 'Edna Cinema',
    description: 'IMAX 3D screening. 156 minutes. PG-13.',
    capacity: 240,
    sold: 188,
    tiers: [
      { id: 'std',  name: 'Standard', price: 350, available: 38, capacity: 200, color: '#22C55E' },
      { id: 'prem', name: 'Premium',  price: 600, available: 14, capacity: 40,  color: '#D4A33B', description: 'Recliner seats, back rows' },
    ],
  },
  {
    id: 'evt-theatre-hahu-1',
    title: 'National Theatre — Ha Hu Ba Sidist Wer',
    amh: 'ሐሁ በስድስት ወር',
    category: 'theatre',
    venue: 'Ethiopian National Theatre',
    city: 'Addis Ababa',
    date: FUTURE_DATE(5, 19.5),
    organizer: 'National Theatre Company',
    description: 'A revival of the beloved Tesfaye Gessesse play, running for two weeks.',
    capacity: 450,
    sold: 312,
    tiers: [
      { id: 'orch',    name: 'Orchestra',     price: 250, available: 80, capacity: 300, color: '#22C55E' },
      { id: 'balcony', name: 'Balcony',       price: 400, available: 28, capacity: 100, color: '#D4A33B' },
      { id: 'box',     name: 'Box Seating',   price: 750, available: 12, capacity: 50,  color: '#581C87' },
    ],
  },
];

export function getEvent(id: string): EventItem | undefined {
  return EVENTS.find(e => e.id === id);
}
