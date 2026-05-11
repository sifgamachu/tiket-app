import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown, MapPin, Search, Users, CircleDot, Globe, Train as TrainIcon } from 'lucide-react';
import { RAIL_STATIONS, RAIL_OPERATOR, getStation } from '@/data/rail';
import { Sheet } from '@/components/ui/Sheet';
import { useAppStore } from '@/store/AppStore';
import { useTelegramBackButton } from '@/lib/telegram';

// Compute the next Tuesday and Saturday from today
function nextDeparture(dayOfWeek: 'Tue' | 'Sat', offsetWeeks = 0): string {
  const target = dayOfWeek === 'Tue' ? 2 : 6;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const diff = (target - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff + offsetWeeks * 7);
  return d.toISOString().slice(0, 10);
}

export function RailSearch() {
  const navigate = useNavigate();
  const { addRecentSearch } = useAppStore();
  useTelegramBackButton(() => navigate('/'));

  const [from, setFrom] = useState('AAL');
  const [to, setTo] = useState('NGD');
  const [date, setDate] = useState(nextDeparture('Sat'));
  const [passengers, setPassengers] = useState(1);
  const [pickerOpen, setPickerOpen] = useState<'from' | 'to' | null>(null);

  const fromSt = getStation(from);
  const toSt = getStation(to);
  const isInternational = fromSt?.country !== toSt?.country;
  const distance = Math.abs((toSt?.km ?? 0) - (fromSt?.km ?? 0));
  const duration = Math.round((distance / 752) * 12);

  const dateOptions = [
    { value: nextDeparture('Sat'), label: 'Sat', sub: nextDeparture('Sat').slice(5) },
    { value: nextDeparture('Tue'), label: 'Tue', sub: nextDeparture('Tue').slice(5) },
    { value: nextDeparture('Sat', 1), label: 'Sat +1', sub: nextDeparture('Sat', 1).slice(5) },
    { value: nextDeparture('Tue', 1), label: 'Tue +1', sub: nextDeparture('Tue', 1).slice(5) },
  ];

  const onSearch = () => {
    addRecentSearch(from, to, 'rail');
    const params = new URLSearchParams({ from, to, date, pax: String(passengers) });
    navigate(`/rail/results?${params.toString()}`);
  };

  return (
    <div className="bg-tiket-cream min-h-screen pb-6">

      {/* Hero — train silhouette */}
      <div className="relative overflow-hidden h-40" style={{
        background: 'linear-gradient(160deg, #1E3A8A 0%, #0E1B45 50%, #0E1411 100%)',
      }}>
        <svg viewBox="0 0 360 160" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <line x1="0" y1="120" x2="360" y2="120" stroke="#D4A33B" strokeWidth="1" opacity="0.5" />
          <line x1="0" y1="124" x2="360" y2="124" stroke="#D4A33B" strokeWidth="1" opacity="0.5" />
          {Array.from({ length: 18 }).map((_, i) => (
            <line key={i} x1={i * 22} y1="118" x2={i * 22} y2="126" stroke="#D4A33B" strokeWidth="1" opacity="0.5" />
          ))}
          <g transform="translate(60, 80)">
            <rect x="0" y="0" width="240" height="36" rx="6" fill="#0E1411" stroke="#D4A33B" strokeWidth="0.8" />
            <rect x="6" y="6" width="20" height="14" rx="2" fill="#FBBF24" opacity="0.7" />
            {[32, 54, 76, 98, 120, 142, 164, 186, 208].map((x, i) => (
              <rect key={i} x={x} y="8" width="16" height="10" rx="1" fill="#67E8F9" opacity="0.6" />
            ))}
            <circle cx="30" cy="40" r="4" fill="#0B0F14" stroke="#D4A33B" strokeWidth="0.5" />
            <circle cx="60" cy="40" r="4" fill="#0B0F14" stroke="#D4A33B" strokeWidth="0.5" />
            <circle cx="180" cy="40" r="4" fill="#0B0F14" stroke="#D4A33B" strokeWidth="0.5" />
            <circle cx="210" cy="40" r="4" fill="#0B0F14" stroke="#D4A33B" strokeWidth="0.5" />
          </g>
        </svg>
        <button
          onClick={() => navigate('/')}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="absolute inset-x-4 bottom-3.5 text-white">
          <div className="text-[10px] tracking-[0.22em] uppercase font-semibold text-tiket-gold">Ethio–Djibouti Railway</div>
          <div className="text-xl font-black mt-0.5 leading-tight">Standard Gauge · Electric</div>
          <div className="text-[11px] opacity-80">752km · 2 weekly departures · cross-border</div>
        </div>
      </div>

      <div className="px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl p-3 shadow-md border border-ink-100">
          <button
            onClick={() => setPickerOpen('from')}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-tiket-warm-cream text-left"
          >
            <div className="w-8 h-8 rounded-full text-white flex items-center justify-center flex-shrink-0" style={{ background: RAIL_OPERATOR.color }}>
              <CircleDot size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">Boarding · መሳፈሪያ ጣቢያ</div>
              <div className="text-sm font-bold text-ink-900 truncate">{fromSt?.name}</div>
              <div className="text-[10px] text-ink-500 truncate font-ethiopic">{fromSt?.amh} · km {fromSt?.km}</div>
            </div>
            <ChevronDown size={14} className="text-ink-500" />
          </button>

          <div className="h-2" />

          <button
            onClick={() => setPickerOpen('to')}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-tiket-warm-cream text-left"
          >
            <div className="w-8 h-8 rounded-full bg-tiket-gold text-white flex items-center justify-center flex-shrink-0">
              <MapPin size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">Destination · መድረሻ</div>
              <div className="text-sm font-bold text-ink-900 truncate flex items-center gap-1">
                {toSt?.name}
                {toSt?.country === 'DJ' && <Globe size={11} className="text-ink-500" />}
              </div>
              <div className="text-[10px] text-ink-500 truncate font-ethiopic">{toSt?.amh} · km {toSt?.km}</div>
            </div>
            <ChevronDown size={14} className="text-ink-500" />
          </button>

          {fromSt && toSt && fromSt.id !== toSt.id && (
            <div className="mt-2.5 px-2.5 py-2 rounded-lg flex items-center gap-2 text-[10px] bg-blue-50 border border-blue-100">
              <TrainIcon size={11} className="text-blue-700" />
              <span className="text-blue-900">~{distance}km · ~{duration}h journey</span>
              {isInternational && (
                <span className="ml-auto px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-900 text-[9px]">
                  PASSPORT REQUIRED
                </span>
              )}
            </div>
          )}

          {/* Date */}
          <div className="mt-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 text-ink-500">
              Date · ቀን
              <span className="px-1.5 py-0.5 rounded text-[8px] bg-amber-100 text-amber-900">Tue & Sat only</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {dateOptions.map(d => (
                <button
                  key={d.value}
                  onClick={() => setDate(d.value)}
                  className={`flex-shrink-0 rounded-lg px-3 py-1.5 ${
                    date === d.value ? 'bg-tiket-green text-white' : 'bg-tiket-warm-cream text-ink-900'
                  }`}
                >
                  <div className="text-[11px] font-bold leading-tight">{d.label}</div>
                  <div className="text-[9px] opacity-80 tabular">{d.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Passengers */}
          <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-tiket-warm-cream">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-ink-500" />
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">Passengers</div>
                <div className="text-xs font-bold text-ink-900">{passengers} {passengers === 1 ? 'adult' : 'adults'}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPassengers(p => Math.max(1, p - 1))} className="w-7 h-7 rounded-full bg-white border border-ink-100 text-ink-900 font-bold">−</button>
              <div className="w-7 text-center text-sm font-bold text-ink-900 tabular">{passengers}</div>
              <button onClick={() => setPassengers(p => Math.min(4, p + 1))} className="w-7 h-7 rounded-full bg-white border border-ink-100 text-ink-900 font-bold">+</button>
            </div>
          </div>

          <button
            onClick={onSearch}
            disabled={from === to}
            className="mt-3 w-full rounded-xl text-white py-3 font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: RAIL_OPERATOR.color }}
          >
            <Search size={14} /> Search Trains · ፈልግ
          </button>
        </div>
      </div>

      {/* Route map preview */}
      <div className="px-4 mt-4">
        <div className="text-[11px] font-bold uppercase tracking-wider mb-2 text-ink-500">The Corridor · መንገዱ</div>
        <div className="rounded-xl p-3 bg-white border border-ink-100">
          <RailRouteMap from={from} to={to} />
        </div>
      </div>

      <Sheet open={pickerOpen !== null} onClose={() => setPickerOpen(null)} title={pickerOpen === 'from' ? 'Boarding from' : 'Going to'}>
        <StationPicker
          exclude={pickerOpen === 'from' ? to : from}
          onSelect={(id) => {
            if (pickerOpen === 'from') setFrom(id); else setTo(id);
            setPickerOpen(null);
          }}
        />
      </Sheet>
    </div>
  );
}

function StationPicker({ exclude, onSelect }: { exclude: string; onSelect: (id: string) => void }) {
  const [q, setQ] = useState('');
  const filtered = RAIL_STATIONS.filter(s =>
    s.id !== exclude && (s.name.toLowerCase().includes(q.toLowerCase()) || s.amh.includes(q))
  );

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search station · ጣቢያ ፈልግ"
          className="w-full text-sm rounded-xl pl-9 pr-3 py-2.5 bg-white border border-ink-100 outline-none"
        />
      </div>
      <div className="max-h-80 overflow-y-auto -mx-2">
        {filtered.map(s => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-left text-ink-900 hover:bg-tiket-warm-cream"
          >
            <div className="w-8 h-8 rounded-md text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0"
              style={{ background: s.country === 'DJ' ? '#D4A33B' : RAIL_OPERATOR.color }}>
              {s.id}
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold flex items-center gap-1.5">
                {s.name}
                {s.border && <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-amber-100 text-amber-900">BORDER</span>}
              </div>
              <div className="text-[10px] text-ink-500 font-ethiopic">{s.amh} · km {s.km} · {s.country === 'ET' ? '🇪🇹 Ethiopia' : '🇩🇯 Djibouti'}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function RailRouteMap({ from, to, currentKm }: { from: string; to: string; currentKm?: number }) {
  const fromSt = getStation(from);
  const toSt = getStation(to);
  const fromKm = Math.min(fromSt?.km ?? 0, toSt?.km ?? 0);
  const toKm = Math.max(fromSt?.km ?? 0, toSt?.km ?? 0);

  return (
    <div className="space-y-1">
      {RAIL_STATIONS.map((s, i) => {
        const inRange = s.km >= fromKm && s.km <= toKm;
        const isEndpoint = s.id === from || s.id === to;
        const isCurrent = currentKm !== undefined && Math.abs(s.km - currentKm) < 50;
        return (
          <div key={s.id} className="flex items-center gap-2 relative" style={{ minHeight: 22 }}>
            <div className="flex flex-col items-center relative" style={{ width: 14 }}>
              {i > 0 && (
                <div
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{ top: -10, height: 12, width: 2, background: inRange ? '#1A6B3A' : '#E5E7EB' }}
                />
              )}
              <div
                className="rounded-full"
                style={{
                  width: isEndpoint ? 12 : (s.isMajor ? 8 : 6),
                  height: isEndpoint ? 12 : (s.isMajor ? 8 : 6),
                  background: isCurrent ? '#F59E0B' : (isEndpoint ? (s.id === from ? '#1A6B3A' : '#D4A33B') : (inRange ? '#1A6B3A' : '#E5E7EB')),
                  border: isEndpoint ? '2px solid white' : 'none',
                  boxShadow: isEndpoint ? `0 0 0 1px ${s.id === from ? '#1A6B3A' : '#D4A33B'}` : 'none',
                  animation: isCurrent ? 'tk-pulse 1.4s ease-in-out infinite' : 'none',
                }}
              />
            </div>
            <div className="flex-1 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5">
                <span style={{ color: inRange ? '#0E1411' : '#6B7280', fontWeight: isEndpoint ? 700 : 500 }}>{s.name}</span>
                {s.border && <span className="px-1 py-0.5 rounded text-[7px] font-bold bg-amber-100 text-amber-900">BORDER</span>}
                {s.country === 'DJ' && <Globe size={9} className="text-ink-500" />}
              </div>
              <span className="text-ink-500 tabular text-[9px]">km {s.km}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
