import type { City } from '@/types';

export const CITIES: City[] = [
  { id: 'AA', name: 'Addis Ababa',  amh: 'አዲስ አበባ', region: 'Federal',   altitude: 2355 },
  { id: 'BD', name: 'Bahir Dar',    amh: 'ባህር ዳር',  region: 'Amhara',    altitude: 1820 },
  { id: 'HW', name: 'Hawassa',      amh: 'ሐዋሳ',     region: 'Sidama',    altitude: 1700 },
  { id: 'MK', name: 'Mekelle',      amh: 'መቐለ',      region: 'Tigray',    altitude: 2080 },
  { id: 'GD', name: 'Gondar',       amh: 'ጎንደር',     region: 'Amhara',    altitude: 2133 },
  { id: 'DD', name: 'Dire Dawa',    amh: 'ድሬዳዋ',   region: 'Federal',   altitude: 1276 },
  { id: 'JM', name: 'Jimma',        amh: 'ጅማ',      region: 'Oromia',    altitude: 1780 },
  { id: 'AD', name: 'Adama',        amh: 'አዳማ',     region: 'Oromia',    altitude: 1712 },
  { id: 'AM', name: 'Arba Minch',   amh: 'አርባ ምንጭ',  region: 'SNNP',      altitude: 1285 },
  { id: 'DS', name: 'Dessie',       amh: 'ደሴ',      region: 'Amhara',    altitude: 2470 },
  { id: 'HR', name: 'Harar',        amh: 'ሐረር',     region: 'Harari',    altitude: 1885 },
  { id: 'DB', name: 'Debre Birhan', amh: 'ደብረ ብርሃን',  region: 'Amhara',    altitude: 2840 },
];

export function getCity(id: string): City | undefined {
  return CITIES.find(c => c.id === id);
}
