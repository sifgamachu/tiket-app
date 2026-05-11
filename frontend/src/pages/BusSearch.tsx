import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown, MapPin, Search, Users, ArrowDownUp } from 'lucide-react';
import { CITIES, getCity } from '@/data/cities';
import { Sheet } from '@/components/ui/Sheet';
import { useAppStore } from '@/store/AppStore';
import { useTelegramBackButton } from '@/lib/telegram';

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (d: number) => {
  const date = new Date();
  date.setDate(date.getDate() + d);
  return date.toISOString().slice(0, 10);
};

export function BusSearch() {
  const navigate = useNavigate();
  const { addRecentSearch } = useAppStore();
  useTelegramBackButton(() => navigate('/'));

  const [from, setFrom] = useState('AA');
  const [to, setTo] = useState('BD');
  const [date, setDate] = useState(today());
  const [passengers, setPassengers] = useState(1);
  const [pickerOpen, setPickerOpen] = useState<'from' | 'to' | null>(null);

  const fromCity = getCity(from);
  const toCity = getCity(to);

  const onSearch = () => {
    addRecentSearch(from, to, 'bus');
    const params = new URLSearchParams({ from, to, date, pax: String(passengers) });
    navigate(`/bus/results?${params.toString()}`);
  };

  const swap = () => { const t = from; setFrom(to); setTo(t); };

  const dateOptions = [
    { value: today(), label: 'Today',    sub: '' },
    { value: addDays(1), label: 'Tomorrow', sub: '' },
    { value: addDays(2), label: '+2 days', sub: '' },
    { value: addDays(3), label: '+3 days', sub: '' },
    { value: addDays(7), label: 'Next week', sub: '' },
  ];

  return (
    <div className="bg-tiket-cream min-h-screen pb-6">

      {/* Hero */}
      <div className="relative overflow-hidden h-40" style={{
        background: 'linear-gradient(180deg, #1A6B3A 0%, #14532D 50%, #0E1411 100%)',
      }}>
        <svg viewBox="0 0 360 160" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <path d="M0 100 L40 70 L80 90 L130 50 L180 80 L240 60 L300 85 L360 55 L360 160 L0 160 Z" fill="#0B0F14" opacity="0.6" />
          <path d="M0 130 L60 105 L120 115 L180 95 L240 110 L300 100 L360 115 L360 160 L0 160 Z" fill="#0B0F14" />
          <circle cx="290" cy="55" r="16" fill="#FCD34D" opacity="0.6" />
          <path d="M-10 145 Q 100 130, 180 138 T 380 132" stroke="#D4A33B" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.7" />
        </svg>
        <button
          onClick={() => navigate('/')}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="absolute inset-x-4 bottom-4 text-white">
          <div className="text-[10px] tracking-[0.22em] uppercase font-semibold text-tiket-gold">Tikēt · Bus</div>
          <div className="text-xl font-black mt-1 leading-tight">Where to next?</div>
          <div className="text-[11px] opacity-80 font-ethiopic">የት ሊጓዙ ነው?</div>
        </div>
      </div>

      {/* Search card */}
      <div className="px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl p-3 shadow-md border border-ink-100">
          {/* From */}
          <button
            onClick={() => setPickerOpen('from')}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-tiket-warm-cream text-left"
          >
            <div className="w-8 h-8 rounded-full bg-tiket-green text-white flex items-center justify-center flex-shrink-0">
              <MapPin size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">From · ከ</div>
              <div className="text-base font-bold text-ink-900 truncate">{fromCity?.name}</div>
              <div className="text-[10px] text-ink-500 truncate font-ethiopic">{fromCity?.amh}</div>
            </div>
            <ChevronDown size={14} className="text-ink-500" />
          </button>

          {/* Swap */}
          <div className="relative h-2">
            <button
              onClick={swap}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border-[1.5px] border-tiket-green text-tiket-green flex items-center justify-center"
            >
              <ArrowDownUp size={12} />
            </button>
          </div>

          {/* To */}
          <button
            onClick={() => setPickerOpen('to')}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-tiket-warm-cream text-left"
          >
            <div className="w-8 h-8 rounded-full bg-tiket-gold text-white flex items-center justify-center flex-shrink-0">
              <MapPin size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">To · ወደ</div>
              <div className="text-base font-bold text-ink-900 truncate">{toCity?.name}</div>
              <div className="text-[10px] text-ink-500 truncate font-ethiopic">{toCity?.amh}</div>
            </div>
            <ChevronDown size={14} className="text-ink-500" />
          </button>

          {/* Date */}
          <div className="mt-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-ink-500">Date · ቀን</div>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {dateOptions.map(d => (
                <button
                  key={d.value}
                  onClick={() => setDate(d.value)}
                  className={`flex-shrink-0 rounded-lg px-3 py-1.5 transition ${
                    date === d.value ? 'bg-tiket-green text-white' : 'bg-tiket-warm-cream text-ink-900'
                  }`}
                >
                  <div className="text-[11px] font-bold leading-tight">{d.label}</div>
                  <div className="text-[9px] opacity-80 tabular">{d.value.slice(5)}</div>
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
              <button
                onClick={() => setPassengers(p => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-full bg-white border border-ink-100 text-ink-900 font-bold"
              >−</button>
              <div className="w-7 text-center text-sm font-bold text-ink-900 tabular">{passengers}</div>
              <button
                onClick={() => setPassengers(p => Math.min(4, p + 1))}
                className="w-7 h-7 rounded-full bg-white border border-ink-100 text-ink-900 font-bold"
              >+</button>
            </div>
          </div>

          <button
            onClick={onSearch}
            disabled={from === to}
            className="mt-3 w-full rounded-xl bg-tiket-green text-white py-3 font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Search size={14} />
            Search Buses · ፈልግ
          </button>
        </div>
      </div>

      <Sheet open={pickerOpen !== null} onClose={() => setPickerOpen(null)} title={pickerOpen === 'from' ? 'From where' : 'Going to'}>
        <CityPicker
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

function CityPicker({ exclude, onSelect }: { exclude: string; onSelect: (id: string) => void }) {
  const [q, setQ] = useState('');
  const filtered = CITIES.filter(c =>
    c.id !== exclude &&
    (c.name.toLowerCase().includes(q.toLowerCase()) || c.amh.includes(q))
  );

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search city · ከተማ ፈልግ"
          className="w-full text-sm rounded-xl pl-9 pr-3 py-2.5 bg-white border border-ink-100 outline-none"
        />
      </div>
      <div className="max-h-80 overflow-y-auto -mx-2">
        {filtered.map(c => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-left text-ink-900 hover:bg-tiket-warm-cream"
          >
            <div className="w-8 h-8 rounded-md bg-tiket-green text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
              {c.id}
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold">{c.name}</div>
              <div className="text-[10px] text-ink-500 font-ethiopic">{c.amh} · {c.region}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
