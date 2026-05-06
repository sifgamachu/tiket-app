import type { RailStation, RailClass, RailOperator } from '@/types';

export const RAIL_STATIONS: RailStation[] = [
  { id: 'AAL', name: 'Addis Ababa Lebu', amh: 'አዲስ አበባ ለቡ', country: 'ET', km: 0,   isStop: true,  isMajor: true },
  { id: 'BSF', name: 'Bishoftu',         amh: 'ቢሾፍቱ',     country: 'ET', km: 47,  isStop: true,  isMajor: false },
  { id: 'MOJ', name: 'Mojo',             amh: 'ሞጆ',       country: 'ET', km: 75,  isStop: true,  isMajor: false },
  { id: 'ADM', name: 'Adama',            amh: 'አዳማ',      country: 'ET', km: 99,  isStop: true,  isMajor: true },
  { id: 'AWS', name: 'Awash',            amh: 'አዋሽ',      country: 'ET', km: 215, isStop: true,  isMajor: true },
  { id: 'MIE', name: 'Mieso',            amh: 'ምሶ',       country: 'ET', km: 350, isStop: true,  isMajor: false },
  { id: 'DRW', name: 'Dire Dawa',        amh: 'ድሬዳዋ',    country: 'ET', km: 446, isStop: true,  isMajor: true },
  { id: 'DEW', name: 'Dewele',           amh: 'ደወሌ',      country: 'ET', km: 600, isStop: true,  isMajor: false, border: true },
  { id: 'ASB', name: 'Ali Sabieh',       amh: 'አሊ ሰቢሕ',   country: 'DJ', km: 660, isStop: true,  isMajor: false },
  { id: 'NGD', name: 'Nagad · Djibouti', amh: 'ናጋድ',      country: 'DJ', km: 752, isStop: true,  isMajor: true },
];

export function getStation(id: string): RailStation | undefined {
  return RAIL_STATIONS.find(s => s.id === id);
}

export const RAIL_CLASSES: RailClass[] = [
  {
    id: 'standard',
    name: 'Standard Coach',
    amh: 'መደበኛ',
    layout: 'rows-2-2',
    rows: 16, cols: 4, totalSeats: 64,
    basePrice: 1500,
    color: '#0F766E', accent: '#5EEAD4',
    desc: 'Reclining seats · A/C · Economy fare',
  },
  {
    id: 'business',
    name: 'Business Class',
    amh: 'ቢዝነስ',
    layout: 'rows-2-2',
    rows: 12, cols: 4, totalSeats: 48,
    basePrice: 2800,
    color: '#1E40AF', accent: '#93C5FD',
    desc: 'Wider seats · power outlets · meal included',
  },
  {
    id: 'sleeper',
    name: 'Sleeper Berths',
    amh: 'መኝታ ካቢን',
    layout: 'cabins',
    rows: 8, cols: 4, totalSeats: 32,
    basePrice: 4500,
    color: '#581C87', accent: '#D8B4FE',
    desc: '4-berth private cabin · bedding included · WC',
  },
];

export function getRailClass(id: string): RailClass | undefined {
  return RAIL_CLASSES.find(c => c.id === id);
}

export const RAIL_OPERATOR: RailOperator = {
  id: 'edr',
  name: 'Ethio–Djibouti Railway',
  amh: 'የኢትዮ–ጅቡቲ ባቡር',
  short: 'EDR',
  color: '#1E3A8A',
  accent: '#FBBF24',
};

// Compute the seat label for a given index in a given rail class
export function railSeatLabel(idx: number, classId: RailClass['id']): string {
  const cls = getRailClass(classId);
  if (!cls) return `${idx}`;
  if (cls.id === 'sleeper') {
    // 8 cabins × 4 berths each (Lower-Left, Lower-Right, upper-left, upper-right)
    const cabin = Math.floor(idx / 4) + 1;
    const berth = ['L', 'R', 'l', 'r'][idx % 4];
    return `C${cabin}${berth}`;
  }
  // Standard coach / business: rows × cols → 1A 1B | 1C 1D
  const row = Math.floor(idx / cls.cols) + 1;
  const seat = ['A', 'B', 'C', 'D'][idx % cls.cols];
  return `${row}${seat}`;
}
