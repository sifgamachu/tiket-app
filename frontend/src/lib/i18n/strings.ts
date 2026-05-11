// ─────────────────────────────────────────────────────────────────
// Tikēt translation dictionaries.
//
// Languages (in order shown in picker):
//   en  English          (default; diaspora, business, fallback)
//   am  አማርኛ            Amharic (federal language)
//   om  Afaan Oromoo     (largest L1 in Ethiopia, Oromia)
//   ti  ትግርኛ           Tigrinya (Tigray)
//   so  Soomaali        Somali (Somali region)
//
// Translation quality notes from the implementer (review before
// going to production):
//   - Amharic is solid; common transit/booking vocabulary widely
//     attested.
//   - Afaan Oromoo: confident on routes, seats, payment terms;
//     some greetings may have regional variation (Mecha vs Tulama
//     dialect differences mostly stylistic).
//   - Tigrinya: confident on Geez-script terms shared with Amharic
//     (price, ticket); polite-form choices may need a native speaker.
//   - Somali: weakest of the five. Verify with a Somali speaker
//     before showing to customers — these are best-effort.
//
// To add a string:
//   1. Add a key + 5 translations to STRINGS below.
//   2. Use `useT()` in your component: `const { t } = useT();`
//   3. Render: `{t('your_key')}`.
// ─────────────────────────────────────────────────────────────────

export type Lang = 'en' | 'am' | 'om' | 'ti' | 'so';

export const LANG_LIST: Lang[] = ['en', 'am', 'om', 'ti', 'so'];

export const LANG_META: Record<Lang, {
  /** English-language name of the language */
  name: string;
  /** Endonym — what speakers call the language themselves */
  native: string;
  /** Script family for font selection */
  script: 'latin' | 'ethiopic';
}> = {
  en: { name: 'English',      native: 'English',      script: 'latin'    },
  am: { name: 'Amharic',      native: 'አማርኛ',         script: 'ethiopic' },
  om: { name: 'Afaan Oromoo', native: 'Afaan Oromoo', script: 'latin'    },
  ti: { name: 'Tigrinya',     native: 'ትግርኛ',        script: 'ethiopic' },
  so: { name: 'Somali',       native: 'Soomaali',     script: 'latin'    },
};

type StringKey =
  // Hero / home
  | 'hero_greeting_visitor'
  | 'hero_greeting_named'
  | 'hero_subtitle'
  | 'choose_how_you_travel'
  // Mode cards
  | 'mode_bus'
  | 'mode_bus_sub'
  | 'mode_rail'
  | 'mode_rail_sub'
  | 'mode_events'
  | 'mode_events_sub'
  // Recent + tickets
  | 'recent_searches'
  | 'upcoming_tickets'
  | 'view_all'
  // Bus search form
  | 'from'
  | 'to'
  | 'date'
  | 'passengers'
  | 'search_buses'
  | 'search_trains'
  | 'today'
  | 'tomorrow'
  // Results page
  | 'results_buses_found'
  | 'results_no_buses'
  | 'duration'
  | 'departure'
  | 'arrival'
  | 'price'
  | 'select'
  | 'seats_left'
  // Seats
  | 'choose_seat'
  | 'seat_aisle'
  | 'seat_window'
  | 'seat_selected'
  | 'continue'
  // Checkout
  | 'passenger_details'
  | 'phone_number'
  | 'full_name'
  | 'pay_with_telebirr'
  | 'pay_amount'
  | 'total'
  // Tickets list
  | 'my_tickets'
  | 'tickets_active'
  | 'tickets_past'
  | 'tickets_empty'
  // Common
  | 'back'
  | 'cancel'
  | 'language';

