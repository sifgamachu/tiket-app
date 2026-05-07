import type { City } from '@/types';

// Comprehensive list of Ethiopian cities served by intercity bus routes.
// Region names follow the 2024 administrative structure (Central Ethiopia,
// South Ethiopia, South West Ethiopia, and Sidama all carved from the
// former SNNPR; Tigray, Amhara, Oromia, Afar, Somali, Benishangul-Gumuz,
// Gambela, and Harari unchanged). Altitude in meters.
export const CITIES: City[] = [
  // ── Federal chartered cities ─────────────────────────────────
  { id: 'AA',  name: 'Addis Ababa',     amh: 'አዲስ አበባ',  region: 'Federal',           altitude: 2355 },
  { id: 'DD',  name: 'Dire Dawa',       amh: 'ድሬዳዋ',     region: 'Federal',           altitude: 1276 },

  // ── Amhara ───────────────────────────────────────────────────
  { id: 'BD',  name: 'Bahir Dar',       amh: 'ባህር ዳር',   region: 'Amhara',            altitude: 1820 },
  { id: 'GD',  name: 'Gondar',          amh: 'ጎንደር',     region: 'Amhara',            altitude: 2133 },
  { id: 'DS',  name: 'Dessie',          amh: 'ደሴ',       region: 'Amhara',            altitude: 2470 },
  { id: 'KB',  name: 'Kombolcha',       amh: 'ኮምቦልቻ',   region: 'Amhara',            altitude: 1842 },
  { id: 'DB',  name: 'Debre Birhan',    amh: 'ደብረ ብርሃን', region: 'Amhara',            altitude: 2840 },
  { id: 'DM',  name: 'Debre Markos',    amh: 'ደብረ ማርቆስ', region: 'Amhara',            altitude: 2446 },
  { id: 'DT',  name: 'Debre Tabor',     amh: 'ደብረ ታቦር',  region: 'Amhara',            altitude: 2706 },
  { id: 'WD',  name: 'Woldia',          amh: 'ወልድያ',     region: 'Amhara',            altitude: 2112 },
  { id: 'LL',  name: 'Lalibela',        amh: 'ላሊበላ',    region: 'Amhara',            altitude: 2630 },
  { id: 'BC',  name: 'Bichena',         amh: 'ቢቸና',     region: 'Amhara',            altitude: 2592 },
  { id: 'IJ',  name: 'Injibara',        amh: 'እንጅባራ',   region: 'Amhara',            altitude: 2560 },
  { id: 'FN',  name: 'Finote Selam',    amh: 'ፍኖተ ሰላም',  region: 'Amhara',            altitude: 1920 },

  // ── Oromia ───────────────────────────────────────────────────
  { id: 'AD',  name: 'Adama',           amh: 'አዳማ',     region: 'Oromia',            altitude: 1712 },
  { id: 'JM',  name: 'Jimma',           amh: 'ጅማ',      region: 'Oromia',            altitude: 1780 },
  { id: 'BS',  name: 'Bishoftu',        amh: 'ቢሾፍቱ',    region: 'Oromia',            altitude: 1920 },
  { id: 'AL',  name: 'Asella',          amh: 'አሰላ',     region: 'Oromia',            altitude: 2430 },
  { id: 'NK',  name: 'Nekemte',         amh: 'ነቀምቴ',    region: 'Oromia',            altitude: 2080 },
  { id: 'SH',  name: 'Shashemene',      amh: 'ሻሸመኔ',   region: 'Oromia',            altitude: 1940 },
  { id: 'BL',  name: 'Bale Robe',       amh: 'ባሌ ሮቤ',   region: 'Oromia',            altitude: 2492 },
  { id: 'AB',  name: 'Ambo',            amh: 'አምቦ',     region: 'Oromia',            altitude: 2101 },
  { id: 'CR',  name: 'Chiro',           amh: 'ጭሮ',      region: 'Oromia',            altitude: 1789 },
  { id: 'GB',  name: 'Goba',            amh: 'ጎባ',      region: 'Oromia',            altitude: 2741 },
  { id: 'NB',  name: 'Negele Borana',   amh: 'ነገሌ ቦረና', region: 'Oromia',            altitude: 1475 },
  { id: 'MT',  name: 'Mettu',           amh: 'መቱ',      region: 'Oromia',            altitude: 1605 },
  { id: 'BE',  name: 'Bedele',          amh: 'በደሌ',     region: 'Oromia',            altitude: 2008 },
  { id: 'MJ',  name: 'Mojo',            amh: 'ሞጆ',      region: 'Oromia',            altitude: 1788 },

  // ── Tigray ───────────────────────────────────────────────────
  { id: 'MK',  name: 'Mekelle',         amh: 'መቐለ',      region: 'Tigray',            altitude: 2080 },
  { id: 'AX',  name: 'Axum',            amh: 'አክሱም',    region: 'Tigray',            altitude: 2131 },
  { id: 'AW',  name: 'Adwa',            amh: 'አድዋ',     region: 'Tigray',            altitude: 1907 },
  { id: 'SR',  name: 'Shire',           amh: 'ሽረ',      region: 'Tigray',            altitude: 1953 },
  { id: 'AT',  name: 'Alamata',         amh: 'አላማጣ',    region: 'Tigray',            altitude: 1520 },

  // ── Sidama ───────────────────────────────────────────────────
  { id: 'HW',  name: 'Hawassa',         amh: 'ሐዋሳ',     region: 'Sidama',            altitude: 1700 },
  { id: 'YR',  name: 'Yirgalem',        amh: 'ይርጋለም',   region: 'Sidama',            altitude: 1776 },

  // ── South Ethiopia ───────────────────────────────────────────
  { id: 'AM',  name: 'Arba Minch',      amh: 'አርባ ምንጭ', region: 'South Ethiopia',    altitude: 1285 },
  { id: 'WS',  name: 'Wolaita Sodo',    amh: 'ወላይታ ሶዶ', region: 'South Ethiopia',    altitude: 1854 },
  { id: 'DL',  name: 'Dilla',           amh: 'ዲላ',      region: 'South Ethiopia',    altitude: 1570 },
  { id: 'JK',  name: 'Jinka',           amh: 'ጂንካ',     region: 'South Ethiopia',    altitude: 1490 },

  // ── Central Ethiopia ─────────────────────────────────────────
  { id: 'HS',  name: 'Hosaena',         amh: 'ሆሳዕና',    region: 'Central Ethiopia',  altitude: 2177 },
  { id: 'BT',  name: 'Butajira',        amh: 'ቡታጅራ',   region: 'Central Ethiopia',  altitude: 2030 },
  { id: 'WB',  name: 'Worabe',          amh: 'ወራቤ',     region: 'Central Ethiopia',  altitude: 2114 },
  { id: 'WL',  name: 'Welkite',         amh: 'ወልቂጤ',    region: 'Central Ethiopia',  altitude: 1910 },

  // ── South West Ethiopia ──────────────────────────────────────
  { id: 'MZ',  name: 'Mizan Teferi',    amh: 'ሚዛን ተፈሪ', region: 'South West',        altitude: 1451 },
  { id: 'TP',  name: 'Tepi',            amh: 'ቴፒ',      region: 'South West',        altitude: 1097 },
  { id: 'BJ',  name: 'Bonga',           amh: 'ቦንጋ',     region: 'South West',        altitude: 1714 },

  // ── Afar ─────────────────────────────────────────────────────
  { id: 'SM',  name: 'Semera',          amh: 'ሰመራ',     region: 'Afar',              altitude: 433  },
  { id: 'LG',  name: 'Logia',           amh: 'ሎጊያ',     region: 'Afar',              altitude: 472  },

  // ── Somali ───────────────────────────────────────────────────
  { id: 'JJ',  name: 'Jijiga',          amh: 'ጅጅጋ',     region: 'Somali',            altitude: 1634 },
  { id: 'GE',  name: 'Gode',            amh: 'ጎዴ',      region: 'Somali',            altitude: 295  },

  // ── Harari ───────────────────────────────────────────────────
  { id: 'HR',  name: 'Harar',           amh: 'ሐረር',     region: 'Harari',            altitude: 1885 },

  // ── Benishangul-Gumuz ────────────────────────────────────────
  { id: 'AS',  name: 'Asosa',           amh: 'አሶሳ',     region: 'Benishangul-Gumuz', altitude: 1570 },

  // ── Gambela ──────────────────────────────────────────────────
  { id: 'GM',  name: 'Gambela',         amh: 'ጋምቤላ',    region: 'Gambela',           altitude: 526  },
];

export function getCity(id: string): City | undefined {
  return CITIES.find(c => c.id === id);
}

// Cities grouped by region — useful when the picker wants to show
// a "Popular hubs" / "Amhara" / "Oromia" structured list instead of
// one flat alphabetical sweep through 50+ entries.
export const CITIES_BY_REGION: Record<string, City[]> = CITIES.reduce((acc, c) => {
  (acc[c.region] = acc[c.region] ?? []).push(c);
  return acc;
}, {} as Record<string, City[]>);