const STRINGS: Record<StringKey, Record<Lang, string>> = {
  // ── Hero ────────────────────────────────────────────────────────
  hero_greeting_visitor: {
    en: 'Where to next?',
    am: 'የት ሊጓዙ ነው?',
    om: 'Gara eessaa imaltu?',
    ti: 'ናበይ ትኸዱ?',
    so: 'Halkee ayaad u socotaa?',
  },
  hero_greeting_named: {
    // Note: the {name} placeholder is substituted at render time.
    en: 'Selam, {name}',
    am: 'ሰላም፣ {name}',
    om: 'Akkam, {name}',
    ti: 'ሰላም፣ {name}',
    so: 'Salaan, {name}',
  },
  hero_subtitle: {
    en: 'Tickets across Ethiopia',
    am: 'በመላው ኢትዮጵያ ቲኬቶች',
    om: 'Tikeetii Itoophiyaa guutuu keessa',
    ti: 'ኣብ መላእ ኢትዮጵያ ቲከት',
    so: 'Tigidh Itoobiya oo dhan',
  },
  choose_how_you_travel: {
    en: 'Choose how you travel',
    am: 'እንዴት መጓዝ እንደሚፈልጉ ይምረጡ',
    om: 'Akkamitti akka deemtu filadhu',
    ti: 'ብኸመይ ከም እትጓዓዙ ምረጹ',
    so: 'Dooro sida aad u safarayso',
  },

  // ── Mode cards ──────────────────────────────────────────────────
  mode_bus: {
    en: 'Intercity Bus',
    am: 'የከተሞች መካከል አውቶቡስ',
    om: 'Awtobusii Magaalaalee Gidduu',
    ti: 'ኣብ መንጎ ከተማታት ኣውቶቡስ',
    so: 'Bas Magaalooyinka',
  },
  mode_bus_sub: {
    en: 'Daily departures across Ethiopia',
    am: 'ዕለታዊ ጉዞዎች በመላው ኢትዮጵያ',
    om: 'Imala guyyaa guyyaa Itoophiyaa keessa',
    ti: 'መዓልታዊ ጉዕዞ ኣብ ኢትዮጵያ',
    so: 'Safarrada maalinlaha ah Itoobiya',
  },
  mode_rail: {
    en: 'Addis–Djibouti Railway',
    am: 'የአዲስ–ጅቡቲ ባቡር',
    om: 'Baaburaa Finfinnee–Jibuutii',
    ti: 'ባቡር ኣዲስ–ጅቡቲ',
    so: 'Tareenka Adis Ababa–Jabuuti',
  },
  mode_rail_sub: {
    en: 'Standard gauge · electric',
    am: 'ስታንዳርድ ጌጅ · በኤሌክትሪክ',
    om: 'Standard gauge · elektirikaa',
    ti: 'ስታንዳርድ ጌጅ · ብኤለክትሪክ',
    so: 'Standard gauge · korontada',
  },
  mode_events: {
    en: 'Events & Tickets',
    am: 'ክስተቶች እና ቲኬቶች',
    om: 'Sirnaa fi Tikeetii',
    ti: 'ፍጻመታትን ቲከትን',
    so: 'Munaasabadaha & Tigidhada',
  },
  mode_events_sub: {
    en: 'Football · concerts · cinema',
    am: 'እግር ኳስ · ኮንሰርቶች · ሲኒማ',
    om: 'Kubbaa miilaa · konsartii · sinimaa',
    ti: 'ኩዕሶ እግሪ · ኮንሰርት · ሲነማ',
    so: 'Kubadda cagta · riwaayadaha · shaneemo',
  },

  // ── Recent / upcoming ──────────────────────────────────────────
  recent_searches: {
    en: 'Recent searches',
    am: 'የቅርብ ጊዜ ፍለጋዎች',
    om: 'Barbaadannoowwan dhiyoo',
    ti: 'ናይ ቀረባ ድለያታት',
    so: 'Raadinta dhawaan',
  },
  upcoming_tickets: {
    en: 'Upcoming tickets',
    am: 'መጪ ቲኬቶች',
    om: 'Tikeetii dhufu',
    ti: 'ዝመጹ ቲከታት',
    so: 'Tigidhada soo socda',
  },
  view_all: {
    en: 'View all',
    am: 'ሁሉንም ይመልከቱ',
    om: 'Hunda ilaali',
    ti: 'ኩሉ ርአ',
    so: 'Eeg dhammaan',
  },

  // ── Search form ────────────────────────────────────────────────
  from: {
    en: 'From',
    am: 'ከ',
    om: 'Irraa',
    ti: 'ካብ',
    so: 'Laga',
  },
  to: {
    en: 'To',
    am: 'ወደ',
    om: 'Gara',
    ti: 'ናብ',
    so: 'Ilaa',
  },
  date: {
    en: 'Date',
    am: 'ቀን',
    om: 'Guyyaa',
    ti: 'ዕለት',
    so: 'Taariikhda',
  },
  passengers: {
    en: 'Passengers',
    am: 'ተሳፋሪዎች',
    om: 'Imaltoota',
    ti: 'ተጓዓዝቲ',
    so: 'Rakaabka',
  },
  search_buses: {
    en: 'Search buses',
    am: 'አውቶቡስ ፈልግ',
    om: 'Awtobusii barbaadi',
    ti: 'ኣውቶቡስ ድለ',
    so: 'Raadi baska',
  },
  search_trains: {
    en: 'Search trains',
    am: 'ባቡር ፈልግ',
    om: 'Baaburaa barbaadi',
    ti: 'ባቡር ድለ',
    so: 'Raadi tareenka',
  },
  today: {
    en: 'Today',
    am: 'ዛሬ',
    om: 'Har\'a',
    ti: 'ሎሚ',
    so: 'Maanta',
  },
  tomorrow: {
    en: 'Tomorrow',
    am: 'ነገ',
    om: 'Bor',
    ti: 'ጽባሕ',
    so: 'Berri',
  },

  // ── Results ────────────────────────────────────────────────────
  results_buses_found: {
    en: 'buses found',
    am: 'አውቶቡሶች ተገኝተዋል',
    om: 'awtobusii argaman',
    ti: 'ኣውቶቡሳት ተረኺቦም',
    so: 'baska la helay',
  },
  results_no_buses: {
    en: 'No buses found for this route',
    am: 'ለዚህ መስመር ምንም አውቶቡስ አልተገኘም',
    om: 'Karaa kanaaf awtobusiin hin argamne',
    ti: 'ኣብዚ መንገዲ ኣውቶቡስ ኣይተረኽበን',
    so: 'Bas lagama helin wadadaan',
  },
  duration: {
    en: 'Duration',
    am: 'ቆይታ',
    om: 'Yeroo',
    ti: 'ግዜ',
    so: 'Mudada',
  },
  departure: {
    en: 'Departure',
    am: 'መነሻ',
    om: 'Ka\'umsa',
    ti: 'ምብጋስ',
    so: 'Bixitaanka',
  },
  arrival: {
    en: 'Arrival',
    am: 'መድረሻ',
    om: 'Gahumsa',
    ti: 'ምብጻሕ',
    so: 'Imaatinka',
  },
  price: {
    en: 'Price',
    am: 'ዋጋ',
    om: 'Gatii',
    ti: 'ዋጋ',
    so: 'Qiimaha',
  },
  select: {
    en: 'Select',
    am: 'ይምረጡ',
    om: 'Filadhu',
    ti: 'ምረጹ',
    so: 'Dooro',
  },
  seats_left: {
    en: 'seats left',
    am: 'መቀመጫዎች ይቀሩ',
    om: 'teessoowwan hafan',
    ti: 'መናብር ይተርፉ',
    so: 'kuraas haray',
  },

  // ── Seats ──────────────────────────────────────────────────────
  choose_seat: {
    en: 'Choose your seat',
    am: 'መቀመጫዎን ይምረጡ',
    om: 'Teessoo kee filadhu',
    ti: 'መንበርኩም ምረጹ',
    so: 'Dooro kursigaaga',
  },
  seat_aisle: {
    en: 'Aisle',
    am: 'መተላለፊያ',
    om: 'Karaa',
    ti: 'መተሓላለፊ',
    so: 'Marin',
  },
  seat_window: {
    en: 'Window',
    am: 'መስኮት',
    om: 'Foddaa',
    ti: 'መስኮት',
    so: 'Daaqad',
  },
  seat_selected: {
    en: 'Selected',
    am: 'የተመረጠ',
    om: 'Filatame',
    ti: 'ተመሪጹ',
    so: 'La doortay',
  },
  continue: {
    en: 'Continue',
    am: 'ቀጥል',
    om: 'Itti fufi',
    ti: 'ቀጽል',
    so: 'Sii wad',
  },

  // ── Checkout ───────────────────────────────────────────────────
  passenger_details: {
    en: 'Passenger details',
    am: 'የተሳፋሪ መረጃ',
    om: 'Odeeffannoo imaltuu',
    ti: 'ሓበሬታ ተጓዓዛይ',
    so: 'Faahfaahinta rakaabka',
  },
  phone_number: {
    en: 'Phone number',
    am: 'ስልክ ቁጥር',
    om: 'Lakkoofsa bilbilaa',
    ti: 'ቁጽሪ ስልኪ',
    so: 'Lambarka taleefanka',
  },
  full_name: {
    en: 'Full name',
    am: 'ሙሉ ስም',
    om: 'Maqaa guutuu',
    ti: 'ምሉእ ስም',
    so: 'Magaca oo dhan',
  },
  pay_with_telebirr: {
    en: 'Pay with Telebirr',
    am: 'በቴሌብር ይክፈሉ',
    om: 'Telebirriin kaffali',
    ti: 'ብቴሌብር ክፈሉ',
    so: 'Ku bixi Telebirr',
  },
  pay_amount: {
    en: 'Pay',
    am: 'ይክፈሉ',
    om: 'Kaffali',
    ti: 'ክፈሉ',
    so: 'Bixi',
  },
  total: {
    en: 'Total',
    am: 'ጠቅላላ',
    om: 'Walumaagalatti',
    ti: 'ጠቅላላ',
    so: 'Wadarta',
  },

  // ── Tickets ────────────────────────────────────────────────────
  my_tickets: {
    en: 'My tickets',
    am: 'የእኔ ቲኬቶች',
    om: 'Tikeetii koo',
    ti: 'ቲከታተይ',
    so: 'Tigidhadayda',
  },
  tickets_active: {
    en: 'Active',
    am: 'ንቁ',
    om: 'Hojii irra',
    ti: 'ንጡፍ',
    so: 'Firfircoon',
  },
  tickets_past: {
    en: 'Past',
    am: 'ያለፉ',
    om: 'Kan darbe',
    ti: 'ዝሓለፉ',
    so: 'Hore',
  },
  tickets_empty: {
    en: 'No tickets yet',
    am: 'እስካሁን ምንም ቲኬት የለም',
    om: 'Hanga ammaatti tikeetii hin qabdu',
    ti: 'ክሳብ ሕጂ ቲከት የለን',
    so: 'Wali ma jiraan tigidho',
  },

  // ── Common ─────────────────────────────────────────────────────
  back: {
    en: 'Back',
    am: 'ተመለስ',
    om: 'Duubatti',
    ti: 'ተመለስ',
    so: 'Gadaal',
  },
  cancel: {
    en: 'Cancel',
    am: 'ይቅር',
    om: 'Haquu',
    ti: 'ሰርዝ',
    so: 'Jooji',
  },
  language: {
    en: 'Language',
    am: 'ቋንቋ',
    om: 'Afaan',
    ti: 'ቋንቋ',
    so: 'Luqada',
  },
};

// ─────────────────────────────────────────────────────────────────
// Translator function. Falls back to English if a key has no
// translation in the target language; falls back to the key itself
// if the key doesn't exist (so missing translations are visible
// rather than silent).
// ─────────────────────────────────────────────────────────────────
export function translate(lang: Lang, key: StringKey, vars?: Record<string, string | number>): string {
  const entry = STRINGS[key];
  if (!entry) {
    if (import.meta.env.DEV) console.warn(`[i18n] missing key: ${key}`);
    return String(key);
  }
  let s = entry[lang] ?? entry.en ?? String(key);
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(`{${k}}`, String(v));
    }
  }
  return s;
}

export type { StringKey };
